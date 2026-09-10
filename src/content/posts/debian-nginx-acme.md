---
title: "🔐 唔用 Certbot 都得：Debian 13 用 NGINX 官方 ACME 自動管 SSL"
description: "整理 NGINX 官方 ngx_http_acme_module 喺 Debian 13 嘅安裝同設定，用 nginx-module-acme 直接申請、載入同自動續期 Let's Encrypt Certificate。"
pubDatetime: 2026-07-23
modDatetime: 2026-09-10
tags:
  - Debian
  - Nginx
  - SSL
  - ACME
  - Let's Encrypt
  - VPS
---

# 🔐 唔用 Certbot 都得：Debian 13 用 NGINX 官方 ACME 自動管 SSL

以前幫 Nginx 開 HTTPS，我第一反應通常都係 Certbot。

佢成熟、資料多、出問題亦容易搵答案，所以如果一部機已經穩定跑緊 Certbot，其實完全冇必要為咗「新」而換。

不過新機由零開始就唔同。NGINX 而家已經有官方 `ngx_http_acme_module`，而且官方 Package 提供 `nginx-module-acme`。如果部 VPS 本身就係用 nginx.org 嘅 Nginx，Certificate 由 Nginx 自己申請同 Renewal，成套配置可以少一層外部工具 ✨。

呢篇就記低 Debian 13（Trixie）我會點樣由零砌呢套做法。

## 🧩 呢個 ACME Module 實際做咩？

`ngx_http_acme_module` 實作 ACMEv2，可以同 Let's Encrypt 呢類 CA 溝通。

概念其實好直接：

```text
Nginx
  ↓
ACME Module
  ↓
Domain Validation
  ↓
取得 Certificate + Private Key
  ↓
Nginx 直接載入
  ↓
到期前自動 Renewal
```

官方文件目前亦提供預編譯 `nginx-module-acme` Package，所以新機唔需要為咗 ACME 自己 Compile Nginx，少一件麻煩事 😮‍💨。

下面用：

- Debian 13
- nginx.org 官方 Repository
- `nginx-module-acme`
- Let's Encrypt
- HTTP-01 Challenge

做例子。

## 📦 先裝 nginx.org 官方 Repository

先準備工具：

```bash
sudo apt update
sudo apt install -y curl gnupg2 ca-certificates lsb-release debian-archive-keyring
```

下載 Signing Key：

```bash
curl https://nginx.org/keys/nginx_signing.key | gpg --dearmor \
  | sudo tee /usr/share/keyrings/nginx-archive-keyring.gpg > /dev/null
```

再加 Stable Repository：

```bash
echo "deb [signed-by=/usr/share/keyrings/nginx-archive-keyring.gpg] \
https://nginx.org/packages/debian $(lsb_release -cs) nginx" \
  | sudo tee /etc/apt/sources.list.d/nginx.list
```

我通常會加埋 Pinning，避免系統混用 Debian 自己嘅 Nginx Package：

```bash
echo -e "Package: *\nPin: origin nginx.org\nPin: release o=nginx\nPin-Priority: 900\n" \
  | sudo tee /etc/apt/preferences.d/99nginx
```

更新：

```bash
sudo apt update
```

## ⚙️ 安裝 Nginx 同 ACME Module

直接：

```bash
sudo apt install -y nginx nginx-module-acme
```

先確認 Package：

```bash
dpkg -l | grep -E 'nginx|nginx-module-acme'
```

再睇 Module 放咗喺邊：

```bash
dpkg -L nginx-module-acme | grep ngx_http_acme_module
```

Dynamic Module 要喺 Nginx Main Context 載入。如果 Package 已經幫你處理，就唔好重複加；如果未有，可以按實際 `.so` 位置喺 `/etc/nginx/nginx.conf` 最前面加入：

```nginx
load_module modules/ngx_http_acme_module.so;
```

每次改完先：

```bash
sudo nginx -t
```

唔好未 Test 就直接 Reload ⚠️。

## 💾 ACME State 一定要持久保存

ACME Account、Certificate 同相關 State 唔應該每次 Restart 都重新生成。

先睇 Nginx Worker User：

```bash
grep '^user' /etc/nginx/nginx.conf
```

nginx.org Package 常見會係 `nginx`，例如建立：

```bash
sudo install -d -o nginx -g nginx /var/cache/nginx/acme-letsencrypt
```

如果你實際用其他 User，就照自己配置改 Owner，唔好死抄。

## 🪪 配置 Let's Encrypt Issuer

`acme_issuer` 放喺 `http {}` Context。

