---
title: "Bybit Card 付款 ChatGPT：由開虛擬卡到訂閱成功嘅完整筆記"
description: "重新整理 Bybit Card 申請、KYC、付款資產、ChatGPT Checkout 同失敗排查，並補返 2026 年最新地區限制、費用同 Billing 注意事項。"
pubDatetime: 2026-08-15
modDatetime: 2026-09-10
tags:
  - Bybit
  - ChatGPT
  - Payment
  - AI
  - Virtual Card
---

# Bybit Card 付款 ChatGPT：由開虛擬卡到訂閱成功嘅完整筆記

有啲境外 Subscription 最麻煩嘅唔係價錢，而係去到 Checkout 先發現張卡過唔到。

我之前就用 Bybit Card 做過 ChatGPT 網頁版訂閱，所以想將成個流程記低。不過呢類文章最容易過時：Card Program、可申請地區、Card Scheme、費用、OpenAI 支援地區同 Checkout 規則全部都有機會改。

所以呢篇唔再當成一份「照抄就一定成功」嘅教學，而係整理成一篇比較耐用嘅實際筆記：邊啲位要睇資格、邊啲位容易出錯，同埋付款前最好檢查乜。

> 重要：呢篇只講正常申請同付款流程，唔係教人繞過地區限制。Bybit 同 OpenAI 都會按所在地、居住地、KYC、發卡地區等判斷資格；資料應該按真實情況填寫。

## 2026 年先要留意嘅一件事：Bybit Card 已經分地區 Program

而家講「Bybit Card」唔可以再假設全世界都係同一套規則。

例如：

- EEA 用戶已經轉去 Bybit EU 嘅 Card Program
- Bybit.com 其他 Card Program 會按 Australia、Asia Pacific、AIFC、Georgia、Brazil、Mexico 等地區分開
- 不同地區可以係 Mastercard 或 Visa
- Virtual / Physical Card、Apple Pay、Google Pay、Fee 同 Limit 都可能唔同

Bybit 官方亦明確列出一批 Excluded Jurisdictions，所以申請之前最重要唔係先搵教程，而係先入自己 Account 嘅 Card 頁面睇 Eligibility。

如果畫面根本唔畀申請，就唔好用其他地區資料硬填。

## Bybit 邀請碼

如果本身符合 Bybit 服務同 Card 申請資格，而又未有 Account，可以用我呢條 Referral Link：

