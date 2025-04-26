// @name         StatsPanelModule
// @description  Floating stats panel module
// @version      1.1
// @grant        none
// @require      https://cdn.tailwindcss.com/3.4.1
// ==/UserScript==

class WinPanel {
  constructor(options = {}) {
    if (!options.GM) {
      throw new Error("GM functions must be provided");
    }
    
    this.GM = options.GM;
    this.defaultOptions = {
      width: 300,
      position: { x: 20, y: 20 },
      onSave: null,
      onDragEnd: null
    };
    
    this.options = { ...this.defaultOptions, ...options };
    this.state = {
      enabled: true,
      timeRange: '7',
      keywords: '',
      totalCount: 0,
      hitCount: 0,
      ...this.GM.get('panelSettings', {})
    };
    console.log(2);
    
    this.initStyles();
    this.createPanel();
    this.setupDrag();
    this.setupEvents();
    //this.startStatsSimulation();
  }
  
  initStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .stats-panel {
        all: initial;
        font-family: system-ui, sans-serif;
      }
      .stats-panel * {
        box-sizing: border-box;
      }
      .stats-panel input[type="checkbox"] {
        width: 16px;
        height: 16px;
        margin-right: 8px;
      }
    `;
    document.head.appendChild(style);
  }
  
  createPanel() {
    // 主容器
    this.panel = document.createElement('div');
    this.panel.className = 'stats-panel fixed z-[9999] shadow-lg rounded-lg cursor-move';
    this.panel.style.width = `${this.options.width}px`;
    this.panel.style.left = `${this.state.position?.x || 20}px`;
    this.panel.style.top = `${this.state.position?.y || 20}px`;
    this.panel.style.backgroundColor = '#10b981';
    this.panel.style.color = 'white';
    this.panel.style.userSelect = 'none';
    
    // 上部区域
    this.topSection = document.createElement('div');
    this.topSection.className = 'p-3 flex justify-between items-center bg-emerald-600';
    this.updateStatusDisplay();
    
    // 下部区域
    this.bottomSection = document.createElement('div');
    this.bottomSection.className = 'p-2 bg-emerald-700 text-center';
    
    this.settingsBtn = document.createElement('button');
    this.settingsBtn.className = 'w-full py-1 text-white font-bold';
    this.settingsBtn.textContent = '设 置';
    this.bottomSection.append(this.settingsBtn);
    
    // 设置表单
    this.settingsForm = document.createElement('div');
    this.settingsForm.className = 'p-4 bg-emerald-800 hidden';
    this.updateSettingsForm();
    
    // 组装面板
    this.panel.append(this.topSection, this.bottomSection, this.settingsForm);
    document.body.append(this.panel);
  }
  
  updateStatusDisplay() {
    this.topSection.innerHTML = '';
    
    const statusDisplay = document.createElement('div');
    statusDisplay.innerHTML = `状态: <span style="color:${this.state.enabled ? 'white' : '#ff6b6b'}">${this.state.enabled ? '启用' : '禁用'}</span>`;
    
    const statsDisplay = document.createElement('div');
    statsDisplay.innerHTML = `数据: <b>${this.state.totalCount}</b> 命中: <b>${this.state.hitCount}</b>`;
    
    this.topSection.append(statusDisplay, statsDisplay);
  }
  
  updateSettingsForm() {
    this.settingsForm.innerHTML = `
      <label class="block mb-2">时间范围:
        <select class="w-full p-2 rounded text-black mb-4">
          ${['3','7','15','30','60'].map(d => 
            `<option ${d === this.state.timeRange ? 'selected' : ''}>${d}天</option>`
          ).join('')}
        </select>
      </label>
      <label class="block mb-2">关键字:
        <textarea class="w-full p-2 rounded text-black mb-4" rows="3">${this.state.keywords}</textarea>
      </label>
      <label class="flex items-center mb-4">
        <input type="checkbox" ${this.state.enabled ? 'checked' : ''}>
        启用程序
      </label>
      <button class="w-full py-2 bg-emerald-500 text-white rounded">保存设置</button>
    `;
  }
  
  setupDrag() {
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;
    
    this.panel.addEventListener('mousedown', (e) => {
      if (e.target === this.panel || e.target.classList.contains('bg-emerald-600') || 
          e.target.classList.contains('bg-emerald-700')) {
        isDragging = true;
        const rect = this.panel.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        this.panel.style.cursor = 'grabbing';
        e.preventDefault();
      }
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      
      const newX = e.clientX - offsetX;
      const newY = e.clientY - offsetY;
      
      const maxX = window.innerWidth - this.panel.offsetWidth;
      const maxY = window.innerHeight - this.panel.offsetHeight;
      
      this.panel.style.left = `${Math.max(0, Math.min(newX, maxX))}px`;
      this.panel.style.top = `${Math.max(0, Math.min(newY, maxY))}px`;
    });
    
    document.addEventListener('mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
      this.panel.style.cursor = 'move';
      
      this.state.position = {
        x: parseInt(this.panel.style.left),
        y: parseInt(this.panel.style.top)
      };
      
      GM_setValue('panelSettings', this.state);
      
      if (this.options.onDragEnd) {
        this.options.onDragEnd(this.state.position);
      }
    });
  }
  
  setupEvents() {
    this.settingsBtn.addEventListener('click', () => {
      this.settingsForm.classList.toggle('hidden');
    });
    
    this.settingsForm.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON') {
        this.state.timeRange = this.settingsForm.querySelector('select').value;
        this.state.keywords = this.settingsForm.querySelector('textarea').value;
        this.state.enabled = this.settingsForm.querySelector('input').checked;
        
        this.GM.set('panelSettings', this.state);
        this.updateStatusDisplay();
        this.settingsForm.classList.add('hidden');
        
        if (this.options.onSave) {
          this.options.onSave(this.state);
        }
      }
    });
  }
  
  startStatsSimulation() {
    this.statsInterval = setInterval(() => {
      if (!this.state.enabled) return;
      
      this.state.totalCount++;
      if (this.state.keywords && Math.random() > 0.7) {
        this.state.hitCount++;
      }
      
      this.updateStatusDisplay();
      GM_setValue('panelSettings', this.state);
    }, 1000);
  }
  
  // 公共方法
  updateStats(total, hits) {
    this.state.totalCount = total;
    this.state.hitCount = hits;
    this.updateStatusDisplay();
    GM_setValue('panelSettings', this.state);
  }
  
  destroy() {
    clearInterval(this.statsInterval);
    this.panel.remove();
  }
}

// 导出类以供其他脚本使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WinPanel;
} else {
  window.WinPanel = WinPanel;
}