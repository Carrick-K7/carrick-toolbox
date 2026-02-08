import { describe, it, expect } from 'vitest';
import { LunarCalendar } from '../utils/lunarCalendar.js';

describe('农历工具测试', () => {
  describe('solar2lunar - 公历转农历', () => {
    it('应该正确转换2024年春节', () => {
      const result = LunarCalendar.solar2lunar(2024, 2, 10);
      expect(result).not.toBeNull();
      expect(result.month).toBe(1);
      expect(result.day).toBe(1);
      expect(result.monthStr).toBe('正月');
      expect(result.dayStr).toBe('初一');
    });

    it('应该正确转换普通日期', () => {
      const result = LunarCalendar.solar2lunar(2024, 6, 15);
      expect(result).not.toBeNull();
      expect(result.year).toBe(2024);
      expect(result.yearGanZhi).toBeDefined();
      expect(result.animal).toBe('龙'); // 2024是龙年
    });

    it('应该正确处理闰月', () => {
      // 2023年有闰二月
      const result = LunarCalendar.solar2lunar(2023, 3, 23);
      expect(result).not.toBeNull();
      // 可能是闰二月
    });

    it('应该正确处理1900年边界', () => {
      const result = LunarCalendar.solar2lunar(1900, 1, 1);
      expect(result).not.toBeNull();
    });

    it('应该正确处理2100年边界', () => {
      const result = LunarCalendar.solar2lunar(2100, 12, 31);
      expect(result).not.toBeNull();
    });

    it('应该返回null对于超出范围的日期', () => {
      const result = LunarCalendar.solar2lunar(1899, 12, 31);
      expect(result).toBeNull();
    });

    it('应该返回null对于超过2100年的日期', () => {
      const result = LunarCalendar.solar2lunar(2101, 1, 1);
      expect(result).toBeNull();
    });

    it('应该正确计算干支', () => {
      // 2024年是甲辰年
      const result = LunarCalendar.solar2lunar(2024, 1, 1);
      expect(result.yearGanZhi).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/);
    });

    it('应该正确计算生肖', () => {
      const animals = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
      const result = LunarCalendar.solar2lunar(2024, 1, 1);
      expect(animals).toContain(result.animal);
    });
  });

  describe('getLunarFestival - 农历节日', () => {
    it('应该正确返回春节', () => {
      const festival = LunarCalendar.getLunarFestival(1, 1);
      expect(festival).toBe('春节');
    });

    it('应该正确返回元宵节', () => {
      const festival = LunarCalendar.getLunarFestival(1, 15);
      expect(festival).toBe('元宵节');
    });

    it('应该正确返回端午节', () => {
      const festival = LunarCalendar.getLunarFestival(5, 5);
      expect(festival).toBe('端午节');
    });

    it('应该正确返回中秋节', () => {
      const festival = LunarCalendar.getLunarFestival(8, 15);
      expect(festival).toBe('中秋节');
    });

    it('应该对非节日日期返回null', () => {
      const festival = LunarCalendar.getLunarFestival(6, 15);
      expect(festival).toBeNull();
    });

    it('应该正确返回重阳节', () => {
      const festival = LunarCalendar.getLunarFestival(9, 9);
      expect(festival).toBe('重阳节');
    });
  });

  describe('getSolarFestival - 公历节日', () => {
    it('应该正确返回元旦', () => {
      const festival = LunarCalendar.getSolarFestival(1, 1);
      expect(festival).toBe('元旦');
    });

    it('应该正确返回劳动节', () => {
      const festival = LunarCalendar.getSolarFestival(5, 1);
      expect(festival).toBe('劳动节');
    });

    it('应该正确返回国庆节', () => {
      const festival = LunarCalendar.getSolarFestival(10, 1);
      expect(festival).toBe('国庆节');
    });

    it('应该正确返回圣诞节', () => {
      const festival = LunarCalendar.getSolarFestival(12, 25);
      expect(festival).toBe('圣诞节');
    });

    it('应该对非节日日期返回null', () => {
      const festival = LunarCalendar.getSolarFestival(3, 15);
      expect(festival).toBeNull();
    });
  });

  describe('getFestival - 综合节日查询', () => {
    it('应该优先返回公历节日', () => {
      const festival = LunarCalendar.getFestival(2024, 1, 1);
      expect(festival).toBe('元旦');
    });

    it('应该返回农历节日当没有公历节日', () => {
      // 2024年春节是2月10日
      const festival = LunarCalendar.getFestival(2024, 2, 10);
      expect(festival).toBe('春节');
    });

    it('应该对普通日期返回null', () => {
      const festival = LunarCalendar.getFestival(2024, 3, 15);
      expect(festival).toBeNull();
    });
  });

  describe('getHolidayStatus - 节假日状态', () => {
    it('应该正确识别2026年元旦假期', () => {
      const status = LunarCalendar.getHolidayStatus(2026, 1, 1);
      expect(status).toBe('holiday');
    });

    it('应该正确识别2026年调休上班日', () => {
      const status = LunarCalendar.getHolidayStatus(2026, 1, 4);
      expect(status).toBe('workday');
    });

    it('应该对普通日期返回null', () => {
      const status = LunarCalendar.getHolidayStatus(2026, 3, 15);
      expect(status).toBeNull();
    });

    it('应该正确识别2026年春节假期', () => {
      const status = LunarCalendar.getHolidayStatus(2026, 2, 17);
      expect(status).toBe('holiday');
    });
  });

  describe('内部方法测试', () => {
    it('leapMonth 应该正确返回闰月', () => {
      // 2023年闰二月
      const leapMonth = LunarCalendar.leapMonth(2023);
      expect(leapMonth).toBe(2);
    });

    it('leapDays 应该正确返回闰月天数', () => {
      const days = LunarCalendar.leapDays(2023);
      expect(days).toBeGreaterThan(0);
    });

    it('monthDays 应该正确返回月份天数（29或30天）', () => {
      const days = LunarCalendar.monthDays(2024, 1);
      expect([29, 30]).toContain(days);
    });

    it('lYearDays 应该正确返回年份总天数', () => {
      const days = LunarCalendar.lYearDays(2024);
      expect(days).toBeGreaterThan(350);
      expect(days).toBeLessThan(400);
    });
  });
});
