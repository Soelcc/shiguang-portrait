@echo off
set "GIT_HOME=C:\Users\17205\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git"
set "GIT=%GIT_HOME%\cmd\git.exe"
set "PATH=%GIT_HOME%\mingw64\bin;%GIT_HOME%\mingw64\libexec\git-core;%GIT_HOME%\cmd;%PATH%"
cd /d "C:\Users\17205\Documents\2"

echo === Push to GitHub (SSL fix) ===
echo.

echo [1/4] Config...
"%GIT%" config user.name "shiguang"
"%GIT%" config user.email "19331022216@163.com"
"%GIT%" config http.proxy http://127.0.0.1:7890
"%GIT%" config https.proxy http://127.0.0.1:7890
"%GIT%" config http.sslVerify false
"%GIT%" config http.sslBackend openssl

echo [2/4] Commit...
"%GIT%" add -A
"%GIT%" commit -m "Update all: QR codes and fixes"

echo [3/4] Pull...
"%GIT%" pull origin main --rebase

echo [4/4] Push...
"%GIT%" push origin main

if %errorlevel% equ 0 (
    echo.
    echo === SUCCESS! ===
    echo https://soelcc.github.io/shiguang-portrait/
) else (
    echo.
    echo If still failed, try SOCKS5:
    echo "%GIT%" config http.proxy socks5://127.0.0.1:7890
    echo "%GIT%" config https.proxy socks5://127.0.0.1:7890
    echo Then run "%GIT%" push origin main
)
pause
