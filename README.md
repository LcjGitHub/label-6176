# Vinyl Collection

一个基于 Vue 3 + TypeScript + Vite 的黑胶唱片收藏管理应用。

## 功能特性

- 唱片收藏管理
- 借阅记录追踪
- 愿望清单管理
- 观赏时间线
- 统计分析

## 技术栈

- **框架**: Vue 3 (Composition API)
- **语言**: TypeScript
- **构建工具**: Vite
- **状态管理**: Pinia
- **路由**: Vue Router
- **UI 组件库**: PrimeVue

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 类型检查

```bash
npx vue-tsc -b
```

### 生产构建

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

## 持续集成

本项目使用 GitHub Actions 进行持续集成。

### 查看构建状态

1. 访问项目 GitHub 仓库主页
2. 点击 `Actions` 标签页
3. 在左侧菜单选择 `CI` 工作流
4. 列表中会显示所有流水线运行记录，绿色对勾表示构建成功，红色叉号表示构建失败
5. 点击某条记录可查看详细的执行步骤和日志
6. 每个步骤（依赖安装、类型检查、生产构建）都会独立显示执行状态，失败的步骤会用红色标记并展示具体错误信息

### 触发条件

流水线会在以下情况自动运行：
- 代码推送到 `main` 或 `master` 分支时
- 向 `main` 或 `master` 分支发起合并请求（Pull Request）时

### 流水线状态徽章

在 README 中显示构建状态徽章（替换为你的仓库信息）：

```
![CI](https://github.com/你的用户名/你的仓库名/actions/workflows/ci.yml/badge.svg)
```

## 目录结构

```
src/
├── components/     # 通用组件
├── mock/          # 模拟数据
├── router/        # 路由配置
├── stores/        # Pinia 状态管理
├── types/         # TypeScript 类型定义
├── utils/         # 工具函数
├── views/         # 页面视图
├── App.vue        # 根组件
└── main.ts        # 入口文件
```

## License

MIT
