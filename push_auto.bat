@rem 时光肖像馆 ©2025 Soelc - 19331022216@163.com
@echo off
chcp 65001 >nul
echo ========================================
echo   Push to GitHub
echo ========================================
echo.

set "GIT_HOME=C:\Users\17205\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git"
set "GIT=C:\Users\17205\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe"
set "PATH=%GIT_HOME%\mingw64\bin;%GIT_HOME%\mingw64\libexec\git-core;%GIT_HOME%\cmd;%PATH%"

cd /d "C:\Users\17205\Documents\2"

echo [1/4] Config git...
"%GIT%" config user.name "shiguang"
"%GIT%" config user.email "19331022216@163.com"

echo [2/4] Add all changes...
"%GIT%" add -A

echo [3/4] Commit...
"%GIT%" commit -m "Optimize: compress images 1.7MB->1.2MB, add lazy loading for faster page load"

echo [4/4] Push...
"%GIT%" push origin main

if %ERRORLEVEL% NEQ 0 (
  echo.
  echo ========================================
  echo   PUSH FAILED - Try closing VPN first
  echo ========================================
) else (
  echo.
  echo ========================================
  echo   SUCCESS!
  echo   https://soelcc.github.io/shiguang-portrait/
  echo ========================================
)
echo.
pause