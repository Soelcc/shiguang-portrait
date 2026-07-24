@echo off
chcp 65001 >nul
echo ============================================
echo   Shiguang Portrait - Push to GitHub
echo ============================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "$t='YOUR_TOKEN';$h=@{'Authorization'='Bearer '+$t;'Accept'='application/vnd.github+json'};$files=@('index.html','admin.html','css/style.css','js/main.js','images/qr-wechat.svg','images/qr-alipay.svg');foreach($f in $files){Write-Host \"Pushing: $f\";try{$c=[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes([IO.File]::ReadAllText(\"C:\\Users\\17205\\Documents\\2\\$f\")));$api='https://api.github.com/repos/Soelcc/shiguang-portrait/contents/'+$f;try{$sha=(Invoke-RestMethod $api -Headers $h -TimeoutSec 10).sha;$body=@{message='real payment + VIP review';content=$c;sha=$sha}|ConvertTo-Json}catch{$body=@{message='add: '+$f;content=$c}|ConvertTo-Json};Invoke-RestMethod $api -Method Put -Headers $h -Body $body -ContentType 'application/json' -TimeoutSec 30|Out-Null;Write-Host '  [OK]' -ForegroundColor Green}catch{Write-Host \"  [FAIL] $_\" -ForegroundColor Red}}"

echo.
echo Done! Visit:
echo   https://soelcc.github.io/shiguang-portrait/
echo   https://soelcc.github.io/shiguang-portrait/admin.html
echo.
pause