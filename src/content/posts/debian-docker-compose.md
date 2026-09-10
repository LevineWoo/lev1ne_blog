---
title: "Debian 13 / Ubuntu 裝 Docker：官方 APT Repository、Compose 同日常設定"
description: "重新整理 Debian 13 / Ubuntu 安裝 Docker Engine 同 Docker Compose 嘅做法，改用官方 APT Repository，順便記低權限、Log Rotation 同常用更新流程。"
pubDatetime: 2026-07-23
modDatetime: 2026-09-10
tags:
  - Debian
  - Ubuntu
  - Docker
  - Docker Compose
  - VPS
---

# Debian 13 / Ubuntu 裝 Docker：官方 APT Repository、Compose 同日常設定

開 VPS 之後，我而家好多 Service 都會優先用 Docker 跑。唔係因為 Container 可以解決晒所有問題，而係對 Self-hosted 呢類用途嚟講，部署、搬機同更新真係簡單好多。

以前裝 Docker，我都試過直接用 Distribution 自帶嘅 `docker.io`，或者跟舊教學加 GPG Key。到 2026 年再睇官方文件，Docker 已經將 Debian / Ubuntu 嘅 APT Repository 寫法整理得幾清楚，所以呢篇直接按官方方式重寫一次。

下面以 Debian 13（Trixie）同近年 Ubuntu 為主，目的唔係堆一堆 Command，而係留低一套之後開新機可以直接翻查嘅流程。

## 點解我會用 Docker 官方 Repository？

Debian / Ubuntu 自己都有 Docker 相關 Package，但版本、Package 名稱同更新節奏未必同 Docker 官方一致。

如果想跟 Docker Engine 官方版本走，我會直接用 Docker 自己嘅 APT Repository，安裝：

- `docker-ce`
- `docker-ce-cli`
- `containerd.io`
- `docker-buildx-plugin`
- `docker-compose-plugin`

而家 Compose 亦係用：

```bash
docker compose
```

唔係以前獨立 Binary 嗰個：

```bash
docker-compose
```

## 安裝前先清走可能衝突嘅 Package

新機通常冇問題，但如果以前裝過 Distribution 自帶版本，可以先檢查同移除衝突 Package：

```bash
sudo apt remove docker.io docker-compose docker-doc docker-buildx podman-docker containerd runc
```

APT 顯示有啲 Package 未安裝係正常嘅。

要留意，移除 Package **唔等於刪除原有 Image、Container、Volume 同 Network**。如果係有資料嘅舊機，唔好順手亂刪 `/var/lib/docker`。

## Debian：加入 Docker 官方 APT Repository

先裝必要工具：

```bash
sudo apt update
sudo apt install -y ca-certificates curl
```

建立 APT Keyring 目錄，再下載 Docker 官方 GPG Key：

```bash
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/debian/gpg \
  -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
```

建立 `/etc/apt/sources.list.d/docker.sources`：

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

Debian 13 正常會得到：

```text
trixie
```

之後更新 Package Index：

```bash
sudo apt update
```

## Ubuntu 要改邊度？

Ubuntu 流程基本一樣，但 Repository 同 GPG Key 要用 Ubuntu 路徑：

```bash
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  -o /etc/apt/keyrings/docker.asc
```

`docker.sources` 改成：

```text
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
```

如果只係自己幾部 Debian VPS，其實記熟 Debian 嗰套已經夠用；Ubuntu 我留低呢段主要係避免日後直接 Copy 錯 Repository。

## 安裝 Docker Engine 同 Compose

Repository 加好之後直接裝：

```bash
sudo apt install -y \
  docker-ce \
  docker-ce-cli \
  containerd.io \
  docker-buildx-plugin \
  docker-compose-plugin
```

先睇 Service：

```bash
sudo systemctl status docker --no-pager
```

再跑官方測試 Image：

```bash
sudo docker run --rm hello-world
```

版本可以一次睇晒：

```bash
docker version
docker compose version
docker buildx version
```

## 要唔要將自己加入 docker Group？

如果唔想每次都打 `sudo`：

```bash
sudo usermod -aG docker "$USER"
```

重新登入 SSH 後再試：

```bash
docker ps
```

不過有一點以前好多教學會略過：**`docker` Group 基本上等同畀咗 Root-level 權限。**

自己私人 VPS 通常問題唔大，但如果係多人共用 Server，就唔好將任何普通 Account 隨便加入 `docker` Group。真係需要更嚴格隔離，可以再研究 Rootless Mode。

## Log 唔好任佢無限長

細 VPS 最容易中伏嘅其中一樣就係 Container Log。

Docker 預設 `json-file` driver 本身唔會自動做 Log Rotation。某個 Service 一路噴 Error，Disk 可以慢慢畀 Log 食晒。

如果冇特別依賴 JSON Log Format，我而家會傾向用 Docker 官方建議嘅 `local` logging driver：

```bash
sudo mkdir -p /etc/docker
sudo nano /etc/docker/daemon.json
```

例如：

```json
{
  "log-driver": "local"
}
```

檢查 JSON 冇問題之後：

```bash
sudo systemctl restart docker
```

再確認：

```bash
docker info --format '{{.LoggingDriver}}'
```

應該會見到：

```text
local
```

要記住，修改 Daemon 預設 Logging Driver **只會套用到之後新建立嘅 Container**；已經存在嘅 Container 要 Re-create 先會跟新設定。

如果本身有工具依賴 `json-file`，就唔一定要轉 Driver，可以改做限制大小：

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "20m",
    "max-file": "3"
  }
}
```

## 平時真正會用到嘅 Command

我自己最常用其實唔多。

睇 Running Container：

```bash
docker ps
```

連停止咗嘅都睇：

```bash
docker ps -a
```

跟 Log：

```bash
docker logs -f --tail 100 <container>
```

睇 Compose Stack：

```bash
docker compose ps
```

啟動：

```bash
docker compose up -d
```

更新 Image 再重建：

```bash
docker compose pull
docker compose up -d
```

唔再用嘅舊 Image 可以先睇：

```bash
docker image ls
```

至於 `docker system prune` 呢類清理 Command，我唔會當成日常例行操作亂跑，尤其係有 Volume 同重要 Service 嘅機，清之前一定要知道自己刪緊乜。

## 我會點樣裝一部新 VPS

如果係一部乾淨 Debian VPS，我最後實際會記住嘅流程大概得幾步：

```text
加 Docker 官方 Repository
        ↓
安裝 Engine + Buildx + Compose Plugin
        ↓
跑 hello-world
        ↓
決定要唔要加入 docker Group
        ↓
設定 Logging Driver / Rotation
        ↓
docker compose up -d
```

Docker 最有用嘅地方唔係「一條 Command 就萬能」，而係每次搬機都可以將環境重新砌返出嚟。Compose File、Volume、Backup 同更新方式整理好，先至真係叫方便。

## 參考資料

- Docker Engine on Debian: https://docs.docker.com/engine/install/debian/
- Docker Engine on Ubuntu: https://docs.docker.com/engine/install/ubuntu/
- Linux post-installation: https://docs.docker.com/engine/install/linux-postinstall/
- Docker logging drivers: https://docs.docker.com/engine/logging/configure/
