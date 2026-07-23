---
title: "常用 Network Latency 測試 URL 整理，一篇收藏哂"
description: "整理 Google、Apple、Cloudflare、Microsoft 等常用 Connectivity Check URL，方便測試 Proxy、Network 同 Latency。"
pubDatetime: 2026-07-23
featured: false
draft: false
tags:
  - Network
  - Linux
  - VPS
  - Proxy
  - Testing
---

# 常用 Network Latency 測試 URL 整理，一篇收藏哂

平時玩 VPS、Proxy、VPN、Docker，又或者寫程式做 Network Test，成日都要搵啲穩定又可靠嘅 URL 去測試 Latency 或 Connectivity。

網上資料好散，有啲仲已經失效。

所以哩度整理返一份自己平時常用嘅清單，之後有需要再慢慢更新。

> **Tips：** 哩啲 URL 唔係 Speed Test，而係主要用嚟測試 Network Connectivity、Latency、HTTP Status，同埋 DNS Resolve。

---

## Google

| URL | 用途 |
|------|------|
| http://www.gstatic.com/generate_204 | Google Connectivity Check |
| http://www.google-analytics.com/generate_204 | Google Analytics Connectivity |
| http://www.google.com/generate_204 | Google 官方 Connectivity URL |
| http://connectivitycheck.gstatic.com/generate_204 | Android Connectivity Check |

一般都會回傳：

```text
HTTP 204 No Content
```

好多 Android ROM、Proxy Client 同 Router 都會用哩幾個 URL。

---

## Apple

### Captive Portal

```
http://captive.apple.com
```

主要俾 iPhone、iPad、Mac 檢查 Wi-Fi 需唔需要登入 Captive Portal。

另外：

```
http://www.apple.com/library/test/success.html
```

正常會回傳：

```text
Success
```

好多 Apple 裝置都會用哩個做 Network Detection。

---

## Microsoft

```
http://www.msftconnecttest.com/connecttest.txt
```

Windows 開機之後，通常都會請求哩個 URL。

正常內容：

```text
Microsoft Connect Test
```

如果回應唔正常，Windows 有機會顯示：

> No Internet

---

## Cloudflare

```
http://cp.cloudflare.com/generate_204
```

Cloudflare 自己提供嘅 Connectivity Check。

優點：

- 全球 CDN
- 穩定
- IPv4 / IPv6 都支援

平時測試 Proxy 我都幾常用。

---

## Firefox

```
http://detectportal.firefox.com/success.txt
```

Firefox 用嚟檢查 Captive Portal。

正常回應：

```text
success
```

---

## V2EX

```
http://www.v2ex.com/generate_204
```

主要俾中國用戶測試。

有啲 Proxy Client 都會支援。

不過留意：

有時會 Redirect。

---

## 小米 (Xiaomi)

```
http://connect.rom.miui.com/generate_204
```

MIUI Connectivity Check。

主要俾小米裝置判斷 Internet 是否正常。

---

## 華為 (Huawei)

```
http://connectivitycheck.platform.hicloud.com/generate_204
```

Huawei EMUI / HarmonyOS 常用。

---

## vivo

```
http://wifi.vivo.com.cn/generate_204
```

vivo 裝置 Connectivity Check。

---

# HTTP 定 HTTPS？

哩個其實要睇用途。

如果想測：

- DNS
- TCP
- HTTP Redirect
- Captive Portal

通常用：

```text
http://
```

如果想測：

- TLS
- HTTPS Handshake
- Proxy HTTPS

就用：

```text
https://
```

有部分 URL 同時支援 HTTP 同 HTTPS，但亦有啲只支援其中一種。

---

# IPv4 定 IPv6？

大部分 URL 都支援：

- IPv4
- IPv6

如果你想測試 IPv6 優先、Happy Eyeballs 或 Dual Stack，都可以直接用哩啲網址。

---

# 我平時點用？

如果我只係想快速 Test 部 VPS 或 Proxy，我通常會揀：

```text
Google
http://www.gstatic.com/generate_204
```

或者：

```text
Cloudflare
http://cp.cloudflare.com/generate_204
```

如果要測 Windows Network Status：

```text
http://www.msftconnecttest.com/connecttest.txt
```

如果測 Apple Device：

```text
http://captive.apple.com
```

基本上已經覆蓋大部分情況。

---

# 小結

平時寫 Script、做 Health Check、Network Monitor，又或者測試 Proxy、VPN、Router、Docker Network，哩啲 URL 都非常實用。

建議 Bookmark 哩篇，之後要用就唔使再周圍搵。

如果之後仲發現其他穩定、可靠嘅 Connectivity URL，我都會再更新哩篇文章。