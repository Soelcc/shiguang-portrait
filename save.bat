@rem 时光肖像馆 ©2025 Soelc - 19331022216@163.com
@echo off
chcp 65001 >nul
echo ========================================
echo   Shiguang Portrait - Save Snapshot
echo ========================================
echo.

for /f "tokens=1-3 delims=/" %%a in ("%date:~-10%") do (
  set "YY=%%a"
  set "MM=%%b"
  set "DD=%%c"
)

set "HH=%time:~0,2%"
if "%HH:~0,1%"==" " set "HH=0%HH:~1,1%"
set "MI=%time:~3,2%"
set "SS=%time:~6,2%"

set "FOLDER=%YY%%MM%%DD%_%HH%%MI%%SS%"
set "BAK=_backups\%FOLDER%"
mkdir "%BAK%" 2>nul

echo Snapshot: _backups\%FOLDER%
echo.

copy /Y index.html "%BAK%\" >nul
copy /Y admin.html "%BAK%\" >nul
copy /Y ai-studio.html "%BAK%\" >nul
copy /Y css\style.css "%BAK%\" >nul
copy /Y js\main.js "%BAK%\" >nul
if exist images\*.* xcopy /Y /Q /E images "%BAK%\images\" >nul 2>nul

echo Files saved:
dir /B "%BAK%"
echo.
echo ========================================
echo   Snapshot saved!
echo ========================================
pause