@echo off
set "GIT=C:\Users\17205\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe"
cd /d "C:\Users\17205\Documents\2"

echo === Fix rebase and restore files ===
echo.

echo [1/3] Abort broken rebase...
"%GIT%" rebase --abort

echo [2/3] Restore all files to last commit...
"%GIT%" reset --hard HEAD

echo [3/3] Current status...
"%GIT%" status

echo.
echo === FIXED ===
echo All files restored. Ready for next step.
pause
