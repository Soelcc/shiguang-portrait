@echo off
set "GIT_HOME=C:\Users\17205\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git"
set "GIT=%GIT_HOME%\cmd\git.exe"
set "PATH=%GIT_HOME%\mingw64\bin;%GIT_HOME%\mingw64\libexec\git-core;%GIT_HOME%\cmd;%PATH%"
cd /d "C:\Users\17205\Documents\2"

echo === Rebuild without token in history ===
echo.

echo [1/5] Config...
"%GIT%" config user.name "shiguang"
"%GIT%" config user.email "19331022216@163.com"

echo [2/5] Remove token files...
del push.bat push_update.bat push_qr.bat push_qr.ps1 push_all.bat clean_push.ps1 clean_push.bat fix_git.bat 2>nul

echo [3/5] Create clean orphan branch...
"%GIT%" checkout --orphan clean_main

echo [4/5] Add all website files...
"%GIT%" add admin.html index.html css/ js/ images/

echo [5/5] Commit and force push...
"%GIT%" commit -m "????? - ????"
"%GIT%" branch -D main
"%GIT%" branch -m main
"%GIT%" push origin main --force

if %errorlevel% equ 0 (
    echo.
    echo === SUCCESS! ===
    echo https://soelcc.github.io/shiguang-portrait/
) else (
    echo.
    echo === FAILED ===
    echo Visit and Allow: https://github.com/Soelcc/shiguang-portrait/security/secret-scanning/unblock-secret/3Gx8zO2ADpvRDg59c9OnWuIJQHw
)
pause
