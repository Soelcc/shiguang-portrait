@echo off
set "GIT_HOME=C:\Users\17205\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git"
set "GIT=%GIT_HOME%\cmd\git.exe"
set "PATH=%GIT_HOME%\mingw64\bin;%GIT_HOME%\mingw64\libexec\git-core;%GIT_HOME%\cmd;%PATH%"
cd /d "C:\Users\17205\Documents\2"
"%GIT%" add -A
"%GIT%" commit -m "Swap AI studio panels"
echo Now try push again... 
"%GIT%" push origin main
pause
