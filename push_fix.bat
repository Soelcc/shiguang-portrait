@echo off
setlocal enabledelayedexpansion
set "GIT_HOME=C:\Users\17205\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git"
set "GIT=%GIT_HOME%\cmd\git.exe"
set "PATH=%GIT_HOME%\mingw64\bin;%GIT_HOME%\mingw64\libexec\git-core;%GIT_HOME%\cmd;%PATH%"
cd /d "C:\Users\17205\Documents\2"

echo Commit + Push (retry up to 5 times)
echo.

"%GIT%" config user.name "shiguang"
"%GIT%" config user.email "19331022216@163.com"
"%GIT%" add -A
"%GIT%" commit -m "Fix: ID, time, VIP, location, prices, gallery, favicon"

for /l %%i in (1,1,5) do (
    echo Attempt %%i/5...
    "%GIT%" push origin main
    if !errorlevel! equ 0 (
        echo.
        echo === SUCCESS ===
        echo https://soelcc.github.io/shiguang-portrait/
        goto done
    )
    echo Failed, waiting 5 seconds...
    timeout /t 5 /nobreak >nul
)
echo === All attempts failed ===
:done
pause
