// ==UserScript==
// @name         MyUserScript
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Main script using StatsPanel
// @match        *://*/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @require      https://cdn.tailwindcss.com/3.4.1
// @require      https://c.xxxxxx.com/static/js/winpanel.js
// ==/UserScript==

(function() {
  'use strict';

    console.log(1111);
  // 创建GM函数包装器
  const GM = {
    get: GM_getValue,
    set: GM_setValue,
    addStyle: GM_addStyle
  };

  // 初始化面板
  const statsPanel = new WinPanel({
    GM: GM, // 传入GM函数
    width: 320,
    onSave: (settings) => {
      console.log('Settings saved:', settings);
    }
  });

  // 使用示例
  statsPanel.updateStats(100, 30);
})();