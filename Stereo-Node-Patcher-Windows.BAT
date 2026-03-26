@echo off
REM Launcher: fetch + run Discord_voice_node_patcher.ps1 (raw + cache-bust each run).
REM Browser: https://github.com/ProdHallow/Discord-Stereo-Windows-MacOS-Linux/blob/main/Updates/Windows/Discord_voice_node_patcher.ps1

title Discord Voice Node Patcher
echo Fetching latest Voice Node Patcher from repo, then starting...
echo.

set "PS1=%TEMP%\discord_voice_node_patcher.ps1"

powershell -NoProfile -ExecutionPolicy Bypass -Command "$u='https://raw.githubusercontent.com/ProdHallow/Discord-Stereo-Windows-MacOS-Linux/main/Updates/Windows/Discord_voice_node_patcher.ps1?t='+[DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds(); Invoke-WebRequest -Uri $u -OutFile '%PS1%' -UseBasicParsing -TimeoutSec 120 -Headers @{'Cache-Control'='no-cache'; 'Pragma'='no-cache'}"

if errorlevel 1 (
  echo Download failed.
  pause
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%PS1%"
pause
