# Toolbox PTT V2 - Tech Spec

## 技术架构

### 核心技术栈
| 层级 | 技术 | 版本 |
|------|------|------|
| 构建工具 | Vite | ^5.4.0 |
| 运行时 | Node.js | 18+ |
| 语言 | JavaScript (ES6+) | ES2022 |
| 样式 | CSS3 | - |
| 图标 | Font Awesome | 6.4.0 |

### 项目结构
```
carrick-toolbox/
├── index.html              # 应用入口
├── styles.css              # 全局样式 + CSS变量
├── main.js                 # 核心调度器（ToolboxApp）
├── vite.config.js          # Vite配置
├── package.json            # 依赖管理
├── .doc/                   # PTT文档
│   ├── product_spec.md     # 产品规范
│   ├── tech_spec.md        # 技术规范（本文档）
│   └── task_spec.md        # 任务规范
├── assets/                 # 静态资源
├── utils/                  # 公共工具模块
│   ├── domHelper.js        # DOM操作封装
│   ├── formatting.js       # 格式化工具
│   ├── lunarCalendar.js    # 农历计算
│   ├── chineseColors.js    # 中国传统色
│   └── colorNames.js       # 颜色名称查询
└── tools/                  # 工具模块（独立封装）
    ├── clock/
    ├── time-converter/
    ├── color-converter/
    ├── currency-converter/
    ├── markdown/
    ├── json-formatter/
    └── regex-tester/
```

---

## 测试架构

### 测试框架选型
**选择: Vitest** (替代 Jest)

**原因**:
- 原生支持 ESM，无需额外配置
- 与 Vite 无缝集成
- 更快的冷启动和热更新
- 兼容 Jest 的 API
- 内置覆盖率报告

### 测试配置

#### 安装依赖
```bash
npm install -D vitest @vitest/coverage-v8 jsdom @testing-library/dom
```

#### vitest.config.js
```javascript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.js',
        'dist/'
      ]
    }
  }
});
```

#### package.json 脚本
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:tool": "vitest run --reporter=verbose tools/"
  }
}
```

---

## TDD 开发规范

### 红-绿-重构循环

```
1. RED    : 编写失败的测试（描述期望行为）
2. GREEN  : 编写最简单的代码让测试通过
3. REFACTOR: 重构代码，保持测试通过
```

### 测试文件结构
```
tools/
├── your-tool/
│   ├── index.js           # 工具实现
│   ├── style.css          # 工具样式
│   ├── index.test.js      # 单元测试（同目录）
│   └── __fixtures__/      # 测试数据（可选）
```

### 测试命名规范
```javascript
// 文件: tools/json-formatter/index.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import JsonFormatter from './index.js';

describe('JsonFormatter', () => {
  describe('formatJson', () => {
    it('should format valid JSON with 2-space indentation', () => {
      // 测试代码
    });
    
    it('should throw error for invalid JSON', () => {
      // 测试代码
    });
  });
  
  describe('compressJson', () => {
    it('should remove all whitespace from JSON', () => {
      // 测试代码
    });
  });
});
```

### 测试覆盖率目标
| 类型 | 目标 | 说明 |
|------|------|------|
| 语句覆盖率 | ≥ 80% | 所有可执行语句 |
| 分支覆盖率 | ≥ 75% | if/else/switch分支 |
| 函数覆盖率 | ≥ 90% | 所有导出函数 |
| 行覆盖率 | ≥ 80% | 所有代码行 |

---

## 工具开发规范

### 工具类模板
```javascript
/**
 * 工具名称
 * 简短描述
 */

import { domHelper } from '../../utils/domHelper.js';
import './style.css';

export default class ToolName {
  constructor(container) {
    this.container = container;
    this.config = {
      // 默认配置
    };
  }

  /**
   * 初始化工具
   * 必须返回 Promise 或同步完成
   */
  async init() {
    this.render();
    this.bindEvents();
    return this;
  }

  /**
   * 渲染界面
   */
  render() {
    this.container.innerHTML = `
      <div class="tool-name">
        <!-- 工具内容 -->
      </div>
    `;
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    // 事件绑定
  }

