---
title: "Nginx 原生 ACME 自動續 SSL：Debian 13 用官方 nginx-module-acme"
description: "重新整理 Nginx 原生 ACME 配置：Debian 13 改用 nginx.org 官方 Repository 同 nginx-module-acme，直接由 Nginx 申請及續期 Let's Encrypt Certificate。"
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

# Nginx 原生 ACME 自動續 SSL：Debian 13 用官方 nginx-module-acme

以前幫 Nginx 開 HTTPS，最常見都係 Certbot：先申請 Certificate，再由 Timer / Cron 負責 Renewal。

Certbot 本身冇乜問題，不過如果部機本來就只係跑 Nginx，我一直都幾鍾意「Certificate 由 Web Server 自己管埋」呢個思路。

我之前寫過一版 nginx-acme 筆記，當時安裝方法仲要兜去第三方 Package。到 2026 年再睇，呢部分已經值得成篇重寫：**nginx.org 官方 Repository 而家已經直接提供 `nginx-module-acme` Dynamic Module。**

所以今次唔再用第三方 Nginx Source，直接跟官方 Package 走。

## nginx-module-acme 做緊乜？

`ngx_http_acme_module` 係 NGINX 官方嘅 ACMEv2 Module，可以由 Nginx 自己處理 Certificate 申請同 Renewal。

最簡單理解就係：

```text
Nginx 啟動 / Reload
        ↓
ACME Module 同 CA 溝通
        ↓
完成 Domain Validation
        ↓
取得 Certificate + Private Key
        ↓
Nginx 直接使用
        ↓
到期前自動 Renewal
```

如果用 HTTP-01 Challenge，Port 80 仍然要由外網正常連到部 Server；DNS Record 亦要指向正確 IP。

## 呢篇用咩環境？

以下配置以：

- Debian 13（Trixie）
- nginx.org 官方 Package
- `nginx-module-acme`
- Let's Encrypt
- HTTP-01 Challenge

為主。

域名用 `example.com` 示範，Email、Domain 同 Resolver 記得換成自己實際設定。

## 先加入 nginx.org 官方 Repository

安裝必要 Package：

```bash
sudo apt update
sudo apt install -y curl gnupg2 ca-certificates lsb-release debian-archive-keyring
```

下載 NGINX 官方 Signing Key：

```bash
curl https://nginx.org/keys/nginx_signing.key | gpg --dearmor \
  | sudo tee /usr/share/keyrings/nginx-archive-keyring.gpg > /dev/null
```

如果想穩陣啲，可以核對 Fingerprint：

```bash
gpg --dry-run --quiet --no-keyring --import \
  --import-options import-show \
  /usr/share/keyrings/nginx-archive-keyring.gpg
```

NGINX 官方目前列出嘅主 Signing Key Fingerprint 係：

```text
573BFD6B3D8FBC641079A6ABABF5BD827BD9BF62
```

加入 Stable Repository：

```bash
echo "deb [signed-by=/usr/share/keyrings/nginx-archive-keyring.gpg] \
https://nginx.org/packages/debian $(lsb_release -cs) nginx" \
  | sudo tee /etc/apt/sources.list.d/nginx.list
```

再加 Pinning，避免同 Debian 自己嘅 Nginx Package 混埋：

```bash
echo -e "Package: *\nPin: origin nginx.org\nPin: release o=nginx\nPin-Priority: 900\n" \
  | sudo tee /etc/apt/preferences.d/99nginx
```

更新：

```bash
sudo apt update
```

## 安裝 Nginx 同官方 ACME Module

直接裝：

```bash
sudo apt install -y nginx nginx-module-acme
```

可以先確認 Package 已經存在：

```bash
dpkg -l | grep -E 'nginx|nginx-module-acme'
```

再搵 Module 實際位置：

```bash
dpkg -L nginx-module-acme | grep ngx_http_acme_module
```

通常會見到 `ngx_http_acme_module.so`。

## Load ACME Module

Dynamic Module 要喺 `nginx.conf` 主層級載入。如果 Package 已經幫你建立自動 Load 設定，就唔好重複加；如果未有，就喺 `/etc/nginx/nginx.conf` 最前面加入：

