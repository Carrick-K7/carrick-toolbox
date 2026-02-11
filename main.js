/**
 * Carrick Toolbox - 核心调度逻辑
 * 负责路由管理、工具加载和事件协调
 */

import { domHelper } from './utils/domHelper.js';

class ToolboxApp {
  constructor() {
    this.currentTool = null;
    this.tools = new Map();
    this.container = null;
    this.sidebar = null;
    this.isInitialized = false;
    this.usageStats = this.loadUsageStats();
  }

  /**
   * 加载使用统计
   */
  loadUsageStats() {
    try {
      const saved = localStorage.getItem('toolbox_usage_stats');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load usage stats:', e);
    }
    return {};
  }

  /**
   * 保存使用统计
   */
  saveUsageStats() {
    try {
      localStorage.setItem('toolbox_usage_stats', JSON.stringify(this.usageStats));
    } catch (e) {
      console.error('Failed to save usage stats:', e);
    }
  }

  /**
   * 记录工具使用
   */
  recordToolUsage(toolId) {
    if (!this.usageStats[toolId]) {
      this.usageStats[toolId] = { count: 0, lastUsed: null };
    }
    this.usageStats[toolId].count++;
    this.usageStats[toolId].lastUsed = new Date().toISOString();
    this.saveUsageStats();
    this.updateStatsPanel();
  }

  /**
   * 获取使用统计
   */
  getUsageStats() {
    const stats = [];
    for (const [toolId, toolConfig] of this.tools) {
      const usage = this.usageStats[toolId] || { count: 0, lastUsed: null };
      stats.push({
        id: toolId,
        name: toolConfig.name,
        count: usage.count,
        lastUsed: usage.lastUsed
      });
    }
    return stats.sort((a, b) => b.count - a.count);
  }

  /**
   * 初始化应用
   */
  async init() {
    if (this.isInitialized) return;

    // 获取DOM元素
    this.container = domHelper.find('#tool-container');
    this.sidebar = domHelper.find('.sidebar');

    if (!this.container) {
      throw new Error('Tool container not found');
    }

    // 注册工具
    await this.registerTools();

    // 绑定导航事件
    this.bindNavigation();

    // 加载默认工具
    const defaultTool = 'analog-clock';
    await this.loadTool(defaultTool);

    // 绑定主题切换
    this.bindThemeToggle();

    // 绑定移动端菜单
    this.bindMobileMenu();

    // 渲染使用统计面板
    this.renderStatsPanel();

    this.isInitialized = true;
    console.log('Carrick Toolbox initialized');
  }

  /**
   * 注册所有工具
   */
  async registerTools() {
    const toolConfigs = [
      {
        id: 'analog-clock',
        name: '模拟时钟',
        icon: 'clock',
        category: 'time-tools',
        module: () => import('./tools/clock/index.js')
      },
      {
        id: 'time-converter',
        name: '时间转换',
        icon: 'clock',
        category: 'time-tools',
        module: () => import('./tools/time-converter/index.js')
      },
      {
        id: 'color-converter',
        name: '颜色转换',
        icon: 'palette',
        category: 'design-tools',
        module: () => import('./tools/color-converter/index.js')
      },
      {
        id: 'currency-converter',
        name: '货币转换',
        icon: 'dollar-sign',
        category: 'finance-tools',
        module: () => import('./tools/currency-converter/index.js')
      },
      {
        id: 'markdown',
        name: 'Markdown编辑器',
        icon: 'edit',
        category: 'writing-tools',
        module: () => import('./tools/markdown/index.js')
      },
      {
        id: 'json-formatter',
        name: 'JSON格式化',
        icon: 'brackets-curly',
        category: 'developer-tools',
        module: () => import('./tools/json-formatter/index.js')
      },
      {
        id: 'regex-tester',
        name: '正则测试',
        icon: 'code',
        category: 'developer-tools',
        module: () => import('./tools/regex-tester/index.js')
      },
      {
        id: 'base64-converter',
        name: 'Base64编解码',
        icon: 'exchange-alt',
        category: 'developer-tools',
        module: () => import('./tools/base64-converter/index.js')
      },
      {
        id: 'password-generator',
        name: '密码生成器',
        icon: 'key',
        category: 'security-tools',
        module: () => import('./tools/password-generator/index.js')
      }
    ];

    for (const config of toolConfigs) {
      this.tools.set(config.id, config);
    }
  }

