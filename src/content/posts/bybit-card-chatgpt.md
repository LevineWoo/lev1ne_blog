---
title: "💳 用 Bybit Card 訂閱 ChatGPT：開卡、付款、3DS 同續費要留意乜"
description: "整理 2026 年 Bybit Card 申請、付款資產、ChatGPT Billing、3DS 驗證同失敗排查，重點講清地區資格、費用同自動續費。"
pubDatetime: 2026-08-15
modDatetime: 2026-09-10
tags:
  - Bybit
  - ChatGPT
  - Payment
  - AI
  - Virtual Card
---

# 💳 用 Bybit Card 訂閱 ChatGPT：開卡、付款、3DS 同續費要留意乜

境外 Subscription 最煩嘅位，很多時唔係價錢，而係去到 Checkout 先發現張卡過唔到 😵‍💫。

Bybit Card 可以作為其中一個網上付款選擇，但去到 2026 年，已經唔適合再用「申請到卡 = 一定可以畀 ChatGPT」呢種思路去理解。Bybit Card 本身分地區 Program，費用、Card Scheme、可用資產同 Limit 都會跟發卡地區而變；ChatGPT Checkout 亦會睇付款地區、發卡地區、Billing Address 同 Authentication。

所以呢篇我想記低嘅唔係一套死步驟，而係一個比較耐用嘅判斷方法 🧭。

> ⚠️ 呢篇只講正常申請同付款流程。Bybit 同 OpenAI 嘅地區、身份認證同付款要求都應該按真實資料處理，唔建議用虛假地址或者資料去繞過限制。

## 🚦 申請之前，先睇自己有冇資格

Bybit 官方目前仍然係由：

```text
Finance → Card → Apply Now
```

開始申請 Virtual Card。

第一步唔係填地址，而係揀自己真實嘅 Country / Region of Residence。Bybit Card 只喺部分地區提供，如果你所在地未支援，頁面可能只會登記 Interest，而唔會直接畀你開卡。

要準備嘅資料通常包括：

- Email 同手機號碼
- 有效身份證明文件
- 真實 Residential Address
- Identity Verification / KYC
- 視乎地區要求嘅額外資料

即使普通 Bybit Account 已經做過 KYC，Card 申請仍然有機會要求再確認資料。呢度唔好嫌麻煩，資料對唔上先係最麻煩嗰種 😅。

## 🎁 Bybit 邀請碼

如果本身符合 Bybit 服務同 Card 資格，而又未有 Account，可以用我呢條 Referral Link：

