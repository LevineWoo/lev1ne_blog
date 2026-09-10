---
title: "🌐 網絡唔通先別跑 Speedtest：用 204 URL + curl 快速定位問題"
description: "整理 Google、Microsoft、Apple 同 Firefox Connectivity Check Endpoint，再用 curl 分開測 DNS、HTTP、HTTPS、IPv4、IPv6 同 Proxy，快速縮細排錯範圍。"
pubDatetime: 2026-07-24
modDatetime: 2026-09-10
tags:
  - Network
  - VPS
  - Linux
  - Proxy
  - Testing
---

# 🌐 網絡唔通先別跑 Speedtest：用 204 URL + curl 快速定位問題

平時搞 VPS、Proxy、Router，見到「上唔到網」四個字，其實資訊量接近零 😵。

究竟係：

- DNS 壞咗？
- TCP 連唔到？
- IPv6 黑洞？
- HTTPS / TLS 出事？
- Proxy Rule 行錯？
- 酒店 Wi-Fi Captive Portal 截咗 Request？

如果一開始就跑 Speedtest，最多只係知道「快定慢」；但排錯真正需要嘅係逐層拆 🧩。

所以我而家更常用一啲本身就為 Connectivity Check 而設嘅細 Endpoint，再配 `curl` 去睇 Status、IP Family 同 Timing。

## 🧰 我會先留呢四條

| System | Endpoint | 正常預期 |
| --- | --- | --- |
| Google / Chromium | `http://connectivitycheck.gstatic.com/generate_204` | HTTP 204 |
| Microsoft NCSI | `http://www.msftconnecttest.com/connecttest.txt` | HTTP 200 + 固定文字 |
| Apple | `http://captive.apple.com` | HTTP 200 / Captive Portal Check |
| Firefox | `http://detectportal.firefox.com/success.txt` | HTTP 200 + `success` |

呢啲 URL 唔係用嚟測 Bandwidth，而係用嚟回答一個簡單問題：**Client 可唔可以經預期路徑正常去到 Internet。**

## 💡 點解 204 特別好用？

HTTP `204 No Content` 冇 Body，所以做 Probe 幾乾淨。

理想流程係：

```text
DNS Resolve
   ↓
TCP Connect
   ↓
HTTP Request
   ↓
204 No Content
```

如果本身應該收 204，結果返咗：

```text
302 Redirect
```

或者一頁：

```text
Login to Wi-Fi
```

咁 Captive Portal 嫌疑就好高 🚧。

## 🔎 Google / Chromium：新 Script 用 connectivitycheck.gstatic.com

以前好多清單都係：

```text
http://www.gstatic.com/generate_204
```

Chromium 喺 2025 年已經將預設 Captive Portal Detection Origin 轉去：

```text
http://connectivitycheck.gstatic.com/generate_204
```

新 Host 專門畀 Connectivity Check 用，所以我而家新寫 Script 會直接用呢條。

只睇 Status Code：

```bash
curl -sS -o /dev/null -w '%{http_code}\n' \
  http://connectivitycheck.gstatic.com/generate_204
```

正常：

```text
204
```

想睇完整 Header：

```bash
curl -I http://connectivitycheck.gstatic.com/generate_204
```

## 🪟 Microsoft NCSI：唔係 204，而係固定內容

Windows NCSI 用：

```text
http://www.msftconnecttest.com/connecttest.txt
```

可以直接：

```bash
curl -fsS http://www.msftconnecttest.com/connecttest.txt
```

正常會見到預期嘅 Microsoft Connect Test 文字。

Windows Network Icon 顯示有冇 Internet，唔係單靠呢一條 HTTP Probe；NCSI 仲會配合其他檢測。所以如果 Browser 明明上到網，但 Windows 仲顯示 No Internet，唔好只係不停 Refresh 呢個 URL 😂。

## 🍎 Apple：captive.apple.com 最適合做咩？

Apple 官方 Network Host 文件仍然列出：

```text
captive.apple.com
```

用途係 Internet Connectivity Validation / Captive Portal。

簡單試：

```bash
curl -I http://captive.apple.com
```

如果酒店、機場 Wi-Fi 登入頁唔正常彈出，呢個 Domain 值得一齊查。

不過我唔會將 Apple 呢類系統 Probe 當成自己 Production Service 嘅長期 SLA Monitor。佢係第三方 Endpoint，唔係為你嘅監控系統提供保證 ⚠️。

