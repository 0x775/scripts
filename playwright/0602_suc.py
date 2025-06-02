from playwright.sync_api import sync_playwright
import time

def get_browser_version(playwright):
    """获取实际的浏览器版本"""
    browser = playwright.chromium.launch(headless=True)
    version = browser.version
    browser.close()
    return version

def get_random_viewport():
    """生成随机的视口大小"""
    resolutions = [
        {"width": 1280, "height": 720},
        {"width": 1366, "height": 768},
        {"width": 1440, "height": 900},
        {"width": 1536, "height": 864},
        {"width": 1600, "height": 900},
        {"width": 1920, "height": 1080},
        {"width": 2560, "height": 1440}
    ]
    return random.choice(resolutions)
    
def get_random_timeZoneAndLocale(country=None):
    """生成随机的时区和语言"""
    countries = [
        {"language": "zh", "timezone": "Asia/Shanghai", "locale": "zh-CN","country":"中国"},
        {"language": "en", "timezone": "America/New_York", "locale": "en-US","country":"美国"},
        {"language": "hi", "timezone": "Asia/Kolkata", "locale": "hi-IN","country":"印度"},
        {"language": "pt", "timezone": "America/Sao_Paulo", "locale": "pt-BR","country":"巴西"},
        {"language": "ru", "timezone": "Europe/Moscow", "locale": "ru-RU","country":"俄罗斯"},
        {"language": "ja", "timezone": "Asia/Tokyo", "locale": "ja-JP","country":"日本"},
        {"language": "de", "timezone": "Europe/Berlin", "locale": "de-DE","country":"德国"},
        {"language": "fr", "timezone": "Europe/Paris", "locale": "fr-FR","country":"法国"},
        {"language": "en", "timezone": "Europe/London", "locale": "en-GB","country":"英国"},
        {"language": "ko", "timezone": "Asia/Seoul", "locale": "ko-KR","country":"韩国"},
        {"language": "es", "timezone": "Europe/Madrid", "locale": "es-ES","country":"西班牙"},
        {"language": "it", "timezone": "Europe/Rome", "locale": "it-IT","country":"意大利"},
        {"language": "en", "timezone": "Australia/Sydney", "locale": "en-AU","country":"澳大利亚"},
        {"language": "en", "timezone": "America/Toronto", "locale": "en-CA","country":"加拿大"},
        {"language": "es", "timezone": "America/Mexico_City", "locale": "es-MX","country":"墨西哥"},
        {"language": "tr", "timezone": "Europe/Istanbul", "locale": "tr-TR","country":"土耳其"},
        {"language": "ar", "timezone": "Asia/Riyadh", "locale": "ar-SA","country":"沙特阿拉伯"},
        {"language": "id", "timezone": "Asia/Jakarta", "locale": "id-ID","country":"印度尼西亚"},
        {"language": "nl", "timezone": "Europe/Amsterdam", "locale": "nl-NL","country":"荷兰"},
        {"language": "pl", "timezone": "Europe/Warsaw", "locale": "pl-PL","country":"波兰"},
        {"language": "vi", "timezone": "Asia/Ho_Chi_Minh", "locale": "vi-VN","country":"越南"},
        {"language": "th", "timezone": "Asia/Bangkok", "locale": "th-TH","country":"泰国"},
        {"language": "fa", "timezone": "Asia/Tehran", "locale": "fa-IR","country":"伊朗"},
        {"language": "ar", "timezone": "Africa/Cairo", "locale": "ar-EG","country":"埃及"},
        {"language": "es", "timezone": "America/Argentina/Buenos_Aires", "locale": "es-AR","country":"阿根廷"},
        {"language": "en", "timezone": "Africa/Johannesburg", "locale": "en-ZA","country":"南非"},
        {"language": "ms", "timezone": "Asia/Kuala_Lumpur", "locale": "ms-MY","country":"马来西亚"},
        {"language": "fil", "timezone": "Asia/Manila", "locale": "fil-PH","country":"菲律宾"},
        {"language": "uk", "timezone": "Europe/Kyiv", "locale": "uk-UA","country":"乌克兰"},
        {"language": "sv", "timezone": "Europe/Stockholm", "locale": "sv-SE","country":"瑞典"},
    ]
    if country:
        data = [item for item in countries if item["country"]==country]
        return data[0] if data else None
    return random.choice(countries)

    

