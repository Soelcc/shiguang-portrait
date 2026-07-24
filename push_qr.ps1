# 时光肖像馆 - 推送收款码更新
cd "C:\Users\17205\Documents\2"
git add images/qr-wechat.png images/qr-alipay.png
git commit -m "更新微信和支付宝收款码"
git push origin main
Write-Host "推送完成！按任意键退出..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
