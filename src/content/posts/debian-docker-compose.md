---
description: 記錄喺 Debian VPS 上安裝 Docker、Docker Compose，同埋調整
  Docker 基本設定嘅筆記。
pubDatetime: 2026-07-23
tags:
- Debian
- Ubuntu
- Docker
- Docker Compose
title: Debian / Ubuntu 安裝 Docker 同 Docker Compose
---

# Debian / Ubuntu 安裝 Docker 同 Docker Compose

最近搞緊 VPS 同 Self-hosted Service，Docker 基本上已經變成日常工具。

好多服務而家都直接提供 Docker Image，例如：

-   Home Assistant
-   Emby
-   Uptime Kuma
-   Vaultwarden
-   各種 Web Service

相比以前逐個安裝 Dependency，Docker
最大方便係可以將環境打包好，搬去另一部 Server 都比較容易。

今次記低一下喺 Debian / Ubuntu 上面安裝 Docker 同 Docker Compose
嘅流程。

------------------------------------------------------------------------

## Docker 係咩？

簡單講，Docker 係一套 Container 技術。

佢可以將應用程式連同需要嘅環境一齊打包，唔使直接改動 Host System。

例如：

以前：

    安裝套件
     ↓
    配 PHP
     ↓
    配 Database
     ↓
    處理版本問題

Docker：

    拉 Image
     ↓
    docker compose up
     ↓
    Service Running

對於平時鍾意自己搞 Server 嘅人，管理方便好多。

------------------------------------------------------------------------

## Docker Compose 係咩？

當一個 Service 需要多個 Container：

例如：

    Web
     +
    Database
     +
    Redis

如果每次都打一大堆 `docker run` Command，之後自己都未必記得。

Docker Compose 就係用 YAML File 定義：

-   Container
-   Port
-   Volume
-   Network
-   Environment

之後一條 Command 就可以啟動：

``` bash
docker compose up -d
```

------------------------------------------------------------------------

## 安裝 Docker

以下假設：

-   Debian / Ubuntu VPS
-   已經有 sudo 權限

先更新 System：

``` bash
sudo apt update
sudo apt upgrade -y
```

安裝必要工具：

``` bash
sudo apt install curl vim wget gnupg ca-certificates lsb-release
```

------------------------------------------------------------------------

## 加入 Docker 官方 Repository

加入 GPG Key：

``` bash
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker.gpg
```

加入 Docker Source：

``` bash
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list
```

更新：

``` bash
sudo apt update
```

安裝 Docker：

``` bash
sudo apt install docker-ce docker-ce-cli containerd.io docker-compose-plugin -y
```

------------------------------------------------------------------------

## 確認 Docker 安裝成功

查看版本：

``` bash
docker version
```

正常會見到 Client 同 Server 資訊。

測試：

``` bash
docker run hello-world
```

如果見到：

    Hello from Docker!

代表 Docker 已經正常運作。

------------------------------------------------------------------------

## Docker Compose

而家新版 Docker 已經內置：

``` bash
docker compose
```

查看版本：

``` bash
docker compose version
```

例如：

    Docker Compose version v2.x.x

以前常見：

``` bash
docker-compose
```

而家官方比較推薦：

``` bash
docker compose
```

------------------------------------------------------------------------

## 將 User 加入 Docker Group

如果唔想每次都加 sudo：

``` bash
sudo usermod -aG docker $USER
```

重新登入後：

``` bash
docker ps
```

應該可以直接使用。

------------------------------------------------------------------------

## Docker 基本設定

自己玩 VPS，有一個問題經常遇到：

Docker Log 太大。

尤其某啲 Container 出錯不停寫 Log，幾日可以食晒 Disk。

修改：

``` bash
sudo nano /etc/docker/daemon.json
```

加入：

``` json
{
    "log-driver": "json-file",
    "log-opts": {
        "max-size": "20m",
        "max-file": "3"
    }
}
```

重新啟動：

``` bash
sudo systemctl restart docker
```

之後每個 Container Log 都會有限制。

------------------------------------------------------------------------

## 常用 Docker Command

查看 Container：

``` bash
docker ps
```

查看全部：

``` bash
docker ps -a
```

停止：

``` bash
docker stop container_name
```

刪除：

``` bash
docker rm container_name
```

查看 Log：

``` bash
docker logs container_name
```

Compose 啟動：

``` bash
docker compose up -d
```

更新：

``` bash
docker compose pull
docker compose up -d
```

------------------------------------------------------------------------

## 總結

Docker 對於 Self-hosted 來講真係方便好多。

以前開新 VPS：

-   裝 Dependency
-   搞 Environment
-   解版本 Conflict

而家：

``` text
docker compose up -d
```

基本搞掂。

之後會慢慢記低更多自己平時用 Docker 搞緊嘅 Service，例如：

-   Media Server
-   Monitoring
-   Cloud Storage
-   Home Lab

慢慢砌返一套自己用得舒服嘅 Infrastructure。
