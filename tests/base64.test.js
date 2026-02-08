import { describe, it, expect } from 'vitest';
import { Base64 } from '../utils/base64.js';

describe('Base64 工具 TDD', () => {
  describe('encode - Base64 编码', () => {
    it('应该正确编码简单字符串', () => {
      expect(Base64.encode('Hello')).toBe('SGVsbG8=');
    });

    it('应该正确编码中文', () => {
      expect(Base64.encode('你好')).toBe('5L2g5aW9');
    });

    it('应该正确编码包含特殊字符的字符串', () => {
      expect(Base64.encode('Hello, World!')).toBe('SGVsbG8sIFdvcmxkIQ==');
    });

    it('应该正确处理空字符串', () => {
      expect(Base64.encode('')).toBe('');
    });

    it('应该正确处理 URL 安全字符', () => {
      const encoded = Base64.encode('???', { urlSafe: true });
      expect(encoded).not.toContain('+');
      expect(encoded).not.toContain('/');
      expect(encoded).not.toContain('=');
    });

    it('应该正确处理多行字符串', () => {
      const input = 'Line1\nLine2\nLine3';
      const encoded = Base64.encode(input);
      expect(typeof encoded).toBe('string');
      expect(encoded.length).toBeGreaterThan(0);
    });
  });

  describe('decode - Base64 解码', () => {
    it('应该正确解码简单字符串', () => {
      expect(Base64.decode('SGVsbG8=')).toBe('Hello');
    });

    it('应该正确解码中文', () => {
      expect(Base64.decode('5L2g5aW9')).toBe('你好');
    });

    it('应该正确解码包含特殊字符的字符串', () => {
      expect(Base64.decode('SGVsbG8sIFdvcmxkIQ==')).toBe('Hello, World!');
    });

    it('应该正确处理空字符串', () => {
      expect(Base64.decode('')).toBe('');
    });

    it('应该正确处理不带填充的 Base64', () => {
      expect(Base64.decode('SGVsbG8')).toBe('Hello');
    });

    it('应该正确解码 URL 安全的 Base64', () => {
      expect(Base64.decode('SGVsbG8sIFdvcmxkIQ', { urlSafe: true })).toBe('Hello, World!');
    });

    it('应该对无效输入抛出错误', () => {
      expect(() => Base64.decode('!!!')).toThrow();
    });
  });

  describe('encodeBinary - 二进制编码', () => {
    it('应该正确编码 Uint8Array', () => {
      const bytes = new Uint8Array([72, 101, 108, 108, 111]);
      expect(Base64.encodeBinary(bytes)).toBe('SGVsbG8=');
    });

    it('应该正确处理空数组', () => {
      expect(Base64.encodeBinary(new Uint8Array([]))).toBe('');
    });

    it('应该正确处理二进制数据', () => {
      const bytes = new Uint8Array([0, 255, 128, 64, 32]);
      const encoded = Base64.encodeBinary(bytes);
      expect(typeof encoded).toBe('string');
    });
  });

  describe('decodeBinary - 二进制解码', () => {
    it('应该正确解码为 Uint8Array', () => {
      const decoded = Base64.decodeBinary('SGVsbG8=');
      expect(decoded).toBeInstanceOf(Uint8Array);
      expect(Array.from(decoded)).toEqual([72, 101, 108, 108, 111]);
    });

    it('应该正确处理空字符串', () => {
      const decoded = Base64.decodeBinary('');
      expect(decoded).toBeInstanceOf(Uint8Array);
      expect(decoded.length).toBe(0);
    });
  });

  describe('isValid - Base64 验证', () => {
    it('应该验证有效的 Base64', () => {
      expect(Base64.isValid('SGVsbG8=')).toBe(true);
      expect(Base64.isValid('5L2g5aW9')).toBe(true);
    });

    it('应该拒绝无效字符', () => {
      expect(Base64.isValid('!!!')).toBe(false);
    });

    it('应该拒绝长度不符合的字符串', () => {
      expect(Base64.isValid('SGVsbG8===')).toBe(false);
    });

    it('应该验证 URL 安全的 Base64', () => {
      expect(Base64.isValid('SGVsbG8sIFdvcmxkIQ', { urlSafe: true })).toBe(true);
    });
  });

  describe('编码解码一致性', () => {
    it('编码后解码应该还原原始字符串', () => {
      const original = 'Hello, World! 你好世界 🌍';
      const encoded = Base64.encode(original);
      const decoded = Base64.decode(encoded);
      expect(decoded).toBe(original);
    });

    it('应该正确处理各种字符', () => {
      const testCases = [
        'Hello',
        '你好',
        'Hello 你好',
        '!@#$%^&*()',
        '1234567890',
        '  Leading and trailing spaces  ',
        '🎉🎊🎁',
        'Line1\nLine2',
        'Tab\there',
        ''
      ];

      testCases.forEach(original => {
        const encoded = Base64.encode(original);
        const decoded = Base64.decode(encoded);
        expect(decoded).toBe(original);
      });
    });
  });

  describe('边界情况', () => {
    it('应该处理非常长的字符串', () => {
      const longString = 'a'.repeat(10000);
      const encoded = Base64.encode(longString);
      const decoded = Base64.decode(encoded);
      expect(decoded).toBe(longString);
    });

    it('应该正确处理包含 null 字节的字符串', () => {
      const bytes = new Uint8Array([0, 0, 0, 0]);
      const encoded = Base64.encodeBinary(bytes);
      const decoded = Base64.decodeBinary(encoded);
      expect(Array.from(decoded)).toEqual([0, 0, 0, 0]);
    });
  });
});
