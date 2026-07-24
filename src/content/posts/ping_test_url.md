---
title: "Network Connectivity Check：測試 URL 大全"
description: "整理 Google、Apple、Cloudflare、Microsoft 等常用 Connectivity Check URL，方便測試 VPS、Proxy、Network Latency 同 IPv4 / IPv6 連通性。"
pubDatetime: 2026-07-24
tags:
  - Network
  - VPS
  - Linux
  - Proxy
  - Testing
---

# Network Connectivity Check：測試 URL 大全

平時搞 VPS、Proxy、VPN、Router，又或者整 Network Monitor，成日都要搵一啲穩定 URL 去測試：

- DNS Resolve
- HTTP Response
- IPv4 / IPv6 Connectivity
- Latency
- Routing

哩啲地址好多系統本身都會用，例如 Android、iOS、Windows 嘅 Network Detection。

> ⭐ 評分只代表一般使用環境參考，實際結果會受 ISP、地區、DNS、Routing 影響。

| Service Provider | URL | 🇨🇳 大陸體驗 | 🌏 境外體驗 | HTTP Status | IP Version | 備註 |
| --- | --- | --- | --- | --- | --- | --- |
| Google | `http://www.gstatic.com/generate_204` | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 204 | IPv4 + IPv6 | Google Connectivity Check |
| Google | `http://www.google.com/generate_204` | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 204 | IPv4 + IPv6 | Google Main Check |
| Google | `http://connectivitycheck.gstatic.com/generate_204` | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 204 | IPv4 + IPv6 | Android Connectivity |
| Google | `http://www.google-analytics.com/generate_204` | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 204 | IPv4 + IPv6 | Analytics Connectivity |
| Apple | `http://captive.apple.com` | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 200 | IPv4 + IPv6 | Apple WiFi Detection |
| Apple | `http://www.apple.com/library/test/success.html` | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 200 | IPv4 + IPv6 | Apple Success Check |
| Microsoft | `http://www.msftconnecttest.com/connecttest.txt` | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 200 | IPv4 | Windows Network Check |
| Cloudflare | `http://cp.cloudflare.com/generate_204` | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 204 | IPv4 + IPv6 | Cloudflare Connectivity |
| Firefox | `http://detectportal.firefox.com/success.txt` | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 200 | IPv4 + IPv6 | Firefox Portal Detection |
| V2EX | `http://www.v2ex.com/generate_204` | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 204/301 | IPv4 + IPv6 | Community Test |
| 小米 | `http://connect.rom.miui.com/generate_204` | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | 204 | IPv4 | MIUI Connectivity |
| Huawei | `http://connectivitycheck.platform.hicloud.com/generate_204` | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | 204 | IPv4 | Huawei Connectivity |
| vivo | `http://wifi.vivo.com.cn/generate_204` | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | 204 | IPv4 | Vivo Connectivity |

## HTTP 定 HTTPS？

`http://`

比較適合：

- Captive Portal Detection
- HTTP Response Test
- Redirect Test

`https://`

比較適合：

- TLS Handshake
- HTTPS Proxy
- Certificate Validation

## 平時我會用邊幾個？

測 VPS / Proxy：

```text
http://cp.cloudflare.com/generate_204
```

測 Android：

```text
http://connectivitycheck.gstatic.com/generate_204
```

測 Windows：

```text
http://www.msftconnecttest.com/connecttest.txt
```

測 Apple：

```text
http://captive.apple.com
```

## 小結

Network Test 唔一定要靠 Speedtest。

一個簡單 HTTP Check，已經可以幫你快速判斷：

- DNS 有冇問題
- Routing 正唔正常
- Proxy 有冇斷線
- IPv6 是否可用

哩份 List 可以當成平時玩 VPS、Network Debug 嘅 Reference。
