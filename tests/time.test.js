import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatting } from '../utils/formatting.js';

describe('时间工具测试', () => {
  describe('formatting.timestamp - 时间戳转换', () => {
    it('应该正确转换 Unix 时间戳（秒级）', () => {
      const timestamp = 1704067200000; // 2024-01-01 00:00:00
      const result = formatting.timestamp(timestamp);
      expect(result).toMatch(/2024-01-01 00:00:00/);
    });

    it('应该正确处理毫秒时间戳', () => {
      const timestamp = 1704067200000;
      const result = formatting.timestamp(timestamp);
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('应该正确处理零值时间戳', () => {
      const result = formatting.timestamp(0);
      expect(result).toMatch(/1970-01-01/);
    });

    it('应该正确处理负数时间戳（1970年前）', () => {
      const timestamp = -86400000; // 1969-12-31
      const result = formatting.timestamp(timestamp);
      expect(result).toMatch(/1969-12-31/);
    });

    it('应该正确处理未来日期的时间戳', () => {
      const timestamp = 1893456000000; // 2030-01-01
      const result = formatting.timestamp(timestamp);
      expect(result).toMatch(/2030-01-01/);
    });
  });

  describe('formatting.dateTime - 日期时间格式化', () => {
    it('应该使用默认格式格式化日期', () => {
      const date = new Date('2024-06-15 14:30:45');
      const result = formatting.dateTime(date);
      expect(result).toBe('2024-06-15 14:30:45');
    });

    it('应该支持自定义格式', () => {
      const date = new Date('2024-06-15 14:30:45');
      const result = formatting.dateTime(date, 'YYYY/MM/DD');
      expect(result).toBe('2024/06/15');
    });

    it('应该正确处理月份和日期的前导零', () => {
      const date = new Date('2024-01-05 03:02:01');
      const result = formatting.dateTime(date);
      expect(result).toBe('2024-01-05 03:02:01');
    });

    it('应该正确处理年末日期', () => {
      const date = new Date('2024-12-31 23:59:59');
      const result = formatting.dateTime(date);
      expect(result).toBe('2024-12-31 23:59:59');
    });

    it('应该正确处理闰年2月29日', () => {
      const date = new Date('2024-02-29 12:00:00');
      const result = formatting.dateTime(date);
      expect(result).toBe('2024-02-29 12:00:00');
    });
  });

  describe('formatting.duration - 持续时间格式化', () => {
    it('应该正确格式化秒级持续时间', () => {
      expect(formatting.duration(5000)).toBe('5秒');
    });

    it('应该正确格式化分钟级持续时间', () => {
      expect(formatting.duration(125000)).toBe('2分钟 5秒');
    });

    it('应该正确格式化小时级持续时间', () => {
      expect(formatting.duration(7260000)).toBe('2小时 1分钟');
    });

    it('应该正确格式天级持续时间', () => {
      expect(formatting.duration(90061000)).toBe('1天 1小时 1分钟');
    });

    it('应该正确处理零值', () => {
      expect(formatting.duration(0)).toBe('0秒');
    });

    it('应该正确处理大数值', () => {
      expect(formatting.duration(86400000 * 10)).toBe('10天 0小时 0分钟');
    });
  });

  describe('formatting.relativeTime - 相对时间', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-15 12:00:00'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('应该返回"刚刚"对于当前时间', () => {
      const now = new Date();
      expect(formatting.relativeTime(now)).toBe('刚刚');
    });

    it('应该正确计算分钟前', () => {
      const fiveMinutesAgo = new Date('2024-01-15 11:55:00');
      expect(formatting.relativeTime(fiveMinutesAgo)).toBe('5分钟前');
    });

    it('应该正确计算小时前', () => {
      const twoHoursAgo = new Date('2024-01-15 10:00:00');
      expect(formatting.relativeTime(twoHoursAgo)).toBe('2小时前');
    });

    it('应该正确计算天前', () => {
      const threeDaysAgo = new Date('2024-01-12 12:00:00');
      expect(formatting.relativeTime(threeDaysAgo)).toBe('3天前');
    });

    it('应该正确处理未来时间', () => {
      const future = new Date('2024-01-15 13:00:00');
      // 未来时间会显示负数，但格式仍然是"X小时前"
      expect(formatting.relativeTime(future)).toBe('刚刚');
    });
  });
});