**邀請連結：** [https://www.bybit.com/invite?ref=ZEL67L5](https://www.bybit.com/invite?ref=ZEL67L5)

**Referral Code：**

```text
ZEL67L5
```

用邀請 Link 註冊時通常會自動帶入 Code；冇顯示就再手動確認。

> 呢條係 Referral Link，我有機會收到 Bybit 提供嘅 Referral Reward。用唔用完全由你決定，唔影響下面流程。

## 開卡之前要準備乜？

正常會用到：

- 可收 Email 嘅地址
- 可用手機號碼
- 有效身份證明文件
- 真實居住地址
- 視地區而定嘅地址證明或額外資料
- 已完成或可以完成 Identity Verification

Bybit Card 嘅 KYC 要求有機會比普通 Account 更嚴格。即使本身 Account 已經 Verified，申請 Card 時都可能要重新驗證資料或者補交文件。

我會順手確認 Account Security 已經設定好：

- Google 2FA
- Anti-phishing Code
- Login / Withdrawal Security

始終 Card 最後係直接連住 Account 資產，安全設定唔值得慳。

## 申請 Virtual Bybit Card

官方目前嘅基本入口仍然係：

```text
Finance → Card → Apply Now
```

大概流程係：

1. 選擇 Country / Region of Residence
2. 做 Eligibility Check
3. 完成或更新 Identity Verification
4. 填 Residential Address
5. 按 Card Region 補交額外資料
6. 確認 Email / Mobile / 2FA
7. 接受相關 Terms 後 Submit

如果所在地區未開放，系統有機會只畀你登記 Interest / Waitlist，而唔係直接開卡。

Virtual Card 批核後通常已經可以做網上付款；Physical Card 則係另一個申請流程，而且唔係每個地區都有。

## 付款之前，我會先睇「用乜資產扣」

Bybit Card 唔係單純一張儲值卡。按 Card Region 同你設定，付款時可以由 Fiat 或支援嘅 Crypto Asset 扣款；如果要由 Crypto 轉成交易貨幣，中間就可能有 Conversion Cost。

所以付款前我會睇三樣：

- Card 嘅 Settlement / Supported Currency
- `Paying With` 嘅資產優先次序
- 今次交易會唔會涉及 FX 或 Crypto Conversion

唔同 Region 嘅 Foreign Exchange Fee、Crypto Conversion Fee 同 Spending Limit 都唔一樣，而且 Bybit 會更新。

最簡單嘅做法就係：**付款嗰刻再睇 Card Dashboard 同官方 Fees & Limits，唔好死背舊百分比。**

如果可以直接用同交易接近嘅 Fiat Balance，我自己會偏向咁做，主要係容易睇清楚實際成本；如果用 Crypto 自動兌換，就要預留少少 Buffer。

## ChatGPT 網頁版付款而家要睇乜？

ChatGPT 網頁 Subscription 目前支援 Credit / Debit Card，而且已經有 Multi-currency Billing。實際顯示邊隻 Currency、邊種本地 Payment Method，會按地區同 Checkout 而定。

用 Bybit Card 時，流程其實同普通網上卡差唔多：

1. 登入 ChatGPT
2. 進入升級 / Billing 頁面
3. 選擇需要嘅 Plan
4. 填 Card Number、Expiry、CVC
5. 填正確 Billing Address
6. 核對 Currency 同實際金額
7. 完成發卡方要求嘅 Authentication

如果出現 3D Secure / SCA、OTP 或 App Approval，就按畫面完成，唔好中途不停 Refresh。

另外要分清：

```text
chatgpt.com 訂閱
≠
Apple App Store 訂閱
≠
Google Play 訂閱
```

三邊 Billing 係分開管理，轉付款方式之前最好先確認自己而家個 Subscription 係邊度開。

## Card Declined，我而家會點排？

以前遇到 Declined 好容易第一時間怪張 Virtual Card，但實際可以係好多原因。

我會由最基本開始：

### 1. Card 資料

檢查：

- Card Number
- Expiry
- CVC
- Billing Address
- ZIP / Postal Code

尤其 Billing Address，應該同 Card Profile 嘅真實資料一致。

### 2. Balance

唔好只睇 Subscription 標價，仲要預埋可能出現嘅：

- FX
- Crypto Conversion
- Authorization / Temporary Hold
- 稅項或本地 Billing 差異

### 3. Online / International / Recurring Payment

Subscription 係 Recurring Transaction，唔係單次付款。

如果 Card Program 或 Issuer 對 Online、International 或 Recurring Payment 有限制，第一次成功都唔代表之後 Renewal 一定成功。

### 4. 3DS / SCA

OpenAI 官方付款排錯亦特別提到 3D Secure / Strong Customer Authentication。

如果 Authentication 畫面彈唔出，可以試：

- 關閉 Popup Blocker
- 暫停過度進取嘅 Ad Blocker
- 用 Incognito / Private Window
- 換 Browser
- 確認 Issuer App / OTP 真係收到 Request

### 5. 所在地同發卡地區

呢點最重要。

OpenAI 官方說明要求購買所在國家 / 地區同 Payment Card 發卡地區符合其支援範圍；Bybit 自己亦有 Card Eligibility 同 Restricted Jurisdiction 規則。

所以「人喺邊度」、「Account 屬邊個 Program」、「Card 由邊個 Region 發」都可能影響結果。

## 一張 Card 可以用，唔代表我會擺好多資產入去

我對 Exchange Card 嘅定位一直都比較簡單：**支付工具。**

我唔會因為張 Card 用得順，就將長期大額資產全部留喺同一個 Exchange Account。原因唔單止係 Crypto 價格波動，仲包括：

- Platform Risk
- Account Risk
- Compliance / Region Rule 變化
- Card Program 改動
- Payment Channel 改動

平時要用幾多，就按自己需要準備幾多，對我嚟講會舒服啲。

## 自動續費要另外記住

第一次 Checkout 成功只係第一關。

Subscription 到 Renewal Date 時會再扣，所以最好留意：

- Card 仲係咪 Active
- Balance 夠唔夠
- Card Region / Program 有冇改
- Recurring Payment 仲有冇支援
- Billing Currency 有冇變

如果已經唔打算續，就喺下一個 Billing Cycle 前去原本開 Subscription 嘅平台取消，而唔係單純靠「張卡冇錢」當取消方法。

## 最後我會點樣理解呢套方法

Bybit Card 對符合資格嘅 User 嚟講，確實可以多一個 Online Payment 選擇，尤其本身已經有 Bybit Account，又清楚自己 Card Program 同費用結構時，用起上嚟幾直接。

但真正值得記低嘅唔係「填邊格」，而係呢幾件事：

```text
先確認地區資格
      ↓
用真實 KYC / Address
      ↓
搞清楚付款資產同費用
      ↓
Checkout 核對 Billing 資料
      ↓
完成 3DS / SCA
      ↓
留意之後 Recurring Renewal
```

Card、Exchange 同 ChatGPT Billing 規則都會變，所以呢類文章我寧願保留流程同判斷方法，具體 Fee、Limit 同支援國家就直接睇官方最新頁面。

## 參考資料

- Bybit Card 申請流程: https://www.bybit.com/en/help-center/article/How-to-Apply-for-Bybit-Card
- Bybit Card FAQ: https://www.bybit.com/en/help-center/article/FAQ-Bybit-Card-General-Inquiries
- Bybit Card Fees & Limits: https://www.bybit.com/en/help-center/article/Fees-and-Spending-Limits-Bybit-Card
- Bybit Restricted Countries: https://www.bybit.com/en/help-center/article/Service-Restricted-Countries
- OpenAI Multi-currency Billing: https://help.openai.com/en/articles/10421635
- OpenAI Card Declined 排錯: https://help.openai.com/en/articles/7232916-why-was-my-credit-card-declined
- ChatGPT Supported Countries: https://help.openai.com/en/articles/7947663-chatgpt-supported-countries