```nginx
load_module modules/ngx_http_acme_module.so;
```

之後先 Test：

```bash
sudo nginx -t
```

如果報 Module 路徑錯，就用頭先 `dpkg -L` 搵到嘅完整 `.so` 路徑。

## 建立 ACME State 目錄

Certificate、Account Key 同相關狀態要持久保存，唔好每次 Restart 都重新嚟過。

NGINX 官方 Package 一般用 `nginx` User，可以先確認：

```bash
grep '^user' /etc/nginx/nginx.conf
```

再建立目錄：

```bash
sudo install -d -o nginx -g nginx /var/cache/nginx/acme-letsencrypt
```

如果你部機實際 Worker User 唔係 `nginx`，就按自己配置改 Owner。

## 配置 Let's Encrypt Issuer

`acme_issuer` 要放喺 `http {}` 入面，而且 Module 需要一個 DNS Resolver。

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

    # 其他 include / server 配置...
}
```

`admin@example.com` 記得改成真正收得到信嘅 Email。

Resolver 亦唔一定要用 Cloudflare；如果你部 Server 有可靠嘅本機 Resolver，可以按實際環境設定。

## HTTPS Server 點寫？

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

如果 `acme_certificate` 冇另外指定 Identifier，Module 會由同一個 `server` Block 嘅 `server_name` 取 Domain。

## Port 80 唔好漏

用預設 HTTP-01 Challenge 時，Port 80 Listener 係必要嘅。

最簡單可以留一個 HTTP Server：

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

ACME Module 會處理 Challenge 所需請求，但前提係外面真係連到 TCP 80。

如果：

- Firewall 擋住 Port 80
- Cloud Provider Security Group 未放行
- DNS 指錯 IP
- 前面仲有另一層 Reverse Proxy 截走 Challenge

Certificate 都有可能申請失敗。

## Test、Reload 同睇 Log

每次改完先：

```bash
sudo nginx -t
```

冇 Error 再：

```bash
sudo systemctl reload nginx
```

睇 Log：

```bash
sudo journalctl -u nginx -f
```

或者：

```bash
sudo tail -f /var/log/nginx/error.log
```

第一次申請 Certificate 時，我會特別睇住 Error Log，ACME Server、Challenge、DNS 或 State Path 權限有問題通常都會喺度見到線索。

## Renewal 仲要唔要 Cron？

正常唔需要另外寫 Certbot Timer 或 Renewal Cron。

呢個方案最大吸引力就係 Certificate Lifecycle 交返畀 Nginx ACME Module 處理。`state_path` 保留好之後，Account Key、Certificate 同 Private Key 可以跨 Restart 保存，亦避免無必要重新向 CA 發 Request。

不過「自動」唔代表可以完全唔理。實際用落我仍然會：

- Monitor Certificate Expiry
- 留意 Nginx Error Log
- 改 DNS / Firewall 後確認 Port 80 Challenge 仲通
- Backup Nginx Config

## 同舊方法最大分別

我之前嗰版最大問題唔係 ACME 概念錯，而係安裝鏈太繞：為咗用 Module，要引入額外第三方 Nginx Package Source。

而家可以收斂成：

```text
nginx.org 官方 Repository
        ↓
nginx
+
nginx-module-acme
        ↓
配置 acme_issuer
        ↓
Nginx 自己申請 + Renewal
```

對新 Debian VPS 嚟講乾淨好多，亦少一個第三方 Repository 要信任同維護。

如果部機本身已經穩定用緊 Certbot，其實冇必要純粹為咗「新」而換；但新機由零開始，我會更願意直接試 Nginx 官方 ACME 呢條路。

## 參考資料

- NGINX ACME Module: https://nginx.org/en/docs/http/ngx_http_acme_module.html
- NGINX Linux Packages: https://nginx.org/en/linux_packages.html
- nginx/nginx-acme: https://github.com/nginx/nginx-acme
- Let's Encrypt ACME Directory: https://acme-v02.api.letsencrypt.org/directory
