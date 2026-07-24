@echo off
set "GIT_HOME=C:\Users\17205\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git"
set "GIT=%GIT_HOME%\cmd\git.exe"
set "PATH=%GIT_HOME%\mingw64\bin;%GIT_HOME%\mingw64\libexec\git-core;%GIT_HOME%\cmd;%PATH%"
cd /d "C:\Users\17205\Documents\2"

echo === Push to GitHub ===
echo.

"%GIT%" config user.name "shiguang"
"%GIT%" config user.email "19331022216@163.com"
"%GIT%" add -A
"%GIT%" commit -m "Update: prices, favicon, gallery, scroll reveal"
"%GIT%" push origin main

if %errorlevel% equ 0 (
    echo.
    echo === SUCCESS ===
    echo https://soelcc.github.io/shiguang-portrait/
) else (
    echo.
    echo === FAILED ===
)
pause