/**
 * Base64 编解码工具
 */

import { domHelper } from '../../utils/domHelper.js';
import './style.css';

export default class Base64Converter {
  constructor(container) {
    this.container = container;
  }

  init() {
    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="base64-converter" id="base64-converter">
        <div class="base64-toolbar">
          <div class="base64-toolbar-left">
            <button class="base64-btn primary" id="encode-btn">
              <i class="fas fa-arrow-up"></i> 编码
            </button>
            <button class="base64-btn" id="decode-btn">
              <i class="fas fa-arrow-down"></i> 解码
            </button>
          </div>
          <div class="base64-toolbar-right">
            <button class="base64-btn" id="copy-btn" title="复制结果">
              <i class="fas fa-copy"></i>
            </button>
            <button class="base64-btn danger" id="clear-btn" title="清空">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        
        <div class="base64-config-panel">
          <div class="base64-config-item">
            <label class="base64-checkbox-label">
              <input type="checkbox" id="url-safe">
              <span>URL安全模式 (替换 +/ 为 -_)</span>
            </label>
          </div>
          <div class="base64-config-item">
            <label class="base64-checkbox-label">
              <input type="checkbox" id="remove-padding" checked>
              <span>移除填充符 (=)</span>
            </label>
          </div>
        </div>
        
        <div class="base64-editor-container">
          <div class="base64-editor-section">
            <div class="base64-editor-header">
              <span class="base64-editor-title">输入</span>
              <span class="base64-status" id="input-status"></span>
            </div>
            <textarea 
              class="base64-editor" 
              id="base64-input" 
              placeholder="请输入要编码或解码的文本..."
            ></textarea>
          </div>
          
          <div class="base64-editor-divider">
            <i class="fas fa-exchange-alt"></i>
          </div>
          
          <div class="base64-editor-section">
            <div class="base64-editor-header">
              <span class="base64-editor-title">输出</span>
              <span class="base64-status" id="output-status"></span>
            </div>
            <textarea 
              class="base64-editor" 
              id="base64-output" 
              readonly
              placeholder="结果将显示在这里..."
            ></textarea>
          </div>
        </div>
        
        <div class="base64-info-bar">
          <div class="base64-info-item">
            <i class="fas fa-info-circle"></i>
            <span id="base64-stats">等待输入...</span>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const input = this.container.querySelector('#base64-input');
    const output = this.container.querySelector('#base64-output');

    // 编码按钮
    this.container.querySelector('#encode-btn').addEventListener('click', () => {
      this.encodeText();
    });

    // 解码按钮
    this.container.querySelector('#decode-btn').addEventListener('click', () => {
      this.decodeText();
    });

    // 复制按钮
    this.container.querySelector('#copy-btn').addEventListener('click', () => {
      this.copyOutput();
    });

    // 清空按钮
    this.container.querySelector('#clear-btn').addEventListener('click', () => {
      this.clearAll();
    });

    // 实时验证
    input.addEventListener('input', () => {
      this.validateInput();
    });
  }

  encodeText() {
    const input = this.container.querySelector('#base64-input');
    const output = this.container.querySelector('#base64-output');
    const value = input.value;

    if (!value) {
      this.showStatus('请输入要编码的文本', 'error');
      return;
    }

    try {
      const urlSafe = this.container.querySelector('#url-safe').checked;
      const removePadding = this.container.querySelector('#remove-padding').checked;
      
      // UTF-8 编码
      const utf8Bytes = new TextEncoder().encode(value);
      let base64 = btoa(String.fromCharCode(...utf8Bytes));
      
      // URL安全模式
      if (urlSafe) {
        base64 = base64.replace(/\+/g, '-').replace(/\//g, '_');
      }
      
      // 移除填充符
      if (removePadding) {
        base64 = base64.replace(/=+$/, '');
      }
      
      output.value = base64;
      this.showStatus('编码成功', 'success');
      this.updateStats(value.length, base64.length);
    } catch (e) {
      this.showStatus(`编码失败: ${e.message}`, 'error');
      output.value = '';
    }
  }

  decodeText() {
    const input = this.container.querySelector('#base64-input');
    const output = this.container.querySelector('#base64-output');
    let value = input.value.trim();

    if (!value) {
      this.showStatus('请输入要解码的文本', 'error');
      return;
    }

    try {
      // 还原URL安全模式
      value = value.replace(/-/g, '+').replace(/_/g, '/');
      
      // 补齐填充符
      const padding = 4 - (value.length % 4);
      if (padding !== 4) {
        value += '='.repeat(padding);
      }
      
      // 解码
      const binaryString = atob(value);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const decoded = new TextDecoder().decode(bytes);
      output.value = decoded;
      this.showStatus('解码成功', 'success');
      this.updateStats(decoded.length, value.length);
    } catch (e) {
      this.showStatus(`解码失败: 无效的Base64字符串`, 'error');
      output.value = '';
    }
  }

  copyOutput() {
    const output = this.container.querySelector('#base64-output');
    if (output.value) {
      navigator.clipboard.writeText(output.value).then(() => {
        this.showStatus('已复制到剪贴板', 'success');
      });
    }
  }

  clearAll() {
    this.container.querySelector('#base64-input').value = '';
    this.container.querySelector('#base64-output').value = '';
    this.container.querySelector('#input-status').textContent = '';
    this.container.querySelector('#output-status').textContent = '';
    this.updateStats(0, 0);
  }

  validateInput() {
    const input = this.container.querySelector('#base64-input');
    const status = this.container.querySelector('#input-status');
    const value = input.value.trim();

    if (!value) {
      status.textContent = '';
      status.className = 'base64-status';
      return;
    }

    // 检查是否可能是Base64
    const isBase64Like = /^[A-Za-z0-9+/\-_]*={0,2}$/.test(value);
    if (isBase64Like && value.length >= 4) {
      status.textContent = '✓ 可能是Base64';
      status.className = 'base64-status valid';
    } else {
      status.textContent = '文本';
      status.className = 'base64-status';
    }
  }

  showStatus(message, type) {
    const status = this.container.querySelector('#output-status');
    status.textContent = message;
    status.className = `base64-status ${type}`;
    
    setTimeout(() => {
      status.textContent = '';
      status.className = 'base64-status';
    }, 3000);
  }

  updateStats(inputLen, outputLen) {
    const stats = this.container.querySelector('#base64-stats');
    if (inputLen === 0 && outputLen === 0) {
      stats.textContent = '等待输入...';
      return;
    }
    stats.textContent = `输入: ${inputLen} 字符 | 输出: ${outputLen} 字符`;
  }

  destroy() {}
}
