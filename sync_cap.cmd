@echo off
setlocal

set "NODE_EXE=%ProgramFiles%\nodejs\node.exe"
if not exist "%NODE_EXE%" (
  echo [ERROR] Node.js not found at %NODE_EXE%
  echo Please install Node.js from https://nodejs.org/
  exit /b 1
)

echo [1/2] Sync web assets...
"%NODE_EXE%" "%~dp0scripts\sync-web.cjs"
if errorlevel 1 exit /b 1

echo [2/2] Capacitor sync...
"%NODE_EXE%" "%~dp0node_modules\@capacitor\cli\bin\capacitor" sync
if errorlevel 1 exit /b 1

echo Done.
endlocal
