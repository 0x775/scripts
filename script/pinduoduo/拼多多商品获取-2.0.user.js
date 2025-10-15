// ==UserScript==
// @name         拼多多商品获取
// @match        https://mobile.yangkeduo.com/goods.html*
// @require      http://127.0.0.1:8787/pinduoduo.js
// @grant        none
// ==/UserScript==
var iframe;
//var currentUrl = window.location.href;
//var goodsId = new URLSearchParams(window.location.search).get('goods_id');
const cleanUrl = new URL(window.location.href);
cleanUrl.search = `?goods_id=${cleanUrl.searchParams.get('goods_id')}`;
var sources = "mobile.yangkeduo.com";
var sources_id = cleanUrl.searchParams.get('goods_id');
var sources_url = cleanUrl.href;

(function () {
    // 等待页面加载完成（确保 .sku-plus1 或商品信息已存在）
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPanel);
    } else {
        initPanel();
    }

    function initPanel() {
        // 避免重复创建
        if (document.getElementById('sku-iframe-panel')) return;

        const panel = document.createElement('div');
        panel.id = 'sku-iframe-panel';
        panel.style.cssText = `
            position: fixed;
            top: 0px;
            left: 0px;
            width: 360px;
            height: 100%;
            z-index: 10000;
            background: white;
            border-radius: 0px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            overflow: hidden;
        `;

        iframe = document.createElement('iframe');
        iframe.src = "http://127.0.0.1:8787/show.htm";
        iframe.style.cssText = `
            width: 100%;
            height: 100%;
            border: none;
        `;
        panel.appendChild(iframe);
        document.body.appendChild(panel);

        // 发送数据
        //const skuData = extractSkuData(); // ← 请确保此函数已定义
        let data = getInfo();

        iframe.onload = () => {
            //iframe.contentWindow.postMessage({ type: 'INIT_PRODUCT_DATA', data: data }, '*');
        };

        setTimeout(function(){
            let data=getInfo();
            iframe.contentWindow.postMessage({ type: 'INIT_PRODUCT_DATA', data: data }, '*');
            //print_debug(data);
        }, 1500);

    }

    function getInfo() {
        const info = {
            title: '',
            saleNum: 0,
            price: 0,
            normalPrice: 0,
            shopName: '',
            commentNum: 0,
            content: { text: '', images: [], video: '' },
            imageList: [],
            shopLogo: '',
            skuList: [],
            sources:sources,
            sources_id:sources_id,
            sources_url:sources_url,
        };

        // 1. 标题
        const titleEl = document.querySelector('.enable-select');
        info.title = titleEl?.textContent.trim() || '';

        // 2. 价格 & 销量
        const container = document.querySelector('.container');
        if (container) {
            // 价格
            const priceMatch = container.textContent.match(/¥([\d.]+)/);
            info.price = priceMatch ? parseFloat(priceMatch[1]) : 0;

            // 销量
            const salesMatch = container.textContent.match(/已[拼抢](\d+)[件包]/);
            info.saleNum = salesMatch ? parseInt(salesMatch[1], 10) : 0;
            if (info.saleNum === 0) {
                const hiddenSpans = container.querySelectorAll('span[aria-hidden="true"]');
                for (const span of hiddenSpans) {
                    const text = span.textContent || '';
                    const match2 = text.match(/已[拼抢](\d+)[件包]/);
                    if (match2) {
                        info.saleNum = parseInt(match2[1], 10);
                        break; // 找到第一个有效值即可
                    }
                }
            }
        }

        // 3. 评论数
        const reviewEl = [...document.querySelectorAll('div[data-active="cell-white"]')]
            .find(el => /商品评价[（\(][\d,]+[）\)]/.test(el.textContent));
        const reviewMatch = reviewEl?.textContent.match(/商品评价[（\(]([\d,]+)[）\)]/);
        info.commentNum = reviewMatch ? parseInt(reviewMatch[1].replace(/,/g, ''), 10) : 0;

        // 4. 店铺信息
        const shopNameEl = document.querySelector('[class*="BAq4Lzv7"]');
        info.shopName = shopNameEl?.textContent.trim() || '';

        // 店铺 Logo（找“进店逛逛”附近的 img）
        const enterBtn = [...document.querySelectorAll('span')].find(
            el => el.textContent.trim() === '进店逛逛'
        );
        let logoImg = null;
        if (enterBtn) {
            let current = enterBtn;
            for (let i = 0; i < 5; i++) {
                current = current.parentElement;
                if (!current) break;
                if (current.children[0]?.tagName === 'IMG') {
                    logoImg = current.children[0];
                    break;
                }
            }
        }
        info.shopLogo = (logoImg?.dataset?.src || logoImg?.src || '').trim();

        // 5. 幻灯图
        info.imageList = [...document.querySelectorAll('img[aria-label="商品大图"]')]
            .map(img => (img.dataset.src || img.src || '').trim())
            .filter(url => url);

        // 6. 商品详情（文本 + 图片）
        const allNodes = [...document.querySelectorAll('*')];
        const startIdx = allNodes.findIndex(n => n.textContent?.trim() === '商品详情');
        const endIdx = allNodes.findIndex(n => n.textContent?.trim() === '点击查看商品价格说明');

        const detailText = [];
        const detailImages = [];

        if (startIdx !== -1 && endIdx !== -1 && startIdx < endIdx) {
            const nodes = allNodes.slice(startIdx + 1, endIdx);
            nodes.forEach(node => {
                const txt = node.textContent?.trim();
                if (txt && txt !== '商品详情') {
                    detailText.push(txt);
                }
                node.querySelectorAll('img').forEach(img => {
                    const url = (img.dataset.src || img.src || '').trim();
                    if (url && !detailImages.includes(url)) detailImages.push(url);
                });
            });
        }

        //去重和删除重复
        info.imageList = [...new Set(info.imageList)];

        const m_texs = [...new Set(
            detailText.filter(item =>
            item !== "查看全部" &&
            item !== "您的浏览器可能不支持视频播放"
            )
        )];
        const m_images = [...new Set(detailImages)];

        info.content = {
            text: m_texs.join('\n'),
            images: m_images,
            video: ''
        };

        // 7. SKU 信息
        info.skuList = skuInfo() || [];

        const specs = info.skuList.specs;
        /*
        // 开始监听
        const stop = watchSkuPrice(specs, ({ combination }) => {
            alert(12);
            info.skuList["combinations"]=combination;
            print_debug(info);
        });
        */
        const stop = watchSkuPrice(specs, (newCombo) => {
            //alert(JSON.stringify(newCombo));
            const idx = info.skuList.combinations.findIndex(c =>
        JSON.stringify(c.specIds.sort()) === JSON.stringify(newCombo.specIds.sort())
    );

    if (idx >= 0) {
        // 存在：更新
        info.skuList.combinations[idx] = newCombo;
    } else {
        // 不存在：插入
        info.skuList.combinations.push(newCombo);
    }

    //console.log('最新 combinations:', combinations);
    // 可在此处更新 info.skuList.combinations = combinations;
            iframe.contentWindow.postMessage({ type: 'INIT_PRODUCT_DATA', data: info }, '*');
            //print_debug(info);
});


        return info;
    }

    function skuInfo() {
    const skuPopup = document.querySelector('.sku-plus1');
    if (!skuPopup) return { specs: [],combinations:[] };

    const specs = [];
    const keySpans = skuPopup.querySelectorAll('.sku-specs-key');

    keySpans.forEach((keySpan, specIndex) => {
        const name = keySpan.textContent.trim();
        if (!name) return;

        const optionsContainer = keySpan.nextElementSibling;
        if (!optionsContainer) return;

        const buttons = optionsContainer.querySelectorAll('div[role="button"]');
        const values = Array.from(buttons)
            .map((btn, idx) => {
                const title = (btn.getAttribute('aria-label') || btn.textContent).trim();
                if (!title) return null;

                // 生成唯一 ID：规格名拼音或简化 + 索引（简单处理，避免中文）
                const specKey = name.replace(/[^\w]/g, '').toLowerCase() || `spec${specIndex}`;
                const id = `${specKey}_${idx}`;

                return {
                    id,
                    title,
                    image: '' // 拼多多 SKU 选项通常无图，留空
                };
            })
            .filter(v => v !== null);

        if (values.length > 0) {
            specs.push({ name, values });
        }
    });
    return { specs,combinations:[] };
}

    function watchSkuPrice(specs, callback) {
    const popup = document.querySelector('.sku-plus1');
    if (!popup || !specs) return;

    let lastCombo = null;

    function getSelectedValues() {
        const el = [...popup.querySelectorAll('span')].find(s => /已选/.test(s.textContent));
        return el ? el.textContent.replace(/^已选：/, '').split(/\s+/).filter(Boolean) : [];
    }

    function getSpecIds(values) {
        const ids = [];
        for (const v of values) {
            outer: for (const spec of specs) {
                for (const item of spec.values) {
                    if (item.title === v) {
                        ids.push(item.id);
                        break outer;
                    }
                }
            }
        }
        return ids;
    }

    function getPrice() {
        const el = popup.querySelector('[aria-label*="¥"]') ||
                   [...popup.querySelectorAll('span, div')].find(e => /¥[\d.]+/.test(e.textContent));
        let text = el?.getAttribute('aria-label') || el?.textContent || '';
        //return text.match(/¥([\d.]+)/)?.[1] || '';
        text = text.replace("2件","件件");
        const match = text.match(/¥([\d.]+)/);
        return match ? parseFloat(match[1]).toFixed(2) : '';

    }

    function getImage() {
        return popup.querySelector('img[aria-label="点击查看大图"]')?.src?.trim() || '';
    }

    function notify() {
        const values = getSelectedValues();
        if (values.length === 0) return;

        const specIds = getSpecIds(values);
        const combo = {
            specIds,
            price: getPrice(),
            normalPrice: '', // 拼多多通常无原价
            image: getImage()
        };

        // 仅当内容变化时回调（避免重复）
        if (JSON.stringify(combo) !== JSON.stringify(lastCombo)) {
            lastCombo = combo;
            callback(combo);
        }
    }

    const observer = new MutationObserver(notify);
    observer.observe(popup, { childList: true, subtree: true, characterData: true, attributes: true });
    notify(); // 初始触发

    return () => observer.disconnect();
}


    // 示例：模拟你的数据提取函数
    function extractSkuData() {
        const info = {
  "title": "宝丽来相纸 i-Type 60张装 复古拍立得相纸",
  "saleNum": "2568",
  "commentNum": "423",
  "imageList": [
    "https://img.pddpic.com/mms-material-img/2023-10-16/5fbcfbb7-0354-489c-aca0-f40d5d904c14.jpeg?imageView2/2/w/400/q/80",
    "https://img.pddpic.com/mms-material-img/2024-07-13/c7ff0af5-9622-4582-8395-af9850e31911.jpeg?imageView2/2/w/400/q/80",
    "https://img.pddpic.com/mms-material-img/2025-07-25/d670f36f-3297-484e-bea4-08424b88700c.jpeg.a.jpeg?imageView2/2/w/400/q/80"
  ],
  "shopName": "宝丽来官方旗舰店",
  "shopLogo": "https://avatar3.pddpic.com/a/Q05vbkllOVVSUThESTRpYlBTWDRZcnFmOXkyaVdjNldSUT09djA0-1728568952?imageMogr2/thumbnail/100x",
  "video": "https://video.pddpic.com/example/polaroid_demo.mp4",
  "image": "https://img.pddpic.com/mms-material-img/2023-10-16/5fbcfbb7-0354-489c-aca0-f40d5d904c14.jpeg?imageView2/2/w/400/q/80",
  "content": {
    "text": "宝丽来 i-Type 相纸适用于所有 i-Type 相机，包括 Now、Now+、OneStep 2 等。每盒含 8 张或 60 张，色彩鲜艳，成像稳定。",
    "images": [
      "https://img.pddpic.com/mms-material-img/2022-12-10/f163fa62-620f-465e-838d-df6d42d039ae.jpeg?imageView2/2/w/400/q/80",
      "https://img.pddpic.com/mms-material-img/2024-03-10/8bf9e093-2d23-4fd6-8fbb-251525f9cca4.jpeg?imageView2/2/w/400/q/80"
    ],
    "video": ""
  },
  "skuList": {
    "specs": [
      {
        "name": "规格",
        "values": [
          { "id": "spec_8", "title": "8张装", "image": "" },
          { "id": "spec_60", "title": "60张装", "image": "" }
        ]
      },
      {
        "name": "类型",
        "values": [
          { "id": "type_bw", "title": "黑白", "image": "" },
          { "id": "type_color", "title": "彩色", "image": "" },
          { "id": "type_special", "title": "边框限量版", "image": "https://img.pddpic.com/mms-material-img/2025-05-16/b86ceffa-9ece-46eb-ba42-cd6eabd727b1.jpeg.a.jpeg?imageView2/2/w/100/q/80" }
        ]
      }
    ],
    "combinations": [
      {
        "specIds": ["spec_8", "type_bw"],
        "price": "59.9",
        "normalPrice": "69.9",
        "image": "https://img.pddpic.com/mms-material-img/2023-10-16/5fbcfbb7-0354-489c-aca0-f40d5d904c14.jpeg?imageView2/2/w/200/q/80"
      },
      {
        "specIds": ["spec_8", "type_color"],
        "price": "69.9",
        "normalPrice": "79.9",
        "image": ""
      },
      {
        "specIds": ["spec_60", "type_color"],
        "price": "399.0",
        "normalPrice": "459.0",
        "image": "https://img.pddpic.com/mms-material-img/2025-07-25/d670f36f-3297-484e-bea4-08424b88700c.jpeg.a.jpeg?imageView2/2/w/200/q/80"
      },
      {
        "specIds": ["spec_60", "type_special"],
        "price": "429.0",
        "normalPrice": "499.0",
        "image": "https://img.pddpic.com/mms-material-img/2025-05-16/b86ceffa-9ece-46eb-ba42-cd6eabd727b1.jpeg.a.jpeg?imageView2/2/w/200/q/80"
      }
    ]
  }
};
        return info;
    }
})();