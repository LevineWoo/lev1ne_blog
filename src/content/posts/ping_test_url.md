---
title: "VPS / Proxy 排錯唔一定要 Speedtest：Connectivity Check URL 實用清單"
description: "整理 Google、Apple、Microsoft、Firefox 同常見 204 Connectivity Check URL，講清每個 Endpoint 適合測乜、預期回應係乜，同埋點用 curl 快速排 DNS、HTTP、IPv4 / IPv6 問題。"
pubDatetime: 2026-07-24
modDatetime: 2026-09-10
tags:
  - Network
  - VPS
  - Linux
  - Proxy
  - Testing
---

# VPS / Proxy 排錯唔一定要 Speedtest：Connectivity Check URL 實用清單

平時搞 VPS、Proxy、Router 或 Network Monitor，出問題第一時間未必需要開 Speedtest。

好多時我真正想知嘅只係：

- DNS 解唔解析到？
- TCP / HTTP 出唔出到去？
- Proxy Route 有冇斷？
- IPv4 同 IPv6 邊邊有問題？
- Captive Portal 有冇截走 Request？

呢類情況，一個細細嘅 Connectivity Check Endpoint 反而比下載幾十 MB Speed Test 更直接。

舊版我曾經用「大陸 / 境外星級」去排地址，但呢種評分太受 ISP、地區、DNS 同 Routing 影響，幾個月後就未必仲有意思。今次改成只留比較實用嘅：**Endpoint、預期 Response，同佢本身用嚟做乜。**

## 我最常留低嘅幾個 Endpoint

| Provider / System | URL | 預期 | 用途 |
| --- | --- | --- | --- |
| Google / Chromium | `http://connectivitycheck.gstatic.com/generate_204` | HTTP 204 | Captive Portal / Internet Connectivity |
| Apple | `http://captive.apple.com` | HTTP 200 | Apple Device Captive Portal Connectivity |
| Microsoft NCSI | `http://www.msftconnecttest.com/connecttest.txt` | HTTP 200 + `Microsoft Connect Test` | Windows Internet Detection |
| Firefox | `http://detectportal.firefox.com/success.txt` | HTTP 200 + `success` | Firefox Captive Portal Detection |
| Cloudflare | `http://cp.cloudflare.com/generate_204` | 一般為 HTTP 204 | 輕量 HTTP Connectivity Check |

如果只想揀三個，我通常會留：

```text
http://connectivitycheck.gstatic.com/generate_204
http://www.msftconnecttest.com/connecttest.txt
http://captive.apple.com
```

分別代表 Google / Chromium、Windows 同 Apple 呢幾套常見 Network Detection 路線。

## 點解 `generate_204` 咁常見？

HTTP `204 No Content` 幾適合做 Connectivity Check。

正常情況 Server 只需要回：

```text
HTTP/1.1 204 No Content
```

Body 可以完全冇內容。

對 Client 嚟講判斷好簡單：

```text
DNS Resolve 成功
        ↓
HTTP Request 成功
        ↓
收到預期 204
        ↓
Internet Connectivity 大致正常
```

如果本身預期 204，結果突然收到一個 `200` Login Page 或 `302` Redirect，就好可能係酒店、機場、商場 Wi-Fi 嗰類 Captive Portal 截咗 Request。

## Google / Chromium：而家優先用 connectivitycheck.gstatic.com

以前好多 List 都會寫：

```text
http://www.gstatic.com/generate_204
```

呢個 Endpoint 目前仍然可以見到，但 Chromium 喺 2025 年已經將 Captive Portal Detection 嘅 Origin 由 `www.gstatic.com` 轉去：

```text
http://connectivitycheck.gstatic.com/generate_204
```

原因係將 Connectivity Check 同一般 `gstatic` Web Resource 分開。

所以如果係新 Script、新 Monitor，我會優先寫：

```bash
curl -I http://connectivitycheck.gstatic.com/generate_204
```

理想結果係：

```text
HTTP/1.1 204 No Content
```

如果只想攞 Status Code：

```bash
curl -sS -o /dev/null -w '%{http_code}\n' \
  http://connectivitycheck.gstatic.com/generate_204
```

正常就會印：

```text
204
```

## Microsoft：唔係 204，而係睇固定 Body

Windows NCSI 個做法唔同。

Windows 10 1607 之後，Microsoft 官方文件列出嘅 Active Web Probe 係：

```text
http://www.msftconnecttest.com/connecttest.txt
```

預期係 HTTP 200，而且內容包含：

```text
Microsoft Connect Test
```

測試：

```bash
curl -fsS http://www.msftconnecttest.com/connecttest.txt
```

如果想睇 Header：

```bash
curl -I http://www.msftconnecttest.com/connecttest.txt
```

Windows 仲會配合 `dns.msftncsi.com` 做 DNS Probe，所以有時「網頁開到」但 Windows Network Icon 仍然話冇 Internet，就要再睇 NCSI DNS / Policy，而唔係淨係測一條 URL。

## Apple：captive.apple.com 係真係官方 Connectivity Host

Apple 官方 Enterprise Network 文件目前仍然列出：

```text
captive.apple.com
```

Port：

```text
80 / 443
```

用途就係：

```text
Internet connectivity validation for networks that use captive portals
```

所以酒店 Wi-Fi 登入頁唔彈、iPhone / Mac 覺得 Network 有問題時，呢個 Domain 值得一齊排查。

可以簡單試：

