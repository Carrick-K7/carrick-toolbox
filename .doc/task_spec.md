# Toolbox PTT V2 - Task Spec

## 当前任务
**下一个开发工具**: Base64 编解码器  
**优先级**: 高  
**预计耗时**: 2小时  
**采用方法**: TDD (Test-Driven Development)

---

## 工具概述

### 功能定义
Base64 编解码器提供文本和文件的 Base64 编码/解码功能，支持：
- 文本 ↔ Base64 双向转换
- 文件上传 → Base64
- Base64 → 文件下载
- URL Safe Base64 支持

### 用户故事
- 作为开发者，我希望能快速将文本编码为 Base64
- 作为开发者，我希望能解码 Base64 字符串查看原始内容
- 作为用户，我希望能将图片文件转为 Base64 数据URI
- 作为用户，我希望能将 Base64 数据转回文件下载

---

## TDD 开发步骤

### Phase 1: 测试先行（30分钟）

#### Step 1.1: 创建测试文件
```bash
mkdir -p tools/base64-converter
touch tools/base64-converter/index.test.js
```

#### Step 1.2: 编写核心功能测试
```javascript
// tools/base64-converter/index.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import Base64Converter from './index.js';

describe('Base64Converter', () => {
  let container;
  let tool;

  beforeEach(() => {
    container = document.createElement('div');
    tool = new Base64Converter(container);
  });

  describe('init', () => {
    it('should render the tool interface', async () => {
      await tool.init();
      expect(container.querySelector('.base64-converter')).toBeTruthy();
      expect(container.querySelector('#text-input')).toBeTruthy();
      expect(container.querySelector('#base64-output')).toBeTruthy();
    });
  });

  describe('encodeText', () => {
    beforeEach(async () => {
      await tool.init();
    });

    it('should encode plain text to base64', () => {
      const input = 'Hello, World!';
      const expected = 'SGVsbG8sIFdvcmxkIQ==';
      expect(tool.encodeText(input)).toBe(expected);
    });

    it('should encode Chinese characters correctly', () => {
      const input = '你好，世界！';
      const expected = '5L2g5aW977yM5LiW55WM77yB';
      expect(tool.encodeText(input)).toBe(expected);
    });

    it('should encode empty string', () => {
      expect(tool.encodeText('')).toBe('');
    });

    it('should handle special characters', () => {
      const input = '<script>alert("xss")</script>';
      const result = tool.encodeText(input);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('decodeText', () => {
    beforeEach(async () => {
      await tool.init();
    });

    it('should decode base64 to plain text', () => {
      const input = 'SGVsbG8sIFdvcmxkIQ==';
      const expected = 'Hello, World!';
      expect(tool.decodeText(input)).toBe(expected);
    });

    it('should decode Chinese characters correctly', () => {
      const input = '5L2g5aW977yM5LiW55WM77yB';
      const expected = '你好，世界！';
      expect(tool.decodeText(input)).toBe(expected);
    });

    it('should return error for invalid base64', () => {
      const input = '!!!invalid!!!';
      expect(() => tool.decodeText(input)).toThrow();
    });

    it('should handle base64 without padding', () => {
      const input = 'SGVsbG8sIFdvcmxkIQ';
      const result = tool.decodeText(input);
      expect(result).toBe('Hello, World!');
    });
  });

  describe('encodeURLSafe', () => {
    beforeEach(async () => {
      await tool.init();
    });

    it('should replace + with - and / with _', () => {
      const input = '???'; // 会产生 + 和 / 的输入
      const result = tool.encodeURLSafe(input);
      expect(result).not.toContain('+');
      expect(result).not.toContain('/');
      expect(result).not.toContain('=');
    });
  });

  describe('fileToBase64', () => {
    it('should convert File to base64', async () => {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const result = await tool.fileToBase64(mockFile);
      expect(result).toContain('data:text/plain;base64,');
    });
  });

  describe('base64ToFile', () => {
    it('should convert base64 data URI to download', () => {
      const dataUri = 'data:text/plain;base64,dGVzdCBjb250ZW50';
      // 验证创建了下载链接
      const link = tool.base64ToFile(dataUri, 'test.txt');
      expect(link.download).toBe('test.txt');
    });
  });

  describe('copy functionality', () => {
    beforeEach(async () => {
      await tool.init();
    });

    it('should copy result to clipboard', async () => {
      const mockClipboard = {
        writeText: vi.fn(() => Promise.resolve())
      };
      Object.assign(navigator, { clipboard: mockClipboard });

      await tool.copyToClipboard('test content');
      expect(mockClipboard.writeText).toHaveBeenCalledWith('test content');
    });
  });
});
```

#### Step 1.3: 运行测试（应该失败）
```bash
npm run test:run tools/base64-converter/
# 预期: 所有测试失败（因为实现还不存在）
```

---

### Phase 2: 最小实现（40分钟）

#### Step 2.1: 创建工具文件
```bash
touch tools/base64-converter/index.js
touch tools/base64-converter/style.css
```

