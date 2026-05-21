# 服务器部署指南

## 方式一：一键发布包（推荐）

本地执行：

```bash
chmod +x scripts/build-release.sh
./scripts/build-release.sh
```

生成 `geo-crm-release-YYYYMMDD_HHMMSS.tar.gz`，上传到服务器后：

```bash
tar -xzf geo-crm-release-*.tar.gz
cd release
cp .env.example .env
# 编辑 .env，务必修改 JWT_SECRET
nano .env
./start.sh
```

访问：`http://服务器IP:3001`

## 环境变量（.env）

| 变量 | 说明 |
|------|------|
| `PORT` | 服务端口，默认 3001 |
| `JWT_SECRET` | JWT 密钥，生产环境必须修改 |
| `DATABASE_URL` | SQLite 路径，如 `./data/geo-crm.db` |
| `STATIC_DIR` | 前端静态目录，默认 `../public` |
| `NODE_ENV` | 固定 `production` |

## 方式二：Nginx + Node 分离部署

1. 前端：`frontend/dist` 放到 Nginx `root`
2. 后端：`cd backend && npm run build && npm start`
3. Nginx 反代：

```nginx
location /api {
    proxy_pass http://127.0.0.1:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

4. 构建前端时设置 API 地址：

```bash
VITE_API_BASE_URL=https://你的域名/api npm run build --prefix frontend
```

## 服务器要求

- Node.js 18+
- Linux x64（`better-sqlite3` 需在目标平台安装依赖）

## 使用 PM2 守护进程

```bash
cd release/server
npm install -g pm2
pm2 start dist/index.js --name geo-crm --cwd .. --env production
pm2 save
```

注意：PM2 启动时需设置 `STATIC_DIR` 指向 `release/public`。
