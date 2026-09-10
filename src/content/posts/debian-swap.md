---
title: "💾 1GB VPS 唔想突然 OOM：Debian / Ubuntu Swap File 實用設定"
description: "整理細 VPS 建立 Swap File、設定開機掛載、調整 vm.swappiness、觀察 Swap I/O 同安全移除嘅做法，順便講清 Swap 幾時有用。"
pubDatetime: 2026-07-23
modDatetime: 2026-09-10
tags:
  - Debian
  - Ubuntu
  - Linux
  - Swap
  - VPS
---

# 💾 1GB VPS 唔想突然 OOM：Debian / Ubuntu Swap File 實用設定

細 VPS 最常見嘅問題唔係 CPU，而係 RAM 太少 😅。

512MB、1GB、2GB 平時跑幾個細 Service 可以完全冇事，但一到更新 Package、Build Image、某個 Container 突然食多咗 Memory，Kernel 就有機會直接 OOM Kill 💥。

Swap 唔係免費 RAM，更加唔會令一部 1GB VPS 變成 3GB RAM。佢比較似一層緩衝：當 Memory 短時間頂到上限，畀 Kernel 多一個地方可以搬走暫時唔活躍嘅 Page，避免 Service 咁快被殺。

所以我開細機第一件事通常唔係「一定加 2GB Swap」，而係先睇清楚部機本身有冇 👀。

## 🔎 先睇而家有冇 Swap

```bash
swapon --show
```

再配：

```bash
free -h
```

想直接睇 Kernel 記錄：

```bash
cat /proc/swaps
```

有啲 VPS Provider 已經預設開咗 Swap Partition / File，呢種情況就唔需要再疊一個落去。

## 📏 Swap 要幾大，其實冇標準答案

以前常見「RAM 幾多，Swap 就幾多倍」呢類公式，但對 VPS 我覺得參考價值唔算高。

如果只係想防短時間 Memory Spike，可以大概由呢個範圍開始諗：

| RAM | 可考慮嘅 Swap |
| --- | --- |
| 512MB | 1GB ～ 2GB |
| 1GB | 1GB ～ 2GB |
| 2GB | 1GB ～ 2GB |
| 4GB 或以上 | 睇 Workload 再決定 |

真正要睇嘅係 Workload。

如果部機日常已經長期 Swap in / out 幾 GB，咁問題通常唔係 Swap 太細，而係 RAM 真係唔夠 ⚠️。

## 🧱 建一個 2GB Swap File

先睇 Root Filesystem：

```bash
df -T /
```

如果係常見 ext4，下面做法通常比較直接。

我偏向用 `dd` 建 File，做法保守啲：

```bash
sudo dd if=/dev/zero of=/swapfile bs=1M count=2048 status=progress
```

跟住一定要收緊權限 🔐：

```bash
sudo chmod 600 /swapfile
```

Swap 可能包含 Process Memory 內容，所以唔應該畀普通 User 讀。

建立 Swap Signature：

```bash
sudo mkswap /swapfile
```

啟用：

```bash
sudo swapon /swapfile
```

確認：

```bash
swapon --show
free -h
```

到呢度見到 `/swapfile`，即時使用已經完成 ✅。

## 🔁 Reboot 之後仲要識得自己返嚟

只做 `swapon` 唔夠，仲要寫入 `/etc/fstab`。

我會先 Backup：

```bash
sudo cp /etc/fstab /etc/fstab.bak
```

再加：

```bash
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

檢查尾幾行：

```bash
tail -n 5 /etc/fstab
```

之後有機會 Reboot 時，再跑：

```bash
swapon --show
```

確認佢真係自動掛返。

## 🎚️ `vm.swappiness=10` 唔係宇宙標準答案

以前 VPS 教學好鍾意直接叫人設：

```text
vm.swappiness=10
```

但 Linux Kernel 對 `vm.swappiness` 嘅定義其實係一個 I/O Cost 取捨，範圍係 `0` 到 `200`，唔係簡單「數字越低越快」。

先睇目前值：

```bash
sysctl vm.swappiness
```

普通 VPS 如果 Storage 唔算快，而又唔想系統太積極用 Swap，可以由 `10` 或 `20` 呢類較低值開始觀察，但我唔會見到有少量 Swap Usage 就當成異常。

臨時改：

```bash
sudo sysctl vm.swappiness=20
```

用落冇問題再持久化：

```bash
echo 'vm.swappiness=20' | sudo tee /etc/sysctl.d/99-swappiness.conf
sudo sysctl --system
```

用獨立 `/etc/sysctl.d/` File，比不停追加 `/etc/sysctl.conf` 易管理好多 👍。

## 📊 真正要睇嘅唔係「Swap Used 幾多」

`free -h` 見到 Swap 用咗幾十 MB，唔代表部機有問題。

我反而會睇有冇持續 Swap I/O：

```bash
vmstat 1
```

留意：

- `si`：Swap in
- `so`：Swap out

如果長時間不停有大量 `si` / `so`，同時 I/O Wait、Load 都升，部機就可能已經真係 Memory Pressure 太大。

再搵邊個 Process 食 RAM：

```bash
ps aux --sort=-%mem | head
```

Docker 機就：

```bash
docker stats
```

呢個時候加多幾 GB Swap 只係延遲問題，唔係解決問題 🫠。

## 🌳 Btrfs 唔好照抄 ext4 做法

如果：

```bash
df -T /
```

見到係 `btrfs`，我會停一停先。

Btrfs 有 Copy-on-write，同 Swap File 有額外要求。`swapon` / `mkswap` 新版工具已經有相關支援，但做法同普通 ext4 唔完全一樣，所以最好按自己 util-linux 同 Btrfs 版本查 Manual。

呢類地方我寧願多查一次，都唔想用一條網上十年前嘅 Command 硬做 🙃。

## 🧹 如果唔再要 Swap

先停：

```bash
sudo swapoff /swapfile
```

確認：

```bash
swapon --show
```

再由 `/etc/fstab` 刪走：

```text
/swapfile none swap sw 0 0
```

最後先：

```bash
sudo rm /swapfile
```

如果之前加過：

```text
/etc/sysctl.d/99-swappiness.conf
```

而又唔再需要自訂 Swappiness，就一齊清返。

## 🧠 我點理解 Swap

對細 VPS 嚟講，我會將佢理解成：

```text
正常用 RAM
   ↓
短時間 Memory Spike
   ↓
Swap 提供 Buffer
   ↓
降低即刻 OOM 嘅機會
```

佢最有價值嘅地方係「頂一頂」，唔係「代替 RAM」。

如果一部機日常已經不停 Swap，最好做嘅唔係再加 Swap，而係減 Service、限制 Container Memory，或者直接升 RAM 💸。

對 1GB 左右嘅小 VPS，我通常會留一個合理大小嘅 Swap File，再配合 `vmstat` 觀察。咁樣比單純追求「Swap 越大越穩」實際得多。

## 📚 參考資料

- Linux `swapon(8)`: https://man7.org/linux/man-pages/man8/swapon.8.html
- Linux `mkswap(8)`: https://man7.org/linux/man-pages/man8/mkswap.8.html
- Linux Kernel `vm.swappiness`: https://docs.kernel.org/admin-guide/sysctl/vm.html
