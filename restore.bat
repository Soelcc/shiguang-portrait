@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo   Shiguang Portrait - Restore Snapshot
echo ========================================
echo.

if not exist "_backups\" (
  echo No backups found! _backups folder does not exist.
  pause
  exit /b
)

set "count=0"
for /d %%d in (_backups\*) do (
  set /a count+=1
  set "bak[!count!]=%%d"
  echo [!count!] %%~nxd
)

if !count! EQU 0 (
  echo No snapshots found!
  pause
  exit /b
)

echo.
set /p "choice=Enter number to restore (1-!count!), or 0 to cancel: "

if "!choice!"=="0" (
  echo Cancelled.
  pause
  exit /b
)

if !choice! LSS 1 (
  echo Invalid choice!
  pause
  exit /b
)
if !choice! GTR !count! (
  echo Invalid choice!
  pause
  exit /b
)

set "selected=!bak[%choice%]!"
echo.
echo Selected: !selected!
echo.
echo This will overwrite current files:
echo   - index.html
echo   - admin.html
echo   - ai-studio.html
echo   - css/style.css
echo   - js/main.js
echo   - images/ folder
echo.
set /p "confirm=Are you sure? Type YES to confirm: "

if not "!confirm!"=="YES" (
  echo Cancelled.
  pause
  exit /b
)

echo.
echo Restoring from !selected!...

:: Restore files
copy /Y "!selected!\index.html" . >nul 2>&1
copy /Y "!selected!\admin.html" . >nul 2>&1
copy /Y "!selected!\ai-studio.html" . >nul 2>&1
if exist "!selected!\css\style.css" copy /Y "!selected!\css\style.css" css\ >nul 2>&1
if exist "!selected!\js\main.js" copy /Y "!selected!\js\main.js" js\ >nul 2>&1
if exist "!selected!\images\" (
  rd /S /Q images 2>nul
  xcopy /Y /Q /E "!selected!\images" images\ >nul 2>&1
)

echo.
echo ========================================
echo   Restore complete!
echo ========================================
pause