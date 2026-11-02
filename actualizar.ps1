param(
    [string]$NombreServicio = 'SistemaStock',
    [switch]$SinReiniciar
)

$ErrorActionPreference = 'Stop'

$raiz = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $raiz

function Ejecutar {
    param(
        [string]$Archivo,
        [string[]]$Argumentos
    )

    & $Archivo @Argumentos

    if ($LASTEXITCODE -ne 0) {
        throw "Fallo: $Archivo $($Argumentos -join ' ')"
    }
}

Write-Host '== Actualizando Sistema Stock ==' -ForegroundColor Cyan

$cambios = git status --porcelain

if ($cambios) {
    throw 'Hay cambios locales sin commitear. Resolvelos antes de actualizar.'
}

Ejecutar 'git' @('pull', '--ff-only')
Ejecutar 'npm.cmd' @('install')
Ejecutar 'npm.cmd' @('run', 'db:start')
Ejecutar 'npm.cmd' @('run', 'db:migrate')
Ejecutar 'npm.cmd' @('run', 'build')

if ($SinReiniciar) {
    Write-Host 'Reinicio omitido (-SinReiniciar).' -ForegroundColor Yellow
    Write-Host 'Reinicia con "Reiniciar Sistema Stock" o a mano.' -ForegroundColor Yellow
} else {
    $nssm = (Get-Command nssm -ErrorAction SilentlyContinue).Source

    if (-not $nssm -and (Test-Path 'C:\Program Files\nssm\nssm.exe')) {
        $nssm = 'C:\Program Files\nssm\nssm.exe'
    }

    $servicio = $null

    if ($nssm) {
        $servicio = Get-Service -Name $NombreServicio -ErrorAction SilentlyContinue
    }

    if ($nssm -and $servicio) {
        $esAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole(
            [Security.Principal.WindowsBuiltInRole]::Administrator
        )

        if ($esAdmin) {
            Ejecutar $nssm @('restart', $NombreServicio)
        } else {
            Write-Host 'Se necesita permiso de administrador para reiniciar el servicio. Abriendo UAC...' -ForegroundColor Yellow
            $proceso = Start-Process -FilePath $nssm -ArgumentList @('restart', $NombreServicio) -Verb RunAs -Wait -PassThru

            if ($proceso.ExitCode -ne 0) {
                throw "No se pudo reiniciar el servicio $NombreServicio (codigo $($proceso.ExitCode))."
            }
        }

        Write-Host "Servicio $NombreServicio reiniciado." -ForegroundColor Green
    } elseif (Test-Path (Join-Path $raiz 'server\scripts\control-local.ps1')) {
        Write-Host 'Reiniciando el sistema con el lanzador local...' -ForegroundColor Cyan

        & powershell.exe -NoProfile -ExecutionPolicy Bypass `
            -File (Join-Path $raiz 'server\scripts\control-local.ps1') restart -SinNavegador

        if ($LASTEXITCODE -eq 0) {
            Write-Host 'Sistema reiniciado.' -ForegroundColor Green
        } else {
            Write-Host 'No se pudo reiniciar automaticamente. Usa "Reiniciar Sistema Stock".' -ForegroundColor Yellow
        }
    } else {
        Write-Host 'No hay servicio NSSM ni lanzador local: el reinicio queda pendiente.' -ForegroundColor Yellow
        Write-Host 'Reinicia el sistema con "Reiniciar Sistema Stock" o a mano.' -ForegroundColor Yellow
    }
}

Write-Host 'Commit activo:' -ForegroundColor Cyan
git log --oneline -1

Write-Host 'Actualizacion terminada.' -ForegroundColor Green
