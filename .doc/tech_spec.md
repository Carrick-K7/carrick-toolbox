# Tech Spec - Carrick Toolbox

## Tech Stack (技术栈)

### 前端技术
- **HTML5**：语义化标签，支持现代Web标准
- **CSS3**：CSS Grid + Flexbox布局，CSS自定义属性（变量）
- **Vanilla JavaScript (ES6+)**：原生JS，无框架依赖
- **Web APIs**：LocalStorage、Fetch API、Intersection Observer

### 外部依赖
- **Google Fonts**：Outfit + Noto Sans SC 字体
- **Font Awesome 6.4.0**：图标库
- **Marked.js**：Markdown解析器
- **color-name-list**：颜色名称数据库（30000+颜色）

### 开发工具
- **Live Server**：本地开发服务器
- **Browser DevTools**：调试和性能分析

## Project Structure (目录/路由结构)
```
carrick-toolbox/
├── index.html              # 单页应用入口
├── styles.css              # 全局样式
├── main.js                 # 核心调度逻辑
├── server.js               # 开发服务器
├── package.json            # 项目配置
├── README.md               # 项目说明
├── utils/                  # 公共工具
│   ├── domHelper.js        # DOM操作辅助
│   ├── formatting.js       # 格式化工具
│   ├── lunarCalendar.js    # 农历计算工具
│   ├── chineseColors.js    # 中国传统色数据
│   └── colorNames.js       # 颜色名称查询（color-name-list）
├── lib/                    # 第三方库
├── tools/                  # 工具模块
│   ├── clock/              # 模拟时钟
│   │   ├── index.js
│   │   └── style.css
│   ├── time-converter/     # 时间转换
│   ├── color-converter/    # 颜色转换
│   ├── currency-converter/ # 货币转换
│   ├── markdown/           # Markdown编辑器
│   ├── regex-tester/       # 正则测试
│   └── json-formatter/     # JSON格式化
└── .doc/                   # PTT文档
    ├── product_spec.md
    ├── tech_spec.md
    └── task_spec.md
```

### 组件架构（当前HTML内嵌）
```
AppContainer
├── Sidebar（导航栏）
│   ├── Logo区域
│   ├── ⏰ 时间工具模块
│   │   ├── 模拟时钟
│   │   └── 时间转换器
│   ├── 🎨 设计工具模块
│   │   └── 颜色转换器
│   ├── 💰 财经工具模块
│   │   └── 货币转换器
│   ├── 📝 写作工具模块
│   │   └── Markdown编辑器
│   ├── 🔧 开发者工具模块
│   │   ├── 正则表达式测试器
│   │   └── JSON格式化工具
│   └── ⚙️ 系统功能模块 (DFX)
│       ├── 主题切换
│       └── 响应式布局
└── MainContent（主内容区）
    ├── AnalogClock（模拟时钟）
    ├── TimeConverter（时间转换器）
    ├── ColorConverter（颜色转换器）
    ├── CurrencyConverter（货币转换器）
    ├── MarkdownEditor（Markdown编辑器）
    ├── RegexTester（正则表达式测试器）
    └── JsonFormatter（JSON格式化工具）
```

## Data Schema (数据模型)

### 核心数据接口

```typescript
// 应用配置接口
interface AppConfig {
  theme: 'light' | 'dark';
  language: 'zh-CN' | 'en-US';
  activeTool: ToolType;
}

// 工具类型枚举
type ToolType = 'analog-clock' | 'time-converter' | 'color-converter' | 'currency-converter' | 'markdown' | 'regex-tester' | 'json-formatter';

// 工具模块枚举
type ToolModule = 'time-tools' | 'design-tools' | 'finance-tools' | 'writing-tools' | 'developer-tools' | 'ui-experience';

// 颜色数据接口
interface ColorData {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  hsv: { h: number; s: number; v: number };
}

// 货币数据接口
interface CurrencyData {
  from: string;
  to: string;
  amount: number;
  result: number;
  rate: number;
  lastUpdated: Date;
}

// 时间数据接口
interface TimeData {
  timezone: string;
  currentTime: Date;
  convertedTime: { [timezone: string]: Date };
  timestamp: number;
}

// 正则表达式测试数据接口
interface RegexTestData {
  pattern: string;
  flags: string;
  testString: string;
  matches: RegExpMatchArray[];
  isSaved: boolean;
  name?: string;
}

// JSON格式化数据接口
interface JsonFormatterData {
  input: string;
  output: string;
  isValid: boolean;
  error?: string;
  isSaved: boolean;
  name?: string;
}

// Markdown文档接口
interface MarkdownDocument {
  id: string;
  title: string;
  content: string;
  lastModified: Date;
  isAutoSave: boolean;
}

// 用户历史记录接口
interface UserHistory {
  tool: ToolType;
  data: any;
  timestamp: Date;
}

// 应用状态接口
interface AppState {
  config: AppConfig;
  history: UserHistory[];
  documents: MarkdownDocument[];
}
```

