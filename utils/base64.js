/**
 * Base64 编码/解码工具
 */

export const Base64 = {
  /**
   * 将字符串编码为 Base64
   * @param {string} str - 要编码的字符串
   * @param {Object} options - 选项
   * @param {boolean} options.urlSafe - 是否使用 URL 安全字符
   * @returns {string}
   */
  encode(str, options = {}) {
    if (str === '') return '';
    
    const { urlSafe = false } = options;
    
    // 使用 TextEncoder 处理 Unicode
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    
    let result = this.encodeBinary(bytes);
    
    if (urlSafe) {
      result = result.replace(/\+/g, '-')
                     .replace(/\//g, '_')
                     .replace(/=/g, '');
    }
    
    return result;
  },

  /**
   * 将 Base64 解码为字符串
   * @param {string} base64 - Base64 字符串
   * @param {Object} options - 选项
   * @param {boolean} options.urlSafe - 是否使用 URL 安全字符
   * @returns {string}
   */
  decode(base64, options = {}) {
    if (base64 === '') return '';
    
    const { urlSafe = false } = options;
    
    if (urlSafe) {
      base64 = base64.replace(/-/g, '+')
                     .replace(/_/g, '/');
    }
    
    // 添加填充
    const padding = base64.length % 4;
    if (padding) {
      base64 += '='.repeat(4 - padding);
    }
    
    const bytes = this.decodeBinary(base64);
    
    // 使用 TextDecoder 处理 Unicode
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(bytes);
  },

  /**
   * 将 Uint8Array 编码为 Base64
   * @param {Uint8Array} bytes - 字节数组
   * @returns {string}
   */
  encodeBinary(bytes) {
    if (bytes.length === 0) return '';
    
    const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    let i = 0;
    
    while (i < bytes.length) {
      // 读取三个字节
      const byte1 = bytes[i++];
      const byte2 = i < bytes.length ? bytes[i++] : null;
      const byte3 = i < bytes.length ? bytes[i++] : null;
      
      // 编码为四个 Base64 字符
      const index1 = byte1 >> 2;
      const index2 = ((byte1 & 0x03) << 4) | (byte2 !== null ? (byte2 >> 4) : 0);
      const index3 = byte2 !== null ? ((byte2 & 0x0F) << 2) | (byte3 !== null ? (byte3 >> 6) : 0) : null;
      const index4 = byte3 !== null ? (byte3 & 0x3F) : null;
      
      result += base64Chars[index1];
      result += base64Chars[index2];
      result += index3 !== null ? base64Chars[index3] : '=';
      result += index4 !== null ? base64Chars[index4] : '=';
    }
    
    return result;
  },

  /**
   * 将 Base64 解码为 Uint8Array
   * @param {string} base64 - Base64 字符串
   * @returns {Uint8Array}
   */
  decodeBinary(base64) {
    if (base64 === '') return new Uint8Array(0);
    
    // 验证 Base64
    if (!this.isValid(base64)) {
      throw new Error('Invalid Base64 string');
    }
    
    const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const charMap = {};
    for (let i = 0; i < base64Chars.length; i++) {
      charMap[base64Chars[i]] = i;
    }
    
    // 移除填充
    let cleanBase64 = base64.replace(/=+$/, '');
    
    const result = [];
    let i = 0;
    
    while (i < cleanBase64.length) {
      // 读取四个字符
      const char1 = cleanBase64[i++];
      const char2 = cleanBase64[i++];
      const char3 = cleanBase64[i++];
      const char4 = cleanBase64[i++];
      
      const index1 = charMap[char1];
      const index2 = charMap[char2];
      const index3 = char3 ? charMap[char3] : 0;
      const index4 = char4 ? charMap[char4] : 0;
      
      // 解码为三个字节
      const byte1 = (index1 << 2) | (index2 >> 4);
      const byte2 = ((index2 & 0x0F) << 4) | (index3 >> 2);
      const byte3 = ((index3 & 0x03) << 6) | index4;
      
      result.push(byte1);
      if (char3 && char3 !== '=') result.push(byte2);
      if (char4 && char4 !== '=') result.push(byte3);
    }
    
    return new Uint8Array(result);
  },

  /**
   * 验证 Base64 字符串
   * @param {string} str - 要验证的字符串
   * @param {Object} options - 选项
   * @param {boolean} options.urlSafe - 是否使用 URL 安全字符
   * @returns {boolean}
   */
  isValid(str, options = {}) {
    if (!str || typeof str !== 'string') return false;
    
    const { urlSafe = false } = options;
    
    if (urlSafe) {
      // URL 安全的 Base64 不使用 +/=，使用 -_ 替代
      return /^[A-Za-z0-9_-]*$/.test(str);
    }
    
    // 标准 Base64
    // 长度必须是 4 的倍数（有填充时）
    if (str.length % 4 !== 0 && !str.match(/={1,2}$/)) {
      // 如果没有填充，长度模 4 可以是 2 或 3
      const mod = str.length % 4;
      if (mod === 1) return false;
    }
    
    // 检查字符集
    return /^[A-Za-z0-9+/]*={0,2}$/.test(str);
  }
};

export default Base64;
