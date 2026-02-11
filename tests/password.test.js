import { describe, it, expect, vi } from 'vitest';

// 密码生成器工具函数
const passwordUtils = {
  // 生成密码
  generate(options = {}) {
    const {
      length = 16,
      uppercase = true,
      lowercase = true,
      numbers = true,
      symbols = true,
      excludeSimilar = false,
      excludeAmbiguous = false
    } = options;

    let chars = '';
    const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowerChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const symbolChars = '!@#$%^&*';

    if (uppercase) {
      let set = upperChars;
      if (excludeSimilar) set = set.replace(/O/g, '');
      chars += set;
    }
    if (lowercase) {
      let set = lowerChars;
      if (excludeSimilar) set = set.replace(/l/g, '');
      chars += set;
    }
    if (numbers) {
      let set = numberChars;
      if (excludeSimilar) set = set.replace(/[01]/g, '');
      chars += set;
    }
    if (symbols) {
      chars += symbolChars;
    }

    if (!chars) chars = lowerChars + numberChars;

    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      password += chars[randomIndex];
    }

    return password;
  },

  // 计算密码强度
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

    if (password.length < 8) score = Math.min(score, 1);
    if (password.length >= 16) score = Math.min(score + 1, 4);

    return { score, entropy };
  },

  // 验证密码复杂度
  validateComplexity(password, requirements = {}) {
    const {
      minLength = 8,
      requireUppercase = true,
      requireLowercase = true,
      requireNumbers = true,
      requireSymbols = false
    } = requirements;

    const issues = [];

    if (password.length < minLength) {
      issues.push(`密码长度至少${minLength}位`);
    }
    if (requireUppercase && !/[A-Z]/.test(password)) {
      issues.push('需要包含大写字母');
    }
    if (requireLowercase && !/[a-z]/.test(password)) {
      issues.push('需要包含小写字母');
    }
    if (requireNumbers && !/[0-9]/.test(password)) {
      issues.push('需要包含数字');
    }
    if (requireSymbols && !/[^A-Za-z0-9]/.test(password)) {
      issues.push('需要包含特殊符号');
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }
};