### 本地存储数据结构
```typescript
interface LocalStorageData {
  'carrick-config': AppConfig;
  'carrick-history': UserHistory[];
  'carrick-documents': MarkdownDocument[];
  'carrick-saved-regex': RegexTestData[];
  'carrick-saved-json': JsonFormatterData[];
}
```

## Implementation Rules (开发与交互规范)

### 代码规范
1. **命名约定**：
   - CSS类名使用kebab-case（`.tool-item`）
   - JavaScript变量使用camelCase（`activeTool`）
   - 常量使用UPPER_SNAKE_CASE（`DEFAULT_THEME`）

2. **文件组织**：
   - 单文件架构：HTML、CSS、JS保持在index.html中
   - 模块化设计：每个工具独立封装，通过事件通信
   - 注释规范：关键逻辑必须包含中文注释

3. **性能优化**：
   - 使用事件委托减少事件监听器
   - 懒加载非关键功能
   - 防抖处理用户输入
   - 使用CSS transform而非position动画

### 交互规范
1. **工具切换**：
   - 点击侧边栏切换工具，使用淡入淡出动画
   - 保持工具状态（如编辑器内容不丢失）
   - URL hash记录当前工具状态

2. **数据持久化**：
   - 用户设置自动保存到localStorage
   - 敏感数据（如货币汇率）设置缓存过期时间
   - 提供数据导出和清理功能

3. **错误处理**：
   - 网络请求失败显示友好提示
   - 输入验证失败提供具体错误信息
   - 使用try-catch包装关键操作

4. **响应式设计**：
   - 移动端侧边栏自动收起
   - 触摸设备优化手势操作
   - 不同屏幕尺寸适配布局

### 安全规范
1. **XSS防护**：所有用户输入必须经过HTML转义
2. **数据验证**：外部API数据必须验证格式和范围
3. **CSP策略**：配置内容安全策略防止代码注入

## UI/UX 设计规范 (2026-01-25 更新)

### 配置面板设计
1. **Toggle开关样式**：
   - 使用Switch开关替代Checkbox
   - 宽度44px，高度24px
   - 激活状态使用主题色（--accent）
   - 过渡动画0.3s

2. **箭头方向规范**：
   - 收起状态：箭头向左（rotate(0deg)）
   - 展开状态：箭头向右（rotate(180deg)）
   - 箭头位于"配置"文字左侧
   - 添加margin-right: 8px间距

3. **文字不换行**：
   - 配置标题使用white-space: nowrap
   - 确保"配置"二字始终在同一行

### 数字字体规范
1. **货币和数字显示**：
   - 使用系统原生字体栈：-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif
   - 启用等宽数字：font-variant-numeric: tabular-nums
   - 字重500，清晰易读
   - 字间距0.3px

2. **应用场景**：
   - 货币输入框和结果框
   - 汇率信息显示
   - 快速参考列表
   - 所有需要数字对齐的场景

### 侧边栏设计
1. **未开发模块标识**：
   - 使用.under-dev类标记
   - 文字和图标透明度50%
   - 悬停时透明度提升到70%
   - 不使用徽章，保持简洁

2. **收起状态优化**：
   - 宽度72px
   - 所有元素居中对齐
   - 展开按钮和主题切换按钮正常显示
   - 按钮宽度48px，居中显示
   - Logo和按钮垂直排列

### 颜色工具设计
1. **预览区布局**：
   - 左侧色块200px宽
   - 右侧信息区flex布局
   - 颜色名称显示在顶部
   - 操作按钮在底部

2. **颜色名称查询**：
   - 使用color-name-list精确匹配
   - 有匹配显示颜色名称
   - 无匹配显示HEX值
   - 同步查询，无延迟

### 货币工具设计
1. **快速参考优化**：
   - 货币名称后添加缩写：美元（USD）
   - 标题右对齐货币单位和数量
   - 最大宽度400px，居中显示

2. **简化设计**：
   - 移除快捷金额按钮
   - 默认金额为1
   - 减少视觉干扰
