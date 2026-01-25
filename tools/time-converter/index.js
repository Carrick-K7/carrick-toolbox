/**
 * 时间转换器工具
 */

import { domHelper } from '../../utils/domHelper.js';
import './style.css';

export default class TimeConverter {
  constructor(container) {
    this.container = container;
  }

  async init() {
    this.render();
    this.bindEvents();
    this.convertFromTimestamp();
  }

  render() {
    const now = new Date();
    const timestamp = Math.floor(now.getTime() / 1000);

    this.container.innerHTML = `
      <div class="time-converter" id="time-converter">
        <div class="time-format-section">
          <div class="time-format-title">日期时间选择</div>
          <div class="time-input-row">
            <input type="datetime-local" class="time-input" id="datetime-input">
            <button class="time-now-btn" id="now-btn"><i class="fas fa-clock"></i> 现在</button>
          </div>
        </div>

        <div class="time-format-section">
          <div class="time-format-title">中文日期格式</div>
          <div class="time-input-row">
            <input type="text" class="time-input" id="chinese-input" readonly>
            <button class="time-copy-btn" data-target="chinese-input"><i class="fas fa-copy"></i></button>
          </div>
        </div>

        <div class="time-format-section">
          <div class="time-format-title">Unix 时间戳</div>
          <div class="time-input-row">
            <input type="number" class="time-input" id="timestamp-input" value="${timestamp}">
            <button class="time-copy-btn" data-target="timestamp-input"><i class="fas fa-copy"></i></button>
          </div>
          <div class="time-hint">秒级时间戳（10位）</div>
        </div>

        <div class="time-format-section">
          <div class="time-format-title">毫秒时间戳</div>
          <div class="time-input-row">
            <input type="number" class="time-input" id="timestamp-ms-input" value="${now.getTime()}">
            <button class="time-copy-btn" data-target="timestamp-ms-input"><i class="fas fa-copy"></i></button>
          </div>
          <div class="time-hint">毫秒级时间戳（13位）</div>
        </div>

        <div class="time-format-section">
          <div class="time-format-title">ISO 8601 格式</div>
          <div class="time-input-row">
            <input type="text" class="time-input" id="iso-input">
            <button class="time-copy-btn" data-target="iso-input"><i class="fas fa-copy"></i></button>
          </div>
          <div class="time-hint">例如: 2025-01-17T12:00:00.000Z</div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const nowBtn = domHelper.find('#now-btn');
    if (nowBtn) {
      domHelper.on(nowBtn, 'click', () => this.setCurrentTimestamp());
    }

    const timestampInput = domHelper.find('#timestamp-input');
    if (timestampInput) {
      domHelper.on(timestampInput, 'input', () => this.convertFromTimestamp());
    }

    const timestampMsInput = domHelper.find('#timestamp-ms-input');
    if (timestampMsInput) {
      domHelper.on(timestampMsInput, 'input', () => this.convertFromTimestampMs());
    }

    const datetimeInput = domHelper.find('#datetime-input');
    if (datetimeInput) {
      domHelper.on(datetimeInput, 'change', () => this.convertFromDatetime());
    }

    const isoInput = domHelper.find('#iso-input');
    if (isoInput) {
      domHelper.on(isoInput, 'input', () => this.convertFromISO());
    }

    domHelper.findAll('.time-copy-btn').forEach(btn => {
      domHelper.on(btn, 'click', () => {
        const targetId = btn.dataset.target;
        this.copyValue(targetId);
      });
    });
  }

  setCurrentTimestamp() {
    const now = new Date();
    domHelper.find('#timestamp-input').value = Math.floor(now.getTime() / 1000);
    this.convertFromTimestamp();
  }

  convertFromTimestamp() {
    const timestamp = parseInt(domHelper.find('#timestamp-input').value) || 0;
    const date = new Date(timestamp * 1000);
    this.updateAllFormats(date);
  }

  convertFromTimestampMs() {
    const timestampMs = parseInt(domHelper.find('#timestamp-ms-input').value) || 0;
    const date = new Date(timestampMs);
    domHelper.find('#timestamp-input').value = Math.floor(timestampMs / 1000);
    this.updateAllFormats(date);
  }

  convertFromDatetime() {
    const datetimeStr = domHelper.find('#datetime-input').value;
    if (!datetimeStr) return;
    const date = new Date(datetimeStr);
    if (!isNaN(date.getTime())) {
      domHelper.find('#timestamp-input').value = Math.floor(date.getTime() / 1000);
      domHelper.find('#timestamp-ms-input').value = date.getTime();
      this.updateAllFormats(date);
    }
  }

  convertFromISO() {
    const isoStr = domHelper.find('#iso-input').value;
    if (!isoStr) return;
    const date = new Date(isoStr);
    if (!isNaN(date.getTime())) {
      domHelper.find('#timestamp-input').value = Math.floor(date.getTime() / 1000);
      domHelper.find('#timestamp-ms-input').value = date.getTime();
      this.updateAllFormats(date, true);
    }
  }

  updateAllFormats(date, skipISO = false) {
    const chineseInput = domHelper.find('#chinese-input');
    const isoInput = domHelper.find('#iso-input');
    const datetimeInput = domHelper.find('#datetime-input');
    const timestampMsInput = domHelper.find('#timestamp-ms-input');

    if (isNaN(date.getTime())) {
      if (chineseInput) chineseInput.value = '无效日期';
      if (isoInput) isoInput.value = '无效日期';
      return;
    }

    if (timestampMsInput) timestampMsInput.value = date.getTime();

    if (datetimeInput) {
      const localDatetime = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString().slice(0, 16);
      datetimeInput.value = localDatetime;
    }

    if (!skipISO && isoInput) {
      isoInput.value = date.toISOString();
    }

    if (chineseInput) {
      const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
      const weekday = weekdays[date.getDay()];
      chineseInput.value = `${year}年${month}月${day}日 ${weekday} ${hours}:${minutes}:${seconds}`;
    }
  }

  copyValue(inputId) {
    const input = domHelper.find('#' + inputId);
    if (!input) return;
    const value = input.value;
    navigator.clipboard.writeText(value).then(() => {
      const row = input.closest('.time-input-row');
      const btn = row.querySelector('.time-copy-btn i');
      if (btn) {
        btn.className = 'fas fa-check';
        setTimeout(() => { btn.className = 'fas fa-copy'; }, 1500);
      }
    });
  }

  destroy() {}
}
