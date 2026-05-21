# Geo CRM Backend

灵雯GEO智能优化系统后端服务

## 技术栈

- **框架**: Hono (高性能 Web 框架)
- **数据库**: SQLite + Drizzle ORM
- **认证**: JWT (jose)
- **校验**: Zod
- **密码**: bcryptjs

## 目录结构

```
src/
├── db/              # 数据库配置和 Schema
│   ├── index.ts     # 数据库连接
│   └── schema.ts    # 表结构定义
├── middleware/      # 中间件
│   ├── auth.ts      # JWT 认证
│   └── error.ts     # 错误处理
├── routes/          # 路由
│   ├── auth.ts      # 认证相关
│   ├── user.ts      # 用户相关
│   ├── diagnosis.ts # AI诊断
│   ├── article.ts   # 文章管理
│   ├── publish.ts   # 发布管理
│   └── tool.ts      # 工具
├── utils/           # 工具函数
│   ├── auth.ts      # 密码/Token
│   └── response.ts  # 响应格式
├── validators/      # 参数校验
│   └── index.ts
└── index.ts         # 入口文件
```

## 开发

```bash
# 安装依赖
npm install

# 开发模式（热重载）
npm run dev

# 数据库迁移
npm run db:migrate

# 数据库可视化
npm run db:studio
```

## API 响应格式

```json
{
  "code": 1,        // 1=成功, 0=失败
  "msg": "提示信息",
  "data": {}        // 响应数据
}
```
