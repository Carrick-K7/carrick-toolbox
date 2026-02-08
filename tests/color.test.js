import { describe, it, expect } from 'vitest';

// 从 color-converter 提取颜色转换函数进行测试
// 模拟颜色转换工具的核心函数
const colorUtils = {
  // HEX 转 RGB
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },

  // RGB 转 HEX
  rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
  },

  // RGB 转 HSL
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
  },

  // HSL 转 RGB
  hslToRgb(h, s, l) {
    h /= 360; s /= 100; l /= 100;
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  },

  // RGB 转 HSV
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
  },

  // RGB 转 CMYK
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
  },

  // 颜色验证
  isValidHex(hex) {
    return /^#?([a-f\d]{6}|[a-f\d]{3})$/i.test(hex);
  },

  isValidRgb(r, g, b) {
    return [r, g, b].every(v => Number.isInteger(v) && v >= 0 && v <= 255);
  },

  isValidHsl(h, s, l) {
    return Number.isInteger(h) && h >= 0 && h <= 360 &&
           Number.isInteger(s) && s >= 0 && s <= 100 &&
           Number.isInteger(l) && l >= 0 && l <= 100;
  }
};

describe('颜色工具测试', () => {
  describe('HEX 和 RGB 转换', () => {
    it('应该正确将 HEX 转换为 RGB', () => {
      expect(colorUtils.hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(colorUtils.hexToRgb('#00FF00')).toEqual({ r: 0, g: 255, b: 0 });
      expect(colorUtils.hexToRgb('#0000FF')).toEqual({ r: 0, g: 0, b: 255 });
      expect(colorUtils.hexToRgb('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 });
      expect(colorUtils.hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
    });

    it('应该正确处理不带 # 的 HEX', () => {
      expect(colorUtils.hexToRgb('FF0000')).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('应该正确将 RGB 转换为 HEX', () => {
      expect(colorUtils.rgbToHex(255, 0, 0)).toBe('#FF0000');
      expect(colorUtils.rgbToHex(0, 255, 0)).toBe('#00FF00');
      expect(colorUtils.rgbToHex(0, 0, 255)).toBe('#0000FF');
      expect(colorUtils.rgbToHex(255, 255, 255)).toBe('#FFFFFF');
      expect(colorUtils.rgbToHex(0, 0, 0)).toBe('#000000');
    });

    it('应该正确处理小写 HEX', () => {
      expect(colorUtils.hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('应该正确处理灰色', () => {
      expect(colorUtils.rgbToHex(128, 128, 128)).toBe('#808080');
    });

    it('应该正确处理中间色', () => {
      expect(colorUtils.rgbToHex(128, 64, 32)).toBe('#804020');
    });
  });

  describe('HEX 验证', () => {
    it('应该验证有效的 6 位 HEX', () => {
      expect(colorUtils.isValidHex('#FF0000')).toBe(true);
      expect(colorUtils.isValidHex('#ABC123')).toBe(true);
      expect(colorUtils.isValidHex('#abcdef')).toBe(true);
    });

    it('应该验证有效的 3 位 HEX', () => {
      expect(colorUtils.isValidHex('#F00')).toBe(true);
      expect(colorUtils.isValidHex('#ABC')).toBe(true);
    });

    it('应该验证不带 # 的 HEX', () => {
      expect(colorUtils.isValidHex('FF0000')).toBe(true);
      expect(colorUtils.isValidHex('F00')).toBe(true);
    });

    it('应该拒绝无效的 HEX', () => {
      expect(colorUtils.isValidHex('#GG0000')).toBe(false);
      expect(colorUtils.isValidHex('#FF00')).toBe(false);
      expect(colorUtils.isValidHex('')).toBe(false);
      expect(colorUtils.isValidHex('#FF00000')).toBe(false);
      expect(colorUtils.isValidHex('red')).toBe(false);
    });
  });

  describe('RGB 验证', () => {
    it('应该验证有效的 RGB', () => {
      expect(colorUtils.isValidRgb(255, 0, 0)).toBe(true);
      expect(colorUtils.isValidRgb(0, 0, 0)).toBe(true);
      expect(colorUtils.isValidRgb(255, 255, 255)).toBe(true);
      expect(colorUtils.isValidRgb(128, 64, 32)).toBe(true);
    });

    it('应该拒绝超出范围的 RGB', () => {
      expect(colorUtils.isValidRgb(256, 0, 0)).toBe(false);
      expect(colorUtils.isValidRgb(-1, 0, 0)).toBe(false);
      expect(colorUtils.isValidRgb(255, 255, 300)).toBe(false);
    });

    it('应该拒绝非整数 RGB', () => {
      expect(colorUtils.isValidRgb(128.5, 0, 0)).toBe(false);
      expect(colorUtils.isValidRgb('255', 0, 0)).toBe(false);
    });
  });

  describe('RGB 和 HSL 转换', () => {
    it('应该正确将 RGB 转换为 HSL', () => {
      expect(colorUtils.rgbToHsl(255, 0, 0)).toEqual({ h: 0, s: 100, l: 50 });   // 红色
      expect(colorUtils.rgbToHsl(0, 255, 0)).toEqual({ h: 120, s: 100, l: 50 }); // 绿色
      expect(colorUtils.rgbToHsl(0, 0, 255)).toEqual({ h: 240, s: 100, l: 50 }); // 蓝色
      expect(colorUtils.rgbToHsl(255, 255, 255)).toEqual({ h: 0, s: 0, l: 100 }); // 白色
      expect(colorUtils.rgbToHsl(0, 0, 0)).toEqual({ h: 0, s: 0, l: 0 });        // 黑色
    });

    it('应该正确将 HSL 转换为 RGB', () => {
      expect(colorUtils.hslToRgb(0, 100, 50)).toEqual({ r: 255, g: 0, b: 0 });   // 红色
      expect(colorUtils.hslToRgb(120, 100, 50)).toEqual({ r: 0, g: 255, b: 0 }); // 绿色
      expect(colorUtils.hslToRgb(240, 100, 50)).toEqual({ r: 0, g: 0, b: 255 }); // 蓝色
      expect(colorUtils.hslToRgb(0, 0, 100)).toEqual({ r: 255, g: 255, b: 255 }); // 白色
      expect(colorUtils.hslToRgb(0, 0, 0)).toEqual({ r: 0, g: 0, b: 0 });        // 黑色
    });

    it('应该正确处理灰色（饱和度为0）', () => {
      const grayHsl = colorUtils.rgbToHsl(128, 128, 128);
      expect(grayHsl.s).toBe(0);
      expect(grayHsl.l).toBe(50);
    });
  });

  describe('HSL 验证', () => {
    it('应该验证有效的 HSL', () => {
      expect(colorUtils.isValidHsl(0, 100, 50)).toBe(true);
      expect(colorUtils.isValidHsl(360, 0, 0)).toBe(true);
      expect(colorUtils.isValidHsl(180, 50, 50)).toBe(true);
    });

    it('应该拒绝超出范围的 HSL', () => {
      expect(colorUtils.isValidHsl(361, 50, 50)).toBe(false);
      expect(colorUtils.isValidHsl(-1, 50, 50)).toBe(false);
      expect(colorUtils.isValidHsl(180, 101, 50)).toBe(false);
      expect(colorUtils.isValidHsl(180, 50, 101)).toBe(false);
    });
  });

  describe('RGB 和 HSV 转换', () => {
    it('应该正确将 RGB 转换为 HSV', () => {
      expect(colorUtils.rgbToHsv(255, 0, 0)).toEqual({ h: 0, s: 100, v: 100 });   // 红色
      expect(colorUtils.rgbToHsv(0, 255, 0)).toEqual({ h: 120, s: 100, v: 100 }); // 绿色
      expect(colorUtils.rgbToHsv(0, 0, 255)).toEqual({ h: 240, s: 100, v: 100 }); // 蓝色
    });

    it('应该正确处理白色和黑色', () => {
      expect(colorUtils.rgbToHsv(255, 255, 255)).toEqual({ h: 0, s: 0, v: 100 }); // 白色
      expect(colorUtils.rgbToHsv(0, 0, 0)).toEqual({ h: 0, s: 0, v: 0 });        // 黑色
    });
  });

  describe('RGB 和 CMYK 转换', () => {
    it('应该正确将 RGB 转换为 CMYK', () => {
      expect(colorUtils.rgbToCmyk(255, 0, 0)).toEqual({ c: 0, m: 100, y: 100, k: 0 });  // 红色
      expect(colorUtils.rgbToCmyk(0, 255, 0)).toEqual({ c: 100, m: 0, y: 100, k: 0 });  // 绿色
      expect(colorUtils.rgbToCmyk(0, 0, 255)).toEqual({ c: 100, m: 100, y: 0, k: 0 });  // 蓝色
      expect(colorUtils.rgbToCmyk(255, 255, 255)).toEqual({ c: 0, m: 0, y: 0, k: 0 });  // 白色
      expect(colorUtils.rgbToCmyk(0, 0, 0)).toEqual({ c: 0, m: 0, y: 0, k: 100 });      // 黑色
    });

    it('应该正确处理中间色', () => {
      const cmyk = colorUtils.rgbToCmyk(128, 128, 128);
      expect(cmyk.k).toBeGreaterThan(0);
    });
  });

  describe('边界情况', () => {
    it('应该对无效 HEX 返回 null', () => {
      expect(colorUtils.hexToRgb('invalid')).toBeNull();
      expect(colorUtils.hexToRgb('#GGGGGG')).toBeNull();
      expect(colorUtils.hexToRgb('#FF00')).toBeNull();
    });

    it('应该处理大小写混合的 HEX', () => {
      expect(colorUtils.hexToRgb('#FfAa12')).toEqual({
        r: 255, g: 170, b: 18
      });
    });

    it('应该保持转换一致性', () => {
      const originalHex = '#39C5BB';
      const rgb = colorUtils.hexToRgb(originalHex);
      const backToHex = colorUtils.rgbToHex(rgb.r, rgb.g, rgb.b);
      expect(backToHex).toBe(originalHex);
    });
  });
});
