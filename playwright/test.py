from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    # 启动浏览器并启用硬件加速
    browser = p.chromium.launch(
        headless=False,
        args=[
            '--ignore-certificate-errors',
            '--use-fake-ui-for-media-stream',
            '--use-fake-device-for-media-stream',
            '--enable-features=VaapiVideoDecoder',
            '--disable-features=UseChromeOSDirectVideoDecoder',
            '--disable-blink-features=AutomationControlled',
            '--disable-dev-shm-usage',
            '--lang=zh-CN',
            '--num-raster-threads=4',
            '--device-memory=8',
            '--use-gl=desktop',  # 启用GPU加速
            '--gpu-vendor-id=0x10de',  # NVIDIA的厂商ID
            '--gpu-device-id=0x2204',  # 模拟RTX 3080的设备ID
            '--gpu-driver-version=31.0.15.1694'
        ],
        ignore_default_args=[
            '--enable-automation',
            '--enable-logging'
        ]
    )
    
    # 创建上下文，模拟真实用户
    context = browser.new_context(
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        viewport={"width": 1366, "height": 768},
        locale="zh-CN",
        timezone_id="Asia/Shanghai",
        permissions=["geolocation"],
        device_scale_factor=1,
        is_mobile=False,
        has_touch=False
    )
    
    # 关键：注入JavaScript覆盖浏览器指纹
    context.add_init_script("""
    // 覆盖navigator属性
    Object.defineProperty(navigator, 'platform', {
        value: 'Win32',
        configurable: true
    });
    
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
    
    // 删除自动化标志
    delete Object.getPrototypeOf(navigator).webdriver;
    
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
    
    // 覆盖硬件并发数
    Object.defineProperty(navigator, 'hardwareConcurrency', {
        value: 4,
        configurable: true
    });
    """)
    
    # 创建页面
    page = context.new_page()
    
    # 添加额外的请求头
    page.set_extra_http_headers({
        "Sec-CH-UA": '"Google Chrome";v="123", "Chromium";v="123", "Not=A?Brand";v="24"',
        "Sec-CH-UA-Platform": "Windows",
        "Sec-CH-UA-Mobile": "?0"
    })
    
    # 导航到页面
    page.goto("https://www.douyin.com")
    
    # 获取标题
    title = page.title()
    print(f"页面标题: {title}")
    
    # 关闭浏览器
    #browser.close()
    input("pause-->")
