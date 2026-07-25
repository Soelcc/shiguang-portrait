@echo off
set "GIT_HOME=C:\Users\17205\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git"
set "GIT=%GIT_HOME%\cmd\git.exe"
set "PATH=%GIT_HOME%\mingw64\bin;%GIT_HOME%\mingw64\libexec\git-core;%GIT_HOME%\cmd;%PATH%"
cd /d "C:\Users\17205\Documents\2"
"%GIT%" config user.name "shiguang"
"%GIT%" config user.email "19331022216@163.com"
"%GIT%" add -A
"%GIT%" commit -m "Fix encoding + Unsplash real photos"
echo Pushing...
"%GIT%" push origin main
if not errorlevel 1 (echo DONE!) else (echo FAILED)
pause