  /**
   * 绑定导航事件
   */
  bindNavigation() {
    // 工具切换事件
    domHelper.findAll('.tool-item').forEach(item => {
      domHelper.on(item, 'click', async (e) => {
        e.preventDefault();
        const toolId = item.dataset.tool;
        if (toolId) {
          await this.loadTool(toolId);
          
          // 更新激活状态
          domHelper.findAll('.tool-item').forEach(i => domHelper.removeClass(i, 'active'));
          domHelper.addClass(item, 'active');
        }
      });
    });

    // 二级菜单展开/收起
    domHelper.findAll('.category-header').forEach(header => {
      domHelper.on(header, 'click', (e) => {
        e.stopPropagation();
        const category = header.parentElement;
        domHelper.toggleClass(category, 'expanded');
      });
    });

    // 侧边栏收起/展开
    const sidebarToggle = domHelper.find('.sidebar-toggle');
    if (sidebarToggle) {
      domHelper.on(sidebarToggle, 'click', () => {
        domHelper.toggleClass(this.sidebar, 'collapsed');
        domHelper.toggleClass(this.container.parentElement, 'expanded');
      });
    }
  }

  /**
   * 更新导航状态
   */
  updateActiveNavigation(toolId) {
    // 移除所有active状态
    domHelper.findAll('.tool-item').forEach(item => {
      domHelper.removeClass(item, 'active');
    });

    // 添加当前active状态
    const currentItem = domHelper.find(`[data-tool="${toolId}"]`);
    if (currentItem) {
      domHelper.addClass(currentItem, 'active');
    }

    // 更新URL hash
    window.location.hash = toolId;
  }

  /**
   * 加载工具
   */
  async loadTool(toolId) {
    const toolConfig = this.tools.get(toolId);
    if (!toolConfig) {
      console.error(`Tool ${toolId} not found`);
      return;
    }

    // 如果正在切换，先添加退出动画
    if (this.currentTool && this.currentTool !== toolId) {
      await this.animateToolTransition('out');
    }

    try {
      // 显示加载状态
      this.showLoading();

      // 卸载当前工具
      if (this.currentTool) {
        await this.unloadCurrentTool();
      }

      // 动态导入工具模块
      const toolModule = await toolConfig.module();
      const ToolClass = toolModule.default;

      // 创建工具实例
      const toolInstance = new ToolClass(this.container);
      
      // 初始化工具
      await toolInstance.init();

      // 添加入场动画
      this.animateToolTransition('in');

      // 更新当前工具
      this.currentTool = toolId;
      this.currentToolInstance = toolInstance;

      // 记录使用统计
      this.recordToolUsage(toolId);

      // 更新导航状态
      this.updateActiveNavigation(toolId);

      // 隐藏加载状态
      this.hideLoading();

      console.log(`Tool ${toolId} loaded successfully`);

    } catch (error) {
      console.error(`Failed to load tool ${toolId}:`, error);
      
      // 检查是否是模块未找到错误（功能未实现）
      if (error.message.includes('Failed to fetch') || error.message.includes('Cannot find module')) {
        this.showUnderDevelopment(toolConfig.name);
      } else {
        this.showError(`加载工具失败: ${error.message}`);
      }
    }
  }