  /**
   * 销毁工具（清理资源）
   * 必须实现，防止内存泄漏
   */
  destroy() {
    // 清理定时器、事件监听等
  }
}
```

### 工具注册
```javascript
// main.js - registerTools()
{
  id: 'tool-id',                    // 唯一标识（kebab-case）
  name: '工具名称',                  // 显示名称
  icon: 'font-awesome-icon',        // Font Awesome 图标名
  category: 'category-name',        // 分类
  module: () => import('./tools/tool-id/index.js')  // 动态导入
}
```

### 分类定义
```javascript
const categories = {
  'time-tools': '时间工具',
  'design-tools': '设计工具',
  'finance-tools': '财务工具',
  'writing-tools': '写作工具',
  'developer-tools': '开发者工具',
  'converter-tools': '转换工具',
  'generator-tools': '生成工具'
};
```

---

## 工具测试模板

### 基础测试结构
```javascript
// tools/your-tool/index.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import YourTool from './index.js';

// Mock DOM 环境
document.body.innerHTML = '<div id="test-container"></div>';

describe('YourTool', () => {
  let container;
  let tool;

  beforeEach(() => {
    container = document.getElementById('test-container');
    container.innerHTML = '';
    tool = new YourTool(container);
  });

  describe('init', () => {
    it('should render the tool interface', async () => {
      await tool.init();
      expect(container.querySelector('.your-tool')).toBeTruthy();
    });
  });

  describe('core functionality', () => {
    beforeEach(async () => {
      await tool.init();
    });

    it('should handle input correctly', () => {
      // 测试核心功能
    });

    it('should update UI on state change', () => {
      // 测试UI更新
    });
  });

  describe('destroy', () => {
    it('should clean up resources', async () => {
      await tool.init();
      tool.destroy();
      // 验证资源已清理
    });
  });
});
```

### Mock 示例
```javascript
// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

mockFetch.mockResolvedValueOnce({
  json: () => Promise.resolve({ rates: { USD: 1.08 } })
});

// Mock clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve())
  }
});

// Mock EyeDropper
class MockEyeDropper {
  open() {
    return Promise.resolve({ sRGBHex: '#FF5733' });
  }
}
global.EyeDropper = MockEyeDropper;
```

---

## 代码质量规范

### ESLint 配置
```javascript
// .eslintrc.js
module.exports = {
  env: {
    browser: true,
    es2022: true,
    node: true
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['error', 'warn'] }],
    'prefer-const': 'error',
    'no-var': 'error'
  }
};
```

### Git 工作流
```bash
# 1. 创建功能分支
git checkout -b feat/tool-name

# 2. 开发（遵循 TDD）
# 编写测试 -> 实现 -> 重构

# 3. 确保测试通过
npm run test:run

# 4. 提交（遵循 Conventional Commits）
git commit -m "feat(tool): add new tool - tool name"
git commit -m "test(tool): add unit tests for tool name"
git commit -m "fix(tool): fix edge case in tool name"

# 5. 推送到远程
git push origin feat/tool-name

# 6. 创建 Pull Request
# 通过代码审查后合并
```

### 提交规范
| 类型 | 说明 | 示例 |
|------|------|------|
| feat | 新功能 | `feat(clock): add timezone selector` |
| fix | Bug修复 | `fix(color): handle invalid hex input` |
| test | 测试相关 | `test(json): add edge case tests` |
| docs | 文档更新 | `docs: update README` |
| refactor | 重构 | `refactor(utils): simplify domHelper` |
| style | 代码格式 | `style: fix indentation` |

---

## 部署配置

### Zeabur 部署
```yaml
# zeabur.yml（如需要）
build:
  command: npm run build
  output: dist
```

### 环境变量
```bash
# .env（本地开发）
VITE_API_BASE_URL=http://localhost:3000

# .env.production（生产环境）
VITE_API_BASE_URL=https://api.example.com
```

---

## 性能优化

### 构建优化
```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['marked']  // 将第三方库分离
        }
      }
    },
    minify: 'terser',
    sourcemap: true
  }
};
```

### 运行时优化
- 工具懒加载：使用动态 `import()`
- 防抖/节流：搜索输入等高频事件
- requestAnimationFrame：动画相关

---

## 更新日志

### V2.0 (2026-02-08)
- 添加 Vitest 测试框架配置
- 定义 TDD 开发规范
- 添加测试覆盖率目标
- 定义工具开发模板和测试模板
- 添加代码质量规范（ESLint、Git工作流）
