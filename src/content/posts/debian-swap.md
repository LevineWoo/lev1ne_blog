---
title: "細 VPS 點樣加 Swap：Debian / Ubuntu 由建立到 Swappiness 一次整理"
description: "整理 Debian / Ubuntu VPS 建立 Swap File、設定開機掛載、調整 vm.swappiness 同安全移除嘅做法，順便講清 Swap 可以解決乜、又唔可以解決乜。"
pubDatetime: 2026-07-23
modDatetime: 2026-09-10
tags:
  - Debian
  - Ubuntu
  - Linux
  - Swap
  - VPS
---

# 細 VPS 點樣加 Swap：Debian / Ubuntu 由建立到 Swappiness 一次整理

細 VPS 最常見嘅配置就係 512MB、1GB、2GB RAM。平時跑 Proxy、Monitoring 或幾個細 Service 未必有事，但一遇到 Compile、Docker Container 突然食多咗 Memory，Kernel 就有機會開始 OOM Kill。

Swap 唔會令 1GB RAM 變成 3GB RAM，亦唔應該當成性能升級；不過對低 Memory VPS 嚟講，佢確實可以做一層 Buffer，畀系統多啲空間捱過短時間 Memory Pressure。

我而家開細機，通常都會先睇清楚有冇 Swap，再決定需唔需要補一個。

## 先睇部機本身有冇 Swap

最直接：

```bash
swapon --show
```

再睇整體 Memory：

```bash
free -h
```

如果 `Swap` 係 `0B`，即係目前冇啟用 Swap。

亦可以睇：

```bash
cat /proc/swaps
```

雲廠有時會預先幫你開 Swap Partition 或 Swap File，所以唔好一登入就直接再整多個。

## Swap 要幾大？

冇一個所有 VPS 都啱嘅固定比例。

我自己會大概咁諗：

| RAM | 一般細 VPS 可考慮 |
| --- | --- |
| 512MB | 1GB ～ 2GB Swap |
| 1GB | 1GB ～ 2GB Swap |
| 2GB | 1GB ～ 2GB Swap |
| 4GB 或以上 | 睇 Workload 再決定 |

如果個 Service 長期要靠幾 GB Swap 先頂得住，問題通常已經唔係「Swap 太細」，而係 RAM 真係唔夠。

Swap 用得太多時，Disk I/O 會明顯拖慢系統；NVMe 會比慢 HDD 好，但始終同真正 RAM 差好遠。

## 建立一個 2GB Swap File

好多教學會直接用 `fallocate`。大部分常見 Filesystem 冇問題，但 `swapon` 官方 Manual 有特別提醒：某啲 Filesystem / Copy-on-write 情況下，預分配 File 可能唔適合作 Swap。

為咗做法保守同易搬，我會用 `dd`：

```bash
sudo dd if=/dev/zero of=/swapfile bs=1M count=2048 status=progress
```

建立完先鎖權限：

```bash
sudo chmod 600 /swapfile
```

呢步唔好漏。Swap 入面有機會出現 Process Memory 內容，唔應該畀普通 User 隨便讀。

## Format 同啟用 Swap

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

正常應該會見到 `/swapfile` 同對應 Size。

## 設定 Reboot 後自動啟用

如果只做 `swapon`，重開機之後未必會自動返嚟，所以要寫入 `/etc/fstab`。

先 Backup：

```bash
sudo cp /etc/fstab /etc/fstab.bak
```

再加：

```bash
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

可以檢查：

```bash
tail -n 5 /etc/fstab
```

之後如果想確認設定真係冇問題，可以搵個方便時間 Reboot，再跑：

```bash
swapon --show
```

## Swappiness 唔係越低越好

以前好多 VPS 教學都會一律叫人：

```text
vm.swappiness=10
```

我而家唔會再當呢個值係「標準答案」。

Linux Kernel 對 `vm.swappiness` 嘅定義，本質上係 Swap I/O 同 Filesystem Paging 成本之間嘅相對取捨，範圍係 `0` 到 `200`，預設通常係 `60`。最佳值要睇 Workload 同 Storage 性能。

先睇目前數值：

```bash
sysctl vm.swappiness
```

或者：

```bash
cat /proc/sys/vm/swappiness
```

普通 VPS 如果想令系統冇咁積極使用慢 Swap，可以由 `10`、`20` 呢類較低值開始觀察，但唔需要見到 Swap 有少量 Usage 就覺得有問題。

臨時測試例如：

```bash
sudo sysctl vm.swappiness=20
```

如果用落適合，再持久化：

```bash
echo 'vm.swappiness=20' | sudo tee /etc/sysctl.d/99-swappiness.conf
```

套用：

```bash
sudo sysctl --system
```

比起直接一路 `tee -a /etc/sysctl.conf`，獨立放一個 `/etc/sysctl.d/99-swappiness.conf` 日後會易管理好多。

## 點知 Swap 係「安全墊」定已經變成問題？

我通常唔會淨係睇 `free -h` 一個數字。

可以裝 `vmstat` 所在套件：

```bash
sudo apt install -y procps
```

再睇：

```bash
vmstat 1
```

留意：

- `si`：Swap in
- `so`：Swap out

如果長期不停有大量 Swap in / out，而且 Load、I/O Wait 都開始升，咁就唔係「加多啲 Swap」可以根治。

嗰陣應該反過來檢查：

```bash
ps aux --sort=-%mem | head
```

或者 Container：

```bash
docker stats
```

睇下究竟邊個 Process 食緊 Memory。

## Btrfs 要特別小心

如果 Root Filesystem 係 ext4 呢類常見配置，上面做法通常比較直接。

但 Btrfs 有 Copy-on-write 同 Swap File 額外要求，唔應該照抄普通 ext4 流程就算。新版 `mkswap --file` 已經改善建立 Btrfs Swap File 嘅處理，但實際操作之前仍然建議按自己 util-linux 同 Filesystem 版本查一次 Manual。

先確認 Filesystem：

```bash
df -T /
```

如果見到 `btrfs`，我會停一停，另外按 Btrfs Swap File 規則做。

## 唔要 Swap 時點樣乾淨移除？

先停用：

```bash
sudo swapoff /swapfile
```

確認已經冇掛載：

```bash
swapon --show
```

再由 `/etc/fstab` 刪走：

```text
/swapfile none swap sw 0 0
```

最後先刪 File：

```bash
sudo rm /swapfile
```

如果之前另外建立咗：

```text
/etc/sysctl.d/99-swappiness.conf
```

而又唔再需要自訂 Swappiness，可以一齊刪或者改返。

## 我會點樣理解 Swap

我唔會將 Swap 當成「免費 RAM」，比較似係：

```text
RAM 快滿
  ↓
Kernel 有多一個地方可以騰挪
  ↓
短時間 Memory Spike 未必即刻 OOM
```

對跑少量 Service 嘅 1GB VPS，呢層 Buffer 幾有用；但如果部機日常已經長期 Swap 到 Disk 狂轉，就應該加 RAM、減 Service，或者重新限制 Container Memory。

所以我而家嘅做法係：**有需要就加，但加完會觀察，而唔係覺得 Swap 越大越穩。**

## 參考資料

- Linux `swapon(8)`: https://man7.org/linux/man-pages/man8/swapon.8.html
- Linux `mkswap(8)`: https://man7.org/linux/man-pages/man8/mkswap.8.html
- Linux Kernel `vm.swappiness`: https://docs.kernel.org/admin-guide/sysctl/vm.html