  /**
   * 卸载当前工具
   */
  async unloadCurrentTool() {
    if (this.currentToolInstance) {
      try {
        if (typeof this.currentToolInstance.destroy === 'function') {
          await this.currentToolInstance.destroy();
        }
        this.currentToolInstance = null;
      } catch (error) {
        console.error('Error unloading current tool:', error);
      }
    }

    // 清空容器
    domHelper.empty(this.container);
  }


  /**
   * 显示加载状态
   */
  showLoading() {
    domHelper.html(this.container, `
      <div class="loading">
        正在加载工具...
      </div>
    `);
  }

  /**
   * 隐藏加载状态
   */
  hideLoading() {
    const loading = domHelper.find('.loading', this.container);
    if (loading) {
      domHelper.hide(loading);
    }
  }

  /**
   * 显示错误信息
   */
  showError(message) {
    domHelper.html(this.container, `
      <div class="error-message">
        <h3>加载失败</h3>
        <p>${message}</p>
        <button onclick="location.reload()">重新加载</button>
      </div>
    `);
  }

  /**
   * 显示开发中提示
   */
  showUnderDevelopment(toolName) {
    domHelper.html(this.container, `
      <div class="under-development">
        <div class="dev-icon">
          <i class="fas fa-code"></i>
        </div>
        <h2>${toolName}</h2>
        <p class="dev-status">功能开发中，敬请期待</p>
        <p class="dev-hint">该工具正在紧张开发中，即将上线</p>
        <div class="dev-progress">
          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>
        </div>
      </div>
    `);
  }

