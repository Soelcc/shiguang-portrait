@echo off
set "GIT_HOME=C:\Users\17205\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git"
set "GIT=%GIT_HOME%\cmd\git.exe"
set "PATH=%GIT_HOME%\mingw64\bin;%GIT_HOME%\mingw64\libexec\git-core;%GIT_HOME%\cmd;%PATH%"
cd /d "C:\Users\17205\Documents\2"

echo === Push via VPN proxy ===
echo.

echo Config proxy 127.0.0.1:7890...
"%GIT%" config http.proxy http://127.0.0.1:7890
"%GIT%" config https.proxy http://127.0.0.1:7890

echo Adding and committing...
"%GIT%" config user.name "shiguang"
"%GIT%" config user.email "19331022216@163.com"
"%GIT%" add -A
"%GIT%" commit -m "AI studio Chinese prompts + admin AI logs + all fixes"

echo Pushing...
for /l %%i in (1,1,3) do (
    "%GIT%" push origin main
    if not errorlevel 1 (
        echo === SUCCESS ===
        echo https://soelcc.github.io/shiguang-portrait/
        pause & exit /b 0
    )
    echo Retry %%i/3...
    timeout /t 3 /nobreak >nul
)
echo FAILED - try without proxy or different port
pause
