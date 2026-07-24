@echo off
set "GIT=C:\Users\17205\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe"
cd /d "C:\Users\17205\Documents\2"

echo === Push QR codes to GitHub ===
echo.

echo [1/4] Config git user...
"%GIT%" config user.name "shiguang"
"%GIT%" config user.email "19331022216@163.com"

echo [2/4] Add all files...
"%GIT%" add -A

echo [3/4] Commit...
"%GIT%" commit -m "Update QR codes and all changes"

echo [4/4] Pull and push...
"%GIT%" pull origin main --rebase 2>nul
"%GIT%" push origin main

if %errorlevel% equ 0 (
    echo.
    echo === SUCCESS! ===
    echo Open: https://soelcc.github.io/shiguang-portrait/
) else (
    echo.
    echo === PUSH FAILED ===
    echo Check your network and try again.
)
pause
