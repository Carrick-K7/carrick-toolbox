/**
 * 密码生成器工具
 */

import { domHelper } from '../../utils/domHelper.js';
import './style.css';

export default class PasswordGenerator {
  constructor(container) {
    this.container = container;
    this.config = {
      length: 16,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
      excludeSimilar: false,
      excludeAmbiguous: false
    };
    this.passwords = [];
  }

  init() {
    this.render();
    this.bindEvents();
    this.generatePasswords();
  }

  render() {
    this.container.innerHTML = `
      <div class="password-generator">
        <div class="password-config">
          <div class="config-section">
            <div class="config-label">
              <span>密码长度</span>
              <span class="length-value" id="length-value">16</span>
            </div>
            <input type="range" class="length-slider" id="length-slider" 
                   min="4" max="64" value="16">
            <div class="length-hints">
              <span>4</span>
              <span>32</span>
              <span>64</span>
            </div>
          </div>

          <div class="config-section">
            <div class="config-label">字符类型</div>
            <div class="checkbox-group">
              <label class="checkbox-item">
                <input type="checkbox" id="uppercase" checked>
                <span class="checkmark"></span>
                <span class="checkbox-text">大写字母 (A-Z)</span>
              </label>
              <label class="checkbox-item">
                <input type="checkbox" id="lowercase" checked>
                <span class="checkmark"></span>
                <span class="checkbox-text">小写字母 (a-z)</span>
              </label>
              <label class="checkbox-item">
                <input type="checkbox" id="numbers" checked>
                <span class="checkmark"></span>
                <span class="checkbox-text">数字 (0-9)</span>
              </label>
              <label class="checkbox-item">
                <input type="checkbox" id="symbols" checked>
                <span class="checkmark"></span>
                <span class="checkbox-text">特殊符号 (!@#$...)</span>
              </label>
            </div>
          </div>

          <div class="config-section">
            <div class="config-label">高级选项</div>
            <div class="checkbox-group">
              <label class="checkbox-item">
                <input type="checkbox" id="exclude-similar">
                <span class="checkmark"></span>
                <span class="checkbox-text">排除易混淆字符 (0O, 1lI)</span>
              </label>
              <label class="checkbox-item">
                <input type="checkbox" id="exclude-ambiguous">
                <span class="checkmark"></span>
                <span class="checkbox-text">排除特殊符号 ({ } [ ] ( ) / \)</span>
              </label>
            </div>
          </div>

          <div class="config-actions">
            <button class="generate-btn" id="generate-btn">
              <i class="fas fa-sync-alt"></i>
              重新生成
            </button>
            <button class="generate-btn secondary" id="generate-multiple-btn">
              <i class="fas fa-list"></i>
              批量生成 (5个)
            </button>
          </div>
        </div>

        <div class="password-results">
          <div class="result-header">
            <span class="result-title">生成结果</span>
            <span class="strength-indicator" id="strength-indicator">
              <span class="strength-bar"></span>
              <span class="strength-text">强度</span>
            </span>
          </div>
          <div class="password-list" id="password-list">
            <!-- 密码列表将在这里生成 -->
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // 长度滑块
    const lengthSlider = this.container.querySelector('#length-slider');
    const lengthValue = this.container.querySelector('#length-value');
    
    lengthSlider.addEventListener('input', () => {
      this.config.length = parseInt(lengthSlider.value);
      lengthValue.textContent = this.config.length;
      this.generatePasswords();
    });

    // 字符类型复选框
    ['uppercase', 'lowercase', 'numbers', 'symbols', 'exclude-similar', 'exclude-ambiguous'].forEach(id => {
      const checkbox = this.container.querySelector(`#${id}`);
      if (checkbox) {
        checkbox.addEventListener('change', () => {
          const configKey = id.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
          this.config[configKey] = checkbox.checked;
          
          // 确保至少选择一种字符类型
          const hasTypeSelected = this.config.uppercase || this.config.lowercase || 
                                  this.config.numbers || this.config.symbols;
          if (!hasTypeSelected) {
            checkbox.checked = true;
            this.config[configKey] = true;
            this.showNotification('至少需要选择一种字符类型', 'warning');
            return;
          }
          
          this.generatePasswords();
        });
      }
    });

    // 生成按钮
    this.container.querySelector('#generate-btn').addEventListener('click', () => {
      this.generatePasswords();
      this.animateGenerateButton();
    });

    // 批量生成按钮
    this.container.querySelector('#generate-multiple-btn').addEventListener('click', () => {
      this.generateMultiplePasswords(5);
      this.animateGenerateButton();
    });

    // 密码列表点击事件（复制）
    const passwordList = this.container.querySelector('#password-list');
    passwordList.addEventListener('click', (e) => {
      const passwordItem = e.target.closest('.password-item');
      if (passwordItem) {
        const password = passwordItem.dataset.password;
        this.copyPassword(password, passwordItem);
      }
    });
  }

  generatePasswords() {
    const password = this.generateSinglePassword();
    this.passwords = [password];
    this.renderPasswords();
    this.updateStrength(password);
    this.recordUsage();
  }

  generateMultiplePasswords(count) {
    this.passwords = [];
    for (let i = 0; i < count; i++) {
      this.passwords.push(this.generateSinglePassword());
    }
    this.renderPasswords();
    if (this.passwords.length > 0) {
      this.updateStrength(this.passwords[0]);
    }
    this.recordUsage();
  }

  generateSinglePassword() {
    const chars = this.getCharacterSet();
    const length = this.config.length;
    
    let password = '';
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < length; i++) {
      password += chars[array[i] % chars.length];
    }
    
    return password;
  }

  getCharacterSet() {
    let chars = '';
    
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*';
    const ambiguous = '{}[]()/\\';
    const similar = '0O1lI';

    if (this.config.uppercase) {
      let set = uppercase;
      if (this.config.excludeSimilar) {
        set = set.replace(/[O]/g, '');
      }
      chars += set;
    }
    
    if (this.config.lowercase) {
      let set = lowercase;
      if (this.config.excludeSimilar) {
        set = set.replace(/[l]/g, '');
      }
      chars += set;
    }
    
    if (this.config.numbers) {
      let set = numbers;
      if (this.config.excludeSimilar) {
        set = set.replace(/[01]/g, '');
      }
      chars += set;
    }
    
    if (this.config.symbols) {
      let set = symbols;
      if (this.config.excludeAmbiguous) {
        // 已经排除了ambiguous符号
      }
      chars += set;
    }

    // 如果排除了所有字符，使用默认字符集
    if (!chars) {
      chars = lowercase + numbers;
    }

    return chars;
  }

  renderPasswords() {
    const list = this.container.querySelector('#password-list');
    
    if (this.passwords.length === 0) {
      list.innerHTML = '<div class="password-empty">点击生成按钮创建密码</div>';
      return;
    }

    list.innerHTML = this.passwords.map((pwd, index) => `
      <div class="password-item ${index === 0 ? 'primary' : ''}" data-password="${this.escapeHtml(pwd)}">
        <div class="password-text" title="点击复制">${this.escapeHtml(pwd)}</div>
        <div class="password-actions">
          <button class="password-action-btn copy-btn" title="复制">
            <i class="fas fa-copy"></i>
          </button>
          <span class="password-length">${pwd.length}位</span>
        </div>
      </div>
    `).join('');

    // 添加入场动画
    const items = list.querySelectorAll('.password-item');
    items.forEach((item, i) => {
      item.style.animationDelay = `${i * 0.05}s`;
      item.classList.add('fade-in-up');
    });
  }

  updateStrength(password) {
    const indicator = this.container.querySelector('#strength-indicator');
    const bar = indicator.querySelector('.strength-bar');
    const text = indicator.querySelector('.strength-text');
    
    const strength = this.calculateStrength(password);
    let strengthClass = '';
    let strengthText = '';
    
    if (strength.score <= 1) {
      strengthClass = 'weak';
      strengthText = '弱';
    } else if (strength.score <= 3) {
      strengthClass = 'medium';
      strengthText = '中';
    } else {
      strengthClass = 'strong';
      strengthText = '强';
    }

    indicator.className = `strength-indicator ${strengthClass}`;
    text.textContent = `强度: ${strengthText} (${strength.entropy.toFixed(0)} bits)`;
  }

  calculateStrength(password) {
    let poolSize = 0;
    if (/[A-Z]/.test(password)) poolSize += 26;
    if (/[a-z]/.test(password)) poolSize += 26;
    if (/[0-9]/.test(password)) poolSize += 10;
    if (/[^A-Za-z0-9]/.test(password)) poolSize += 32;
    
    const entropy = password.length * Math.log2(poolSize || 1);
    
    let score = 0;
    if (entropy < 30) score = 1;
    else if (entropy < 50) score = 2;
    else if (entropy < 70) score = 3;
    else score = 4;
    
    // 额外加分/减分
    if (password.length < 8) score = Math.min(score, 1);
    if (password.length >= 16) score = Math.min(score + 1, 4);
    
    return { score, entropy };
  }

  async copyPassword(password, element) {
    try {
      await navigator.clipboard.writeText(password);
      
      // 视觉反馈
      element.classList.add('copied');
      
      // 显示提示
      this.showNotification('密码已复制到剪贴板', 'success');
      
      setTimeout(() => {
        element.classList.remove('copied');
      }, 1500);
    } catch (err) {
      this.showNotification('复制失败', 'error');
    }
  }

  showNotification(message, type = 'info') {
    // 移除现有通知
    const existing = this.container.querySelector('.password-notification');
    if (existing) {
      existing.remove();
    }

    const notification = document.createElement('div');
    notification.className = `password-notification ${type}`;
    notification.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
      <span>${message}</span>
    `;
    
    this.container.appendChild(notification);
    
    // 动画进入
    requestAnimationFrame(() => {
      notification.classList.add('show');
    });
    
    setTimeout(() => {
      notification.classList.add('hide');
      setTimeout(() => notification.remove(), 300);
    }, 2500);
  }

  animateGenerateButton() {
    const btn = this.container.querySelector('#generate-btn');
    const icon = btn.querySelector('i');
    icon.style.animation = 'none';
    requestAnimationFrame(() => {
      icon.style.animation = 'spin 0.5s ease';
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  recordUsage() {
    // 记录使用统计
    const usage = JSON.parse(localStorage.getItem('toolbox_usage') || '{}');
    const toolName = 'password-generator';
    usage[toolName] = (usage[toolName] || 0) + 1;
    usage.lastUsed = new Date().toISOString();
    localStorage.setItem('toolbox_usage', JSON.stringify(usage));
  }

  destroy() {}
}
