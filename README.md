# AI 阅读器

一个基于 React + Supabase 的 AI 文学名著阅读器，支持多模型 AI 辅助阅读。

## 功能

- **书籍导入**：支持 `.txt` 和 `.epub` 格式，自动识别章节
- **阅读器**：目录导航、字体调节、阅读进度记忆
- **AI 助手**：总结、深度解读、人物分析、词汇精选、自由提问
- **多模型支持**：智谱 AI、DeepSeek、SiliconFlow、OpenRouter
- **用户系统**：邮箱/密码登录、Google 登录、个人资料、头像上传
- **云端同步**：登录后书籍和阅读进度自动同步到 Supabase

## 技术栈

- React 19 + TypeScript + Vite
- Supabase（Auth + Database + Storage）
- Organic 设计风格（frontend-design skill）

## 本地开发

```bash
npm install
npm run dev
```

## 环境变量

复制 `.env.example` 为 `.env`，填入你的 Supabase 配置：

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Supabase 配置

执行 `supabase-setup.sql` 中的 SQL 语句，创建数据库表和存储桶。

## 协作

1. Fork 或 Clone 本仓库
2. 创建自己的 `.env` 文件
3. 执行 SQL 创建自己的 Supabase 项目
4. 提交 PR 或 Push 到主分支
