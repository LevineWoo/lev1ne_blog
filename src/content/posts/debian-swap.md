---
description: 記錄喺 Debian 同 Ubuntu VPS 上手動建立 Swap File、設定
  Swappiness 同管理 Swap 嘅方法。
pubDatetime: 2026-07-23
tags:
- Debian
- Ubuntu
- Linux
- Swap
- VPS
title: Debian / Ubuntu 手動加 Swap，幫部細 VPS 頂住 Memory 壓力
---

# Debian / Ubuntu 手動加 Swap，幫部細 VPS 頂住 Memory 壓力

玩 VPS 嘅朋友應該都試過：

開咗部細 VPS，RAM 得 512MB 或 1GB，跑幾個 Service 之後 Memory 慢慢爆。

尤其係：

-   Docker Container
-   Database
-   Proxy Service
-   Monitoring

一多就容易 OOM（Out Of Memory）。

Swap 唔係真 RAM，但喺啲細 VPS 上面，可以當一個安全墊。

今次記低點樣喺 Debian / Ubuntu 手動整 Swap File。

------------------------------------------------------------------------

## 先睇下部 Server 有冇 Swap

``` bash
sudo swapon -s
```

或者：

``` bash
free -m
```

如果 Swap 顯示 0，代表未有 Swap。

------------------------------------------------------------------------

## 建立 Swap File

例如建立 1GB Swap：

``` bash
sudo fallocate -l 1G /swapfile
```

設定權限：

``` bash
sudo chmod 600 /swapfile
```

------------------------------------------------------------------------

## 啟用 Swap

建立格式：

``` bash
sudo mkswap /swapfile
```

啟用：

``` bash
sudo swapon /swapfile
```

確認：

``` bash
free -m
```

------------------------------------------------------------------------

## 設定開機自動啟用

加入 `/etc/fstab`：

``` bash
echo "/swapfile swap swap defaults 0 0" | sudo tee -a /etc/fstab
```

之後 Reboot 後 Swap 會自動開返。

------------------------------------------------------------------------

## 調整 Swappiness

查看：

``` bash
cat /proc/sys/vm/swappiness
```

一般 VPS 可以調低：

``` bash
echo "vm.swappiness=10" | sudo tee -a /etc/sysctl.conf
```

套用：

``` bash
sudo sysctl -p
```

咁 Linux 會比較傾向使用 RAM，減少過早使用 Swap。

------------------------------------------------------------------------

## 關閉 Swap

停用：

``` bash
sudo swapoff -v /swapfile
```

刪除 `/etc/fstab` 入面：

``` text
/swapfile swap swap defaults 0 0
```

最後：

``` bash
sudo rm /swapfile
```

------------------------------------------------------------------------

## 小結

Swap 唔會令 VPS 變成高性能 Server。

RAM 始終係 RAM。

但對於：

-   小型 VPS
-   Docker Server
-   Home Lab
-   長期運行 Service

加一個 Swap，可以多一層保護，避免 Memory 爆滿直接 OOM。

平時開新 VPS，我通常都會順手整埋。

少少設定，換返多一層穩定性。