例如：

```nginx
http {
    resolver 1.1.1.1 1.0.0.1 valid=300s;
    resolver_timeout 5s;

    acme_issuer letsencrypt {
        uri https://acme-v02.api.letsencrypt.org/directory;
        contact admin@example.com;
        state_path /var/cache/nginx/acme-letsencrypt;
        accept_terms_of_service;
    }

    acme_shared_zone zone=ngx_acme_shared:1M;

    # 其他 include / server...
}
```

要改嘅主要有兩樣：

- `admin@example.com` → 自己真正收得到信嘅 Email
- `resolver` → 按 VPS 網絡環境決定

Resolver 唔一定要 Cloudflare，只要係部機可靠可用嘅 DNS 就得。

## 🌐 HTTPS Server 反而幾乾淨

例如 `example.com`：

```nginx
server {
    listen 443 ssl;
    listen [::]:443 ssl;

    server_name example.com;

    acme_certificate letsencrypt;

    ssl_certificate     $acme_certificate;
    ssl_certificate_key $acme_certificate_key;
    ssl_certificate_cache max=2;

    root /var/www/html;
    index index.html;
}
```

`acme_certificate letsencrypt;` 會將呢個 Server 同頭先定義嘅 Issuer 連起來。

如果冇另外指定 Identifier，Module 可以由 `server_name` 取得 Domain，所以最重要係 DNS 真係指啱部機 ✅。

## 🚪 用 HTTP-01，Port 80 唔可以假裝唔存在

HTTPS Site 寫好唔代表 ACME 一定成功。

用 HTTP-01 Challenge 時，外網要連到 TCP 80。最簡單可以保留：

```nginx
server {
    listen 80;
    listen [::]:80;

    server_name example.com;

    location / {
        return 301 https://$host$request_uri;
    }
}
```

如果 Certificate 一直申請唔到，我會先查：

- DNS A / AAAA Record 有冇指錯
- VPS Firewall 有冇放行 80
- Cloud Provider Security Group 有冇擋
- 前面有冇另一層 Reverse Proxy / CDN 改咗 Request
- State Path 權限啱唔啱

好多時唔係 ACME Config 寫錯，而係 Challenge 根本入唔到部機。呢種最易令人喺 Config 入面兜圈兜到懷疑人生 😵‍💫。

## 🛠️ Reload 之前先睇 Log

配置檢查：

```bash
sudo nginx -t
```

冇 Error 再：

```bash
sudo systemctl reload nginx
```

跟 systemd Log：

```bash
sudo journalctl -u nginx -f
```

或者直接睇 Error Log：

```bash
sudo tail -f /var/log/nginx/error.log
```

第一次申請 Certificate 時，我會特別睇住呢度 👀。DNS、CA、Challenge、Module Load 同檔案權限問題通常都會留線索。

## 🔁 Renewal 仲使唔使 Cron？

正常唔需要另外寫 Certbot Timer 或 Renewal Cron。

呢套方案嘅重點正正係由 ACME Module 管 Certificate Lifecycle，而 `state_path` 用嚟持久化相關狀態。

不過「自動續期」唔代表永遠唔使理。我仍然會做：

- Monitor Certificate Expiry
- 留意 Nginx Error Log
- 改 DNS / CDN / Firewall 後重新確認 HTTP-01
- Backup Nginx Config

自動化係減少日常操作，唔係取消 Monitoring 🤖≠🧠。

## 🤔 咁 Certbot 仲有冇必要？

有，而且好多情況我仍然會揀 Certbot。

如果部機：

- 已經穩定跑咗好耐
- 有多個 Service 共用 Certificate
- Certificate 流程已經同現有 Automation 綁得好好

咁就冇必要為咗少一個 Process 而重砌。

但如果係一部新 Debian VPS，而我本身就會裝 nginx.org 官方 Package，呢條路就幾順：

```text
nginx.org Repository
      ↓
nginx + nginx-module-acme
      ↓
acme_issuer
      ↓
HTTP-01 Validation
      ↓
Nginx 自己申請 + Renewal
```

少一個第三方 Repository，亦少一套獨立 Certificate Tool 要維護，對簡單 Web Server 幾啱用 👍。

## 📚 參考資料

- NGINX ACME Module: https://nginx.org/en/docs/http/ngx_http_acme_module.html
- NGINX Linux Packages: https://nginx.org/en/linux_packages.html
- nginx/nginx-acme: https://github.com/nginx/nginx-acme
- Let's Encrypt ACME Directory: https://acme-v02.api.letsencrypt.org/directory
