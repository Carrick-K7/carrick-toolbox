/**
 * 颜色转换器工具
 */

import { domHelper } from '../../utils/domHelper.js';
import { chineseColors } from '../../utils/chineseColors.js';
import './style.css';

export default class ColorConverter {
  constructor(container) {
    this.container = container;
    this.currentColor = { r: 57, g: 197, b: 187 };
  }

  init() {
    this.render();
    this.bindEvents();
    this.updateAllFormats();
  }

  render() {
    const hsv = this.rgbToHsv(this.currentColor.r, this.currentColor.g, this.currentColor.b);
    const cmyk = this.rgbToCmyk(this.currentColor.r, this.currentColor.g, this.currentColor.b);
    const eyeDropperSupported = 'EyeDropper' in window;

    this.container.innerHTML = `
      <div class="color-converter">
        <div class="color-preview-section">
          <div class="color-preview" id="color-preview" style="background: rgb(${this.currentColor.r}, ${this.currentColor.g}, ${this.currentColor.b})">
            <input type="color" class="color-picker-input" id="color-picker" value="${this.rgbToHex(this.currentColor.r, this.currentColor.g, this.currentColor.b)}">
          </div>
          <div class="color-info">
            <div class="color-name" id="color-name">加载中...</div>
            <div class="color-actions">
              ${eyeDropperSupported ? `<button class="action-btn" id="eyedropper-btn" title="屏幕取色"><i class="fas fa-eye-dropper"></i></button>` : ''}
              <button class="action-btn" id="random-btn" title="随机颜色"><i class="fas fa-random"></i></button>
            </div>
          </div>
        </div>
        <div class="color-formats-grid">
          <div class="color-format-card">
            <div class="color-format-title">HEX</div>
            <div class="color-input-row">
              <input type="text" class="color-input" id="hex-input" value="${this.rgbToHex(this.currentColor.r, this.currentColor.g, this.currentColor.b)}">
              <button class="color-copy-btn" data-target="hex-input"><i class="fas fa-copy"></i></button>
            </div>
          </div>
          <div class="color-format-card">
            <div class="color-format-title">RGB</div>
            <div class="color-input-row">
              <input type="text" class="color-input" id="rgb-input" value="rgb(${this.currentColor.r}, ${this.currentColor.g}, ${this.currentColor.b})">
              <button class="color-copy-btn" data-target="rgb-input"><i class="fas fa-copy"></i></button>
            </div>
          </div>
          <div class="color-format-card">
            <div class="color-format-title">HSL</div>
            <div class="color-input-row">
              <input type="text" class="color-input" id="hsl-input" value="${this.rgbToHslString(this.currentColor.r, this.currentColor.g, this.currentColor.b)}">
              <button class="color-copy-btn" data-target="hsl-input"><i class="fas fa-copy"></i></button>
            </div>
          </div>
          <div class="color-format-card">
            <div class="color-format-title">HSV/HSB</div>
            <div class="color-input-row">
              <input type="text" class="color-input" id="hsv-input" value="hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)">
              <button class="color-copy-btn" data-target="hsv-input"><i class="fas fa-copy"></i></button>
            </div>
          </div>
          <div class="color-format-card">
            <div class="color-format-title">CMYK</div>
            <div class="color-input-row">
              <input type="text" class="color-input" id="cmyk-input" value="cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)">
              <button class="color-copy-btn" data-target="cmyk-input"><i class="fas fa-copy"></i></button>
            </div>
          </div>
          <div class="color-format-card">
            <div class="color-format-title">RGB 数值</div>
            <div class="color-input-row">
              <input type="text" class="color-input" id="rgb-values-input" value="${this.currentColor.r}, ${this.currentColor.g}, ${this.currentColor.b}">
              <button class="color-copy-btn" data-target="rgb-values-input"><i class="fas fa-copy"></i></button>
            </div>
          </div>
        </div>
        <div class="color-sliders">
          <div class="color-slider-row">
            <span class="color-slider-label">R</span>
            <input type="range" class="color-slider" id="r-slider" min="0" max="255" value="${this.currentColor.r}">
            <span class="color-slider-value" id="r-value">${this.currentColor.r}</span>
          </div>
          <div class="color-slider-row">
            <span class="color-slider-label">G</span>
            <input type="range" class="color-slider" id="g-slider" min="0" max="255" value="${this.currentColor.g}">
            <span class="color-slider-value" id="g-value">${this.currentColor.g}</span>
          </div>
          <div class="color-slider-row">
            <span class="color-slider-label">B</span>
            <input type="range" class="color-slider" id="b-slider" min="0" max="255" value="${this.currentColor.b}">
            <span class="color-slider-value" id="b-value">${this.currentColor.b}</span>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const colorPicker = domHelper.find('#color-picker');
    if (colorPicker) {
      domHelper.on(colorPicker, 'change', (e) => this.handleColorPicker(e.target.value));
    }

    const randomBtn = domHelper.find('#random-btn');
    if (randomBtn) {
      domHelper.on(randomBtn, 'click', () => this.randomColor());
    }

    const eyedropperBtn = domHelper.find('#eyedropper-btn');
    if (eyedropperBtn) {
      domHelper.on(eyedropperBtn, 'click', () => this.pickColorFromScreen());
    }

    const hexInput = domHelper.find('#hex-input');
    if (hexInput) {
      domHelper.on(hexInput, 'change', (e) => this.handleHexInput(e.target.value));
    }

    const rgbInput = domHelper.find('#rgb-input');
    if (rgbInput) {
      domHelper.on(rgbInput, 'change', (e) => this.handleRgbInput(e.target.value));
    }

    ['r-slider', 'g-slider', 'b-slider'].forEach(id => {
      const slider = domHelper.find('#' + id);
      if (slider) {
        domHelper.on(slider, 'input', () => this.handleRgbSlider());
      }
    });

    domHelper.findAll('.color-copy-btn').forEach(btn => {
      domHelper.on(btn, 'click', () => {
        const targetId = btn.dataset.target;
        this.copyValue(targetId);
      });
    });
  }

  handleColorPicker(hex) {
    const rgb = this.hexToRgb(hex);
    if (rgb) {
      this.currentColor = rgb;
      this.updateAllFormats();
    }
  }

  handleHexInput(hex) {
    const rgb = this.hexToRgb(hex);
    if (rgb) {
      this.currentColor = rgb;
      this.updateAllFormats();
    }
  }

  handleRgbInput(value) {
    const match = value.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
    if (match) {
      this.currentColor = {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3])
      };
      this.updateAllFormats();
    }
  }

  handleRgbSlider() {
    this.currentColor = {
      r: parseInt(domHelper.find('#r-slider').value),
      g: parseInt(domHelper.find('#g-slider').value),
      b: parseInt(domHelper.find('#b-slider').value)
    };
    this.updateAllFormats();
  }

  randomColor() {
    this.currentColor = {
      r: Math.floor(Math.random() * 256),
      g: Math.floor(Math.random() * 256),
      b: Math.floor(Math.random() * 256)
    };
    this.updateAllFormats();
  }

  async pickColorFromScreen() {
    if ('EyeDropper' in window) {
      try {
        const eyeDropper = new EyeDropper();
        const result = await eyeDropper.open();
        const rgb = this.hexToRgb(result.sRGBHex);
        if (rgb) {
          this.currentColor = rgb;
          this.updateAllFormats();
        }
      } catch (e) {}
    }
  }

  getColorNameSync(hex) {
    // 使用color-name-list进行精确匹配
    const name = getColorName(hex);
    return name || ''; // 只在精确匹配时返回颜色名称，否则留空
  }

  updateAllFormats() {
    const { r, g, b } = this.currentColor;
    const hsv = this.rgbToHsv(r, g, b);
    const hsl = this.rgbToHsl(r, g, b);
    const cmyk = this.rgbToCmyk(r, g, b);
    const hex = this.rgbToHex(r, g, b);

    const preview = domHelper.find('#color-preview');
    if (preview) preview.style.background = `rgb(${r}, ${g}, ${b})`;

    const picker = domHelper.find('#color-picker');
    if (picker) picker.value = hex;

    const hexInput = domHelper.find('#hex-input');
    if (hexInput) hexInput.value = hex;

    const rgbInput = domHelper.find('#rgb-input');
    if (rgbInput) rgbInput.value = `rgb(${r}, ${g}, ${b})`;

    const hslInput = domHelper.find('#hsl-input');
    if (hslInput) hslInput.value = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

    const hsvInput = domHelper.find('#hsv-input');
    if (hsvInput) hsvInput.value = `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`;

    const cmykInput = domHelper.find('#cmyk-input');
    if (cmykInput) cmykInput.value = `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;

    const rgbValuesInput = domHelper.find('#rgb-values-input');
    if (rgbValuesInput) rgbValuesInput.value = `${r}, ${g}, ${b}`;

    const rSlider = domHelper.find('#r-slider');
    const gSlider = domHelper.find('#g-slider');
    const bSlider = domHelper.find('#b-slider');
    if (rSlider) {
      rSlider.value = r;
      rSlider.style.background = `linear-gradient(to right, rgb(0,${g},${b}), rgb(255,${g},${b}))`;
    }
    if (gSlider) {
      gSlider.value = g;
      gSlider.style.background = `linear-gradient(to right, rgb(${r},0,${b}), rgb(${r},255,${b}))`;
    }
    if (bSlider) {
      bSlider.value = b;
      bSlider.style.background = `linear-gradient(to right, rgb(${r},${g},0), rgb(${r},${g},255))`;
    }

    // 使用color-name-list进行精确匹配
    const colorName = domHelper.find('#color-name');
    if (colorName) {
      const name = this.getColorNameSync(hex);
      colorName.textContent = name || hex; // 如果没有精确匹配，显示HEX值
    }

    const rValue = domHelper.find('#r-value');
    const gValue = domHelper.find('#g-value');
    const bValue = domHelper.find('#b-value');
    if (rValue) rValue.textContent = r;
    if (gValue) gValue.textContent = g;
    if (bValue) bValue.textContent = b;
  }

