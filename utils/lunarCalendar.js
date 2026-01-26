/**
 * 农历计算工具
 * 包含农历日期计算和节日
 */

export const LunarCalendar = {
  // 天干
  Gan: ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'],
  // 地支
  Zhi: ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'],
  // 生肖
  Animals: ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'],
  // 农历月份
  lunarMonths: ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月'],
  // 农历日期
  lunarDays: ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
    '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
    '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'],
  
  // 农历数据表 1900-2100
  lunarInfo: [
    0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
    0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
    0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
    0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
    0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
    0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5d0, 0x14573, 0x052d0, 0x0a9a8, 0x0e950, 0x06aa0,
    0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
    0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b5a0, 0x195a6,
    0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
    0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0,
    0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
    0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
    0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
    0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
    0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
    0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0,
    0x0a2e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4,
    0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0,
    0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160,
    0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a2d0, 0x0d150, 0x0f252
  ],

  /**
   * 返回农历y年的总天数
   */
  lYearDays(y) {
    let sum = 348;
    for (let i = 0x8000; i > 0x8; i >>= 1) {
      sum += (this.lunarInfo[y - 1900] & i) ? 1 : 0;
    }
    return sum + this.leapDays(y);
  },

  /**
   * 返回农历y年闰月的天数
   */
  leapDays(y) {
    if (this.leapMonth(y)) {
      return (this.lunarInfo[y - 1900] & 0x10000) ? 30 : 29;
    }
    return 0;
  },

  /**
   * 返回农历y年闰哪个月 1-12 , 没闰返回 0
   */
  leapMonth(y) {
    return this.lunarInfo[y - 1900] & 0xf;
  },

  /**
   * 返回农历y年m月的总天数
   */
  monthDays(y, m) {
    return (this.lunarInfo[y - 1900] & (0x10000 >> m)) ? 30 : 29;
  },

  /**
   * 公历转农历
   */
  solar2lunar(year, month, day) {
    if (year < 1900 || year > 2100) {
      return null;
    }

    let offset = (Date.UTC(year, month - 1, day) - Date.UTC(1900, 0, 31)) / 86400000;
    
    let lunarYear, lunarMonth, lunarDay;
    let isLeap = false;

    // 计算农历年
    for (lunarYear = 1900; lunarYear < 2101 && offset > 0; lunarYear++) {
      let daysInYear = this.lYearDays(lunarYear);
      offset -= daysInYear;
    }
    if (offset < 0) {
      offset += this.lYearDays(--lunarYear);
    }

    // 计算农历月
    let leap = this.leapMonth(lunarYear);
    for (lunarMonth = 1; lunarMonth < 13 && offset > 0; lunarMonth++) {
      if (leap > 0 && lunarMonth === (leap + 1) && !isLeap) {
        --lunarMonth;
        isLeap = true;
        let daysInMonth = this.leapDays(lunarYear);
        offset -= daysInMonth;
      } else {
        let daysInMonth = this.monthDays(lunarYear, lunarMonth);
        offset -= daysInMonth;
      }
      if (isLeap && lunarMonth === (leap + 1)) {
        isLeap = false;
      }
    }
    if (offset === 0 && leap > 0 && lunarMonth === leap + 1) {
      if (isLeap) {
        isLeap = false;
      } else {
        isLeap = true;
        --lunarMonth;
      }
    }
    if (offset < 0) {
      offset += isLeap ? this.leapDays(lunarYear) : this.monthDays(lunarYear, lunarMonth);
      --lunarMonth;
    }
    lunarDay = offset + 1;

    // 计算干支年
    const yearGanZhi = this.Gan[(lunarYear - 4) % 10] + this.Zhi[(lunarYear - 4) % 12];
    const animal = this.Animals[(lunarYear - 4) % 12];

    return {
      year: lunarYear,
      month: lunarMonth,
      day: lunarDay,
      isLeap: isLeap,
      yearGanZhi: yearGanZhi,
      animal: animal,
      monthStr: (isLeap ? '闰' : '') + this.lunarMonths[lunarMonth - 1],
      dayStr: this.lunarDays[lunarDay - 1]
    };
  },

  /**
   * 获取农历节日
   */
  getLunarFestival(month, day) {
    const festivals = {
      '1-1': '春节',
      '1-15': '元宵节',
      '2-2': '龙抬头',
      '5-5': '端午节',
      '7-7': '七夕节',
      '7-15': '中元节',
      '8-15': '中秋节',
      '9-9': '重阳节',
      '12-8': '腊八节',
      '12-23': '小年'
    };
    const key = `${month}-${day}`;
    return festivals[key] || null;
  },

  /**
   * 获取公历节日
   */
  getSolarFestival(month, day) {
    const solarFestivals = {
      '1-1': '元旦',
      '2-14': '情人节',
      '3-8': '妇女节',
      '3-12': '植树节',
      '4-1': '愚人节',
      '5-1': '劳动节',
      '5-4': '青年节',
      '6-1': '儿童节',
      '7-1': '建党节',
      '8-1': '建军节',
      '9-10': '教师节',
      '10-1': '国庆节',
      '12-25': '圣诞节'
    };
    
    const key = `${month}-${day}`;
    return solarFestivals[key] || null;
  },

  /**
   * 获取节日信息
   */
  getFestival(year, month, day) {
    // 先检查公历节日
    const solarFestival = this.getSolarFestival(month, day);
    if (solarFestival) return solarFestival;
    
    // 再检查农历节日
    const lunar = this.solar2lunar(year, month, day);
    if (lunar) {
      const lunarFestival = this.getLunarFestival(lunar.month, lunar.day);
      if (lunarFestival) return lunarFestival;
    }
    
    return null;
  },

  /**
   * 获取调休信息
   * 返回: 'holiday' = 放假, 'workday' = 调休上班, null = 普通日
   * 数据来源：国务院办公厅关于2026年部分节假日安排的通知（2025年11月4日发布）
   */
  getHolidayStatus(year, month, day) {
    const key = `${year}-${month}-${day}`;
    
    // 2026年法定节假日安排（国务院办公厅官方通知）
    const holidays2026 = {
      // 元旦：1月1日至3日放假调休，共3天。1月4日上班。
      '2026-1-1': 'holiday', '2026-1-2': 'holiday', '2026-1-3': 'holiday',
      '2026-1-4': 'workday',
      // 春节：2月15日（腊月廿八）至23日（正月初七）放假调休，共9天。2月14日、2月28日上班。
      '2026-2-15': 'holiday', '2026-2-16': 'holiday', '2026-2-17': 'holiday',
      '2026-2-18': 'holiday', '2026-2-19': 'holiday', '2026-2-20': 'holiday',
      '2026-2-21': 'holiday', '2026-2-22': 'holiday', '2026-2-23': 'holiday',
      '2026-2-14': 'workday', '2026-2-28': 'workday',
      // 清明节：4月4日至6日放假，共3天。
      '2026-4-4': 'holiday', '2026-4-5': 'holiday', '2026-4-6': 'holiday',
      // 劳动节：5月1日至5日放假调休，共5天。5月9日上班。
      '2026-5-1': 'holiday', '2026-5-2': 'holiday', '2026-5-3': 'holiday',
      '2026-5-4': 'holiday', '2026-5-5': 'holiday',
      '2026-5-9': 'workday',
      // 端午节：6月19日至21日放假，共3天。
      '2026-6-19': 'holiday', '2026-6-20': 'holiday', '2026-6-21': 'holiday',
      // 中秋节：9月25日至27日放假，共3天。
      '2026-9-25': 'holiday', '2026-9-26': 'holiday', '2026-9-27': 'holiday',
      // 国庆节：10月1日至7日放假调休，共7天。9月20日、10月10日上班。
      '2026-10-1': 'holiday', '2026-10-2': 'holiday', '2026-10-3': 'holiday',
      '2026-10-4': 'holiday', '2026-10-5': 'holiday', '2026-10-6': 'holiday',
      '2026-10-7': 'holiday',
      '2026-9-20': 'workday', '2026-10-10': 'workday'
    };

    return holidays2026[key] || null;
  }
};
