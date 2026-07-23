---
title: "开始记录我的技术折腾"
description: "记录 Linux、VPS、网络和服务器实践经验"
pubDatetime: 2026-07-22
tags:
  - 随笔
  - 技术
---

## 开始记录

这是我的个人技术博客。

这里记录：

- VPS 使用体验
- Linux 系统维护
- sing-box 配置
- IPv6 网络优化
- rclone 存储方案
- Emby 部署记录

希望把这些年的折腾经验整理下来。

```bash title="Debian 服务器"
sudo apt update
sudo apt upgrade -y
systemctl status sing-box
systemctl restart sing-box
```

```json title="sing-box 配置示例"
{
  "log": {
    "level": "info"
  }
}
```