**邀請連結：** [https://www.bybit.com/invite?ref=ZEL67L5](https://www.bybit.com/invite?ref=ZEL67L5)

**Referral Code：**

```text
ZEL67L5
```

> ℹ️ 呢條係 Referral Link，我有機會收到平台提供嘅 Referral Reward。用唔用唔影響下面流程。

## 💰 開到 Virtual Card 之後，唔好急住付款

我會先睇 Card Dashboard 入面三樣嘢：

1. Card 屬邊個 Region / Program
2. `Paying With` 用邊種資產
3. 今次交易會唔會涉及 FX 或 Crypto Conversion

Bybit 官方 Fees & Limits 會按地區分開，而且資料會更新。與其死背某個百分比，我會直接喺付款前再睇一次官方頁面同 Card Dashboard。

如果交易貨幣同你持有嘅 Fiat / Settlement Currency 唔同，可能會出現 Foreign Exchange Fee；如果要由 Crypto 轉成付款貨幣，亦可能有 Conversion Cost 💸。

最簡單做法係預留少少 Balance Buffer，唔好淨係放啱啱好等於 Subscription 標價嘅金額。

## 🧾 ChatGPT Checkout 實際要填乜？

ChatGPT 網頁版目前支援 Credit / Debit Card，亦有 Multi-currency Billing。實際顯示幣種同其他本地 Payment Method，會跟所在地同 Checkout 而變。

用 Bybit Card 時，基本流程同普通銀行卡差唔多：

1. 登入 ChatGPT
2. 入升級 / Billing 頁面
3. 選擇 Plan
4. 填 Card Number、Expiry、CVC
5. 填正確 Billing Address 同 Postal Code
6. 核對幣種同實際金額
7. 完成發卡方要求嘅 3DS / SCA 驗證

要特別分清 👇：

```text
chatgpt.com 訂閱
≠
Apple App Store 訂閱
≠
Google Play 訂閱
```

三邊 Billing 係分開管理。如果原本係 App Store 開嘅 Subscription，就唔好去網頁版亂改完先發現重複訂閱 🫠。

## 🛠️ 如果 Card Declined，我會由呢幾樣開始排

### 🔎 Card 資料

先睇最基本：

- Card Number
- Expiry
- CVC
- Billing Address
- ZIP / Postal Code

Billing Address 應該同 Card Profile 嘅真實資料一致。

### 💸 Balance 同付款資產

除咗 Subscription 金額，仲要預：

- FX
- Crypto Conversion
- 稅項或本地 Billing 差異
- 發卡方可能出現嘅 Authorization Hold

### 🔐 3D Secure / SCA

OpenAI 官方付款排錯目前仍然特別提到 3D Secure / Strong Customer Authentication。

如果驗證畫面彈唔出，可以試：

- 關閉 Popup Blocker
- 暫停過度進取嘅 Ad Blocker
- 開 Incognito / Private Window
- 換 Browser / Device / Network
- 確認 Issuer App 或 OTP 真係收到 Request

最忌係驗證途中不停 Refresh 或關頁 ⚠️。

### 🌍 所在地同發卡地區

呢個反而係最容易忽略。

OpenAI 官方要求付款卡嘅發卡地區屬於支援範圍；Bybit 自己亦有 Card Eligibility 同 Restricted Jurisdiction 規則。所以 Account 喺邊個 Program、Card 邊度發、實際所在地同 Billing 資料，都可能影響結果。

## 🔁 第一次成功，唔代表之後 Renewal 一定成功

Subscription 係 Recurring Payment。

到下一個 Billing Cycle，最好留意：

- Card 仲係咪 Active
- Balance 夠唔夠
- `Paying With` 次序有冇改
- Card Program / Region 規則有冇更新
- Recurring / International Payment 仲有冇正常開啟

如果已經唔再續，我會直接去原本開 Subscription 嘅平台取消，而唔係靠「張卡冇錢」去阻止扣款。靠餘額不足當取消方法，真係有少少賭運氣 🎲。

## 🧠 我會點樣用 Exchange Card

我比較傾向將 Bybit Card 當成一個 Payment Tool，而唔係因為張卡方便，就將大量長期資產擺晒入同一個 Exchange Account。

原因其實好簡單：除咗 Crypto 價格之外，仲有 Platform、Compliance、Account 同 Card Program 本身嘅風險。

所以對我嚟講，最好用嘅方式係：

```text
確認資格
  ↓
用真實資料開卡
  ↓
搞清楚付款資產同 Fee
  ↓
Checkout 核對 Billing
  ↓
完成 3DS / SCA
  ↓
留意之後 Renewal
```

真正值得記住嘅係呢個判斷順序，而唔係某個今日有效、幾個月後可能已經變咗嘅 Fee 或 Limit ✅。

## 📚 參考資料

- Bybit Card 申請流程: https://www.bybit.com/en/help-center/article/How-to-Apply-for-Bybit-Card
- Bybit Card Fees & Limits: https://www.bybit.com/en/help-center/article/Fees-and-Spending-Limits-Bybit-Card
- Bybit Restricted Countries: https://www.bybit.com/en/help-center/article/Service-Restricted-Countries
- OpenAI Multi-currency Billing: https://help.openai.com/en/articles/10421635
- OpenAI Card Declined 排錯: https://help.openai.com/en/articles/7232916-why-was-my-credit-card-declined
- ChatGPT Supported Countries: https://help.openai.com/en/articles/7947663-chatgpt-supported-countries
