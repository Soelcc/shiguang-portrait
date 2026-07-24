@echo off
set "GIT_HOME=C:\Users\17205\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git"
set "GIT=%GIT_HOME%\cmd\git.exe"
set "PATH=%GIT_HOME%\mingw64\bin;%GIT_HOME%\mingw64\libexec\git-core;%GIT_HOME%\cmd;%PATH%"
cd /d "C:\Users\17205\Documents\2"

echo === Push all fixes to GitHub ===
echo.
echo Fixes included:
echo   1. Gallery images: .png -^> .svg
echo   2. Booking form: HTML structure fixed
echo   3. Scroll reveal: animation restored
echo   4. Clean tags: no orphans, no dupes
echo.

"%GIT%" config user.name "shiguang"
"%GIT%" config user.email "19331022216@163.com"
"%GIT%" add -A
"%GIT%" commit -m "Fix: gallery paths, booking form, scroll reveal animation"
"%GIT%" push origin main

if %errorlevel% equ 0 (
    echo.
    echo === SUCCESS ===
    echo Refresh: https://soelcc.github.io/shiguang-portrait/
) else (
    echo === FAILED, try again ===
)
pause
