pkg update && pkg upgrade
pkg install python git
git clone https://github.com/usertype46@gmail.com/HiveBear.git
git clone https://github.com/usertype46-collab/HiveBear.git
git clone https://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@github.com/usertype46-collab/HiveBear.git
git clone https://github.com/usertype46-collab/myweb/HiveBear.git
cd~
cd
pkg update && pkg upgrade -y
pkg install git curl aapt apksigner dx ecj quickjs -y
termux-setup-storage
curl -O https://raw.githubusercontent.com/BuildAPKs/buildAPKs/master/setup.buildAPKs.bash
yes | bash setup.buildAPKs.bash
cp ~/buildAPKs/scripts/bash/build/build.one.bash ~/../usr/bin/
chmod +775 ~/../usr/bin/build.one.bash
git clone https://github.com/StringManolo/APKGenerator
cd APKGenerator
qjs --std APKGenerator.js -u https://你的網址.com -n com.example.mywebsite -t 網站App名稱
qjs --std APKGenerator.js -u https://usertype46-collab.github.io/asd-1278/%E5%9B%9E%E5%A0%B1%E7%B3%BB%E7%B5%B1.html -n com.example.mywebsite -t shopee
cd~
qjs --std APKGenerator.js -u https://usertype46-collab.github.io/asd-1278/%E5%9B%9E%E5%A0%B1%E7%B3%BB%E7%B5%B1.html -n com.example.mywebsite -t shopee
pkg update && pkg upgrade -y
qjs --std APKGenerator.js -u https://usertype46-collab.github.io/asd-1278/%E5%9B%9E%E5%A0%B1%E7%B3%BB%E7%B5%B1.html -n com.example.mywebsite -t shopee
cat ~/buildAPKs/var/log/stnderr.main.log
cd
pkg update && pkg upgrade -y
pkg install python openjdk-17 aapt2 apksigner d8 wget zip -y
nano build_apk.py
python build_apk.py
sed -i 's|https://github.com/ScaCap/android-jar/raw/master/android-34/android.jar|https://raw.githubusercontent.com/ScaCap/android-jar/master/android-33/android.jar|g' build_apk.py
python build_apk.py
# 1. 更新套件庫
pkg update && pkg upgrade -y
# 2. 安裝 JDK 17、Android 開發工具包、Python 與相關工具
pkg install openjdk-17 android-tools python wget zip -y
mkdir -p web2apk
cd web2apk
mkdir -p assets
cat << 'EOF' > assets/index.html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Termux Web App</title>
    <style>
        body {
            font-family: system-ui, -apple-system, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            text-align: center;
        }
        .card {
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(10px);
            padding: 30px;
            border-radius: 20px;
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
        }
        button {
            margin-top: 15px;
            padding: 12px 24px;
            font-size: 16px;
            border: none;
            border-radius: 8px;
            background: #fff;
            color: #764ba2;
            font-weight: bold;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div class="card">
        <h1>📱 歡迎使用 Termux 打包的 App</h1>
        <p>這是一個完全在手機本地編譯運行的 WebView 應用程式。</p>
        <button onclick="alert('JavaScript 運作正常！')">測試互動功能</button>
    </div>
</body>
</html>
EOF