## 🦊 Firefox：success.txt 幾適合手動測

Firefox 有一條非常直觀：

```text
http://detectportal.firefox.com/success.txt
```

直接：

```bash
curl -fsS http://detectportal.firefox.com/success.txt
```

正常 Body：

```text
success
```

做臨時 Script 時，呢種固定 Body 其實幾舒服 ✅。

## 🔐 排錯時，我會先分 HTTP 同 HTTPS

HTTP：

```bash
curl -v http://connectivitycheck.gstatic.com/generate_204
```

主要可以睇：

```text
DNS
TCP 80
HTTP
Redirect / Captive Portal
```

HTTPS：

```bash
curl -v https://connectivitycheck.gstatic.com/generate_204
```

再多咗：

```text
TCP 443
TLS Handshake
Certificate Validation
HTTPS Proxy / MITM
```

所以如果 HTTP 正常、HTTPS Timeout，排錯範圍已經可以由「成條網絡」縮到 443、TLS、Proxy 呢一層 🎯。

## 4️⃣ / 6️⃣ IPv4 / IPv6 一定要識得拆開

Dual-stack 最麻煩嘅情況之一，就係 IPv4 正常、IPv6 半死不活。

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

如果得到：

```text
IPv4 = 204
IPv6 = timeout
```

已經比「個網站開得好慢」有用得多。

再睇 DNS Record：

```bash
dig A connectivitycheck.gstatic.com
dig AAAA connectivitycheck.gstatic.com
```

冇 `dig` 都可以：

```bash
getent ahosts connectivitycheck.gstatic.com
```

## 🔀 Proxy 最好做 Direct 對照

例如本機 HTTP Proxy 喺 `127.0.0.1:7890`：

```bash
curl -x http://127.0.0.1:7890 \
  -sS -o /dev/null -w '%{http_code}\n' \
  http://connectivitycheck.gstatic.com/generate_204
```

再試 Direct：

```bash
curl --noproxy '*' \
  -sS -o /dev/null -w '%{http_code}\n' \
  http://connectivitycheck.gstatic.com/generate_204
```

結果如果係：

```text
Direct = 204
Proxy = timeout
```

咁我就唔會繼續亂改 DNS，而係直接查：

- Proxy Process
- Rule
- Outbound
- Route
- Firewall

排錯最重要就係每次測試都可以排除一批可能性。唔好一出事就「重啟晒先算」🤣。

## ⏱️ 一條 curl 睇埋慢喺邊

如果唔係完全斷，而係「好似通，但好慢」，可以睇 Timing：

```bash
curl -sS -o /dev/null \
  -w 'code=%{http_code} dns=%{time_namelookup}s connect=%{time_connect}s tls=%{time_appconnect}s total=%{time_total}s\n' \
  https://connectivitycheck.gstatic.com/generate_204
```

一次就有：

- DNS Time
- TCP Connect Time
- TLS Time
- Total Time
- HTTP Status

例如 DNS 0.01s、Connect 2s，同 DNS 2s、Connect 0.05s，方向完全唔同。

## 🚨 唔好將第三方 Probe 當 Ping 轟

呢啲 Endpoint 好用，但唔代表應該：

- 每秒不停 Request
- 當成正式 Production SLA Target
- 一條 Timeout 就判斷全 Internet Down
- 用單一 Provider 代表全世界 Routing

長期 Monitoring 最好用自己控制嘅 Endpoint；真係要用第三方，至少降低 Frequency 同用多 Provider 交叉判斷。

## 🧭 最後我會點排

遇到「網絡唔通」，我而家大概會照呢個順序：

```text
DNS
 ↓
HTTP 204 / 固定 Body
 ↓
HTTPS / TLS
 ↓
IPv4 vs IPv6
 ↓
Direct vs Proxy
 ↓
Timing
```

做完呢幾步，通常已經可以將問題由一句模糊嘅「上唔到網」，縮到某一層再繼續查 ✅。

Speedtest 當然有用，但佢應該係你想知道 Bandwidth 時先跑，而唔係每次 Network 出事嘅第一把鎚 🔨。

## 📚 參考資料

- Microsoft NCSI: https://learn.microsoft.com/windows-server/networking/ncsi/ncsi-frequently-asked-questions
- Apple Enterprise Network Hosts: https://support.apple.com/101555
- Chromium Captive Portal Origin Change: https://chromium.googlesource.com/chromium/src/+/0307e728703a96f6c86b35e705937e85821cde0d
