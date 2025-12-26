var browserIconPaths = {
    "Microsoft Edge": "icons/edge.png",
    "Google Chrome": "icons/chrome.png",
    "Apple Safari": "icons/safari.png",
    "Mozilla Firefox": "icons/firefox.png",
    "Opera": "icons/opera.png",
    "Internet Explorer": "icons/ie.png",
    "未知浏览器": "icons/unknown.png"
};

var engineMarketShare = {
    "Blink": { value: 78.5, color: "#4285F4", highlight: "#2196F3" },
    "WebKit": { value: 12.3, color: "#007AFF", highlight: "#388E3C" },
    "Gecko": { value: 4.7, color: "#FF9500", highlight: "#F57C00" },
    "Trident": { value: 1.2, color: "#00A3EF", highlight: "#0288D1" },
    "其他内核": { value: 3.3, color: "#9E9E9E", highlight: "#757575" }
};

var osMarketShare = {
    "Windows": { value: 45.2, color: "#00A3EF", highlight: "#2196F3" },
    "macOS": { value: 18.7, color: "#5AC8FA", highlight: "#039BE5" },
    "Android": { value: 27.8, color: "#76FF03", highlight: "#64DD17" },
    "iOS": { value: 7.1, color: "#FFCCBC", highlight: "#FFAB91" },
    "Linux": { value: 1.2, color: "#FDD835", highlight: "#FBC02D" }
};

var latestVersions = {
    "Microsoft Edge": 120,
    "Google Chrome": 120,
    "Apple Safari": 17,
    "Mozilla Firefox": 121,
    "Opera": 106,
    "Internet Explorer": 11,
    "未知浏览器": 0
};

var kernelReleaseInfo = {
    "Blink": "2013年4月",
    "WebKit": "2003年6月",
    "Gecko": "1997年10月",
    "Trident": "1997年8月",
    "未知内核": "未知"
};

var engineChart = null;
var osChart = null;

// 修复1：重构图表初始化函数，增加前置检查
function initEngineChart(userEngine) {
    try {
        // 前置检查：确保canvas元素存在
        var canvas = document.getElementById('engineChart');
        if (!canvas) {
            console.error("Engine chart canvas not found");
            return;
        }
        
        // 安全销毁旧图表
        if (engineChart) {
            try {
                engineChart.destroy();
            } catch (e) {
                console.warn("Destroy engine chart failed:", e);
            }
            engineChart = null;
        }
        
        var labels = [];
        var data = [];
        var backgroundColors = [];
        var hoverBackgroundColors = [];

        var engineKeys = [];
        for (var key in engineMarketShare) {
            if (engineMarketShare.hasOwnProperty(key)) {
                engineKeys.push(key);
            }
        }
        
        for (var i = 0; i < engineKeys.length; i++) {
            var engine = engineKeys[i];
            labels.push(engine);
            data.push(engineMarketShare[engine].value);
            backgroundColors.push(engineMarketShare[engine].color);
            hoverBackgroundColors.push(engineMarketShare[engine].highlight);
        }

        var ctx = canvas.getContext('2d');
        // 修复2：优化Chart配置，兼容IE
        engineChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColors,
                    hoverBackgroundColor: hoverBackgroundColors,
                    borderWidth: 1,
                    borderColor: '#ffffff',
                    // 修复：同时设置cutout和cutoutPercentage，兼容不同Chart版本
                    cutout: '70%',
                    cutoutPercentage: 70
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                // 修复：IE兼容的插件配置方式
                legend: { display: false },
                tooltip: {
                    enabled: true,
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.raw + '%';
                        }
                    }
                },
                animation: { 
                    animateRotate: true,
                    animateScale: true,
                    duration: 1000 // 统一动画时长
                },
                // 修复：增加IE兼容的布局配置
                layout: {
                    padding: 0
                }
            }
        });

        generateLegend('engineLegend', engineMarketShare, userEngine);

    } catch (e) {
        console.error("Engine chart init failed:", e);
    }
}

// 修复3：同步修复系统图表初始化函数
function initOsChart(userOs) {
    try {
        var canvas = document.getElementById('osChart');
        if (!canvas) {
            console.error("OS chart canvas not found");
            return;
        }
        
        if (osChart) {
            try {
                osChart.destroy();
            } catch (e) {
                console.warn("Destroy OS chart failed:", e);
            }
            osChart = null;
        }
        
        var osType = userOs.split(' ')[0];
        var labels = [];
        var data = [];
        var backgroundColors = [];
        var hoverBackgroundColors = [];

        var osKeys = [];
        for (var key in osMarketShare) {
            if (osMarketShare.hasOwnProperty(key)) {
                osKeys.push(key);
            }
        }
        
        for (var i = 0; i < osKeys.length; i++) {
            var os = osKeys[i];
            labels.push(os);
            data.push(osMarketShare[os].value);
            backgroundColors.push(osMarketShare[os].color);
            hoverBackgroundColors.push(osMarketShare[os].highlight);
        }

        var ctx = canvas.getContext('2d');
        osChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColors,
                    hoverBackgroundColor: hoverBackgroundColors,
                    borderWidth: 1,
                    borderColor: '#ffffff',
                    cutout: '70%',
                    cutoutPercentage: 70
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                legend: { display: false },
                tooltip: {
                    enabled: true,
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.raw + '%';
                        }
                    }
                },
                animation: { 
                    animateRotate: true,
                    animateScale: true,
                    duration: 1000
                },
                layout: {
                    padding: 0
                }
            }
        });

        generateLegend('osLegend', osMarketShare, osType);

    } catch (e) {
        console.error("OS chart init failed:", e);
    }
}

