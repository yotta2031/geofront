# Geo CRM System

灵雯GEO智能优化系统 - 现代技术栈重构版

## 技术栈

### 前端
- **框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **UI组件库**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router
- **图表**: ECharts
- **HTTP**: Axios

### 后端
- **框架**: Hono (高性能 Web 框架)
- **数据库**: SQLite + Drizzle ORM
- **认证**: JWT (jose)
- **校验**: Zod
- **密码**: bcryptjs

## 项目结构

```
geo-crm-system/
├── frontend/          # Vue3 前端
│   ├── src/
│   │   ├── api/       # API 接口
│   │   ├── components/# 公共组件
│   │   ├── layouts/   # 布局组件
│   │   ├── router/    # 路由配置
│   │   ├── stores/    # Pinia 状态管理
│   │   ├── views/     # 页面视图
│   │   └── main.ts    # 入口文件
│   └── package.json
├── backend/           # Hono 后端
│   ├── src/
│   │   ├── db/        # 数据库配置和 Schema
│   │   ├── middleware/ # 中间件
│   │   ├── routes/     # 路由
│   │   ├── utils/      # 工具函数
│   │   ├── validators/ # 参数校验
│   │   └── index.ts    # 入口文件
│   └── package.json
└── package.json       # 根 package.json (workspace)
```

## 功能模块

- 🔍 AI诊断 - 多平台AI可见度诊断
- ✍️ AI创作准备 - 关键词管理、文章分类、AI写作任务
- 📤 文章发布 - 网站媒体、自媒体、官网SEO
- 📈 AI数据中心 - 数据报表、收录查询
- 🛠️ AI工具助手 - 关键词指数、拓词工具
- 👤 个人中心 - 用户信息、点数余额

## 开发

```bash
# 安装依赖
npm install

# 启动前后端（并行）
npm run dev

# 单独启动前端
cd frontend && npm run dev

# 单独启动后端
cd backend && npm run dev
```

## API 响应格式

```json
{
  "code": 1,        // 1=成功, 0=失败
  "msg": "提示信息",
  "data": {}        // 响应数据
}
```
# geofront