describe('密码生成器测试', () => {
  describe('generate - 密码生成', () => {
    it('应该生成默认16位密码', () => {
      const password = passwordUtils.generate();
      expect(password.length).toBe(16);
    });

    it('应该生成指定长度的密码', () => {
      const password8 = passwordUtils.generate({ length: 8 });
      const password32 = passwordUtils.generate({ length: 32 });
      expect(password8.length).toBe(8);
      expect(password32.length).toBe(32);
    });

    it('应该只包含大写字母', () => {
      const password = passwordUtils.generate({
        length: 20,
        uppercase: true,
        lowercase: false,
        numbers: false,
        symbols: false
      });
      expect(password).toMatch(/^[A-Z]+$/);
    });

    it('应该只包含小写字母', () => {
      const password = passwordUtils.generate({
        length: 20,
        uppercase: false,
        lowercase: true,
        numbers: false,
        symbols: false
      });
      expect(password).toMatch(/^[a-z]+$/);
    });

    it('应该只包含数字', () => {
      const password = passwordUtils.generate({
        length: 20,
        uppercase: false,
        lowercase: false,
        numbers: true,
        symbols: false
      });
      expect(password).toMatch(/^[0-9]+$/);
    });

    it('应该包含混合字符', () => {
      const password = passwordUtils.generate({
        length: 50,
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true
      });
      expect(password).toMatch(/[A-Z]/);
      expect(password).toMatch(/[a-z]/);
      expect(password).toMatch(/[0-9]/);
      expect(password).toMatch(/[^A-Za-z0-9]/);
    });

    it('排除相似字符时不应包含0,O,1,l', () => {
      const password = passwordUtils.generate({
        length: 100,
        excludeSimilar: true
      });
      expect(password).not.toMatch(/[0O1l]/);
    });

    it('生成的密码应该随机', () => {
      const passwords = new Set();
      for (let i = 0; i < 10; i++) {
        passwords.add(passwordUtils.generate());
      }
      // 10个密码应该各不相同（概率极高）
      expect(passwords.size).toBe(10);
    });

    it('应该处理最小长度4', () => {
      const password = passwordUtils.generate({ length: 4 });
      expect(password.length).toBe(4);
    });

    it('应该处理最大长度64', () => {
      const password = passwordUtils.generate({ length: 64 });
      expect(password.length).toBe(64);
    });
  });

  describe('calculateStrength - 密码强度计算', () => {
    it('短密码应该是弱密码', () => {
      const strength = passwordUtils.calculateStrength('abc123');
      expect(strength.score).toBeLessThanOrEqual(2);
      expect(strength.entropy).toBeLessThan(50);
    });

    it('长且复杂的密码应该是强密码', () => {
      const strength = passwordUtils.calculateStrength('Ab1!Ab1!Ab1!Ab1!');
      expect(strength.score).toBeGreaterThanOrEqual(3);
      expect(strength.entropy).toBeGreaterThan(50);
    });

    it('应该正确计算熵值', () => {
      const strength1 = passwordUtils.calculateStrength('abc');
      const strength2 = passwordUtils.calculateStrength('abcabc');
      expect(strength2.entropy).toBeGreaterThan(strength1.entropy);
    });

    it('小于8位的密码分数不应超过1', () => {
      const strength = passwordUtils.calculateStrength('Ab1!');
      expect(strength.score).toBeLessThanOrEqual(1);
    });

    it('16位以上的复杂密码应该是最高分', () => {
      const strength = passwordUtils.calculateStrength('Abc123!@#Def456$%^');
      expect(strength.score).toBe(4);
    });

    it('纯小写字母密码强度较低', () => {
      const strength = passwordUtils.calculateStrength('abcdefgh'); // 8位小写字母
      expect(strength.score).toBeLessThanOrEqual(3);
    });

    it('包含四种字符类型的密码强度最高', () => {
      const strength = passwordUtils.calculateStrength('A1b2C3d4E5f6!@#$');
      expect(strength.score).toBe(4);
    });
  });

  describe('validateComplexity - 密码复杂度验证', () => {
    it('应该验证最小长度', () => {
      const result = passwordUtils.validateComplexity('abc', { minLength: 8 });
      expect(result.valid).toBe(false);
      expect(result.issues).toContain('密码长度至少8位');
    });

    it('应该验证大写字母要求', () => {
      const result = passwordUtils.validateComplexity('abc123', { requireUppercase: true });
      expect(result.valid).toBe(false);
      expect(result.issues).toContain('需要包含大写字母');
    });

    it('应该验证小写字母要求', () => {
      const result = passwordUtils.validateComplexity('ABC123', { requireLowercase: true });
      expect(result.valid).toBe(false);
      expect(result.issues).toContain('需要包含小写字母');
    });

    it('应该验证数字要求', () => {
      const result = passwordUtils.validateComplexity('Abcdef', { requireNumbers: true });
      expect(result.valid).toBe(false);
      expect(result.issues).toContain('需要包含数字');
    });

    it('应该验证特殊符号要求', () => {
      const result = passwordUtils.validateComplexity('Abc123', { requireSymbols: true });
      expect(result.valid).toBe(false);
      expect(result.issues).toContain('需要包含特殊符号');
    });

    it('应该验证通过复杂密码', () => {
      const result = passwordUtils.validateComplexity('Abc123!@#', {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSymbols: true
      });
      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('应该同时返回多个问题', () => {
      const result = passwordUtils.validateComplexity('abc', {
        minLength: 8,
        requireUppercase: true,
        requireNumbers: true,
        requireSymbols: true
      });
      expect(result.valid).toBe(false);
      expect(result.issues.length).toBeGreaterThan(1);
    });
  });

  describe('边界情况', () => {
    it('应该处理空字符集（默认使用小写+数字）', () => {
      const password = passwordUtils.generate({
        uppercase: false,
        lowercase: false,
        numbers: false,
        symbols: false
      });
      expect(password.length).toBe(16);
      expect(password).toMatch(/^[a-z0-9]+$/);
    });

    it('应该生成长度为1的密码', () => {
      const password = passwordUtils.generate({ length: 1 });
      expect(password.length).toBe(1);
    });

    it('超长密码应该正确处理', () => {
      const password = passwordUtils.generate({ length: 128 });
      expect(password.length).toBe(128);
    });

    it('密码应该包含至少一个字符', () => {
      const password = passwordUtils.generate();
      expect(password.length).toBeGreaterThan(0);
    });
  });
});
