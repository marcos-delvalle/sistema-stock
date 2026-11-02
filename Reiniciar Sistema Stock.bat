@echo off
rem Reinicia la API del sistema sin dejar una consola abierta.
start "" /min powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "%~dp0server\scripts\control-local.ps1" restart
exit /b 0
