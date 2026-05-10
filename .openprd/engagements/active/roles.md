# 角色

## 用户

- 主要用户:
- 首次访问官网并准备安装 MotiClaw 的普通用户
- 需要给团队成员分发本地部署安装入口的运营或管理员

- 次要用户:
- 查看版本更新和校验信息的开发者
- 从 GitHub Release 或脚本安装迁移过来的存量用户

- 相关方:
- MotiClaw 产品负责人
- 官网维护者
- Release 打包与发布维护者

## 类型专项

- buyer: 需要让团队成员低门槛安装本地 Agent 管理平台的产品/运营负责人。
- user: 准备下载并运行 MotiClaw 的普通用户、运营人员和 Agent 管理员。
- admin: 负责安装、配置、更新和分发安装链接的团队管理员。
- operator: 维护官网、发布包和安装脚本的项目运营者。
- roles: 访客、安装者、团队管理员、Release 维护者、官网维护者。
- asIs: 官网当前通过 Quick Start 区展示 curl 命令，首屏主 CTA 跳转页面内部锚点；下载信息分散在 public manifest、install 脚本和 GitHub Release 链接中。
- toBe: 首页首屏直接提供 Download CTA，点击后在站内弹窗完成系统识别、推荐安装包、其它平台分组、备用安装命令和 Release 兜底。
- permissionMatrix: 访客可查看和下载公开安装包；管理员可复制安装脚本；官网维护者和 Release 维护者负责更新 manifest 与发布产物。
- approvalFlow: 视觉稿和 PRD 由用户确认后进入实现；多平台下载按钮只有对应真实产物存在后才可开放。
