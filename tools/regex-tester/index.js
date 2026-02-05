/**
 * 正则表达式测试工具
 */

import { domHelper } from '../../utils/domHelper.js';
import './style.css';

export default class RegexTester {
  constructor(container) {
    this.container = container;
    this.pattern = '';
    this.flags = 'g';
    this.testText = '';
    this.replaceText = '';
    this.matches = [];
  }

  init() {
    this.render();
    this.bindEvents();
    this.loadPresets();
  }

  render() {
    this.container.innerHTML = `
      <div class="regex-tester">
        <div class="regex-section">
          <div class="regex-section-header">
            <span class="regex-section-title">正则表达式</span>
            <div class="regex-flags">
              <label class="regex-flag-label" title="全局匹配">
                <input type="checkbox" id="flag-g" checked> g
              </label>
              <label class="regex-flag-label" title="忽略大小写">
                <input type="checkbox" id="flag-i"> i
              </label>
              <label class="regex-flag-label" title="多行模式">
                <input type="checkbox" id="flag-m"> m
              </label>
              <label class="regex-flag-label" title="点号匹配换行">
                <input type="checkbox" id="flag-s"> s
              </label>
            </div>
          </div>
          <div class="regex-input-row">
            <input 
              type="text" 
              class="regex-pattern-input" 
              id="regex-pattern"
              placeholder="输入正则表达式，例如: \\d+"
            >
            <button class="regex-btn" id="test-btn" title="测试匹配">
              <i class="fas fa-play"></i>
            </button>
          </div>
          <div class="regex-status" id="regex-status"></div>
        </div>
        
        <div class="regex-section">
          <div class="regex-section-header">
            <span class="regex-section-title">常用预设</span>
          </div>
          <div class="regex-presets" id="regex-presets">
            <!-- 动态加载预设 -->
          </div>
        </div>
        
        <div class="regex-split-layout">
          <div class="regex-panel">
            <div class="regex-section-header">
              <span class="regex-section-title">测试文本</span>
              <button class="regex-btn small" id="clear-text-btn">
                <i class="fas fa-eraser"></i> 清空
              </button>
            </div>
            <textarea 
              class="regex-textarea" 
              id="test-text"
              placeholder="输入要测试的文本...&#10;例如: Hello 123 World 456"
            ></textarea>
          </div>
          
          <div class="regex-panel">
            <div class="regex-section-header">
              <span class="regex-section-title">匹配结果</span>
              <span class="regex-match-count" id="match-count">0 个匹配</span>
            </div>
            <div class="regex-result" id="regex-result">
              <div class="regex-result-placeholder">输入正则和测试文本后查看结果</div>
            </div>
          </div>
        </div>
        
        <div class="regex-section">
          <div class="regex-section-header">
            <span class="regex-section-title">替换测试</span>
          </div>
          <div class="regex-replace-row">
            <input 
              type="text" 
              class="regex-replace-input" 
              id="replace-text"
              placeholder="替换为... (支持 $1, $2 等捕获组)"
            >
            <button class="regex-btn" id="replace-btn">
              <i class="fas fa-exchange-alt"></i> 替换
            </button>
          </div>
          <div class="regex-replace-result" id="replace-result"></div>
        </div>
        
        <div class="regex-quick-ref">
          <div class="regex-section-header">
            <span class="regex-section-title"><i class="fas fa-book"></i> 快速参考</span>
          </div>
          <div class="regex-ref-grid">
            <div class="regex-ref-item"><code>.</code> 任意字符</div>
            <div class="regex-ref-item"><code>\\d</code> 数字</div>
            <div class="regex-ref-item"><code>\\w</code> 单词字符</div>
            <div class="regex-ref-item"><code>\\s</code> 空白</div>
            <div class="regex-ref-item"><code>^</code> 开头</div>
            <div class="regex-ref-item"><code>$</code> 结尾</div>
            <div class="regex-ref-item"><code>*</code> 0次或多次</div>
            <div class="regex-ref-item"><code>+</code> 1次或多次</div>
            <div class="regex-ref-item"><code>?</code> 0次或1次</div>
            <div class="regex-ref-item"><code>{}</code> 指定次数</div>
            <div class="regex-ref-item"><code>[]</code> 字符集</div>
            <div class="regex-ref-item"><code>()</code> 捕获组</div>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const patternInput = this.container.querySelector('#regex-pattern');
    const testText = this.container.querySelector('#test-text');
    const testBtn = this.container.querySelector('#test-btn');
    const replaceBtn = this.container.querySelector('#replace-btn');
    const clearBtn = this.container.querySelector('#clear-text-btn');

    // 测试按钮
    testBtn.addEventListener('click', () => {
      this.testRegex();
    });

    // 替换按钮
    replaceBtn.addEventListener('click', () => {
      this.testReplace();
    });

    // 清空按钮
    clearBtn.addEventListener('click', () => {
      this.container.querySelector('#test-text').value = '';
      this.clearResult();
    });

    // 实时测试
    patternInput.addEventListener('input', () => {
      this.debounceTest();
    });

    testText.addEventListener('input', () => {
      this.debounceTest();
    });

    // Flag 变化
    ['g', 'i', 'm', 's'].forEach(flag => {
      const checkbox = this.container.querySelector(`#flag-${flag}`);
      checkbox.addEventListener('change', () => {
        this.updateFlags();
        this.testRegex();
      });
    });
  }

  loadPresets() {
    const presets = [
      { name: '邮箱', pattern: '[\\w.-]+@[\\w.-]+\\.\\w+' },
      { name: '手机号', pattern: '1[3-9]\\d{9}' },
      { name: 'IP地址', pattern: '\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}' },
      { name: 'URL', pattern: 'https?://[^\\s]+' },
      { name: '日期', pattern: '\\d{4}[-/]\\d{1,2}[-/]\\d{1,2}' },
      { name: '数字', pattern: '\\d+' },
      { name: '中文', pattern: '[\\u4e00-\\u9fa5]+' },
      { name: '身份证号', pattern: '\\d{17}[\\dXx]' }
    ];

    const container = this.container.querySelector('#regex-presets');
    container.innerHTML = presets.map(p => `
      <button class="regex-preset-btn" data-pattern="${p.pattern}" title="${p.pattern}">
        ${p.name}
      </button>
    `).join('');

    container.querySelectorAll('.regex-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.container.querySelector('#regex-pattern').value = btn.dataset.pattern;
        this.testRegex();
      });
    });
  }

  updateFlags() {
    this.flags = ['g', 'i', 'm', 's']
      .filter(f => this.container.querySelector(`#flag-${f}`).checked)
      .join('');
    if (!this.flags) this.flags = 'g';
  }

  debounceTest() {
    clearTimeout(this.testTimeout);
    this.testTimeout = setTimeout(() => this.testRegex(), 300);
  }

  testRegex() {
    const pattern = this.container.querySelector('#regex-pattern').value;
    const text = this.container.querySelector('#test-text').value;
    const status = this.container.querySelector('#regex-status');
    const result = this.container.querySelector('#regex-result');

    if (!pattern || !text) {
      this.clearResult();
      return;
    }

    try {
      const regex = new RegExp(pattern, this.flags);
      const matches = [];
      let match;

      // 收集所有匹配
      if (this.flags.includes('g')) {
        while ((match = regex.exec(text)) !== null) {
          matches.push({
            text: match[0],
            index: match.index,
            groups: match.slice(1)
          });
          if (match.index === regex.lastIndex) regex.lastIndex++;
        }
      } else {
        match = regex.exec(text);
        if (match) {
          matches.push({
            text: match[0],
            index: match.index,
            groups: match.slice(1)
          });
        }
      }

      this.matches = matches;
      this.renderResult(text, matches);
      this.updateMatchCount(matches.length);
      status.textContent = '✓ 有效正则';
      status.className = 'regex-status valid';
    } catch (e) {
      status.textContent = `✗ ${e.message}`;
      status.className = 'regex-status invalid';
      result.innerHTML = `<div class="regex-result-error">正则表达式语法错误</div>`;
    }
  }

  renderResult(text, matches) {
    const result = this.container.querySelector('#regex-result');
    
    if (matches.length === 0) {
      result.innerHTML = `<div class="regex-result-empty">无匹配</div>`;
      return;
    }

    // 高亮显示匹配
    let html = '';
    let lastIndex = 0;
    
    matches.forEach((match, i) => {
      // 匹配前的文本
      html += this.escapeHtml(text.slice(lastIndex, match.index));
      // 匹配的文本
      html += `<mark class="regex-match" title="匹配 ${i + 1}: ${this.escapeHtml(match.text)}">${this.escapeHtml(match.text)}</mark>`;
      lastIndex = match.index + match.text.length;
    });
    
    // 剩余文本
    html += this.escapeHtml(text.slice(lastIndex));

    // 匹配列表
    const listHtml = matches.map((m, i) => `
      <div class="regex-match-item">
        <span class="regex-match-number">#${i + 1}</span>
        <span class="regex-match-text">"${this.escapeHtml(m.text)}"</span>
        <span class="regex-match-pos">位置: ${m.index}</span>
        ${m.groups.length > 0 ? `<span class="regex-match-groups">组: ${m.groups.map(g => `"${this.escapeHtml(g)}"`).join(', ')}</span>` : ''}
      </div>
    `).join('');

    result.innerHTML = `
      <div class="regex-highlighted-text">${html}</div>
      <div class="regex-match-list">${listHtml}</div>
    `;
  }

  testReplace() {
    const pattern = this.container.querySelector('#regex-pattern').value;
    const text = this.container.querySelector('#test-text').value;
    const replaceText = this.container.querySelector('#replace-text').value;
    const result = this.container.querySelector('#replace-result');

    if (!pattern || !text) {
      result.innerHTML = '<span class="regex-replace-placeholder">请先输入正则和测试文本</span>';
      return;
    }

    try {
      const regex = new RegExp(pattern, this.flags);
      const replaced = text.replace(regex, replaceText);
      result.innerHTML = `
        <div class="regex-replace-label">替换结果：</div>
        <pre class="regex-replace-output">${this.escapeHtml(replaced)}</pre>
      `;
    } catch (e) {
      result.innerHTML = `<span class="regex-replace-error">替换失败: ${e.message}</span>`;
    }
  }

  updateMatchCount(count) {
    this.container.querySelector('#match-count').textContent = `${count} 个匹配`;
  }

  clearResult() {
    this.container.querySelector('#regex-result').innerHTML = '<div class="regex-result-placeholder">输入正则和测试文本后查看结果</div>';
    this.container.querySelector('#match-count').textContent = '0 个匹配';
    this.matches = [];
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
