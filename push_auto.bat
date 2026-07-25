@echo off
chcp 65001 >nul
echo ========================================
echo   Push to GitHub (direct + proxy)
echo ========================================

set "GIT_HOME=C:\Users\17205\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git"
set "GIT=%GIT_HOME%\cmd\git.exe"
set "PATH=%GIT_HOME%\mingw64\bin;%GIT_HOME%\mingw64\libexec\git-core;%GIT_HOME%\cmd;%PATH%"
cd /d "C:\Users\17205\Documents\2"

echo.
echo [1] Trying direct...
"%GIT%" config --unset http.proxy 2>nul
"%GIT%" config --unset https.proxy 2>nul
"%GIT%" push origin main
if %ERRORLEVEL% EQU 0 goto success

echo.
echo [2] Trying proxy 7890...
"%GIT%" config http.proxy http://127.0.0.1:7890
"%GIT%" config https.proxy http://127.0.0.1:7890
"%GIT%" push origin main
if %ERRORLEVEL% EQU 0 goto success

echo.
echo ========================================
echo   FAILED - Check network or try later
echo ========================================
goto end

:success
echo.
echo SUCCESS! https://soelcc.github.io/shiguang-portrait/

:end
"%GIT%" config --unset http.proxy 2>nul
"%GIT%" config --unset https.proxy 2>nul
pause