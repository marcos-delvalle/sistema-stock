@echo off
rem Arranca el sistema sin dejar una consola abierta.
start "" /min powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "%~dp0server\scripts\control-local.ps1" start
exit /b 0
