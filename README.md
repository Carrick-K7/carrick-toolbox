# Carrick 工具箱

现代化的多合一网页实用工具集合，致力于为用户提供简洁、高效、美观的日常工具体验。

## 🚀 快速开始

### 开发环境

```bash
# 安装依赖
npm install

# 启动开发服务器（Vite HMR）
npm run dev
```

然后在浏览器中访问 `http://localhost:3000`

### 生产构建

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

构建产物将输出到 `dist/` 目录。

## 📁 项目结构

```
carrick-toolbox/
├── index.html              # 单页应用入口
├── styles.css              # 全局样式
├── main.js                 # 核心调度逻辑（ES6模块）
├── vite.config.js          # Vite构建配置
├── package.json            # 项目配置和依赖
├── .gitignore              # Git忽略配置
├── .windsurfrules          # 分支开发规范
├── assets/                 # 静态资源
│   └── icon.svg            # 应用图标
├── utils/                  # 公共工具模块
│   ├── domHelper.js        # DOM操作辅助
│   ├── formatting.js       # 格式化工具
│   ├── lunarCalendar.js    # 农历计算
│   ├── chineseColors.js    # 中国传统色
│   └── colorNames.js       # 颜色名称查询
├── tools/                  # 工具模块（独立封装）
│   ├── clock/              # 模拟时钟
│   │   ├── index.js        # 工具逻辑
│   │   └── style.css       # 工具样式
│   ├── time-converter/     # 时间转换器
│   ├── color-converter/    # 颜色转换器
│   ├── currency-converter/ # 货币转换器
│   └── markdown/           # Markdown编辑器
├── dist/                   # Vite构建输出（.gitignore）
└── .doc/                   # PTT框架文档
    ├── product_spec.md
    ├── tech_spec.md
    └── task_spec.md
```

## 🛠️ 功能特性

### 已实现工具

- ⏰ **模拟时钟**：实时模拟时钟显示、数字时间、日期、农历、时区切换
- 🕐 **时间转换器**：时间戳转换、时区转换、多格式支持
- 🎨 **颜色转换器**：HEX/RGB/HSL/HSV/CMYK格式转换、屏幕取色、中国传统色、颜色名称查询
- 💰 **货币转换器**：实时汇率换算（Frankfurter API）、快速参考、主流货币支持
- 📝 **Markdown编辑器**：实时预览、工具栏快捷操作、语法高亮

### 系统功能

- 🌓 **主题切换**：明暗模式自动切换
- � **响应式设计**：适配桌面、平板、手机
- ⚡ **性能优化**：代码分割、懒加载、HMR热更新
- 🎯 **模块化架构**：ES6模块、独立工具封装

## 🎨 设计特色

- 🌿 清新的青绿色主题配色
- 🌓 明暗模式切换
- 📱 响应式设计，适配各种设备
- ⚡ 流畅的动画和交互
- 🎯 简洁直观的用户界面

## 📖 开发说明

### 技术栈

#### 核心技术
- **HTML5** + **CSS3** + **Vanilla JavaScript (ES6+)**
- **Vite 5.4.21**：快速构建工具和开发服务器
- **ES6 模块**：原生模块化，动态import按需加载

#### 外部依赖
- **Google Fonts**：Outfit + Noto Sans SC
- **Font Awesome 6.4.0**：图标库
- **Marked.js**：Markdown解析（CDN）
- **color-name-list**：颜色名称数据库（npm）

#### 开发工具
- **Node.js 18+**：运行环境
- **npm**：包管理
- **Git + GitHub CLI**：版本控制和PR管理

### 添加新工具

1. 在`tools/`目录下创建新工具文件夹
2. 创建`index.js`和`style.css`文件
3. 在`main.js`中注册工具配置
4. 在`index.html`中添加导航项

### 工具模板

```javascript
// tools/your-tool/index.js
import { domHelper } from '../../utils/domHelper.js';
import './style.css';  // 重要：导入CSS让Vite处理

export default class YourTool {
  constructor(container) {
    this.container = container;
  }

  async init() {
    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="your-tool">
        <!-- 工具内容 -->
      </div>
    `;
  }

  bindEvents() {
    // 绑定事件
  }

  destroy() {
    // 清理资源
  }
}
```

### 分支开发规范

遵循 `.windsurfrules` 定义的规范：

1. **禁止直接在 main 分支开发**
2. **创建功能分支**：`feat/功能名称` 或 `fix/问题描述`
3. **提交规范**：遵循 Conventional Commits（`feat:`, `fix:`, `docs:` 等）
4. **通过 PR 合并**：代码审查后合入主干
5. **自动部署**：main 分支推送触发 Zeabur 部署

## � 部署

### Zeabur（推荐）

项目已配置自动部署到 Zeabur：

- **构建命令**：`npm run build`
- **输出目录**：`dist`
- **触发方式**：推送到 `main` 分支自动部署

### 其他平台

项目支持部署到任何支持 Vite 的静态站点托管平台：

- **Vercel**：自动识别 Vite，零配置部署
- **Netlify**：支持持续部署和预览
- **GitHub Pages**：需要配置 base 路径

详见 `.doc/tech_spec.md` 中的部署章节。

## �📄 PTT框架文档

项目采用PTT（Product, Tech, Task）框架进行管理：

- 📋 **Product Spec**：产品需求和功能定义
- 🔧 **Tech Spec**：技术架构和实现规范
- 📝 **Task Spec**：开发任务和进度跟踪

文档位于`.doc/`目录下。

## 🤝 贡献

欢迎提交Issue和Pull Request！

请遵循分支开发规范，通过 PR 方式贡献代码。

## 📜 许可证

MIT License