```bash
curl -I http://captive.apple.com
```

不過 Apple 呢類 Endpoint 主要係畀系統做 Captive Portal Detection，唔建議將佢當成你自己 Service 嘅 SLA Monitor。

## Firefox：最直觀嘅 success.txt

Firefox 呢條幾舒服：

```text
http://detectportal.firefox.com/success.txt
```

正常 Response Body 就係：

```text
success
```

所以 Script 判斷都好簡單：

```bash
curl -fsS http://detectportal.firefox.com/success.txt
```

如果返唔到預期內容，就再睇 DNS、Proxy 或 Captive Portal。

## 中國網絡環境可以再留幾條備用

如果 VPS / Client 主要喺中國網絡環境，有時我亦會留低呢幾條：

```text
http://connect.rom.miui.com/generate_204
http://connectivitycheck.platform.hicloud.com/generate_204
http://wifi.vivo.com.cn/generate_204
```

目前前兩條仍然可以正常回應 204 類 Connectivity Request；但同 Microsoft / Apple 官方文件嗰種「明確對外 Documented Probe」唔同，手機廠商日後改 Host、改行為都唔出奇。

所以我會將佢哋當：

> 額外 Probe Target，而唔係永遠不變嘅 Public API。

## HTTP 定 HTTPS？唔好混埋測

如果目標係排 Network，我反而會刻意分開。

### HTTP 可以測到

```text
DNS
TCP 80
HTTP Request / Response
Captive Portal Redirect
```

例如：

```bash
curl -v http://connectivitycheck.gstatic.com/generate_204
```

### HTTPS 再多測一層

```text
TCP 443
TLS Handshake
Certificate Validation
HTTPS Proxy / MITM 行為
```

例如：

```bash
curl -v https://connectivitycheck.gstatic.com/generate_204
```

所以如果 HTTP 通、HTTPS 唔通，就唔好籠統講「網絡壞咗」，範圍其實已經縮細到 TLS / Port 443 / HTTPS Proxy 呢邊。

## IPv4 / IPv6 最好分開試

`curl` 本身就可以指定 IP Family。

IPv4：

```bash
curl -4 -sS -o /dev/null -w '%{http_code}\n' \
  http://connectivitycheck.gstatic.com/generate_204
```

IPv6：

```bash
curl -6 -sS -o /dev/null -w '%{http_code}\n' \
  http://connectivitycheck.gstatic.com/generate_204
```

如果：

```text
IPv4 = 204
IPv6 = Timeout
```

咁就已經比一句「上唔到網」有用好多。

再睇 DNS：

```bash
dig A connectivitycheck.gstatic.com
dig AAAA connectivitycheck.gstatic.com
```

或者冇 `dig` 時：

```bash
getent ahosts connectivitycheck.gstatic.com
```

## Proxy 排錯我會點做？

例如本機有 HTTP Proxy：

```bash
curl -x http://127.0.0.1:7890 \
  -sS -o /dev/null -w '%{http_code}\n' \
  http://connectivitycheck.gstatic.com/generate_204
```

再同 Direct 比：

```bash
curl --noproxy '*' \
  -sS -o /dev/null -w '%{http_code}\n' \
  http://connectivitycheck.gstatic.com/generate_204
```

如果 Direct 正常、Proxy Timeout，範圍自然落到 Proxy Process、Rule、Outbound 或 Route，而唔係繼續亂改 DNS。

## 一條 Command 睇埋時間

想快速測 Response Time：

```bash
curl -sS -o /dev/null \
  -w 'code=%{http_code} dns=%{time_namelookup}s connect=%{time_connect}s tls=%{time_appconnect}s total=%{time_total}s\n' \
  https://connectivitycheck.gstatic.com/generate_204
```

呢個比單純 Ping 更實用，因為你可以一次睇：

- DNS Time
- TCP Connect
- TLS Handshake
- Total Time
- HTTP Status

尤其 Proxy 「好似通，但開網頁慢」嗰類問題，呢幾個數字好快就睇到究竟卡喺邊。

## 唔建議點用呢啲 URL？

Connectivity Endpoint 好方便，但唔應該濫用。

我唔會：

- 每秒狂打第三方 Probe
- 當成正式 Production SLA Target
- 見一條 Endpoint Timeout 就判定全 Internet Down
- 用單一 Provider 判斷所有國家 / ISP 嘅網絡質素

如果係長期 Monitoring，最好用自己控制嘅 Endpoint，或者至少多 Provider 交叉判斷。

## 我而家會保留嘅最小清單

最後其實唔需要收藏幾十條。

我自己覺得呢四條已經夠應付大部分臨時排錯：

```text
Google / Chromium
http://connectivitycheck.gstatic.com/generate_204

Microsoft
http://www.msftconnecttest.com/connecttest.txt

Apple
http://captive.apple.com

Firefox
http://detectportal.firefox.com/success.txt
```

真正排錯時，再配 `curl -4`、`curl -6`、`dig` 同 Proxy Option，就已經比一張「邊條 URL 最快」嘅星級表實際得多。

## 參考資料

- Microsoft NCSI: https://learn.microsoft.com/windows-server/networking/ncsi/ncsi-frequently-asked-questions
- Apple Enterprise Network Hosts: https://support.apple.com/101555
- Chromium Captive Portal Origin Change: https://chromium.googlesource.com/chromium/src/+/0307e728703a96f6c86b35e705937e85821cde0d
