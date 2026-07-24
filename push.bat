@echo off
cd /d "C:\Users\17205\Documents\2"
echo === ????? - ?????? ===
echo.
git remote set-url origin https://YOUR_TOKEN@github.com/Soelcc/shiguang-portrait.git
git add -A
git -c user.name="shiguang" -c user.email="19331022216@163.com" commit -m "VIP????+????+????"
git push -u origin main
echo.
echo === ?????===
echo ?1-2?????: https://soelcc.github.io/shiguang-portrait/
pause
