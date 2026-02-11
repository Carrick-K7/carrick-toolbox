/**
 * JSON 格式化工具
 */

import { domHelper } from '../../utils/domHelper.js';
import './style.css';

export default class JsonFormatter {
  constructor(container) {
    this.container = container;
    this.input = '';
    this.output = '';
    this.config = {
      indentSize: 2,
      sortKeys: false,
      escapeUnicode: false
    };
  }

  init() {
    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="json-formatter">
        <div class="json-toolbar">
          <div class="json-toolbar-left">
            <button class="json-btn primary" id="format-btn">
              <i class="fas fa-code"></i> 格式化
            </button>
            <button class="json-btn" id="compress-btn">
              <i class="fas fa-compress"></i> 压缩
            </button>
            <button class="json-btn" id="escape-btn">
              <i class="fas fa-terminal"></i> 转义
            </button>
            <button class="json-btn" id="unescape-btn">
              <i class="fas fa-file-code"></i> 去转义
            </button>
          </div>
          <div class="json-toolbar-right">
            <button class="json-btn" id="copy-btn" title="复制结果">
              <i class="fas fa-copy"></i>
            </button>
            <button class="json-btn danger" id="clear-btn" title="清空">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        
        <div class="json-config-panel">
          <div class="json-config-item">
            <label>缩进空格</label>
            <select id="indent-select" class="json-select">
              <option value="2">2 空格</option>
              <option value="4" selected>4 空格</option>
              <option value="8">8 空格</option>
              <option value="\t">Tab</option>
            </select>
          </div>
          <div class="json-config-item">
            <label class="json-checkbox-label">
              <input type="checkbox" id="sort-keys">
              <span>按键排序</span>
            </label>
          </div>
        </div>
        
        <div class="json-editor-container">
          <div class="json-editor-section">
            <div class="json-editor-header">
              <span class="json-editor-title">输入</span>
              <span class="json-status" id="input-status"></span>
            </div>
            <textarea 
              class="json-editor" 
              id="json-input" 
              placeholder="请输入 JSON 数据...&#10;例如: {"name": "Carrick", "age": 25}"
            ></textarea>
          </div>
          
          <div class="json-editor-divider">
            <i class="fas fa-arrow-right"></i>
          </div>
          
          <div class="json-editor-section">
            <div class="json-editor-header">
              <span class="json-editor-title">输出</span>
              <span class="json-status" id="output-status"></span>
            </div>
            <textarea 
              class="json-editor" 
              id="json-output" 
              readonly
              placeholder="格式化结果将显示在这里..."
            ></textarea>
          </div>
        </div>
        
        <div class="json-info-bar">
          <div class="json-info-item">
            <i class="fas fa-info-circle"></i>
            <span id="json-stats">等待输入...</span>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const input = this.container.querySelector('#json-input');
    const output = this.container.querySelector('#json-output');
    const indentSelect = this.container.querySelector('#indent-select');
    const sortKeys = this.container.querySelector('#sort-keys');

    // 格式化按钮
    this.container.querySelector('#format-btn').addEventListener('click', () => {
      this.formatJson();
    });

    // 压缩按钮
    this.container.querySelector('#compress-btn').addEventListener('click', () => {
      this.compressJson();
    });

    // 转义按钮
    this.container.querySelector('#escape-btn').addEventListener('click', () => {
      this.escapeJson();
    });

    // 去转义按钮
    this.container.querySelector('#unescape-btn').addEventListener('click', () => {
      this.unescapeJson();
    });

    // 复制按钮
    this.container.querySelector('#copy-btn').addEventListener('click', () => {
      this.copyOutput();
    });

    // 清空按钮
    this.container.querySelector('#clear-btn').addEventListener('click', () => {
      this.clearAll();
    });

    // 配置变化
    indentSelect.addEventListener('change', () => {
      this.config.indentSize = indentSelect.value;
    });

    sortKeys.addEventListener('change', () => {
      this.config.sortKeys = sortKeys.checked;
    });

    // 实时验证
    input.addEventListener('input', () => {
      this.validateInput();
    });
  }

  formatJson() {
    const input = this.container.querySelector('#json-input');
    const output = this.container.querySelector('#json-output');
    const value = input.value.trim();

    if (!value) {
      this.showStatus('请输入 JSON 数据', 'error');
      return;
    }

    try {
      let parsed = JSON.parse(value);
      
      // 按键排序
      if (this.config.sortKeys && typeof parsed === 'object' && parsed !== null) {
        parsed = this.sortObjectKeys(parsed);
      }
      
      const indent = this.config.indentSize === '\\t' ? '\\t' : parseInt(this.config.indentSize);
      output.value = JSON.stringify(parsed, null, indent);
      this.showStatus('格式化成功', 'success');
      this.updateStats(parsed);
    } catch (e) {
      this.showStatus(`格式错误: ${e.message}`, 'error');
      output.value = '';
    }
  }

