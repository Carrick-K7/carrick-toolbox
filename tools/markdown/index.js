/**
 * Markdown编辑器工具
 */

import { domHelper } from '../../utils/domHelper.js';

export default class MarkdownEditor {
  constructor(container) {
    this.container = container;
    this.content = '# 欢迎使用 Markdown 编辑器\n\n这是一个简单的 Markdown 编辑器，支持实时预览。\n\n## 功能特点\n\n- **实时预览**：边写边看效果\n- **常用格式**：支持标题、列表、链接等\n- **代码高亮**：支持代码块\n\n## 示例\n\n```javascript\nconsole.log("Hello, World!");\n```\n\n> 这是一段引用文字\n\n[访问 GitHub](https://github.com)';
  }

  async init() {
    await this.loadMarked();
    this.render();
    this.bindEvents();
    this.updatePreview();
  }

  async loadMarked() {
    if (typeof marked === 'undefined') {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
        script.onload = resolve;
        document.head.appendChild(script);
      });
    }
  }

  render() {
    this.container.innerHTML = `
      <div class="markdown-editor">
        <div class="markdown-toolbar">
          <button class="toolbar-btn" data-action="bold" title="粗体"><i class="fas fa-bold"></i></button>
          <button class="toolbar-btn" data-action="italic" title="斜体"><i class="fas fa-italic"></i></button>
          <button class="toolbar-btn" data-action="heading" title="标题"><i class="fas fa-heading"></i></button>
          <button class="toolbar-btn" data-action="link" title="链接"><i class="fas fa-link"></i></button>
          <button class="toolbar-btn" data-action="image" title="图片"><i class="fas fa-image"></i></button>
          <button class="toolbar-btn" data-action="code" title="代码"><i class="fas fa-code"></i></button>
          <button class="toolbar-btn" data-action="quote" title="引用"><i class="fas fa-quote-left"></i></button>
          <button class="toolbar-btn" data-action="list" title="列表"><i class="fas fa-list-ul"></i></button>
          <button class="toolbar-btn" data-action="ordered-list" title="有序列表"><i class="fas fa-list-ol"></i></button>
        </div>
        <div class="markdown-content">
          <div class="markdown-input-section">
            <div class="section-title">编辑</div>
            <textarea class="markdown-input" id="markdown-input" placeholder="在这里输入 Markdown...">${this.content}</textarea>
          </div>
          <div class="markdown-preview-section">
            <div class="section-title">预览</div>
            <div class="markdown-preview" id="markdown-preview"></div>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const input = domHelper.find('#markdown-input');
    if (input) {
      domHelper.on(input, 'input', () => {
        this.content = input.value;
        this.updatePreview();
      });
    }

    domHelper.findAll('.toolbar-btn').forEach(btn => {
      domHelper.on(btn, 'click', () => {
        const action = btn.dataset.action;
        this.handleToolbarAction(action);
      });
    });
  }

  handleToolbarAction(action) {
    const input = domHelper.find('#markdown-input');
    if (!input) return;

    const start = input.selectionStart;
    const end = input.selectionEnd;
    const selectedText = input.value.substring(start, end);
    let insertText = '';
    let cursorOffset = 0;

    switch (action) {
      case 'bold':
        insertText = `**${selectedText || '粗体文字'}**`;
        cursorOffset = selectedText ? 0 : -2;
        break;
      case 'italic':
        insertText = `*${selectedText || '斜体文字'}*`;
        cursorOffset = selectedText ? 0 : -1;
        break;
      case 'heading':
        insertText = `## ${selectedText || '标题'}`;
        break;
      case 'link':
        insertText = `[${selectedText || '链接文字'}](url)`;
        cursorOffset = selectedText ? -1 : -5;
        break;
      case 'image':
        insertText = `![${selectedText || '图片描述'}](url)`;
        cursorOffset = selectedText ? -1 : -5;
        break;
      case 'code':
        if (selectedText.includes('\n')) {
          insertText = `\`\`\`\n${selectedText}\n\`\`\``;
        } else {
          insertText = `\`${selectedText || '代码'}\``;
          cursorOffset = selectedText ? 0 : -1;
        }
        break;
      case 'quote':
        insertText = `> ${selectedText || '引用文字'}`;
        break;
      case 'list':
        insertText = `- ${selectedText || '列表项'}`;
        break;
      case 'ordered-list':
        insertText = `1. ${selectedText || '列表项'}`;
        break;
    }

    input.value = input.value.substring(0, start) + insertText + input.value.substring(end);
    this.content = input.value;
    this.updatePreview();

    const newCursorPos = start + insertText.length + cursorOffset;
    input.focus();
    input.setSelectionRange(newCursorPos, newCursorPos);
  }

  updatePreview() {
    const preview = domHelper.find('#markdown-preview');
    if (preview && typeof marked !== 'undefined') {
      preview.innerHTML = marked.parse(this.content);
    }
  }

  destroy() {}
}
