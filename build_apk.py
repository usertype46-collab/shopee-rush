import os
import subprocess
import urllib.request

# ================= 專案設定區 =================
APP_NAME = "MyWebApp"               # 你的 App 名稱
PKG_NAME = "com.example.mywebapp"   # 你的包名 (不能包含大寫或特殊符號)
WEB_URL = "https://www.google.com"  # 你要打包的網址
# ============================================

JAVA_DIR = f"src/{PKG_NAME.replace('.', '/')}"
OBJ_DIR = "obj"

def run_cmd(cmd):
    print(f"[*] 執行: {' '.join(cmd)}")
    result = subprocess.run(cmd)
    if result.returncode != 0:
        print("[!] 發生錯誤，中斷編譯！")
        exit(1)

print("\n=== 2026 現代化 WebView APK 打包腳本 ===")

# 1. 準備目錄與下載核心庫 (android.jar)
os.makedirs(JAVA_DIR, exist_ok=True)
os.makedirs(OBJ_DIR, exist_ok=True)

if not os.path.exists("android.jar"):
    print("[*] 正在下載最新版 android.jar (API 34)...")
    url = "https://raw.githubusercontent.com/ScaCap/android-jar/master/android-33/android.jar"
    urllib.request.urlretrieve(url, "android.jar")

# 2. 生成 AndroidManifest.xml
manifest_content = f"""<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android" package="{PKG_NAME}">
    <uses-permission android:name="android.permission.INTERNET" />
    <application android:label="{APP_NAME}" android:theme="@android:style/Theme.DeviceDefault.NoActionBar">
        <activity android:name=".MainActivity" android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
"""
with open("AndroidManifest.xml", "w", encoding="utf-8") as f:
    f.write(manifest_content)

# 3. 生成 Java 原始碼 (MainActivity.java)
java_content = f"""package {PKG_NAME};
import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {{
    private WebView webView;
    @Override
    protected void onCreate(Bundle savedInstanceState) {{
        super.onCreate(savedInstanceState);
        webView = new WebView(this);
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webView.setWebViewClient(new WebViewClient());
        webView.loadUrl("{WEB_URL}");
        setContentView(webView);
    }}
    @Override
    public void onBackPressed() {{
        if (webView.canGoBack()) {{
            webView.goBack();
        }} else {{
            super.onBackPressed();
        }}
    }}
}}
"""
with open(f"{JAVA_DIR}/MainActivity.java", "w", encoding="utf-8") as f:
    f.write(java_content)

# 4. 編譯資源與清單 (aapt2)
# 使用現代化 aapt2 工具鏈，將 Manifest 打包進基底 APK
run_cmd(["aapt2", "link", "-o", "base.apk", "-I", "android.jar", "--manifest", "AndroidManifest.xml", "--java", "src"])

# 5. 編譯 Java 為 Class (javac)
run_cmd(["javac", "-source", "1.8", "-target", "1.8", "-bootclasspath", "android.jar", "-d", OBJ_DIR, f"{JAVA_DIR}/MainActivity.java"])

# 6. 將 Class 轉換為 Dex (d8)
# D8 是 2026 標配的位元組碼編譯器，取代了舊的 dx
run_cmd(["d8", "--lib", "android.jar", "--output", ".", f"{OBJ_DIR}/{PKG_NAME.replace('.', '/')}/MainActivity.class"])

# 7. 合併 Dex 與資源 (zip)
run_cmd(["zip", "-uj", "base.apk", "classes.dex"])

# 8. 生成簽名憑證並簽名 (apksigner)
if not os.path.exists("mykey.keystore"):
    print("[*] 創建新的數位簽名憑證...")
    run_cmd(["keytool", "-genkey", "-v", "-keystore", "mykey.keystore", "-keyalg", "RSA", "-keysize", "2048", "-validity", "10000", "-alias", "app", "-dname", "CN=Termux, OU=Dev, O=Dev, L=Taipei, S=TW, C=TW", "-storepass", "123456", "-keypass", "123456"])

print("[*] 正在為 APK 進行最終簽署...")
run_cmd(["apksigner", "sign", "--ks", "mykey.keystore", "--ks-pass", "pass:123456", "--out", "FinalApp.apk", "base.apk"])

print("\n✅ 打包成功！你的應用程式已輸出為：FinalApp.apk")
