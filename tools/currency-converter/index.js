/**
 * 货币转换器工具
 */

import { domHelper } from '../../utils/domHelper.js';

export default class CurrencyConverter {
  constructor(container) {
    this.container = container;
    this.defaultRates = {
      EUR: 1,
      USD: 1.08,
      CNY: 7.85,
      JPY: 162.5,
      GBP: 0.85,
      HKD: 8.45,
      KRW: 1445,
      SGD: 1.45,
      AUD: 1.65,
      CAD: 1.48
    };
    this.rates = { ...this.defaultRates };
    this.currencies = [
      { code: 'CNY', name: '人民币', symbol: '¥' },
      { code: 'USD', name: '美元', symbol: '$' },
      { code: 'EUR', name: '欧元', symbol: '€' },
      { code: 'JPY', name: '日元', symbol: '¥' },
      { code: 'GBP', name: '英镑', symbol: '£' },
      { code: 'HKD', name: '港币', symbol: 'HK$' },
      { code: 'KRW', name: '韩元', symbol: '₩' },
      { code: 'SGD', name: '新加坡元', symbol: 'S$' },
      { code: 'AUD', name: '澳元', symbol: 'A$' },
      { code: 'CAD', name: '加元', symbol: 'C$' }
    ];
    this.fromCurrency = 'CNY';
    this.toCurrency = 'USD';
    this.amount = 1;
    this.config = {
      showRateInfo: true,
      showBidirectional: true,
      showQuickReference: true,
      showDataSource: true
    };
  }

  async init() {
    this.render();
    this.bindEvents();
    this.convert();
  }

