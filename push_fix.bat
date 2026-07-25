@echo off
set "GIT_HOME=C:\Users\17205\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git"
set "GIT=%GIT_HOME%\cmd\git.exe"
set "PATH=%GIT_HOME%\mingw64\bin;%GIT_HOME%\mingw64\libexec\git-core;%GIT_HOME%\cmd;%PATH%"
cd /d "C:\Users\17205\Documents\2"
echo Pushing...
"%GIT%" config user.name "shiguang"
"%GIT%" config user.email "19331022216@163.com"
"%GIT%" add -A
"%GIT%" commit -m "Fix: sequential ID, Beijing time, admin VIP, Chinese location"
"%GIT%" push origin main
echo.
if %errorlevel% equ 0 (echo SUCCESS: https://soelcc.github.io/shiguang-portrait/) else (echo FAILED)
pause
