param(
    [ValidateSet('start', 'stop', 'status')]
    [string]$Accion = 'status'
)

$ErrorActionPreference = 'Stop'

$base = Join-Path $env:LOCALAPPDATA 'gestion-stock\pgsql'
$pgCtl = Join-Path $base 'pgsql\bin\pg_ctl.exe'
$data = Join-Path $base 'data'
$log = Join-Path $base 'postgres.log'

$puertoOcupado = [bool](Get-NetTCPConnection -LocalPort 5432 -State Listen -ErrorAction SilentlyContinue)
$portableDisponible = Test-Path $pgCtl

# Si no está el portable, puede haber un PostgreSQL instalado como servicio.
# En ese caso dejamos que la API use el servicio y no intentamos arrancar nada.
if (-not $portableDisponible) {
    switch ($Accion) {
        'start' {
            if ($puertoOcupado) {
                Write-Output 'Hay un PostgreSQL escuchando en el puerto 5432 (servicio instalado). Se usa ese.'
                exit 0
            }

            Write-Error "No se encontró PostgreSQL portable en $base y no hay nada escuchando en 5432. Instalá PostgreSQL o creá la instancia portable."
        }

        'stop' {
            if ($puertoOcupado) {
                Write-Output 'El PostgreSQL que escucha en 5432 no es el portable; este script no detiene servicios.'
            } else {
                Write-Output 'No hay PostgreSQL portable para detener.'
            }

            exit 0
        }

        'status' {
            if ($puertoOcupado) {
                Write-Output 'Hay un PostgreSQL escuchando en el puerto 5432 (servicio instalado o externo).'
                exit 0
            }

            Write-Output 'No hay PostgreSQL escuchando en el puerto 5432.'
            exit 1
        }
    }
}

# pg_ctl status devuelve 0 si ESTA instancia portable está corriendo.
& $pgCtl -D $data status *> $null
$portableCorriendo = ($LASTEXITCODE -eq 0)

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
            if ($puertoOcupado) {
                Write-Output 'El PostgreSQL que escucha en 5432 no es el portable; no se detiene desde este script.'
            } else {
                Write-Output 'El PostgreSQL portable no está corriendo.'
            }

            exit 0
        }

        & $pgCtl -D $data -m fast -w stop
        exit $LASTEXITCODE
    }

    'status' {
        if (-not $portableCorriendo) {
            if ($puertoOcupado) {
                Write-Output 'Hay un PostgreSQL escuchando en 5432 (no es el portable).'
                exit 0
            }

            Write-Output 'El PostgreSQL portable no está corriendo.'
            exit 1
        }

        & $pgCtl -D $data status
        exit $LASTEXITCODE
    }
}
