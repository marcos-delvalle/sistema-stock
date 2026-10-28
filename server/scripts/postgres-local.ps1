param(
    [ValidateSet('start', 'stop', 'status')]
    [string]$Accion = 'status'
)

$ErrorActionPreference = 'Stop'

$base = Join-Path $env:LOCALAPPDATA 'gestion-stock\pgsql'
$pgCtl = Join-Path $base 'pgsql\bin\pg_ctl.exe'
$data = Join-Path $base 'data'
$log = Join-Path $base 'postgres.log'

if (-not (Test-Path $pgCtl)) {
    Write-Error "No se encontró PostgreSQL portable en $base. Instalá PostgreSQL o ejecutá el setup inicial."
}

# pg_ctl status devuelve 0 si ESTA instancia portable está corriendo.
& $pgCtl -D $data status *> $null
$portableCorriendo = ($LASTEXITCODE -eq 0)

$puertoOcupado = [bool](Get-NetTCPConnection -LocalPort 5432 -State Listen -ErrorAction SilentlyContinue)

switch ($Accion) {
    'start' {
        if ($portableCorriendo) {
            Write-Output 'PostgreSQL portable ya está corriendo en el puerto 5432.'
            exit 0
        }

        if ($puertoOcupado) {
            Write-Output 'Ya hay un PostgreSQL escuchando en el puerto 5432. Se usa ese.'
            exit 0
        }

        & $pgCtl -D $data -l $log -o '-p 5432' -w start
        exit $LASTEXITCODE
    }

    'stop' {
        if (-not $portableCorriendo) {
            Write-Output 'El PostgreSQL portable no está corriendo.'
            exit 0
        }

        & $pgCtl -D $data -m fast -w stop
        exit $LASTEXITCODE
    }

    'status' {
        if (-not $portableCorriendo) {
            Write-Output 'El PostgreSQL portable no está corriendo.'
            exit 1
        }

        & $pgCtl -D $data status
        exit $LASTEXITCODE
    }
}
