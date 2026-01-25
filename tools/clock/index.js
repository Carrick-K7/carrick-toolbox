/**
 * 模拟时钟工具
 * 提供模拟时钟显示、数字时间、日期、农历等功能
 */

import { domHelper } from '../../utils/domHelper.js';
import { formatting } from '../../utils/formatting.js';
import { LunarCalendar } from '../../utils/lunarCalendar.js';

export default class AnalogClock {
  constructor(container) {
    this.container = container;
    this.clockInterval = null;
    this.lastSecond = -1;
    this.calendarYear = new Date().getFullYear();
    this.calendarMonth = new Date().getMonth() + 1;
    this.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.config = {
      clockSize: 280,
      smoothSecond: true,
      showSecond: true,
      showDigital: true,
      showDate: true,
      showLunar: true,
      hourFormat: '24',
      showHoliday: true,
      showCalendar: false,
      showMarkers: true,
      showNumbers: true
    };
  }

  /**
   * 初始化时钟
   */
  async init() {
    this.render();
    this.createClockFace();
    this.startClock();
    this.bindEvents();
  }

  /**
   * 渲染时钟界面
   */
  render() {
    this.container.innerHTML = `
      <div class="clock-wrapper" id="clock-wrapper">
        <div class="clock">
          <div class="clock-inner">
            <div class="clock-face" id="clock-face"></div>
            <div class="hand hour-hand" id="hour-hand"></div>
            <div class="hand minute-hand" id="minute-hand"></div>
            <div class="hand second-hand smooth" id="second-hand"></div>
            <div class="center-dot"></div>
            <div class="center-dot-inner"></div>
          </div>
        </div>
        <div style="text-align: center;">
          <div class="digital-time" id="digital-time">00:00:<span class="seconds">00</span></div>
          <div class="date-display" id="date-display"></div>
          <div class="lunar-display" id="lunar-display"></div>
          <div class="festival-display" id="festival-display"></div>
        </div>
        <div class="holiday-countdown" id="holiday-countdown"></div>
        <div class="calendar-wrapper hidden" id="calendar-wrapper">
          <div class="calendar-header">
            <div class="calendar-title" id="calendar-title"></div>
            <div class="calendar-nav">
              <button class="calendar-nav-btn" data-nav="-1"><i class="fas fa-chevron-left"></i></button>
              <button class="calendar-nav-btn" data-nav="0"><i class="fas fa-circle"></i></button>
              <button class="calendar-nav-btn" data-nav="1"><i class="fas fa-chevron-right"></i></button>
            </div>
          </div>
          <div class="calendar-grid" id="calendar-grid"></div>
        </div>
      </div>
      <div class="clock-config">
        <div class="config-panel collapsed" id="config-panel">
          <div class="config-header" id="config-header">
            <i class="fas fa-chevron-left config-toggle"></i>
            <div class="config-title">
              <i class="fas fa-cog"></i>
              <span>配置</span>
            </div>
          </div>
          <div class="config-body">
            <div class="config-section">
              <div class="config-section-title">表盘</div>
              <div class="config-item">
                <div class="toggle-wrapper">
                  <span class="config-label">显示刻度</span>
                  <div class="toggle-switch ${this.config.showMarkers !== false ? 'active' : ''}" data-config="showMarkers"></div>
                </div>
              </div>
              <div class="config-item">
                <div class="toggle-wrapper">
                  <span class="config-label">显示数字</span>
                  <div class="toggle-switch ${this.config.showNumbers !== false ? 'active' : ''}" data-config="showNumbers"></div>
                </div>
              </div>
            </div>
            <div class="config-section">
              <div class="config-section-title">秒针</div>
              <div class="config-item">
                <div class="config-label">指针模式</div>
                <div class="btn-group">
                  <button class="btn-option ${this.config.smoothSecond ? '' : 'active'}" data-config="smoothSecond" data-value="false">跳动</button>
                  <button class="btn-option ${this.config.smoothSecond ? 'active' : ''}" data-config="smoothSecond" data-value="true">平滑</button>
                </div>
              </div>
              <div class="config-item">
                <div class="toggle-wrapper">
                  <span class="config-label">显示秒针</span>
                  <div class="toggle-switch ${this.config.showSecond !== false ? 'active' : ''}" data-config="showSecond"></div>
                </div>
              </div>
            </div>
            <div class="config-section">
              <div class="config-section-title">时钟大小</div>
              <div class="config-item">
                <div class="range-wrapper">
                  <input type="range" class="config-range" id="clock-size-range" min="160" max="400" step="20" value="${this.config.clockSize}">
                  <span class="range-value" id="clock-size-value">${this.getSizeLabel(this.config.clockSize)}</span>
                </div>
              </div>
            </div>
            <div class="config-section">
              <div class="config-section-title">时区</div>
              <div class="config-item">
                <div class="timezone-wrapper">
                  <select class="timezone-select" id="timezone-select">
                    <option value="Asia/Shanghai">中国标准时间 (UTC+8)</option>
                    <option value="America/New_York">美国东部时间 (UTC-5)</option>
                    <option value="America/Los_Angeles">美国西部时间 (UTC-8)</option>
                    <option value="Europe/London">英国时间 (UTC+0)</option>
                    <option value="Europe/Paris">欧洲中部时间 (UTC+1)</option>
                    <option value="Asia/Tokyo">日本时间 (UTC+9)</option>
                    <option value="Asia/Dubai">迪拜时间 (UTC+4)</option>
                    <option value="Australia/Sydney">澳大利亚东部时间 (UTC+11)</option>
                  </select>
                  <button class="timezone-reset-btn" id="timezone-reset-btn" title="重置为本地时区">
                    <i class="fas fa-undo"></i>
                  </button>
                </div>
                <div class="timezone-display" id="timezone-display">${this.timezone}</div>
              </div>
            </div>
            <div class="config-section">
              <div class="config-section-title">显示</div>
              <div class="config-item">
                <div class="toggle-wrapper">
                  <span class="config-label">数字时间</span>
                  <div class="toggle-switch ${this.config.showDigital ? 'active' : ''}" data-config="showDigital"></div>
                </div>
              </div>
              <div class="config-item">
                <div class="toggle-wrapper">
                  <span class="config-label">显示日期</span>
                  <div class="toggle-switch ${this.config.showDate ? 'active' : ''}" data-config="showDate"></div>
                </div>
              </div>
              <div class="config-item">
                <div class="toggle-wrapper">
                  <span class="config-label">显示农历</span>
                  <div class="toggle-switch ${this.config.showLunar ? 'active' : ''}" data-config="showLunar"></div>
                </div>
              </div>
              <div class="config-item">
                <div class="toggle-wrapper">
                  <span class="config-label">节假日倒计时</span>
                  <div class="toggle-switch ${this.config.showHoliday ? 'active' : ''}" data-config="showHoliday"></div>
                </div>
              </div>
              <div class="config-item">
                <div class="toggle-wrapper">
                  <span class="config-label">显示日历</span>
                  <div class="toggle-switch ${this.config.showCalendar ? 'active' : ''}" data-config="showCalendar"></div>
                </div>
              </div>
              <div class="config-item">
                <div class="config-label">时间格式</div>
                <div class="btn-group">
                  <button class="btn-option ${this.config.hourFormat === '12' ? 'active' : ''}" data-config="hourFormat" data-value="12">12小时</button>
                  <button class="btn-option ${this.config.hourFormat === '24' ? 'active' : ''}" data-config="hourFormat" data-value="24">24小时</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // 应用时钟大小配置
    this.updateClockSize();
    // 渲染节假日倒计时
    this.renderHolidayCountdown();
  }

  /**
   * 创建时钟表盘
   */
  createClockFace() {
    const face = domHelper.find('#clock-face');
    if (!face) return;

    // 清空现有内容
    face.innerHTML = '';

    const clockSize = this.config.clockSize;
    const borderWidth = 3; // 边框宽度
    const innerSize = clockSize - borderWidth * 2;
    const center = innerSize / 2;
    const radius = center - 8; // 留出一点边距

    const showMarkers = this.config.showMarkers !== false;
    const showNumbers = this.config.showNumbers !== false;

    // 按比例计算
    const baseSize = 274; // 基准内部尺寸 (280 - 6)
    const scale = innerSize / baseSize;

    // 绘制刻度
    if (showMarkers) {
      for (let i = 0; i < 60; i++) {
        const marker = document.createElement('div');
        const angleDeg = i * 6;
        const isHour = i % 5 === 0;
        const isMajor = i % 15 === 0;
        const markerLength = (isHour ? (isMajor ? 14 : 10) : 5) * scale;
        const markerWidth = (isHour ? (isMajor ? 3 : 2) : 1) * scale;

        marker.className = isHour ? ('hour-marker' + (isMajor ? ' major' : '')) : 'minute-marker';
        marker.style.cssText = `
          position: absolute;
          left: ${center}px;
          top: ${center}px;
          width: ${markerWidth}px;
          height: ${markerLength}px;
          transform-origin: center top;
          transform: translate(-50%, 0) rotate(${angleDeg}deg) translateY(${-radius}px);
          background: var(--clock-marks);
          border-radius: 1px;
        `;

        face.appendChild(marker);
      }
    }

    // 绘制数字
    if (showNumbers) {
      const numberRadius = showMarkers ? (radius - 24 * scale) : (radius - 10 * scale);
      const fontSize = Math.max(12, 15 * scale);
      
      for (let i = 1; i <= 12; i++) {
        const number = document.createElement('div');
        number.className = 'hour-number';
        number.textContent = i;

        const angle = (i * 30 - 90) * (Math.PI / 180);
        const x = center + numberRadius * Math.cos(angle);
        const y = center + numberRadius * Math.sin(angle);

        number.style.cssText = `
          position: absolute;
          left: ${x}px;
          top: ${y}px;
          transform: translate(-50%, -50%);
          font-size: ${fontSize}px;
          font-weight: 600;
          color: var(--clock-marks);
          font-family: Outfit, sans-serif;
        `;

        face.appendChild(number);
      }
    }
  }

  /**
   * 启动时钟
   */
  startClock() {
    this.updateClock();
    const interval = this.config.smoothSecond ? 100 : 1000;
    this.clockInterval = setInterval(() => this.updateClock(), interval);
  }

  /**
   * 更新时钟
   */
  updateClock() {
    const now = this.getCurrentTime();
    
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const milliseconds = now.getMilliseconds();

    const hourHand = domHelper.find('.hour-hand');
    const minuteHand = domHelper.find('.minute-hand');
    const secondHand = domHelper.find('.second-hand');

    if (hourHand && minuteHand && secondHand) {
      const hourDeg = (hours % 12) * 30 + minutes * 0.5;
      const minuteDeg = minutes * 6 + seconds * 0.1;
      let secondDeg;

      if (this.config.smoothSecond) {
        secondDeg = seconds * 6 + milliseconds * 0.006;
        secondHand.classList.add('smooth');
      } else {
        secondDeg = seconds * 6;
        secondHand.classList.remove('smooth');
      }

      hourHand.style.transform = `translateX(-50%) translateY(-100%) rotate(${hourDeg}deg)`;
      minuteHand.style.transform = `translateX(-50%) translateY(-100%) rotate(${minuteDeg}deg)`;
      
      if (this.config.showSecond) {
        secondHand.style.transform = `translateX(-50%) translateY(-100%) rotate(${secondDeg}deg)`;
        secondHand.style.display = 'block';
      } else {
        secondHand.style.display = 'none';
      }
    }

    if (seconds !== this.lastSecond) {
      this.lastSecond = seconds;
      this.updateDigitalDisplay(now);
    }
  }

  /**
   * 获取当前时区时间
   */
  getCurrentTime() {
    const now = new Date();
    if (this.timezone === Intl.DateTimeFormat().resolvedOptions().timeZone) {
      return now;
    }
    return new Date(now.toLocaleString('en-US', { timeZone: this.timezone }));
  }

  /**
   * 更新数字显示
   */
  updateDigitalDisplay(now) {
    const digitalTime = domHelper.find('#digital-time');
    const dateDisplay = domHelper.find('#date-display');
    const lunarDisplay = domHelper.find('#lunar-display');

    if (!digitalTime) return;

    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const pad = n => n.toString().padStart(2, '0');

    if (this.config.showDigital) {
      digitalTime.classList.remove('hidden');
      let displayHours = hours;
      let suffix = '';

      if (this.config.hourFormat === '12') {
        suffix = hours >= 12 ? ' PM' : ' AM';
        displayHours = hours % 12 || 12;
      }

      digitalTime.innerHTML = `${pad(displayHours)}:${pad(minutes)}:<span class="seconds">${pad(seconds)}</span>${suffix}`;
    } else {
      digitalTime.classList.add('hidden');
    }

    if (dateDisplay && this.config.showDate) {
      dateDisplay.classList.remove('hidden');
      const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
      const weekday = weekdays[now.getDay()];
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const day = now.getDate();
      dateDisplay.textContent = `${year}年${month}月${day}日 ${weekday}`;
    } else if (dateDisplay) {
      dateDisplay.classList.add('hidden');
    }

    // 农历显示
    if (lunarDisplay) {
      if (this.config.showLunar) {
        lunarDisplay.classList.remove('hidden');
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        const lunar = LunarCalendar.solar2lunar(year, month, day);
        if (lunar) {
          lunarDisplay.textContent = `${lunar.yearGanZhi}年（${lunar.animal}） ${lunar.monthStr}${lunar.dayStr}`;
        }
      } else {
        lunarDisplay.classList.add('hidden');
      }
    }

    // 节日显示
    const festivalDisplay = domHelper.find('#festival-display');
    if (festivalDisplay && this.config.showDate) {
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const day = now.getDate();
      const festival = LunarCalendar.getFestival(year, month, day);
      if (festival) {
        festivalDisplay.classList.remove('hidden');
        festivalDisplay.textContent = festival;
      } else {
        festivalDisplay.classList.add('hidden');
      }
    }
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    // 配置面板展开/收起
    const configHeader = domHelper.find('#config-header');
    const configPanel = domHelper.find('#config-panel');
    
    if (configHeader && configPanel) {
      domHelper.on(configHeader, 'click', () => {
        configPanel.classList.toggle('collapsed');
      });
    }

    // 时钟大小调整
    const clockSizeSlider = domHelper.find('#clock-size-range');
    const clockSizeValue = domHelper.find('#clock-size-value');
    
    if (clockSizeSlider && clockSizeValue) {
      domHelper.on(clockSizeSlider, 'input', (e) => {
        const size = parseInt(e.target.value);
        clockSizeValue.textContent = this.getSizeLabel(size);
        this.setConfig('clockSize', size);
      });
    }

    // Toggle开关事件
    domHelper.findAll('.toggle-switch').forEach(toggle => {
      domHelper.on(toggle, 'click', () => {
        toggle.classList.toggle('active');
        const configKey = toggle.dataset.config;
        const isActive = toggle.classList.contains('active');
        this.handleConfigChange(configKey, isActive);
      });
    });

    // 按钮组事件
    domHelper.findAll('.btn-option').forEach(btn => {
      domHelper.on(btn, 'click', () => {
        const parent = btn.parentElement;
        parent.querySelectorAll('.btn-option').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const configKey = btn.dataset.config;
        let value = btn.dataset.value;
        // 处理布尔值
        if (value === 'true') value = true;
        if (value === 'false') value = false;
        this.handleConfigChange(configKey, value);
      });
    });

    // 日历导航
    domHelper.findAll('.calendar-nav-btn').forEach(btn => {
      domHelper.on(btn, 'click', (e) => {
        const nav = parseInt(e.currentTarget.dataset.nav);
        this.navigateCalendar(nav);
      });
    });

    // 时区选择
    const timezoneSelect = domHelper.find('#timezone-select');
    if (timezoneSelect) {
      timezoneSelect.value = this.timezone;
      domHelper.on(timezoneSelect, 'change', (e) => {
        this.timezone = e.target.value;
        this.updateTimezoneDisplay();
      });
    }

    // 时区重置
    const timezoneResetBtn = domHelper.find('#timezone-reset-btn');
    if (timezoneResetBtn) {
      domHelper.on(timezoneResetBtn, 'click', () => {
        this.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const select = domHelper.find('#timezone-select');
        if (select) select.value = this.timezone;
        this.updateTimezoneDisplay();
      });
    }
  }

  /**
   * 更新时区显示
   */
  updateTimezoneDisplay() {
    const display = domHelper.find('#timezone-display');
    if (display) {
      display.textContent = this.timezone;
    }
  }

  /**
   * 处理配置变更
   */
  handleConfigChange(key, value) {
    this.config[key] = value;
    
    switch (key) {
      case 'smoothSecond':
        const secondHand = domHelper.find('#second-hand');
        if (secondHand) {
          secondHand.classList.toggle('smooth', value);
        }
        this.restartClock();
        break;
        
      case 'showSecond':
        const hand = domHelper.find('#second-hand');
        if (hand) hand.classList.toggle('hidden', !value);
        break;
        
      case 'showDigital':
      case 'showDate':
      case 'showLunar':
      case 'hourFormat':
        this.lastSecond = -1;
        this.updateDigitalDisplay(new Date());
        break;
        
      case 'showMarkers':
      case 'showNumbers':
        this.createClockFace();
        break;
        
      case 'showCalendar':
        const calendarWrapper = domHelper.find('#calendar-wrapper');
        if (calendarWrapper) {
          calendarWrapper.classList.toggle('hidden', !value);
          if (value) this.renderCalendar();
        }
        break;
        
      case 'showHoliday':
        const holidayContainer = domHelper.find('#holiday-countdown');
        if (holidayContainer) {
          holidayContainer.classList.toggle('hidden', !value);
        }
        break;
        
      case 'clockSize':
        this.updateClockSize();
        this.createClockFace();
        break;
    }
  }

  /**
   * 渲染节假日倒计时
   */
  renderHolidayCountdown() {
    const container = domHelper.find('#holiday-countdown');
    if (!container) return;

    const today = new Date();
    const year = today.getFullYear();

    // 中国法定节假日
    const holidays = [
      { name: '元旦', date: new Date(year, 0, 1), icon: '🎊' },
      { name: '春节', date: this.getLunarNewYear(year), icon: '🧧' },
      { name: '清明节', date: this.getQingming(year), icon: '🌿' },
      { name: '劳动节', date: new Date(year, 4, 1), icon: '💪' },
      { name: '端午节', date: this.getDuanwu(year), icon: '🐉' },
      { name: '中秋节', date: this.getZhongqiu(year), icon: '🥮' },
      { name: '国庆节', date: new Date(year, 9, 1), icon: '🇨🇳' }
    ];

    // 明年的节假日
    const nextYearHolidays = [
      { name: '元旦', date: new Date(year + 1, 0, 1), icon: '🎊' },
      { name: '春节', date: this.getLunarNewYear(year + 1), icon: '🧧' },
      { name: '清明节', date: this.getQingming(year + 1), icon: '🌿' },
      { name: '劳动节', date: new Date(year + 1, 4, 1), icon: '💪' },
      { name: '端午节', date: this.getDuanwu(year + 1), icon: '🐉' },
      { name: '中秋节', date: this.getZhongqiu(year + 1), icon: '🥮' },
      { name: '国庆节', date: new Date(year + 1, 9, 1), icon: '🇨🇳' }
    ];

    const allHolidays = [...holidays, ...nextYearHolidays];

    // 计算距离每个节日的天数
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const upcomingHolidays = allHolidays
      .map(h => {
        const holidayStart = new Date(h.date.getFullYear(), h.date.getMonth(), h.date.getDate());
        const diffTime = holidayStart - todayStart;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return { ...h, daysLeft: diffDays };
      })
      .filter(h => h.daysLeft >= 0)
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 7);

    if (upcomingHolidays.length === 0) {
      container.innerHTML = '<div class="holiday-empty">暂无即将到来的节假日</div>';
      return;
    }

    const nextHoliday = upcomingHolidays[0];
    const otherHolidays = upcomingHolidays.slice(1);

    let html = `
      <div class="holiday-section-title">法定节假日倒计时</div>
      <div class="holiday-next">
        <div class="holiday-next-info">
          <span class="holiday-next-icon">${nextHoliday.icon}</span>
          <div class="holiday-next-text">
            <div class="holiday-next-name">${nextHoliday.name}</div>
            <div class="holiday-next-date">${this.formatHolidayDate(nextHoliday.date)}</div>
          </div>
        </div>
        <div class="holiday-next-countdown">
          ${nextHoliday.daysLeft === 0 ? '<span class="holiday-today">今天!</span>' : `<span class="holiday-days">${nextHoliday.daysLeft}</span><span class="holiday-days-label">天</span>`}
        </div>
      </div>
    `;

    if (otherHolidays.length > 0) {
      html += '<div class="holiday-list">';
      otherHolidays.forEach(h => {
        html += `
          <div class="holiday-item">
            <span class="holiday-item-icon">${h.icon}</span>
            <span class="holiday-item-name">${h.name}</span>
            <span class="holiday-item-date">${this.formatHolidayDate(h.date)}</span>
            <span class="holiday-item-days">${h.daysLeft}天</span>
          </div>
        `;
      });
      html += '</div>';
    }

    container.innerHTML = html;
  }

  formatHolidayDate(date) {
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  }

  // 春节日期表
  getLunarNewYear(year) {
    const springFestivals = {
      2024: new Date(2024, 1, 10),
      2025: new Date(2025, 0, 29),
      2026: new Date(2026, 1, 17),
      2027: new Date(2027, 1, 6),
      2028: new Date(2028, 0, 26),
      2029: new Date(2029, 1, 13),
      2030: new Date(2030, 1, 3)
    };
    return springFestivals[year] || new Date(year, 1, 1);
  }

  // 清明节日期
  getQingming(year) {
    const qingmingDates = {
      2024: new Date(2024, 3, 4),
      2025: new Date(2025, 3, 4),
      2026: new Date(2026, 3, 5),
      2027: new Date(2027, 3, 5),
      2028: new Date(2028, 3, 4),
      2029: new Date(2029, 3, 4),
      2030: new Date(2030, 3, 5)
    };
    return qingmingDates[year] || new Date(year, 3, 5);
  }

  // 端午节日期
  getDuanwu(year) {
    const duanwuDates = {
      2024: new Date(2024, 5, 10),
      2025: new Date(2025, 4, 31),
      2026: new Date(2026, 5, 19),
      2027: new Date(2027, 5, 9),
      2028: new Date(2028, 4, 28),
      2029: new Date(2029, 5, 16),
      2030: new Date(2030, 5, 5)
    };
    return duanwuDates[year] || new Date(year, 5, 1);
  }

  // 中秋节日期
  getZhongqiu(year) {
    const zhongqiuDates = {
      2024: new Date(2024, 8, 17),
      2025: new Date(2025, 9, 6),
      2026: new Date(2026, 8, 25),
      2027: new Date(2027, 8, 15),
      2028: new Date(2028, 9, 3),
      2029: new Date(2029, 8, 22),
      2030: new Date(2030, 8, 12)
    };
    return zhongqiuDates[year] || new Date(year, 8, 15);
  }

  /**
   * 导航日历
   */
  navigateCalendar(direction) {
    if (direction === 0) {
      // 回到今天
      this.calendarYear = new Date().getFullYear();
      this.calendarMonth = new Date().getMonth() + 1;
    } else {
      this.calendarMonth += direction;
      if (this.calendarMonth > 12) {
        this.calendarMonth = 1;
        this.calendarYear++;
      } else if (this.calendarMonth < 1) {
        this.calendarMonth = 12;
        this.calendarYear--;
      }
    }
    this.renderCalendar();
  }

  /**
   * 渲染日历
   */
  renderCalendar() {
    const calendarGrid = domHelper.find('#calendar-grid');
    const calendarTitle = domHelper.find('#calendar-title');
    
    if (!calendarGrid || !calendarTitle) return;

    const year = this.calendarYear;
    const month = this.calendarMonth - 1; // JavaScript月份从0开始
    const now = new Date();
    
    calendarTitle.textContent = `${year}年${month + 1}月`;
    
    // 清空日历
    calendarGrid.innerHTML = '';
    
    // 添加星期标题
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    weekdays.forEach((day, index) => {
      const weekdayEl = document.createElement('div');
      weekdayEl.className = 'calendar-weekday' + (index === 0 || index === 6 ? ' weekend' : '');
      weekdayEl.textContent = day;
      calendarGrid.appendChild(weekdayEl);
    });
    
    // 获取月份第一天和最后一天
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // 生成日历天数
    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const dayEl = document.createElement('div');
      dayEl.className = 'calendar-day';
      
      // 公历日期
      const solarDay = document.createElement('div');
      solarDay.className = 'calendar-solar';
      solarDay.textContent = currentDate.getDate();
      dayEl.appendChild(solarDay);
      
      // 农历日期
      const lunar = LunarCalendar.solar2lunar(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        currentDate.getDate()
      );
      if (lunar) {
        const lunarDay = document.createElement('div');
        lunarDay.className = 'calendar-lunar';
        lunarDay.textContent = lunar.day === 1 ? lunar.monthStr : lunar.dayStr;
        dayEl.appendChild(lunarDay);
      }

      // 标记法定节假日调休
      const holidayStatus = LunarCalendar.getHolidayStatus(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        currentDate.getDate()
      );
      if (holidayStatus === 'holiday') {
        dayEl.classList.add('holiday');
      } else if (holidayStatus === 'workday') {
        dayEl.classList.add('workday');
      }
      
      // 标记今天
      if (currentDate.toDateString() === now.toDateString()) {
        dayEl.classList.add('today');
      }
      
      // 标记其他月份
      if (currentDate.getMonth() !== month) {
        dayEl.classList.add('other-month');
      }
      
      // 标记周末
      if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
        dayEl.classList.add('weekend');
      }
      
      calendarGrid.appendChild(dayEl);
    }
  }

  /**
   * 更新时钟大小
   */
  updateClockSize() {
    const clock = domHelper.find('.clock');
    if (clock) {
      clock.style.setProperty('--clock-size', this.config.clockSize + 'px');
    }
  }

  /**
   * 获取大小标签
   */
  getSizeLabel(size) {
    if (size <= 200) return '小';
    if (size <= 280) return '中';
    if (size <= 340) return '大';
    return '特大';
  }

  /**
   * 设置配置
   */
  setConfig(key, value) {
    this.config[key] = value;
    
    switch (key) {
      case 'clockSize':
        this.updateClockSize();
        this.createClockFace();
        break;
      case 'smoothSecond':
        this.restartClock();
        break;
      case 'showDigital':
      case 'showDate':
      case 'showLunar':
      case 'hourFormat':
        this.updateDigitalDisplay(new Date());
        break;
    }
  }

  /**
   * 重启时钟
   */
  restartClock() {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
    this.startClock();
  }

  /**
   * 销毁时钟
   */
  destroy() {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
    domHelper.empty(this.container);
  }
}
