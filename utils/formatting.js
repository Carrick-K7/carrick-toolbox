/**
 * 格式化工具
 * 提供常用的数据格式化方法
 */

export const formatting = {
  /**
   * 格式化数字
   * @param {number} num - 数字
   * @param {number} decimals - 小数位数
   * @returns {string}
   */
  number(num, decimals = 2) {
    return num.toFixed(decimals);
  },

  /**
   * 格式化货币
   * @param {number} amount - 金额
   * @param {string} currency - 货币代码
   * @param {string} locale - 地区代码
   * @returns {string}
   */
  currency(amount, currency = 'CNY', locale = 'zh-CN') {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount);
  },

  /**
   * 格式化日期时间
   * @param {Date} date - 日期对象
   * @param {string} format - 格式字符串
   * @returns {string}
   */
  dateTime(date, format = 'YYYY-MM-DD HH:mm:ss') {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  },

  /**
   * 格式化时间戳
   * @param {number} timestamp - 时间戳
   * @returns {string}
   */
  timestamp(timestamp) {
    return this.dateTime(new Date(timestamp));
  },

  /**
   * 格式化文件大小
   * @param {number} bytes - 字节数
   * @returns {string}
   */
  fileSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${this.number(size, 2)} ${units[unitIndex]}`;
  },

  /**
   * 格式化百分比
   * @param {number} value - 数值
   * @param {number} total - 总数
   * @param {number} decimals - 小数位数
   * @returns {string}
   */
  percentage(value, total, decimals = 2) {
    const percentage = (value / total) * 100;
    return `${this.number(percentage, decimals)}%`;
  },

  /**
   * 格式化持续时间
   * @param {number} milliseconds - 毫秒数
   * @returns {string}
   */
  duration(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}天 ${hours % 24}小时 ${minutes % 60}分钟`;
    } else if (hours > 0) {
      return `${hours}小时 ${minutes % 60}分钟`;
    } else if (minutes > 0) {
      return `${minutes}分钟 ${seconds % 60}秒`;
    } else {
      return `${seconds}秒`;
    }
  },

  /**
   * 格式化相对时间
   * @param {Date} date - 日期
   * @returns {string}
   */
  relativeTime(date) {
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}天前`;
    } else if (hours > 0) {
      return `${hours}小时前`;
    } else if (minutes > 0) {
      return `${minutes}分钟前`;
    } else {
      return '刚刚';
    }
  },

  /**
   * 格式化电话号码
   * @param {string} phone - 电话号码
   * @returns {string}
   */
  phoneNumber(phone) {
    // 移除所有非数字字符
    const cleaned = phone.replace(/\D/g, '');
    
    // 中国手机号格式化
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    }
    
    return phone;
  },

  /**
   * 格式化URL
   * @param {string} url - URL地址
   * @param {number} maxLength - 最大长度
   * @returns {string}
   */
  url(url, maxLength = 50) {
    if (url.length <= maxLength) {
      return url;
    }
    
    return url.substring(0, maxLength - 3) + '...';
  },

  /**
   * 格式化文本截断
   * @param {string} text - 文本
   * @param {number} maxLength - 最大长度
   * @param {string} suffix - 后缀
   * @returns {string}
   */
  truncate(text, maxLength = 100, suffix = '...') {
    if (text.length <= maxLength) {
      return text;
    }
    
    return text.substring(0, maxLength - suffix.length) + suffix;
  },

  /**
   * 格式化首字母大写
   * @param {string} text - 文本
   * @returns {string}
   */
  capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  },

  /**
   * 格式化驼峰转下划线
   * @param {string} text - 驼峰文本
   * @returns {string}
   */
  camelToSnake(text) {
    return text.replace(/([A-Z])/g, '_$1').toLowerCase();
  },

  /**
   * 格式化下划线转驼峰
   * @param {string} text - 下划线文本
   * @returns {string}
   */
  snakeToCamel(text) {
    return text.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }
};