  copyValue(inputId) {
    const input = domHelper.find('#' + inputId);
    if (!input) return;
    navigator.clipboard.writeText(input.value).then(() => {
      const row = input.closest('.color-input-row');
      const btn = row.querySelector('.color-copy-btn i');
      if (btn) {
        btn.className = 'fas fa-check';
        setTimeout(() => { btn.className = 'fas fa-copy'; }, 1500);
      }
    });
  }

  rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  }

  rgbToHslString(r, g, b) {
    const { h, s, l } = this.rgbToHsl(r, g, b);
    return `hsl(${h}, ${s}%, ${l}%)`;
  }

  rgbToHsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const d = max - min;
    let h, s, v = max;
    s = max === 0 ? 0 : d / max;
    if (max === min) {
      h = 0;
    } else {
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) };
  }

  rgbToCmyk(r, g, b) {
    if (r === 0 && g === 0 && b === 0) {
      return { c: 0, m: 0, y: 0, k: 100 };
    }
    const c = 1 - r / 255;
    const m = 1 - g / 255;
    const y = 1 - b / 255;
    const k = Math.min(c, m, y);
    return {
      c: Math.round((c - k) / (1 - k) * 100),
      m: Math.round((m - k) / (1 - k) * 100),
      y: Math.round((y - k) / (1 - k) * 100),
      k: Math.round(k * 100)
    };
  }

  destroy() {}
}