#### Step 2.2: 编写最小实现
```javascript
// tools/base64-converter/index.js
import { domHelper } from '../../utils/domHelper.js';
import './style.css';

export default class Base64Converter {
  constructor(container) {
    this.container = container;
    this.mode = 'encode'; // 'encode' | 'decode'
  }

  async init() {
    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="base64-converter">
        <div class="b64-mode-switch">
          <button class="b64-mode-btn active" data-mode="encode">编码 →</button>
          <button class="b64-mode-btn" data-mode="decode">→ 解码</button>
        </div>
        
        <div class="b64-section">
          <div class="b64-section-header">
            <span class="b64-label" id="input-label">输入文本</span>
            <button class="b64-clear-btn" id="clear-btn">
              <i class="fas fa-eraser"></i> 清空
            </button>
          </div>
          <textarea class="b64-textarea" id="text-input" placeholder="输入要编码的文本..."></textarea>
        </div>

        <div class="b64-actions">
          <button class="b64-btn primary" id="convert-btn">
            <i class="fas fa-exchange-alt"></i> 转换
          </button>
          <label class="b64-btn" id="file-btn">
            <i class="fas fa-file-upload"></i> 选择文件
            <input type="file" id="file-input" hidden>
          </label>
        </div>

        <div class="b64-section">
          <div class="b64-section-header">
            <span class="b64-label" id="output-label">Base64 结果</span>
            <button class="b64-copy-btn" id="copy-btn">
              <i class="fas fa-copy"></i> 复制
            </button>
          </div>
          <textarea class="b64-textarea" id="base64-output" readonly placeholder="转换结果将显示在这里..."></textarea>
        </div>

        <div class="b64-options">
          <label class="b64-checkbox">
            <input type="checkbox" id="url-safe">
            <span>URL Safe（替换 +/=）</span>
          </label>
        </div>

        <div class="b64-stats" id="stats"></div>
      </div>
    `;
  }

  bindEvents() {
    // 模式切换
    domHelper.findAll('.b64-mode-btn', this.container).forEach(btn => {
      domHelper.on(btn, 'click', () => {
        this.setMode(btn.dataset.mode);
      });
    });

    // 转换按钮
    const convertBtn = domHelper.find('#convert-btn', this.container);
    if (convertBtn) {
      domHelper.on(convertBtn, 'click', () => this.convert());
    }

    // 清空按钮
    const clearBtn = domHelper.find('#clear-btn', this.container);
    if (clearBtn) {
      domHelper.on(clearBtn, 'click', () => this.clear());
    }

    // 复制按钮
    const copyBtn = domHelper.find('#copy-btn', this.container);
    if (copyBtn) {
      domHelper.on(copyBtn, 'click', () => this.copyResult());
    }

    // 文件输入
    const fileInput = domHelper.find('#file-input', this.container);
    if (fileInput) {
      domHelper.on(fileInput, 'change', (e) => this.handleFile(e.target.files[0]));
    }

    // 实时转换（可选）
    const textInput = domHelper.find('#text-input', this.container);
    if (textInput) {
      domHelper.on(textInput, 'input', () => this.debounceConvert());
    }
  }

  setMode(mode) {
    this.mode = mode;
    
    // 更新按钮状态
    domHelper.findAll('.b64-mode-btn', this.container).forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    // 更新标签
    const inputLabel = domHelper.find('#input-label', this.container);
    const outputLabel = domHelper.find('#output-label', this.container);
    
    if (mode === 'encode') {
      inputLabel.textContent = '输入文本';
      outputLabel.textContent = 'Base64 结果';
    } else {
      inputLabel.textContent = 'Base64 输入';
      outputLabel.textContent = '解码结果';
    }

    // 清空结果
    this.clearOutput();
  }

  encodeText(text) {
    if (!text) return '';
    try {
      return btoa(unescape(encodeURIComponent(text)));
    } catch (e) {
      throw new Error('编码失败: ' + e.message);
    }
  }

  decodeText(base64) {
    if (!base64) return '';
    try {
      // 处理没有padding的情况
      const padding = 4 - (base64.length % 4);
      if (padding !== 4) {
        base64 += '='.repeat(padding);
      }
      return decodeURIComponent(escape(atob(base64)));
    } catch (e) {
      throw new Error('无效的 Base64 字符串');
    }
  }

  encodeURLSafe(text) {
    let encoded = this.encodeText(text);
    return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  convert() {
    const input = domHelper.find('#text-input', this.container).value;
    const urlSafe = domHelper.find('#url-safe', this.container).checked;
    const output = domHelper.find('#base64-output', this.container);

    try {
      let result;
      if (this.mode === 'encode') {
        result = urlSafe ? this.encodeURLSafe(input) : this.encodeText(input);
      } else {
        result = this.decodeText(input);
      }
      output.value = result;
      this.updateStats(input, result);
    } catch (e) {
      output.value = '错误: ' + e.message;
    }
  }

  debounceConvert() {
    clearTimeout(this.convertTimeout);
    this.convertTimeout = setTimeout(() => this.convert(), 300);
  }

  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async handleFile(file) {
    if (!file) return;
    
    try {
      const result = await this.fileToBase64(file);
      const output = domHelper.find('#base64-output', this.container);
      output.value = result;
      
      // 显示文件名
      this.updateStats(file.name, result, file.size);
    } catch (e) {
      alert('文件读取失败: ' + e.message);
    }
  }

  copyResult() {
    const output = domHelper.find('#base64-output', this.container);
    if (!output.value) return;
    
    navigator.clipboard.writeText(output.value).then(() => {
      const btn = domHelper.find('#copy-btn', this.container);
      const originalHTML = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-check"></i> 已复制';
      setTimeout(() => {
        btn.innerHTML = originalHTML;
      }, 1500);
    });
  }

  clear() {
    domHelper.find('#text-input', this.container).value = '';
    this.clearOutput();
  }

  clearOutput() {
    domHelper.find('#base64-output', this.container).value = '';
    domHelper.find('#stats', this.container).textContent = '';
  }

  updateStats(input, output, fileSize = null) {
    const stats = domHelper.find('#stats', this.container);
    const inputSize = fileSize || new Blob([input]).size;
    const outputSize = new Blob([output]).size;
    stats.innerHTML = `
      输入: ${this.formatBytes(inputSize)} | 
      输出: ${this.formatBytes(outputSize)} | 
      膨胀率: ${((outputSize / inputSize - 1) * 100).toFixed(1)}%
    `;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  destroy() {
    clearTimeout(this.convertTimeout);
    domHelper.empty(this.container);
  }
}
```

#### Step 2.3: 运行测试（应该通过）
```bash
npm run test:run tools/base64-converter/
# 预期: 所有测试通过
```

---

### Phase 3: 样式完善（20分钟）

```css
/* tools/base64-converter/style.css */
.base64-converter {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.b64-mode-switch {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.b64-mode-btn {
  flex: 1;
  padding: 12px 24px;
  border: 2px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.b64-mode-btn.active {
  border-color: var(--primary-color);
  background: var(--primary-color);
  color: white;
}

.b64-section {
  margin-bottom: 16px;
}

.b64-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.b64-label {
  font-weight: 500;
  color: var(--text-primary);
}

.b64-textarea {
  width: 100%;
  min-height: 120px;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-family: 'Fira Code', monospace;
  font-size: 14px;
  resize: vertical;
}

.b64-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.b64-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.b64-btn.primary {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.b64-btn:hover {
  opacity: 0.9;
}

.b64-options {
  margin-bottom: 16px;
}

.b64-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.b64-stats {
  padding: 12px;
  background: var(--bg-tertiary);
  border-radius: 6px;
  font-size: 13px;
  color: var(--text-secondary);
}

@media (max-width: 600px) {
  .base64-converter {
    padding: 12px;
  }
  
  .b64-actions {
    flex-direction: column;
  }
}
```

---

### Phase 4: 注册工具（10分钟）

```javascript
// main.js - registerTools()
{
  id: 'base64-converter',
  name: 'Base64 编解码',
  icon: 'code',
  category: 'developer-tools',
  module: () => import('./tools/base64-converter/index.js')
}
```

```html
<!-- index.html - 添加导航项 -->
<li class="tool-item" data-tool="base64-converter">
  <i class="fas fa-code"></i>
  <span>Base64 编解码</span>
</li>
```

---

### Phase 5: 验证与提交（20分钟）

```bash
# 1. 运行所有测试
npm run test:run

# 2. 构建验证
npm run build

# 3. 提交代码
git add .
git commit -m "feat(tools): add Base64 converter with full test coverage"
git commit -m "test(base64): add comprehensive unit tests"
git commit -m "style(base64): add responsive styling"

# 4. 推送到功能分支
git push origin feat/base64-converter
```

---

## 测试检查清单

### 功能测试
- [ ] 文本编码正确
- [ ] 文本解码正确
- [ ] 中文编码/解码正确
- [ ] 特殊字符处理正确
- [ ] 无效Base64提示错误
- [ ] URL Safe模式工作正常
- [ ] 文件上传转Base64工作
- [ ] 复制功能正常
- [ ] 统计信息显示正确

### UI测试
- [ ] 模式切换界面更新正确
- [ ] 响应式布局正常
- [ ] 暗色主题正常
- [ ] 按钮反馈正常

---

## 后续工具队列

### 优先级：高
| 工具 | 功能 | TDD时间 |
|------|------|---------|
| 密码生成器 | 生成随机密码，支持强度设置 | 1.5h |
| 文本对比 | 对比两段文本差异 | 2h |

### 优先级：中
| 工具 | 功能 | TDD时间 |
|------|------|---------|
| HTTP请求测试 | 简单的HTTP客户端 | 3h |
| 二维码生成 | 文本/URL转二维码 | 1.5h |
| 单位换算 | 长度、重量、温度等 | 2h |

---

## 更新日志

### V2.0 (2026-02-08)
- 创建 Base64 编解码器的完整 TDD 开发流程
- 定义测试优先的5阶段开发步骤
- 包含完整代码模板和检查清单
- 规划后续工具开发队列