// 修复4：优化图例生成逻辑，避免空数据
function generateLegend(containerId, dataMap, highlightKey) {
    var container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';

    var keys = [];
    for (var key in dataMap) {
        if (dataMap.hasOwnProperty(key)) {
            keys.push(key);
        }
    }
    
    // 空数据保护
    if (keys.length === 0) {
        var emptyText = document.createElement('div');
        emptyText.className = 'legend-item';
        emptyText.textContent = '暂无数据';
        container.appendChild(emptyText);
        return;
    }
    
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var legendItem = document.createElement('div');
        legendItem.className = 'legend-item ' + (key === highlightKey ? 'legend-highlight' : '');
        
        var colorBox = document.createElement('div');
        colorBox.className = 'legend-color';
        colorBox.style.backgroundColor = (key === highlightKey) 
            ? dataMap[key].highlight 
            : dataMap[key].color;
        
        var text = document.createElement('span');
        text.textContent = key + ': ' + dataMap[key].value + '%';
        
        if (key === highlightKey) {
            text.textContent += ' (你的设备)';
        }

        legendItem.appendChild(colorBox);
        legendItem.appendChild(text);
        container.appendChild(legendItem);
    }
}

// 新增：版本状态图表更新函数（独立逻辑，便于维护）
function updateVersionStatusChart(browserName, isOutdated) {
    var statusText = document.getElementById('engineStatusText');
    if (!statusText) return;
    
    if (browserName === "Internet Explorer") {
        statusText.textContent = "已停止维护";
        statusText.style.color = "#F44336";
    } else if (isOutdated) {
        statusText.textContent = "版本过时";
        statusText.style.color = "#F44336";
    } else {
        statusText.textContent = "版本最新";
        statusText.style.color = "#4CAF50";
    }
}

function detectOs(userAgent) {
    var osName = "未知系统";
    
    if (userAgent.indexOf("Windows") !== -1) {
        osName = "Windows";
        if (userAgent.indexOf("Windows NT 10.0") !== -1) osName += " 10/11";
        else if (userAgent.indexOf("Windows NT 6.3") !== -1) osName += " 8.1";
        else if (userAgent.indexOf("Windows NT 6.2") !== -1) osName += " 8";
        else if (userAgent.indexOf("Windows NT 6.1") !== -1) osName += " 7";
        else if (userAgent.indexOf("Windows NT 6.0") !== -1) osName += " Vista";
        else if (userAgent.indexOf("Windows NT 5.1") !== -1) osName += " XP";
    } 
    else if (userAgent.indexOf("Mac OS X") !== -1) {
        var macVersion = userAgent.match(/Mac OS X (\d+_\d+)/);
        if (macVersion) {
            var version = macVersion[1].replace('_', '.');
            osName = 'macOS ' + version;
        } else {
            osName = "macOS";
        }
    } 
    else if (userAgent.indexOf("Linux") !== -1) {
        if (userAgent.indexOf("Ubuntu") !== -1) osName = "Ubuntu Linux";
        else if (userAgent.indexOf("CentOS") !== -1) osName = "CentOS Linux";
        else if (userAgent.indexOf("Fedora") !== -1) osName = "Fedora Linux";
        else osName = "Linux";
    } 
    else if (userAgent.indexOf("Android") !== -1) {
        var androidVersion = userAgent.match(/Android (\d+\.\d+)/);
        if (androidVersion) {
            osName = 'Android ' + androidVersion[1];
        } else {
            osName = "Android";
        }
    } 
    else if (userAgent.indexOf("iOS") !== -1 || userAgent.indexOf("iPhone") !== -1 || userAgent.indexOf("iPad") !== -1) {
        var iosVersion = userAgent.match(/OS (\d+)_(\d+)/);
        if (iosVersion) {
            osName = 'iOS ' + iosVersion[1] + '.' + iosVersion[2];
        } else {
            osName = "iOS";
        }
    }
    else if (userAgent.indexOf("ChromeOS") !== -1) osName = "ChromeOS";
    else if (userAgent.indexOf("FreeBSD") !== -1) osName = "FreeBSD";

    return osName;
}

