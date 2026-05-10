/*
## 核心功能
配置官网项目的 PostCSS 插件链，让 Tailwind CSS v4 在构建时完成样式编译。
## 输入
接收全站 CSS、Tailwind 指令和 Next.js 样式构建流程。
## 输出
向 PostCSS 导出插件配置对象。
## 定位
位于项目根目录，是全站样式编译链的配置入口。
## 依赖
依赖 `@tailwindcss/postcss` 插件。
## 维护规则
- 调整样式编译链、增加 PostCSS 插件或替换 Tailwind 方案时，必须同步更新本说明书。
- 保持本地开发与生产构建使用同一套样式处理规则。
*/
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
