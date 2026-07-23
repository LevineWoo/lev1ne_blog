---
description: 記錄喺 Debian VPS 上使用 nginx-acme 自動申請 Let's Encrypt
  SSL Certificate 嘅過程。
pubDatetime: 2026-07-23
tags:
- Debian
- Nginx
- SSL
- ACME
- VPS
title: Debian / Ubuntu 用 nginx-acme 自動搞掂 SSL Certificate
---

# Debian / Ubuntu 用 nginx-acme 自動搞掂 SSL Certificate

最近又開咗部 Debian VPS，順手整埋 Web Server。

以前玩 Nginx，如果想開 HTTPS，通常流程都係：

1.  安裝 Certbot
2.  申請 SSL Certificate
3.  修改 Nginx Config
4.  設定自動 Renewal

今次試下 `nginx-acme` 呢個方案。

簡單講：

> 由 Nginx 自己處理 ACME Certificate。

------------------------------------------------------------------------

## nginx-acme 係咩？

`nginx-acme` 係 Nginx 官方推出嘅 ACME Module，用來自動申請同管理 SSL
Certificate。

支援：

-   Let's Encrypt
-   ACME Protocol
-   自動申請 Certificate
-   自動 Renewal

------------------------------------------------------------------------

## 安裝前準備

以下假設：

-   Debian / Ubuntu Server
-   已經有 Domain
-   DNS 已經指向 VPS IP
-   有 sudo 權限

更新系統：

``` bash
sudo apt update
sudo apt upgrade -y
```

安裝工具：

``` bash
sudo apt install curl vim wget gnupg dpkg apt-transport-https lsb-release ca-certificates
```

------------------------------------------------------------------------

## 安裝 Nginx

加入 Repository：

``` bash
curl -sSL https://n.wtf/public.key | sudo bash -c 'gpg --dearmor > /usr/share/keyrings/n.wtf.gpg'
```

更新：

``` bash
sudo apt update
```

安裝：

``` bash
sudo apt install nginx-extras -y
```

------------------------------------------------------------------------

## 配置 nginx-acme

建立 Certificate Storage：

``` bash
sudo mkdir -p /var/cache/nginx/letsencrypt
sudo chown 33:33 /var/cache/nginx -R
```

修改：

``` bash
sudo nano /etc/nginx/sites-enabled/default
```

加入：

``` nginx
resolver 8.8.8.8:53 ipv6=off valid=5s;

acme_issuer letsencrypt {
    uri https://acme-v02.api.letsencrypt.org/directory;
    contact admin@example.com;
    state_path /var/cache/nginx/letsencrypt;
    accept_terms_of_service;
    ssl_trusted_certificate /etc/ssl/certs/ca-certificates.crt;
    ssl_verify on;
}

acme_shared_zone zone=ngx_acme_shared:1M;
```

------------------------------------------------------------------------

## 配置 HTTPS Site

``` nginx
server {
    listen 443 ssl;

    server_name example.com;

    root /var/www/html;

    ssl_protocols TLSv1.3;

    acme_certificate letsencrypt;

    ssl_certificate $acme_certificate;
    ssl_certificate_key $acme_certificate_key;
}
```

重點：

``` nginx
acme_certificate letsencrypt;
```

呢行會令 Nginx 自動處理 Certificate。

------------------------------------------------------------------------

## 測試

``` bash
sudo nginx -t
sudo nginx -s reload
```

之後：

``` text
https://example.com
```

應該已經可以正常使用 HTTPS。

------------------------------------------------------------------------

## Certificate Renewal

`nginx-acme` 會自動處理 Renewal，唔需要另外寫 Cron。

查看：

``` bash
journalctl -u nginx
```

------------------------------------------------------------------------

## 總結

玩 VPS 咁耐，最煩通常唔係裝 Nginx。

真正麻煩係：

-   SSL Certificate 管理
-   Renewal
-   Domain Validation
-   HTTPS Redirect

以前開一部新 VPS，又要重新搞一次 Certbot。

而家配置好 nginx-acme，之後交畀 Nginx 自己處理。

少啲手動操作，多啲自動化。

慢慢將重複工作自動化，先係玩 Infrastructure 嘅樂趣。