function detectBrowserInfo() {
    var userAgent = navigator.userAgent || "";
    
    var browserName = "未知浏览器";
    var browserEngine = "未知内核";
    var browserVersion = "未知版本";
    var osName = "未知系统";
    var isOutdated = false;
    
    osName = detectOs(userAgent);
    
    if (userAgent.indexOf("Edg") !== -1) {
        browserName = "Microsoft Edge";
        browserEngine = "Blink";
        var edgeVersion = userAgent.match(/Edg\/(\d+)/);
        browserVersion = edgeVersion ? edgeVersion[1] : "未知";
        isOutdated = edgeVersion ? (parseInt(edgeVersion[1]) < latestVersions[browserName]) : true;
    } else if (userAgent.indexOf("Chrome") !== -1 && userAgent.indexOf("Edg") === -1) {
        browserName = "Google Chrome";
        browserEngine = "Blink";
        var chromeVersion = userAgent.match(/Chrome\/(\d+)/);
        browserVersion = chromeVersion ? chromeVersion[1] : "未知";
        isOutdated = chromeVersion ? (parseInt(chromeVersion[1]) < latestVersions[browserName]) : true;
    } else if (userAgent.indexOf("Safari") !== -1 && userAgent.indexOf("Chrome") === -1) {
        browserName = "Apple Safari";
        browserEngine = "WebKit";
        var safariVersion = userAgent.match(/Version\/(\d+)/);
        browserVersion = safariVersion ? safariVersion[1] : "未知";
        isOutdated = safariVersion ? (parseInt(safariVersion[1]) < latestVersions[browserName]) : true;
    } else if (userAgent.indexOf("Firefox") !== -1) {
        browserName = "Mozilla Firefox";
        browserEngine = "Gecko";
        var firefoxVersion = userAgent.match(/Firefox\/(\d+)/);
        browserVersion = firefoxVersion ? firefoxVersion[1] : "未知";
        isOutdated = firefoxVersion ? (parseInt(firefoxVersion[1]) < latestVersions[browserName]) : true;
    } else if (userAgent.indexOf("Opera") !== -1 || userAgent.indexOf("OPR") !== -1) {
        browserName = "Opera";
        browserEngine = "Blink";
        var operaVersion = userAgent.match(/OPR\/(\d+)/) || userAgent.match(/Opera\/(\d+)/);
        browserVersion = operaVersion ? operaVersion[1] : "未知";
        isOutdated = operaVersion ? (parseInt(operaVersion[1]) < latestVersions[browserName]) : true;
    } else if (userAgent.indexOf("Trident") !== -1 || userAgent.indexOf("MSIE") !== -1) {
        browserName = "Internet Explorer";
        browserEngine = "Trident";
        var ieVersion = userAgent.match(/MSIE (\d+)/) || userAgent.match(/rv:(\d+)/);
        browserVersion = ieVersion ? ieVersion[1] : "未知";
        isOutdated = true;
    }
    
    // 更新基础信息
    document.getElementById("browser-name").textContent = browserName;
    document.getElementById("browser-engine").textContent = browserEngine;
    document.getElementById("browser-version").textContent = browserVersion;
    document.getElementById("os-name").textContent = osName;
    document.getElementById("user-agent").textContent = userAgent;
    document.getElementById("kernel-release").textContent = kernelReleaseInfo[browserEngine] || "未知";
    
    // 更新版本状态标签
    var statusElement = document.getElementById("kernel-status");
    statusElement.textContent = isOutdated ? "已过时" : "最新版";
    statusElement.className = 'meta-tag ' + (isOutdated ? 'tag-outdated' : 'tag-latest');
    
    // 更新浏览器图标
    var iconPath = browserIconPaths[browserName] || browserIconPaths["未知浏览器"];
    document.getElementById("browser-icon").innerHTML = 
        '<img src="' + iconPath + '" width="40" height="40" alt="' + browserName + '图标">';
    
    // 更新副标题
    var osType = osName.split(' ')[0];
    document.getElementById("engineSubtitle").textContent = 
        '你的浏览器内核：' + browserEngine + ' (' + (engineMarketShare[browserEngine]?.value || 0) + '%)';
    document.getElementById("osSubtitle").textContent = 
        '你的操作系统：' + osType + ' (' + (osMarketShare[osType]?.value || 0) + '%)';
    
    // 修复5：延迟初始化图表，确保DOM完全就绪
    setTimeout(function() {
        // 初始化图表
        initEngineChart(browserEngine);
        initOsChart(osName);
        // 更新版本状态文字
        updateVersionStatusChart(browserName, isOutdated);
        // 更新系统图表状态文字
        var osStatusText = document.getElementById('osStatusText');
        if (osStatusText) {
            osStatusText.textContent = osType + '\n占比: ' + (osMarketShare[osType]?.value || 0) + '%';
            osStatusText.style.color = "#333";
        }
    }, 200); // 增加延迟，确保canvas渲染完成
}

// 修复6：确保页面完全加载后再初始化
function initPage() {
    // 双重检查：确保DOM和资源都加载完成
    if (document.readyState === 'complete') {
        detectBrowserInfo();
    } else {
        setTimeout(initPage, 100);
    }
}

if (document.addEventListener) {
    window.addEventListener('load', initPage); // 改用load事件，确保所有资源加载完成
} else {
    window.attachEvent('onload', initPage);
}