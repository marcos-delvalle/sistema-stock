Option Explicit

' Reinicia la API del sistema. No muestra ninguna consola.
Dim fso, shell, carpeta, script, comando

Set fso = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")

carpeta = fso.GetParentFolderName(WScript.ScriptFullName)
script = carpeta & "\server\scripts\control-local.ps1"

comando = "powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File """ & script & """ restart"

shell.Run comando, 0, False