with sync_playwright() as p:
    #获取真实版本
    country=get_random_timeZoneAndLocale("日本")
    full_version = "136.0.7103.25"
    major_version = full_version.split('.')[0]
    
    # 创建 Client Hints 元数据
    client_hints_metadata = {
        "brands": [
            {"brand": "Chromium", "version": major_version},
            {"brand": "Not.A/Brand", "version": "99"},
            {"brand": "Google Chrome", "version": major_version}
        ],
        "fullVersionList": [
            {"brand": "Chromium", "version": full_version},
            {"brand": "Not.A/Brand", "version": "99.0.0.0"},
            {"brand": "Google Chrome", "version": full_version}
        ],
        "platform": "Windows",
        "platformVersion": "10.0.0",
        "formFactors":["Desktop"],
        "architecture": "x86",
        "bitness": "64",
        "model": "",
        "mobile": False,
        "wow64": False
    }

    path_to_extension = "/data/chrome_plugin/custom_proxyauth_plugin"
    # 启动浏览器并启用硬件加速
    browser = p.chromium.launch_persistent_context(
        user_data_dir=r'./w/data',
        headless=False,
        proxy={'server': 'http://8.211.151.166:3389','username': 'demo','password': '123456a'},
        #proxy={"server": "http://demo:123456a@8.211.151.166:3389"},
        args=[
            #f"--disable-extensions-except={path_to_extension}",
            #f"--load-extension={path_to_extension}",
            #f'--proxy-server=socks5://demo:123456a@8.211.151.166:3389',
            '--ignore-certificate-errors',
            '--use-fake-ui-for-media-stream',
            '--use-fake-device-for-media-stream',
            '--enable-features=VaapiVideoDecoder',
            '--disable-dev-shm-usage',
            # 禁用自动化特征
            "--disable-blink-features=AutomationControlled",
            '--disable-features=UseChromeOSDirectVideoDecoder',
        
            # 禁用隐身模式特征
            '--disable-features=EphemeralGuestProfile',
            '--disable-features=PrivacySandboxSettings4',
            # 隐藏自动化标志
            "--disable-infobars",
            "--no-default-browser-check",
            "--no-first-run",
        
            # 禁用可能暴露 CDP 的功能
            "--remote-debugging-port=0",
            "--disable-remote-fonts",
            
            # 禁用WebRTC功能
            "--disable-webrtc",
            "--disable-features=WebRTC",
        
            # 其他隐私保护设置
            "--disable-dns-over-https",
            "--disable-notifications"
            
            # 启用 Client Hints
            "--enable-features=UserAgentClientHint",

            '--num-raster-threads=4',
            '--device-memory=8',
            '--use-gl=desktop',  # 启用GPU加速
            '--gpu-vendor-id=0x10de',  # NVIDIA的厂商ID
            '--gpu-device-id=0x2204',  # 模拟RTX 3080的设备ID
            '--gpu-driver-version=31.0.15.1694'
        ],
        ignore_default_args=[
            "--enable-automation",
            "--enable-blink-features=IdleDetection"
        ],
        locale=country["locale"],
        timezone_id=country["timezone"],
        #user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.7103.25 Safari/537.36",
        #user_agent_metadata=client_hints_metadata
    )
    
    context = browser;
    
    # 关键：注入JavaScript覆盖浏览器指纹
    context.add_init_script("""
    //删除CDP相关痕迹
    // 清除 CDP 相关痕迹
    const cdpPatterns = [
        'cdc_adoQpoasnfa76pfcZLmcfl_',
        '_Selenium_IDE_Recorder',
        '_driver_evaluate',
        '__webdriver_script_fn'
    ];
    
    // 遍历所有对象属性并删除 CDP 痕迹
    for (const key in window) {
        if (key.includes('$cdc_') || 
            key.includes('__driver_') || 
            cdpPatterns.some(pattern => key.includes(pattern))) {
            delete window[key];
        }
    }
    
    // 删除特定已知的 CDP 对象
    window.cdc_adoQpoasnfa76pfcZLmcfl_Array = undefined;
    window.cdc_adoQpoasnfa76pfcZLmcfl_Object = undefined;
    window.cdc_adoQpoasnfa76pfcZLmcfl_Promise = undefined;
    window.cdc_adoQpoasnfa76pfcZLmcfl_Proxy = undefined;
    window.cdc_adoQpoasnfa76pfcZLmcfl_Symbol = undefined;
    
    // 覆盖 document 中的 CDP 痕迹
    if (document.$cdc_asdjflasutopfhvcZLmcfl) {
        delete document.$cdc_asdjflasutopfhvcZLmcfl;
    }
    
    // 重写 Function.prototype.toString 来隐藏自动化特征
    const originalToString = Function.prototype.toString;
    Function.prototype.toString = function() {
        const str = originalToString.call(this);
        if (str.includes('cdc_') || str.includes('$cdc')) {
            return 'function() { [native code] }';
        }
        return str;
    };
    
    // 覆盖 navigator.userAgent
        Object.defineProperty(navigator, 'userAgent', {{
            value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.7103.25 Safari/537.36',
            configurable: false,
            writable: false
        }});
        
    // 覆盖 navigator.userAgentData
        Object.defineProperty(navigator, 'userAgentData', {{
            value: {{
                brands: {json.dumps(client_hints_metadata['brands'])},
                getHighEntropyValues: function(hints) {{
                    return new Promise((resolve, reject) => {{
                        const result = {{}};
                        if (hints.includes('architecture')) {{
                            result.architecture = '{client_hints_metadata['architecture']}';
                        }}
                        if (hints.includes('bitness')) {{
                            result.bitness = '{client_hints_metadata['bitness']}';
                        }}
                        if (hints.includes('model')) {{
                            result.model = '{client_hints_metadata['model']}';
                        }}
                        if (hints.includes('platformVersion')) {{
                            result.platformVersion = '{client_hints_metadata['platformVersion']}';
                        }}
                        if (hints.includes('fullVersionList')) {{
                            result.fullVersionList = {json.dumps(client_hints_metadata['fullVersionList'])};
                        }}
                        if (hints.includes('wow64')) {{
                            result.wow64 = {str(client_hints_metadata['wow64']).lower()};
                        }}
                        resolve(result);
                    }});
                }},
                mobile: {str(client_hints_metadata['mobile']).lower()},
                platform: '{client_hints_metadata['platform']}'
            }},
            configurable: false,
            writable: false
        }});

    // 覆盖navigator属性
    Object.defineProperty(navigator, 'platform', {
        value: 'Win32',
        configurable: true
    });

    // 覆盖Navigator属性
    Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
        configurable: true,
        enumerable: true
    });
    //删除自动化特征
    delete Object.getPrototypeOf(navigator).webdriver;

    Object.defineProperty(navigator, 'credentials', {{
        value: {{
            create: () => Promise.reject(new Error('Blocked')),
            get: () => Promise.reject(new Error('Blocked')),
            preventSilentAccess: () => Promise.resolve(),
            store: () => Promise.reject(new Error('Blocked'))
        }},
        configurable: true
    }});

    //覆盖Permissions API
    const originalQuery = navigator.permissions.query;
    navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
            Promise.resolve({{ state: 'denied' }}) :
            originalQuery(parameters)
    );
    
    // 覆盖oscpu属性（Firefox特有，但Chrome中不存在）
    if ('oscpu' in navigator) {
        Object.defineProperty(navigator, 'oscpu', {
            value: 'Windows NT 10.0',
            configurable: true
        });
    }
    
    // 覆盖WebGL渲染信息
    const getParameter = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function(parameter) {
        // UNMASKED_VENDOR_WEBGL
        if (parameter === 37445) {
            return 'Google Inc. (NVIDIA)';
        }
        // UNMASKED_RENDERER_WEBGL
        if (parameter === 37446) {
            return 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3080 Direct3D11 vs_5_0 ps_5_0, D3D11-31.0.15.1694)';
        }
        return getParameter.call(this, parameter);
    };
    
    // 覆盖插件信息
    const originalPlugins = Array.from(navigator.plugins);
    Object.defineProperty(navigator, 'plugins', {
        get: () => [
            ...originalPlugins,
            {
                name: 'Chrome PDF Plugin',
                filename: 'internal-pdf-viewer',
                description: 'Portable Document Format',
                __proto__: Plugin.prototype
            },
            {
                name: 'Chrome PDF Viewer',
                filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai',
                description: '',
                __proto__: Plugin.prototype
            }
        ],
        configurable: true
    });
    
    // 覆盖mimeTypes
    const originalMimeTypes = Array.from(navigator.mimeTypes);
    Object.defineProperty(navigator, 'mimeTypes', {
        get: () => [
            ...originalMimeTypes,
            {
                type: 'application/pdf',
                suffixes: 'pdf',
                description: '',
                enabledPlugin: {
                    name: 'Chrome PDF Plugin',
                    filename: 'internal-pdf-viewer',
                    description: 'Portable Document Format'
                },
                __proto__: MimeType.prototype
            }
        ],
        configurable: true
    });
    
    // 覆盖chrome对象
    Object.defineProperty(window, 'chrome', {
        value: {
            app: {
                isInstalled: false,
            },
            webstore: {},
            runtime: {
                PlatformOs: {
                    MAC: 'mac',
                    WIN: 'win',
                    ANDROID: 'android',
                    CROS: 'cros',
                    LINUX: 'linux',
                    OPENBSD: 'openbsd'
                },
                PlatformArch: {
                    ARM: 'arm',
                    X86_32: 'x86-32',
                    X86_64: 'x86-64'
                },
                PlatformNaclArch: {
                    ARM: 'arm',
                    X86_32: 'x86-32',
                    X86_64: 'x86-64'
                },
                RequestUpdateCheckStatus: {
                    THROTTLED: 'throttled',
                    NO_UPDATE: 'no_update',
                    UPDATE_AVAILABLE: 'update_available'
                },
                OnInstalledReason: {
                    INSTALL: 'install',
                    UPDATE: 'update',
                    CHROME_UPDATE: 'chrome_update',
                    SHARED_MODULE_UPDATE: 'shared_module_update'
                },
                OnRestartRequiredReason: {
                    APP_UPDATE: 'app_update',
                    OS_UPDATE: 'os_update',
                    PERIODIC: 'periodic'
                }
            },
        },
        configurable: true
    });
    
    // 覆盖网络信息
    Object.defineProperty(navigator, 'connection', {
        value: {
            downlink: 10,
            effectiveType: '4g',
            rtt: 50,
            saveData: false,
            type: 'wifi'
        },
        configurable: true
    });
    
    // Canvas指纹随机化
        HTMLCanvasElement.prototype.originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
        HTMLCanvasElement.prototype.toDataURL = function(type, quality) {{
            const canvas = document.createElement('canvas');
            canvas.width = this.width;
            canvas.height = this.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(this, 0, 0);

            // 添加随机噪声
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {{
                if (Math.random() > 0.9) {{
                    data[i] = data[i] ^ Math.floor(Math.random() * 256);
                    data[i+1] = data[i+1] ^ Math.floor(Math.random() * 256);
                    data[i+2] = data[i+2] ^ Math.floor(Math.random() * 256);
                }}
            }}
            ctx.putImageData(imageData, 0, 0);

            return canvas.originalToDataURL(type, quality);
        }};

    // 音频指纹伪装
        const originalOscillator = AudioContext.prototype.createOscillator;
        AudioContext.prototype.createOscillator = function() {{
            const oscillator = originalOscillator.call(this);
            oscillator.frequency.value += (Math.random() * 20 - 10);
            return oscillator;
        }};

    
    // 覆盖硬件并发数
    Object.defineProperty(navigator, 'hardwareConcurrency', {
        value: 4,
        configurable: true
    });
    """)
    
    # 创建页面
    page = context.new_page()
    
    # 使用 CDP 会话来覆盖自动化痕迹
    client = page.context.new_cdp_session(page)
    client.send('Page.addScriptToEvaluateOnNewDocument', {
        'source': """
            Object.defineProperty(navigator, 'webdriver', { get: () => false });
            window.chrome = { runtime: {} };
            delete window.document.$cdc_asdjflasutopfhvcZLmcfl;
        """
    })

    # 覆盖其他自动化特征
    client.send('Runtime.evaluate', {
        'expression': """
            Object.defineProperty(window, 'cdc_adoQpoasnfa76pfcZLmcfl_Array', {
                value: undefined,
                writable: false
            });
        """
    })

    # 添加额外的请求头
    page.set_extra_http_headers({
        "Sec-CH-UA": '"Google Chrome";v="136", "Chromium";v="136", "Not=A?Brand";v="24"',
        "Sec-CH-UA-Platform": "Windows",
        "Sec-CH-UA-Mobile": "?0"
    })
    
    # 导航到页面
    #page.goto("https://www.douyin.com",timeout=60000)
    page.goto("about:blank",timeout=60000)
    
    # 获取标题
    title = page.title()
    print(f"页面标题: {title}")
    
    # 关闭浏览器
    #browser.close()
    input("pause-->")
