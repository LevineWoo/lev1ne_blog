---
title: "🐳 新 VPS 我點裝 Docker：Debian 13 / Ubuntu 官方 APT、Compose 同 Log 設定"
description: "由乾淨 VPS 開始，用 Docker 官方 APT Repository 安裝 Engine、Buildx 同 Compose，順便整理權限、Log Rotation、更新同日常維護。"
pubDatetime: 2026-07-23
modDatetime: 2026-09-10
tags:
  - Debian
  - Ubuntu
  - Docker
  - Docker Compose
  - VPS
---

# 🐳 新 VPS 我點裝 Docker：Debian 13 / Ubuntu 官方 APT、Compose 同 Log 設定

而家開一部新 VPS，如果要跑 Self-hosted Service，我多數都會先諗 Docker 🧰。

唔係因為 Container 萬能，而係對我呢類用途——Proxy 周邊、Monitoring、Web Service、Media Tool——最實際嘅好處係：配置容易搬、更新比較乾淨，出問題亦較易還原。

以前網上好多 Docker 教學仲係用 `docker.io`、舊式 `apt-key`，甚至獨立 `docker-compose` Binary。到 2026 年再裝新機，我會直接跟 Docker 官方 APT Repository，少啲歷史包袱 🧹。

下面主要用 Debian 13（Trixie）做例子，Ubuntu 做法亦一齊留低。

## 🧭 先決定：官方 Docker 定 Distribution Package？

Debian / Ubuntu 自己都有 Docker 相關 Package，但如果想跟 Docker 官方版本同文件走，我會直接裝官方呢套：

```text
docker-ce
docker-ce-cli
containerd.io
docker-buildx-plugin
docker-compose-plugin
```

Compose 而家用：

```bash
docker compose
```

以前常見嘅：

```bash
docker-compose
```

已經唔係我新機會優先裝嘅方式。

## 🧹 舊機先檢查有冇衝突 Package

全新 VPS 通常可以跳過，但如果以前裝過其他版本，可以先移除 Docker 官方列出嘅衝突 Package：

```bash
sudo apt remove -y \
  docker.io \
  docker-compose \
  docker-doc \
  docker-buildx \
  podman-docker \
  containerd \
  runc
```

APT 話某啲 Package 未安裝係正常。

要留意 ⚠️：移除 Package 唔等於幫你清資料。舊機有 Container / Volume 時，唔好見到 `/var/lib/docker` 就順手刪。

## 📦 Debian 13：加入 Docker 官方 APT Repository

先裝最基本工具：

```bash
sudo apt update
sudo apt install -y ca-certificates curl
```

建立 Keyring 目錄：

```bash
sudo install -m 0755 -d /etc/apt/keyrings
```

下載 Docker 官方 GPG Key：

```bash
sudo curl -fsSL https://download.docker.com/linux/debian/gpg \
  -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
```

再建立 `/etc/apt/sources.list.d/docker.sources`：

```bash
sudo tee /etc/apt/sources.list.d/docker.sources > /dev/null <<EOF
Types: deb
URIs: https://download.docker.com/linux/debian
Suites: $(. /etc/os-release && echo "$VERSION_CODENAME")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF
```

Debian 13 正常會用：

```text
trixie
```

最後更新一次：

```bash
sudo apt update
```

## 🐧 Ubuntu 唔好直接 Copy Debian Repository

Ubuntu 基本流程一樣，但 URL 要換成 Ubuntu：

```bash
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  -o /etc/apt/keyrings/docker.asc
```

`docker.sources` 裏面則係：

```text
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
```

最常見嘅低級錯誤就係 Debian / Ubuntu Repository 混用，所以我寧願留低兩套寫法 😅。

## 🐳 安裝 Engine、Buildx 同 Compose

Repository 加好後：

```bash
sudo apt install -y \
  docker-ce \
  docker-ce-cli \
  containerd.io \
  docker-buildx-plugin \
  docker-compose-plugin
```