  /**
   * 绑定主题切换
   */
  bindThemeToggle() {
    const themeToggle = domHelper.find('.theme-toggle');
    if (themeToggle) {
      domHelper.on(themeToggle, 'click', () => {
        const isDark = domHelper.hasClass(document.body, 'dark');
        if (isDark) {
          domHelper.removeClass(document.body, 'dark');
          localStorage.setItem('theme', 'light');
        } else {
          domHelper.addClass(document.body, 'dark');
          localStorage.setItem('theme', 'dark');
        }
      });

      // 恢复主题设置
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') {
        domHelper.addClass(document.body, 'dark');
      }
    }
  }

  /**
   * 绑定移动端菜单
   */
  bindMobileMenu() {
    const mobileToggle = domHelper.find('.mobile-menu-toggle');
    if (mobileToggle) {
      domHelper.on(mobileToggle, 'click', () => {
        domHelper.toggleClass(this.sidebar, 'mobile-open');
      });
    }

    // 点击外部关闭菜单
    domHelper.on(document, 'click', (e) => {
      if (window.innerWidth <= 768 && 
          !this.sidebar.contains(e.target) && 
          !mobileToggle.contains(e.target)) {
        domHelper.removeClass(this.sidebar, 'mobile-open');
      }
    });
  }

  /**
   * 获取当前工具
   */
  getCurrentTool() {
    return this.currentTool;
  }

  /**
   * 重新加载当前工具
   */
  async reloadCurrentTool() {
    if (this.currentTool) {
      await this.loadTool(this.currentTool);
    }
  }

  /**
   * 工具切换动画
   */
  async animateToolTransition(direction) {
    return new Promise((resolve) => {
      const container = this.container;
      if (!container) {
        resolve();
        return;
      }

      if (direction === 'out') {
        container.style.opacity = '1';
        container.style.transform = 'translateX(0)';
        container.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
        
        requestAnimationFrame(() => {
          container.style.opacity = '0';
          container.style.transform = 'translateX(-20px)';
          setTimeout(resolve, 200);
        });
      } else {
        container.style.opacity = '0';
        container.style.transform = 'translateX(20px)';
        container.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        
        requestAnimationFrame(() => {
          container.style.opacity = '1';
          container.style.transform = 'translateX(0)';
          setTimeout(resolve, 300);
        });
      }
    });
  }

  /**
   * 渲染使用统计面板
   */
  renderStatsPanel() {
    const sidebar = this.sidebar;
    if (!sidebar) return;

    // 检查是否已存在
    let statsPanel = sidebar.querySelector('.usage-stats-panel');
    if (statsPanel) {
      statsPanel.remove();
    }

    statsPanel = document.createElement('div');
    statsPanel.className = 'usage-stats-panel';
    statsPanel.innerHTML = `
      <div class="stats-header" id="stats-toggle">
        <i class="fas fa-chart-bar"></i>
        <span>使用统计</span>
        <i class="fas fa-chevron-down stats-toggle-icon"></i>
      </div>
      <div class="stats-content" id="stats-content">
        <div class="stats-list" id="stats-list"></div>
        <div class="stats-total" id="stats-total"></div>
      </div>
    `;

    const footer = sidebar.querySelector('.sidebar-footer');
    if (footer) {
      sidebar.insertBefore(statsPanel, footer);
    } else {
      sidebar.appendChild(statsPanel);
    }

    // 绑定展开/收起
    const toggle = statsPanel.querySelector('#stats-toggle');
    const content = statsPanel.querySelector('#stats-content');
    const icon = statsPanel.querySelector('.stats-toggle-icon');
    
    // 默认收起
    let isExpanded = false;
    
    toggle.addEventListener('click', () => {
      isExpanded = !isExpanded;
      content.classList.toggle('expanded', isExpanded);
      icon.style.transform = isExpanded ? 'rotate(180deg)' : 'rotate(0deg)';
    });

    this.updateStatsPanel();
  }

  /**
   * 更新使用统计面板
   */
  updateStatsPanel() {
    const statsPanel = this.sidebar?.querySelector('.usage-stats-panel');
    if (!statsPanel) return;

    const statsList = statsPanel.querySelector('#stats-list');
    const statsTotal = statsPanel.querySelector('#stats-total');
    
    const stats = this.getUsageStats();
    const totalUsage = stats.reduce((sum, s) => sum + s.count, 0);

    if (stats.length === 0 || totalUsage === 0) {
      statsList.innerHTML = '<div class="stats-empty">暂无使用记录</div>';
      statsTotal.innerHTML = '';
      return;
    }

    // 只显示前5个使用最多的工具
    const topStats = stats.slice(0, 5);
    const maxCount = Math.max(...topStats.map(s => s.count));

    statsList.innerHTML = topStats.map(stat => {
      const percentage = maxCount > 0 ? (stat.count / maxCount) * 100 : 0;
      const isActive = stat.id === this.currentTool;
      return `
        <div class="stats-item ${isActive ? 'active' : ''}" data-tool="${stat.id}">
          <div class="stats-item-info">
            <span class="stats-item-name">${stat.name}</span>
            <span class="stats-item-count">${stat.count}次</span>
          </div>
          <div class="stats-bar">
            <div class="stats-bar-fill" style="width: ${percentage}%"></div>
          </div>
        </div>
      `;
    }).join('');

    statsTotal.innerHTML = `
      <div class="stats-total-label">总使用次数</div>
      <div class="stats-total-value">${totalUsage}</div>
    `;

    // 点击统计项切换到对应工具
    statsList.querySelectorAll('.stats-item').forEach(item => {
      item.addEventListener('click', () => {
        const toolId = item.dataset.tool;
        if (toolId && toolId !== this.currentTool) {
          this.loadTool(toolId);
        }
      });
    });
  }
}

// 创建应用实例
const app = new ToolboxApp();

// DOM加载完成后初始化
domHelper.on(document, 'DOMContentLoaded', () => {
  app.init().catch(error => {
    console.error('Failed to initialize app:', error);
  });
});

// 处理浏览器后退/前进
window.addEventListener('hashchange', () => {
  const hash = window.location.hash.slice(1);
  if (hash && hash !== app.getCurrentTool()) {
    app.loadTool(hash);
  }
});

// 导出应用实例
export default app;
