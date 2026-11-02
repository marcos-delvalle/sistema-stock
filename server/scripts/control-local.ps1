param(
    [ValidateSet('start', 'stop', 'restart', 'status')]
    [string]$Accion = 'start',

    [switch]$SinNavegador,

    [switch]$SinMensajes
)

$ErrorActionPreference = 'Stop'

# La API es local: evitamos que un proxy corporativo intercepte las llamadas
# (la detección automática de proxy puede tardar ~20 s la primera vez).
[System.Net.WebRequest]::DefaultWebProxy = $null

# Raíz del proyecto: server\scripts\control-local.ps1 -> dos niveles arriba
$raiz = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$logs = Join-Path $raiz 'logs'
$logApi = Join-Path $logs 'api.log'
$logErr = Join-Path $logs 'api.err.log'
$logControl = Join-Path $logs 'control.log'
$archivoPid = Join-Path $logs 'api.pid'

$puerto = 3000
$archivoEnv = Join-Path $raiz 'server\.env'

# Si server\.env define PORT, respetamos ese puerto.
if (Test-Path $archivoEnv) {
    $lineaPuerto = Get-Content $archivoEnv -ErrorAction SilentlyContinue |
        Where-Object { $_ -match '^\s*PORT\s*=' } |
        Select-Object -Last 1

    if ($lineaPuerto) {
        $valor = ($lineaPuerto -split '=', 2)[1].Trim()

        if ($valor -match '^\d+$') {
            $puerto = [int]$valor
        }
    }
}

New-Item -ItemType Directory -Force $logs | Out-Null
Add-Type -AssemblyName System.Windows.Forms

function Registrar {
    param([string]$Texto)

    $linea = '[{0:yyyy-MM-dd HH:mm:ss}] {1}' -f (Get-Date), $Texto
    Add-Content -Path $logControl -Value $linea -Encoding UTF8
}

function Recortar {
    param([string]$Texto, [int]$Maximo = 800)

    $limpio = ($Texto | Out-String).Trim()

    if ($limpio.Length -gt $Maximo) {
        return $limpio.Substring($limpio.Length - $Maximo)
    }

    return $limpio
}

function MostrarError {
    param([string]$Texto)

    Registrar "ERROR: $Texto"

    if ($SinMensajes) { return }

    [System.Windows.Forms.MessageBox]::Show(
        $Texto,
        'Sistema Stock',
        [System.Windows.Forms.MessageBoxButtons]::OK,
        [System.Windows.Forms.MessageBoxIcon]::Error
    ) | Out-Null
}

function MostrarAviso {
    param([string]$Texto)

    Registrar "AVISO: $Texto"

    if ($SinMensajes) { return }

    [System.Windows.Forms.MessageBox]::Show(
        $Texto,
        'Sistema Stock',
        [System.Windows.Forms.MessageBoxButtons]::OK,
        [System.Windows.Forms.MessageBoxIcon]::Information
    ) | Out-Null
}

function ConexionApi {
    return Get-NetTCPConnection -LocalPort $puerto -State Listen -ErrorAction SilentlyContinue |
        Select-Object -First 1
}

function AbrirNavegador {
    if (-not $SinNavegador) {
        Start-Process "http://localhost:$puerto"
    }
}

function IniciarBase {
    $scriptBase = Join-Path $raiz 'server\scripts\postgres-local.ps1'

    Registrar 'Iniciando PostgreSQL...'

    $salida = & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $scriptBase start 2>&1

    if ($LASTEXITCODE -ne 0) {
        throw "No se pudo iniciar PostgreSQL.`n`n$(Recortar $salida)"
    }

    Registrar (Recortar $salida)
}

function DetenerApi {
    $detenido = $false

    if (Test-Path $archivoPid) {
        $idApi = (Get-Content $archivoPid -Raw).Trim()

        if ($idApi -match '^\d+$') {
            $proceso = Get-Process -Id $idApi -ErrorAction SilentlyContinue

            if ($proceso -and $proceso.ProcessName -eq 'node') {
                Stop-Process -Id $proceso.Id -Force
                $detenido = $true
                Registrar "API detenida (PID $($proceso.Id))."
            }
        }

        Remove-Item $archivoPid -Force -ErrorAction SilentlyContinue
    }

    # Si el puerto sigue ocupado (por ejemplo, se arrancó a mano con npm start),
    # buscamos el proceso que escucha y lo detenemos solo si es Node.
    $conexion = ConexionApi

    if ($conexion) {
        $proceso = Get-Process -Id $conexion.OwningProcess -ErrorAction SilentlyContinue

        if ($proceso -and $proceso.ProcessName -eq 'node') {
            Stop-Process -Id $proceso.Id -Force
            $detenido = $true
            Registrar "API detenida (PID $($proceso.Id), arrancada a mano)."
        }
    }

    for ($i = 0; $i -lt 20; $i++) {
        if (-not (ConexionApi)) { break }
        Start-Sleep -Milliseconds 250
    }

    if (ConexionApi) {
        throw "El puerto $puerto sigue ocupado. Cerrá el proceso que lo usa o reiniciá la PC."
    }

    return $detenido
}

