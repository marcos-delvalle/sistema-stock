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
Ejecutar 'npm.cmd' @('run', 'db:migrate')
Ejecutar 'npm.cmd' @('run', 'build')

if (-not $SinReiniciar) {
    $nssm = (Get-Command nssm -ErrorAction SilentlyContinue).Source

    if (-not $nssm -and (Test-Path 'C:\Program Files\nssm\nssm.exe')) {
        $nssm = 'C:\Program Files\nssm\nssm.exe'
    }

    if (-not $nssm) {
        throw 'No se encontro nssm.exe. Instalalo o usa -SinReiniciar.'
    }

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
} else {
    Write-Host 'Reinicio del servicio omitido (-SinReiniciar).' -ForegroundColor Yellow
}

Write-Host 'Commit activo:' -ForegroundColor Cyan
git log --oneline -1

Write-Host 'Actualizacion terminada.' -ForegroundColor Green