  render() {
    const fromOptions = this.currencies.map(c => 
      `<option value="${c.code}" ${c.code === this.fromCurrency ? 'selected' : ''}>${c.name} (${c.code})</option>`
    ).join('');
    
    const toOptions = this.currencies.map(c => 
      `<option value="${c.code}" ${c.code === this.toCurrency ? 'selected' : ''}>${c.name} (${c.code})</option>`
    ).join('');

    this.container.innerHTML = `
      <div class="currency-converter">
        <div class="currency-main">
          <div class="currency-input-section">
            <div class="currency-label">金额</div>
            <div class="currency-input-row">
              <input type="number" class="currency-amount" id="amount-input" value="${this.amount}">
              <select class="currency-select" id="from-currency">${fromOptions}</select>
            </div>
          </div>
          
          <button class="currency-swap-btn" id="swap-btn" title="交换货币">
            <i class="fas fa-exchange-alt"></i>
          </button>
          
          <div class="currency-input-section">
            <div class="currency-label">转换为</div>
            <div class="currency-input-row">
              <input type="text" class="currency-result" id="result-input" readonly>
              <select class="currency-select" id="to-currency">${toOptions}</select>
            </div>
          </div>
        </div>
        
        <div class="currency-rate-info" id="rate-info"></div>
        
        <div class="currency-list" id="currency-list"></div>

        <div class="currency-data-source" id="data-source">
          <i class="fas fa-info-circle"></i>
          <span>汇率数据来源：Frankfurter API（欧洲中央银行）</span>
        </div>

        <div class="currency-config">
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
                <div class="config-item">
                  <div class="toggle-wrapper">
                    <span class="config-label">显示汇率信息</span>
                    <div class="toggle-switch ${this.config.showRateInfo ? 'active' : ''}" data-config="showRateInfo"></div>
                  </div>
                </div>
                <div class="config-item">
                  <div class="toggle-wrapper">
                    <span class="config-label">显示双向换算</span>
                    <div class="toggle-switch ${this.config.showBidirectional ? 'active' : ''}" data-config="showBidirectional"></div>
                  </div>
                </div>
                <div class="config-item">
                  <div class="toggle-wrapper">
                    <span class="config-label">显示快速参考</span>
                    <div class="toggle-switch ${this.config.showQuickReference ? 'active' : ''}" data-config="showQuickReference"></div>
                  </div>
                </div>
                <div class="config-item">
                  <div class="toggle-wrapper">
                    <span class="config-label">显示数据来源</span>
                    <div class="toggle-switch ${this.config.showDataSource ? 'active' : ''}" data-config="showDataSource"></div>
                  </div>
                </div>
              </div>
              <div class="config-section">
                <div class="config-section-title">自定义汇率</div>
                <div class="custom-rates" id="custom-rates"></div>
                <button class="reset-rates-btn" id="reset-rates-btn">
                  <i class="fas fa-undo"></i> 恢复默认汇率
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    this.renderCustomRates();
  }

  bindEvents() {
    const amountInput = domHelper.find('#amount-input');
    if (amountInput) {
      domHelper.on(amountInput, 'input', (e) => {
        this.amount = parseFloat(e.target.value) || 0;
        this.convert();
      });
    }

    // 配置面板展开/收起
    const configHeader = domHelper.find('#config-header');
    if (configHeader) {
      domHelper.on(configHeader, 'click', () => {
        const panel = domHelper.find('#config-panel');
        domHelper.toggleClass(panel, 'collapsed');
      });
    }

    // 配置开关
    domHelper.findAll('.toggle-switch').forEach(toggle => {
      domHelper.on(toggle, 'click', () => {
        const configKey = toggle.dataset.config;
        domHelper.toggleClass(toggle, 'active');
        this.config[configKey] = domHelper.hasClass(toggle, 'active');
        this.updateVisibility();
      });
    });

    const resetRatesBtn = domHelper.find('#reset-rates-btn');
    if (resetRatesBtn) {
      domHelper.on(resetRatesBtn, 'click', () => this.resetRates());
    }

    const fromSelect = domHelper.find('#from-currency');
    if (fromSelect) {
      domHelper.on(fromSelect, 'change', (e) => {
        this.fromCurrency = e.target.value;
        this.convert();
      });
    }

    const toSelect = domHelper.find('#to-currency');
    if (toSelect) {
      domHelper.on(toSelect, 'change', (e) => {
        this.toCurrency = e.target.value;
        this.convert();
      });
    }

    const swapBtn = domHelper.find('#swap-btn');
    if (swapBtn) {
      domHelper.on(swapBtn, 'click', () => this.swapCurrencies());
    }

    domHelper.findAll('.quick-amount-btn').forEach(btn => {
      domHelper.on(btn, 'click', () => {
        this.amount = parseInt(btn.dataset.amount);
        domHelper.find('#amount-input').value = this.amount;
        this.convert();
      });
    });
  }

  swapCurrencies() {
    const temp = this.fromCurrency;
    this.fromCurrency = this.toCurrency;
    this.toCurrency = temp;
    
    domHelper.find('#from-currency').value = this.fromCurrency;
    domHelper.find('#to-currency').value = this.toCurrency;
    this.convert();
  }

  convert() {
    const fromRate = this.rates[this.fromCurrency];
    const toRate = this.rates[this.toCurrency];
    const rate = toRate / fromRate;
    const result = this.amount * rate;

    const resultInput = domHelper.find('#result-input');
    if (resultInput) {
      resultInput.value = result.toFixed(2);
    }

    const rateInfo = domHelper.find('#rate-info');
    if (rateInfo && this.config.showRateInfo) {
      const reverseRate = fromRate / toRate;
      if (this.config.showBidirectional) {
        rateInfo.innerHTML = `
          <div class="rate-item">1 ${this.fromCurrency} = ${rate.toFixed(4)} ${this.toCurrency}</div>
          <div class="rate-item">1 ${this.toCurrency} = ${reverseRate.toFixed(4)} ${this.fromCurrency}</div>
        `;
      } else {
        rateInfo.innerHTML = `<div class="rate-item">1 ${this.fromCurrency} = ${rate.toFixed(4)} ${this.toCurrency}</div>`;
      }
    }

    this.updateCurrencyList();
  }

  updateCurrencyList() {
    const listEl = domHelper.find('#currency-list');
    if (!listEl) return;
    
    if (!this.config.showQuickReference) {
      listEl.style.display = 'none';
      return;
    }
    
    listEl.style.display = 'block';

    const fromRate = this.rates[this.fromCurrency];
    const fromCurrency = this.currencies.find(c => c.code === this.fromCurrency);
    let html = `<div class="currency-list-title">快速参考 <span class="currency-list-amount">${this.amount} ${fromCurrency.name}（${this.fromCurrency}）</span></div>`;
    
    this.currencies.forEach(c => {
      if (c.code !== this.fromCurrency) {
        const rate = this.rates[c.code] / fromRate;
        const converted = (this.amount * rate).toFixed(2);
        html += `
          <div class="currency-list-item">
            <span class="currency-list-name">${c.name}（${c.code}）</span>
            <span class="currency-list-value">${c.symbol} ${converted}</span>
          </div>
        `;
      }
    });

    listEl.innerHTML = html;
  }

  updateVisibility() {
    const rateInfo = domHelper.find('#rate-info');
    if (rateInfo) {
      rateInfo.style.display = this.config.showRateInfo ? 'block' : 'none';
    }

    const quickAmounts = domHelper.find('#quick-amounts');
    if (quickAmounts) {
      quickAmounts.style.display = this.config.showQuickAmounts ? 'flex' : 'none';
    }

    const dataSource = domHelper.find('#data-source');
    if (dataSource) {
      dataSource.style.display = this.config.showDataSource ? 'flex' : 'none';
    }

    this.convert();
  }

  renderCustomRates() {
    const container = domHelper.find('#custom-rates');
    if (!container) return;

    let html = '';
    this.currencies.forEach(c => {
      html += `
        <div class="custom-rate-item">
          <label>${c.name} (${c.code})</label>
          <input type="number" class="custom-rate-input" data-currency="${c.code}" 
                 value="${this.rates[c.code]}" step="0.0001">
        </div>
      `;
    });
    container.innerHTML = html;

    domHelper.findAll('.custom-rate-input').forEach(input => {
      domHelper.on(input, 'change', (e) => {
        const currency = e.target.dataset.currency;
        const value = parseFloat(e.target.value);
        if (!isNaN(value) && value > 0) {
          this.rates[currency] = value;
          this.convert();
        }
      });
    });
  }

  resetRates() {
    this.rates = { ...this.defaultRates };
    this.renderCustomRates();
    this.convert();
  }

  destroy() {}
}
