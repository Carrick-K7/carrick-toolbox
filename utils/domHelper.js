/**
 * DOM操作辅助工具
 * 提供常用的DOM操作方法
 */

export const domHelper = {
  /**
   * 创建元素
   * @param {string} tag - 标签名
   * @param {string[]} classes - CSS类名数组
   * @param {Object} attributes - 属性对象
   * @param {string} text - 文本内容
   * @returns {HTMLElement}
   */
  create(tag, classes = [], attributes = {}, text = '') {
    const element = document.createElement(tag);
    
    if (classes.length > 0) {
      element.classList.add(...classes);
    }
    
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
    
    if (text) {
      element.textContent = text;
    }
    
    return element;
  },

  /**
   * 查找元素
   * @param {string} selector - CSS选择器
   * @param {HTMLElement} parent - 父元素，默认为document
   * @returns {HTMLElement|null}
   */
  find(selector, parent = document) {
    return parent.querySelector(selector);
  },

  /**
   * 查找所有元素
   * @param {string} selector - CSS选择器
   * @param {HTMLElement} parent - 父元素，默认为document
   * @returns {NodeList}
   */
  findAll(selector, parent = document) {
    return parent.querySelectorAll(selector);
  },

  /**
   * 添加事件监听
   * @param {HTMLElement} element - 目标元素
   * @param {string} event - 事件类型
   * @param {Function} handler - 事件处理函数
   * @param {Object} options - 事件选项
   */
  on(element, event, handler, options = {}) {
    element.addEventListener(event, handler, options);
  },

  /**
   * 移除事件监听
   * @param {HTMLElement} element - 目标元素
   * @param {string} event - 事件类型
   * @param {Function} handler - 事件处理函数
   */
  off(element, event, handler) {
    element.removeEventListener(event, handler);
  },

  /**
   * 显示元素
   * @param {HTMLElement} element - 目标元素
   */
  show(element) {
    element.style.display = '';
  },

  /**
   * 隐藏元素
   * @param {HTMLElement} element - 目标元素
   */
  hide(element) {
    element.style.display = 'none';
  },

  /**
   * 切换元素显示状态
   * @param {HTMLElement} element - 目标元素
   */
  toggle(element) {
    const isVisible = element.style.display !== 'none';
    element.style.display = isVisible ? 'none' : '';
  },

  /**
   * 添加CSS类
   * @param {HTMLElement} element - 目标元素
   * @param {string} className - CSS类名
   */
  addClass(element, className) {
    element.classList.add(className);
  },

  /**
   * 移除CSS类
   * @param {HTMLElement} element - 目标元素
   * @param {string} className - CSS类名
   */
  removeClass(element, className) {
    element.classList.remove(className);
  },

  /**
   * 切换CSS类
   * @param {HTMLElement} element - 目标元素
   * @param {string} className - CSS类名
   */
  toggleClass(element, className) {
    element.classList.toggle(className);
  },

  /**
   * 检查是否包含CSS类
   * @param {HTMLElement} element - 目标元素
   * @param {string} className - CSS类名
   * @returns {boolean}
   */
  hasClass(element, className) {
    return element.classList.contains(className);
  },

  /**
   * 清空元素内容
   * @param {HTMLElement} element - 目标元素
   */
  empty(element) {
    element.innerHTML = '';
  },

  /**
   * 设置HTML内容
   * @param {HTMLElement} element - 目标元素
   * @param {string} html - HTML内容
   */
  html(element, html) {
    element.innerHTML = html;
  },

  /**
   * 获取元素尺寸
   * @param {HTMLElement} element - 目标元素
   * @returns {Object} {width, height}
   */
  getSize(element) {
    const rect = element.getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height
    };
  },

  /**
   * 检查元素是否在视口中
   * @param {HTMLElement} element - 目标元素
   * @returns {boolean}
   */
  isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth
    );
  }
};
