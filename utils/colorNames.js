/**
 * 颜色名称查询工具
 * 使用 color-name-list 进行精确匹配
 */

// 从 npm 包导入颜色列表（使用命名导出）
import { colornames } from '../node_modules/color-name-list/dist/colornames.esm.js';

/**
 * 根据HEX值查询颜色名称（精确匹配）
 * @param {string} hex - HEX颜色值（如 #39C5BB）
 * @returns {string} - 颜色名称，如果没有精确匹配则返回空字符串
 */
export function getColorName(hex) {
  // 标准化HEX格式（统一转为小写，去掉#号）
  const normalizedHex = hex.toLowerCase().replace(/^#/, '');
  
  // 在color-name-list中查找精确匹配（color-name-list的hex值是小写带#的）
  const color = colornames.find(c => c.hex.toLowerCase().replace(/^#/, '') === normalizedHex);
  
  return color ? color.name : '';
}

/**
 * 获取所有颜色列表
 * @returns {Array} - 颜色列表
 */
export function getAllColors() {
  return colornames;
}