  compressJson() {
    const input = this.container.querySelector('#json-input');
    const output = this.container.querySelector('#json-output');
    const value = input.value.trim();

    if (!value) {
      this.showStatus('请输入 JSON 数据', 'error');
      return;
    }

    try {
      const parsed = JSON.parse(value);
      output.value = JSON.stringify(parsed);
      this.showStatus('压缩成功', 'success');
      this.updateStats(parsed);
    } catch (e) {
      this.showStatus(`格式错误: ${e.message}`, 'error');
      output.value = '';
    }
  }

  escapeJson() {
    const input = this.container.querySelector('#json-input');
    const output = this.container.querySelector('#json-output');
    const value = input.value.trim();

    if (!value) {
      this.showStatus('请输入 JSON 数据', 'error');
      return;
    }

    try {
      const escaped = JSON.stringify(value);
      output.value = escaped;
      this.showStatus('转义成功', 'success');
    } catch (e) {
      this.showStatus(`转义失败: ${e.message}`, 'error');
    }
  }

  unescapeJson() {
    const input = this.container.querySelector('#json-input');
    const output = this.container.querySelector('#json-output');
    const value = input.value.trim();

    if (!value) {
      this.showStatus('请输入 JSON 数据', 'error');
      return;
    }

    try {
      // 去掉首尾的引号
      let str = value;
      if ((str.startsWith('"') && str.endsWith('"')) || 
          (str.startsWith("'") && str.endsWith("'"))) {
        str = str.slice(1, -1);
      }
      const unescaped = JSON.parse(`"${str.replace(/"/g, '\\"')}"`);
      output.value = unescaped;
      this.showStatus('去转义成功', 'success');
    } catch (e) {
      this.showStatus(`去转义失败: ${e.message}`, 'error');
    }
  }

  sortObjectKeys(obj) {
    if (Array.isArray(obj)) {
      return obj.map(item => this.sortObjectKeys(item));
    } else if (typeof obj === 'object' && obj !== null) {
      return Object.keys(obj).sort().reduce((sorted, key) => {
        sorted[key] = this.sortObjectKeys(obj[key]);
        return sorted;
      }, {});
    }
    return obj;
  }

  copyOutput() {
    const output = this.container.querySelector('#json-output');
    if (output.value) {
      navigator.clipboard.writeText(output.value).then(() => {
        this.showStatus('已复制到剪贴板', 'success');
      });
    }
  }

  clearAll() {
    this.container.querySelector('#json-input').value = '';
    this.container.querySelector('#json-output').value = '';
    this.container.querySelector('#input-status').textContent = '';
    this.container.querySelector('#output-status').textContent = '';
    this.updateStats(null);
  }

  validateInput() {
    const input = this.container.querySelector('#json-input');
    const status = this.container.querySelector('#input-status');
    const value = input.value.trim();

    if (!value) {
      status.textContent = '';
      status.className = 'json-status';
      return;
    }

    try {
      JSON.parse(value);
      status.textContent = '✓ 有效 JSON';
      status.className = 'json-status valid';
    } catch (e) {
      status.textContent = '✗ 格式错误';
      status.className = 'json-status invalid';
    }
  }

  showStatus(message, type) {
    const status = this.container.querySelector('#output-status');
    status.textContent = message;
    status.className = `json-status ${type}`;
    
    setTimeout(() => {
      status.textContent = '';
      status.className = 'json-status';
    }, 3000);
  }

  updateStats(data) {
    const stats = this.container.querySelector('#json-stats');
    if (!data) {
      stats.textContent = '等待输入...';
      return;
    }

    const size = JSON.stringify(data).length;
    const keys = this.countKeys(data);
    stats.textContent = `共 ${keys} 个键 | 约 ${size} 字节`;
  }

  countKeys(obj) {
    if (typeof obj !== 'object' || obj === null) return 0;
    if (Array.isArray(obj)) {
      return obj.reduce((sum, item) => sum + this.countKeys(item), 0);
    }
    let count = Object.keys(obj).length;
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        count += this.countKeys(obj[key]);
      }
    }
    return count;
  }
}
