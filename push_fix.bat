@echo off
set "GIT_HOME=C:\Users\17205\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git"
set "GIT=%GIT_HOME%\cmd\git.exe"
set "PATH=%GIT_HOME%\mingw64\bin;%GIT_HOME%\mingw64\libexec\git-core;%GIT_HOME%\cmd;%PATH%"
cd /d "C:\Users\17205\Documents\2"
echo === Push ===
"%GIT%" config user.name "shiguang"
"%GIT%" config user.email "19331022216@163.com"
"%GIT%" add -A
"%GIT%" commit -m "Registration: SMS code + security rules + IP/location tracking"
"%GIT%" push origin main
if %errorlevel% equ 0 (echo DONE: https://soelcc.github.io/shiguang-portrait/) else (echo FAILED - check network)
pause