先確認 Service：

```bash
sudo systemctl status docker --no-pager
```

再跑測試：

```bash
sudo docker run --rm hello-world
```

版本一次睇晒：

```bash
docker version
docker compose version
docker buildx version
```

到呢度冇 Error，基本安裝就完成 ✅。

## 🔐 `docker` Group 方便，但其實權限好大

如果唔想每次都 `sudo`：

```bash
sudo usermod -aG docker "$USER"
```

重新登入 SSH 後：

```bash
docker ps
```

方便係真，但要知道 `docker` Group 基本上等同畀咗非常高嘅 Host 權限。

自己私人 VPS 我通常接受；多人共用 Server 就唔會隨便加 User 入去。如果真係需要更嚴格隔離，可以另外研究 Docker Rootless Mode。

## 📝 細 VPS 最值得先處理嘅其實係 Log

Docker 預設常見係 `json-file` Logging Driver。如果 Container 一路噴 Log，而又冇 Rotation，Disk 真係可以慢慢畀佢食晒 📈💥。

如果冇工具依賴 JSON Log，我會考慮用 Docker 官方建議嘅 `local` Driver：

```bash
sudo mkdir -p /etc/docker
sudo nano /etc/docker/daemon.json
```

內容：

```json
{
  "log-driver": "local"
}
```

Restart：

```bash
sudo systemctl restart docker
```

確認：

```bash
docker info --format '{{.LoggingDriver}}'
```

如果一定要保留 `json-file`，至少可以限 Size：

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "20m",
    "max-file": "3"
  }
}
```

要留意，改 Daemon Default 只會影響之後新建嘅 Container，舊 Container 通常要 Re-create 先會跟新設定。

## ⌨️ Compose 我日常真正用得最多嘅幾條 Command

啟動：

```bash
docker compose up -d
```

睇狀態：

```bash
docker compose ps
```

跟 Log：

```bash
docker compose logs -f --tail 100
```

更新 Image：

```bash
docker compose pull
docker compose up -d
```

單獨睇全部 Container：

```bash
docker ps -a
```

如果要睇邊個食 Resource：

```bash
docker stats
```

至於：

```bash
docker system prune
```

我唔會當成「定期清理神器」亂跑 😬。有重要 Volume、舊 Image 或暫停咗嘅 Container 時，清之前要知道自己刪緊乜。

## 🔄 Docker 更新我會點做？

因為係官方 APT Repository，所以平時系統更新已經會一齊處理 Package：

```bash
sudo apt update
sudo apt upgrade
```

如果想先睇 Docker 有冇新版本：

```bash
apt list --upgradable 2>/dev/null | grep -E 'docker|containerd'
```

更新 Engine 同更新 Container Image 係兩回事。

Engine 由 APT 管；Compose Stack 嘅 Image 則要自己：

```bash
docker compose pull
docker compose up -d
```

呢兩層分清楚，日後維護會清楚好多 👍。

## ✅ 新機最後我只會記住呢條線

```text
官方 APT Repository
      ↓
Docker Engine + Buildx + Compose
      ↓
hello-world
      ↓
決定 docker Group 權限
      ↓
設定 Log Rotation
      ↓
部署 Compose Stack
```

Docker 真正幫到我嘅唔係「安裝快」，而係日後搬機、重建同還原都比較有秩序。

Compose File、Persistent Volume、Backup 同更新方法整理好，先至係一套真正容易維護嘅 Self-hosted 環境 🧱。

## 📚 參考資料

- Docker Engine on Debian: https://docs.docker.com/engine/install/debian/
- Docker Engine on Ubuntu: https://docs.docker.com/engine/install/ubuntu/
- Linux post-installation: https://docs.docker.com/engine/install/linux-postinstall/
- Docker logging drivers: https://docs.docker.com/engine/logging/configure/