function IniciarApi {
    if (-not (Test-Path (Join-Path $raiz 'server\.env'))) {
        throw 'Falta el archivo server\.env. Pedile al administrador que lo configure.'
    }

    if (-not (Test-Path (Join-Path $raiz 'node_modules'))) {
        throw 'Faltan las dependencias. El administrador debe ejecutar npm install.'
    }

    if (-not (Test-Path (Join-Path $raiz 'dist\index.html'))) {
        Registrar 'No existe dist. Compilando el front...'

        $npm = (Get-Command npm.cmd -ErrorAction Stop).Source
        $salidaBuild = & $npm run build 2>&1

        if ($LASTEXITCODE -ne 0) {
            throw "No se pudo compilar el front.`n`n$(Recortar $salidaBuild)"
        }
    }

    $conexion = ConexionApi

    if ($conexion) {
        $proceso = Get-Process -Id $conexion.OwningProcess -ErrorAction SilentlyContinue

        if ($proceso -and $proceso.ProcessName -eq 'node') {
            Registrar 'La API ya estaba en marcha.'
            return
        }

        throw "El puerto $puerto está ocupado por otro programa ($($proceso.ProcessName)). Liberalo antes de iniciar."
    }

    # Guardamos la salida anterior para no perder el error de un arranque fallido.
    if (Test-Path $logApi) { Move-Item $logApi (Join-Path $logs 'api.prev.log') -Force }
    if (Test-Path $logErr) { Move-Item $logErr (Join-Path $logs 'api.err.prev.log') -Force }

    Registrar 'Iniciando la API...'

    $env:NODE_ENV = 'production'
    $comando = 'node server/index.js >> logs\api.log 2>> logs\api.err.log'

    Start-Process -FilePath $env:ComSpec -ArgumentList '/c', $comando `
        -WorkingDirectory $raiz -WindowStyle Hidden

    $fin = (Get-Date).AddSeconds(30)
    $conexion = $null

    while ((Get-Date) -lt $fin) {
        $conexion = ConexionApi
        if ($conexion) { break }
        Start-Sleep -Milliseconds 300
    }

    if (-not $conexion) {
        $detalle = ''

        if (Test-Path $logErr) {
            $detalle = Get-Content $logErr -Tail 5 -ErrorAction SilentlyContinue | Out-String
        }

        throw "El servidor no arrancó.`n`n$(Recortar $detalle)"
    }

    Set-Content -Path $archivoPid -Value $conexion.OwningProcess -Encoding ASCII
    Registrar "API iniciada (PID $($conexion.OwningProcess)) en el puerto $puerto."

    # La API ya responde. Esperamos un momento a que la base conteste.
    $fin = (Get-Date).AddSeconds(20)

    while ((Get-Date) -lt $fin) {
        try {
            $salud = Invoke-RestMethod "http://127.0.0.1:$puerto/api/salud" -TimeoutSec 2

            if ($salud.ok) {
                Registrar 'Base de datos conectada.'
                return
            }
        } catch {
            # 503 mientras la base no responde: seguimos esperando.
        }

        Start-Sleep -Milliseconds 500
    }

    Registrar 'La API responde, pero la base todavía no está conectada.'
}

function VerEstado {
    $conexion = ConexionApi

    if (-not $conexion) {
        Write-Output "API: detenida (puerto $puerto libre)"
        return
    }

    $proceso = Get-Process -Id $conexion.OwningProcess -ErrorAction SilentlyContinue
    Write-Output "API: en marcha (PID $($conexion.OwningProcess), puerto $puerto)"

    if ($proceso) {
        Write-Output "Proceso: $($proceso.ProcessName)"
    }

    try {
        $salud = Invoke-RestMethod "http://127.0.0.1:$puerto/api/salud" -TimeoutSec 2
        Write-Output "Base de datos: $($salud.baseDeDatos)"
    } catch {
        Write-Output 'Base de datos: sin respuesta'
    }
}

try {
    Registrar "Acción: $Accion"

    switch ($Accion) {
        'start' {
            IniciarBase
            IniciarApi
            AbrirNavegador
        }

        'stop' {
            DetenerApi | Out-Null
            Registrar 'Sistema detenido.'
            MostrarAviso 'Sistema Stock detenido. La base de datos queda corriendo.'
        }

        'restart' {
            IniciarBase
            DetenerApi | Out-Null
            IniciarApi
            AbrirNavegador
        }

        'status' {
            VerEstado
        }
    }
} catch {
    MostrarError $_.Exception.Message
    exit 1
}
