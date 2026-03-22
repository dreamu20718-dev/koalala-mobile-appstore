@echo off
setlocal

call "%~dp0sync_cap.cmd"
if errorlevel 1 exit /b 1

set "NODE_EXE=%ProgramFiles%\nodejs\node.exe"
if not exist "%NODE_EXE%" (
  echo [ERROR] Node.js not found at %NODE_EXE%
  exit /b 1
)

echo Opening Android Studio project...
"%NODE_EXE%" "%~dp0node_modules\@capacitor\cli\bin\capacitor" open android
if errorlevel 1 exit /b 1

endlocal
