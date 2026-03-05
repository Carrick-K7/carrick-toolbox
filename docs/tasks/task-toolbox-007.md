# task-toolbox-007: Toolbox 主题系统接入

## 需求
Toolbox 接入 carrick-ui 主题系统

## 状态
- [x] 已完成

## 实现内容

### 1. 创建 useTheme composable
- 文件: `/composables/useTheme.js`
- 功能: 支持 light | dark | cyberpunk | system 四种主题
- API: initTheme(), setTheme(), onThemeChange(), getThemeState()

### 2. 更新样式系统
- 文件: `/styles.css`
- 整合 Carrick UI 主题变量 (--miku-*)
- 保留 Toolbox 兼容层 (--bg-*, --text-*, --accent)
- 添加 Cyberpunk 霓虹特效

### 3. 更新页面组件
- 文件: `/index.html`
- 新增主题选择器 UI (亮色/暗色/赛博朋克/跟随系统)
- 文件: `/main.js`
- 集成 useTheme 初始化与事件绑定

### 4. 构建验证
- ✅ vite build 成功
- ✅ 214 个单元测试通过

## 主题变量映射

| Carrick UI | Toolbox 兼容 |
|------------|-------------|
| --miku-bg | --bg-primary |
| --miku-card-bg | --bg-secondary |
| --miku-text | --text-primary |
| --miku-primary | --accent |
| --miku-border | --border |
