/**
 * Carrick UI - useTheme Composable (JavaScript Version)
 * 主题管理 - 支持: light | dark | cyberpunk | system
 */

// 主题配置映射
const themeConfigs = {
  light: {
    name: 'light',
    icon: 'Sun',
    label: '亮色'
  },
  dark: {
    name: 'dark',
    icon: 'Moon',
    label: '暗色'
  },
  cyberpunk: {
    name: 'cyberpunk',
    icon: 'Sparkles',
    label: '赛博朋克'
  },
  system: {
    name: 'system',
    icon: 'Monitor',
    label: '跟随系统'
  }
};

// Storage key
const STORAGE_KEY = 'carrick-theme';

// 当前主题状态
let currentTheme = 'system';
let isInitialized = false;
let listeners = [];

/**
 * 获取系统偏好主题
 */
function getSystemTheme() {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * 应用主题到 DOM
 */
function applyTheme(theme) {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  
  if (theme === 'system') {
    // 跟随系统 - 移除 data-theme 属性
    root.removeAttribute('data-theme');
  } else {
    // 设置指定主题
    root.setAttribute('data-theme', theme);
  }
  
  // 同步更新 body class (兼容旧代码)
  document.body.classList.remove('dark');
  const effectiveTheme = getEffectiveTheme(theme);
  if (effectiveTheme === 'dark' || effectiveTheme === 'cyberpunk') {
    document.body.classList.add('dark');
  }
}

/**
 * 获取实际生效的主题（system 会解析为 light/dark）
 */
function getEffectiveTheme(theme) {
  if (theme === 'system') {
    return getSystemTheme();
  }
  return theme;
}

/**
 * 保存主题到 localStorage
 */
function saveTheme(theme) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, theme);
}

/**
 * 从 localStorage 读取主题
 */
function loadTheme() {
  if (typeof localStorage === 'undefined') return null;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && ['light', 'dark', 'cyberpunk', 'system'].includes(saved)) {
    return saved;
  }
  return null;
}

/**
 * 通知所有监听器
 */
function notifyListeners() {
  const state = {
    currentTheme,
    effectiveTheme: getEffectiveTheme(currentTheme),
    isDark: isDarkMode(),
    config: themeConfigs[currentTheme]
  };
  listeners.forEach(fn => fn(state));
}

/**
 * 是否暗色模式
 */
function isDarkMode() {
  const effective = getEffectiveTheme(currentTheme);
  return effective === 'dark' || effective === 'cyberpunk';
}

/**
 * 初始化主题
 */
function initTheme() {
  if (typeof window === 'undefined') return;
  if (isInitialized) return;
  
  // 尝试从 localStorage 读取
  const saved = loadTheme();
  if (saved) {
    currentTheme = saved;
  }
  
  // 应用主题
  applyTheme(currentTheme);
  isInitialized = true;
  
  // 监听系统主题变化
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', () => {
    if (currentTheme === 'system') {
      // 跟随系统模式下，重新应用以触发系统主题变化
      applyTheme('system');
      notifyListeners();
    }
  });
  
  notifyListeners();
}

/**
 * 设置主题
 */
function setTheme(theme) {
  currentTheme = theme;
  applyTheme(theme);
  saveTheme(theme);
  notifyListeners();
}

/**
 * 切换到下一个主题
 */
function toggleTheme() {
  const themes = ['light', 'dark', 'cyberpunk', 'system'];
  const currentIndex = themes.indexOf(currentTheme);
  const nextIndex = (currentIndex + 1) % themes.length;
  setTheme(themes[nextIndex]);
}

/**
 * 订阅主题变化
 */
function onThemeChange(fn) {
  listeners.push(fn);
  // 立即返回当前状态
  fn({
    currentTheme,
    effectiveTheme: getEffectiveTheme(currentTheme),
    isDark: isDarkMode(),
    config: themeConfigs[currentTheme]
  });
  return () => {
    listeners = listeners.filter(l => l !== fn);
  };
}

/**
 * 获取当前主题状态
 */
function getThemeState() {
  return {
    currentTheme,
    effectiveTheme: getEffectiveTheme(currentTheme),
    isDark: isDarkMode(),
    config: themeConfigs[currentTheme],
    availableThemes: Object.entries(themeConfigs).map(([key, config]) => ({
      value: key,
      ...config
    }))
  };
}

// 导出主题管理 API
export {
  initTheme,
  setTheme,
  toggleTheme,
  onThemeChange,
  getThemeState,
  getEffectiveTheme,
  isDarkMode,
  themeConfigs,
  STORAGE_KEY
};

// 默认导出
export default {
  initTheme,
  setTheme,
  toggleTheme,
  onThemeChange,
  getThemeState,
  getEffectiveTheme,
  isDarkMode,
  themeConfigs,
  STORAGE_KEY
};
