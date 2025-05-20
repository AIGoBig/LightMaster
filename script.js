document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素 - 基础控制
    const lightSource = document.getElementById('lightSource');
    const brightnessSlider = document.getElementById('brightness');
    const temperatureSlider = document.getElementById('temperature');
    const brightnessValue = document.getElementById('brightnessValue');
    const temperatureValue = document.getElementById('temperatureValue');
    
    // 获取DOM元素 - 高级功能
    const toggleAdvanced = document.getElementById('toggleAdvanced');
    const advancedPanel = document.getElementById('advancedPanel');
    const modeButtons = document.querySelectorAll('.mode-button');
    const colorFilters = document.querySelectorAll('.color-filter');
    const frequencySlider = document.getElementById('frequency');
    const frequencyValue = document.getElementById('frequencyValue');
    const batteryLevel = document.getElementById('batteryLevel');
    const batteryText = document.getElementById('batteryText');
    const batteryEstimate = document.getElementById('batteryEstimate');
    
    // 获取DOM元素 - 超级功能
    const voiceControlBtn = document.getElementById('voiceControlBtn');
    const sceneBtn = document.getElementById('sceneBtn');
    const voiceModal = document.getElementById('voiceModal');
    const sceneModal = document.getElementById('sceneModal');
    const settingsModal = document.getElementById('settingsModal');
    const closeVoiceModal = document.getElementById('closeVoiceModal');
    const closeSceneModal = document.getElementById('closeSceneModal');
    const closeSettingsModal = document.getElementById('closeSettingsModal');
    const startVoiceBtn = document.getElementById('startVoiceBtn');
    const voiceStatus = document.getElementById('voiceStatus');
    const voiceAnimation = document.getElementById('voiceAnimation');
    const sceneCards = document.querySelectorAll('.scene-card');
    const sceneButtons = document.querySelectorAll('.scene-button');
    const timerDecrement = document.getElementById('timerDecrement');
    const timerIncrement = document.getElementById('timerIncrement');
    const timerMinutes = document.getElementById('timerMinutes');
    const timerStart = document.getElementById('timerStart');
    const timerBar = document.getElementById('timerBar');
    const timerText = document.getElementById('timerText');
    const settingsBtn = document.getElementById('settingsBtn');
    const shareBtn = document.getElementById('shareBtn');
    const installBtn = document.getElementById('installBtn');
    const toast = document.getElementById('toast');
    
    // 设置选项元素
    const darkModeToggle = document.getElementById('darkModeToggle');
    const wakeLockToggle = document.getElementById('wakeLockToggle');
    const batteryInfoToggle = document.getElementById('batteryInfoToggle');
    const autoFullscreenToggle = document.getElementById('autoFullscreenToggle');
    const soundEffectsToggle = document.getElementById('soundEffectsToggle');
    const languageSelect = document.getElementById('languageSelect');
    const resetAppBtn = document.getElementById('resetAppBtn');
    
    // 灯光模式变量
    let currentMode = 'normal';
    let currentFilter = 'none';
    let currentScene = null;
    let animationInterval = null;
    let timerInterval = null;
    let timerTimeout = null;
    let timerActive = false;
    let timerDuration = 5; // 默认5分钟
    let timerStartTime = 0;
    let timerRemaining = 0;
    
    // 设置变量
    let settings = {
        darkMode: false,
        wakeLock: true,
        batteryInfo: true,
        autoFullscreen: false,
        soundEffects: false,
        language: 'zh-CN'
    };
    
    // 从localStorage加载设置
    loadSettings();
    
    // 禁止双击缩放
    document.addEventListener('dblclick', (e) => {
        e.preventDefault();
    });
    
    // 禁止缩放触摸手势
    document.addEventListener('gesturestart', (e) => {
        e.preventDefault();
    });
    
    // 高级功能显示/隐藏切换
    toggleAdvanced.addEventListener('click', () => {
        advancedPanel.classList.toggle('hidden');
        
        // 使用超时确保过渡动画可以正常工作
        setTimeout(() => {
            advancedPanel.classList.toggle('visible');
            document.querySelector('.arrow').classList.toggle('rotated');
        }, 10);
    });
    
    // 应用初始亮度和色温
    updateLight();
    
    // 初始化电池状态
    if (settings.batteryInfo) {
        initBatteryStatus();
    }
    
    // 根据设置应用自动全屏
    if (settings.autoFullscreen) {
        setTimeout(() => {
            toggleFullScreen();
        }, 1000);
    }
    
    // 监听亮度滑块变化
    brightnessSlider.addEventListener('input', () => {
        updateLight();
        brightnessValue.textContent = `${brightnessSlider.value}%`;
        playToneEffect(brightnessSlider.value);
    });
    
    // 监听色温滑块变化
    temperatureSlider.addEventListener('input', () => {
        updateLight();
        temperatureValue.textContent = `${temperatureSlider.value}K`;
        playClickEffect();
    });
    
    // 监听频率滑块变化
    frequencySlider.addEventListener('input', () => {
        frequencyValue.textContent = `${frequencySlider.value}Hz`;
        if (currentMode !== 'normal') {
            clearCurrentAnimation();
            applyLightMode(currentMode);
        }
        playClickEffect();
    });
    
    // 阻止默认的触摸行为，防止在触摸滑块时页面滚动
    document.querySelectorAll('.slider').forEach(slider => {
        slider.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
    });
    
    // 切换全屏模式（仅当点击不在控制面板上时）
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.controls') && !e.target.closest('.floating-controls') && 
            !e.target.closest('.modal')) {
            toggleFullScreen();
        }
    });
    
    // 监听模式按钮点击
    modeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const mode = button.getAttribute('data-mode');
            
            // 更新活动按钮
            modeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // 退出场景模式
            exitSceneMode();
            
            // 设置当前模式并应用
            currentMode = mode;
            clearCurrentAnimation();
            applyLightMode(mode);
            playClickEffect();
        });
    });
    
    // 监听颜色滤镜点击
    colorFilters.forEach(filter => {
        filter.addEventListener('click', () => {
            const filterType = filter.getAttribute('data-filter');
            
            // 更新活动滤镜
            colorFilters.forEach(f => f.classList.remove('active'));
            filter.classList.add('active');
            
            // 设置当前滤镜并应用
            currentFilter = filterType;
            updateLight();
            playClickEffect();
        });
    });
    
    // 场景按钮事件监听
    sceneButtons.forEach(button => {
        button.addEventListener('click', () => {
            const scene = button.getAttribute('data-scene');
            
            // 退出当前场景
            exitSceneMode();
            
            // 应用新场景
            applySceneMode(scene);
            playClickEffect();
            
            // 关闭高级面板
            hideAdvancedPanel();
        });
    });
    
    // 定时器控制
    timerDecrement.addEventListener('click', () => {
        if (parseInt(timerMinutes.value) > 1) {
            timerMinutes.value = parseInt(timerMinutes.value) - 1;
            playClickEffect();
        }
    });
    
    timerIncrement.addEventListener('click', () => {
        if (parseInt(timerMinutes.value) < 120) {
            timerMinutes.value = parseInt(timerMinutes.value) + 1;
            playClickEffect();
        }
    });
    
    timerMinutes.addEventListener('change', () => {
        let value = parseInt(timerMinutes.value);
        if (isNaN(value) || value < 1) {
            timerMinutes.value = 1;
        } else if (value > 120) {
            timerMinutes.value = 120;
        }
    });
    
    timerStart.addEventListener('click', () => {
        if (timerActive) {
            stopTimer();
            timerStart.textContent = '启动';
            showToast('定时器已取消');
        } else {
            startTimer(parseInt(timerMinutes.value));
            timerStart.textContent = '取消';
            showToast(`定时器已设置: ${timerMinutes.value}分钟`);
        }
        playClickEffect();
    });
    
    // 浮动按钮事件
    voiceControlBtn.addEventListener('click', () => {
        openModal(voiceModal);
        playClickEffect();
    });
    
    sceneBtn.addEventListener('click', () => {
        openModal(sceneModal);
        playClickEffect();
    });
    
    // 模态框关闭按钮
    closeVoiceModal.addEventListener('click', () => {
        closeModal(voiceModal);
        stopVoiceRecognition();
        playClickEffect();
    });
    
    closeSceneModal.addEventListener('click', () => {
        closeModal(sceneModal);
        playClickEffect();
    });
    
    closeSettingsModal.addEventListener('click', () => {
        closeModal(settingsModal);
        playClickEffect();
    });
    
    // 场景卡片点击
    sceneCards.forEach(card => {
        card.addEventListener('click', () => {
            const scene = card.getAttribute('data-scene');
            
            // 退出当前场景
            exitSceneMode();
            
            // 应用新场景
            applySceneMode(scene);
            
            // 关闭模态框
            closeModal(sceneModal);
            
            playClickEffect();
        });
    });
    
    // 设置按钮
    settingsBtn.addEventListener('click', () => {
        openModal(settingsModal);
        playClickEffect();
    });
    
    // 分享按钮
    shareBtn.addEventListener('click', () => {
        shareApp();
        playClickEffect();
    });
    
    // 安装按钮
    installBtn.addEventListener('click', () => {
        installApp();
        playClickEffect();
    });
    
    // 设置项变更事件
    darkModeToggle.addEventListener('change', () => {
        settings.darkMode = darkModeToggle.checked;
        document.body.classList.toggle('dark-mode', settings.darkMode);
        saveSettings();
        playClickEffect();
    });
    
    wakeLockToggle.addEventListener('change', () => {
        settings.wakeLock = wakeLockToggle.checked;
        if (settings.wakeLock) {
            requestWakeLock();
        } else if (wakeLock) {
            wakeLock.release();
            wakeLock = null;
        }
        saveSettings();
        playClickEffect();
    });
    
    batteryInfoToggle.addEventListener('change', () => {
        settings.batteryInfo = batteryInfoToggle.checked;
        if (settings.batteryInfo) {
            initBatteryStatus();
        }
        saveSettings();
        playClickEffect();
    });
    
    autoFullscreenToggle.addEventListener('change', () => {
        settings.autoFullscreen = autoFullscreenToggle.checked;
        saveSettings();
        playClickEffect();
    });
    
    soundEffectsToggle.addEventListener('change', () => {
        settings.soundEffects = soundEffectsToggle.checked;
        saveSettings();
        playClickEffect();
    });
    
    languageSelect.addEventListener('change', () => {
        settings.language = languageSelect.value;
        saveSettings();
        playClickEffect();
    });
    
    resetAppBtn.addEventListener('click', () => {
        if (confirm('确定要重置所有设置吗？这将清除所有自定义设置。')) {
            localStorage.removeItem('flashlightSettings');
            showToast('设置已重置，刷新页面以应用更改');
            setTimeout(() => {
                location.reload();
            }, 3000);
        }
        playClickEffect();
    });
    
    // 语音控制
    startVoiceBtn.addEventListener('click', () => {
        startVoiceRecognition();
        playClickEffect();
    });
    
    // 全屏切换功能
    function toggleFullScreen() {
        if (!document.fullscreenElement) {
            // 尝试进入全屏模式
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.webkitRequestFullscreen) { /* Safari */
                document.documentElement.webkitRequestFullscreen();
            }
            // 锁定屏幕方向为竖屏（如果支持）
            if (screen.orientation && screen.orientation.lock) {
                screen.orientation.lock('portrait').catch(err => {
                    // 忽略错误，某些设备或浏览器可能不支持
                });
            }
        } else {
            // 退出全屏
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) { /* Safari */
                document.webkitExitFullscreen();
            }
        }
    }
    
    // 防止屏幕休眠
    let wakeLock = null;
    
    async function requestWakeLock() {
        try {
            if ('wakeLock' in navigator && settings.wakeLock) {
                wakeLock = await navigator.wakeLock.request('screen');
                wakeLock.addEventListener('release', () => {
                    // 如果 wake lock 被释放，尝试重新获取
                    if (settings.wakeLock) {
                        requestWakeLock();
                    }
                });
            }
        } catch (err) {
            // 某些浏览器可能不支持 Wake Lock API
            console.log(`Wake Lock 错误: ${err.message}`);
        }
    }
    
    // 请求屏幕常亮
    if (settings.wakeLock) {
        requestWakeLock();
    }
    
    // 页面可见性变化时重新获取 wake lock
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && wakeLock === null && settings.wakeLock) {
            requestWakeLock();
        }
    });
    
    // 更新光源函数
    function updateLight() {
        const brightness = brightnessSlider.value;
        const temperature = temperatureSlider.value;
        
        // 将色温转换为RGB颜色
        let rgb = colorTemperatureToRGB(temperature);
        
        // 应用颜色滤镜
        rgb = applyColorFilter(rgb, currentFilter);
        
        // 应用亮度和颜色到光源
        lightSource.style.backgroundColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        
        // 仅在非动画模式下设置不透明度
        if (currentMode === 'normal' && !currentScene) {
            lightSource.style.opacity = brightness / 100;
        }
        
        // 根据亮度调整控制面板颜色
        const controls = document.querySelector('.controls');
        const labels = document.querySelectorAll('label');
        const valueDisplays = document.querySelectorAll('.value-display');
        const modeTitles = document.querySelectorAll('.mode-title');
        
        if (brightness > 70) {
            controls.classList.add('high-light');
            controls.classList.remove('low-light');
            
            // 亮度高时文字改为深色
            labels.forEach(label => label.style.color = '#000');
            valueDisplays.forEach(display => display.style.color = 'rgba(0, 0, 0, 0.8)');
            modeTitles.forEach(title => title.style.color = 'rgba(0, 0, 0, 0.8)');
        } else {
            controls.classList.add('low-light');
            controls.classList.remove('high-light');
            
            // 亮度低时文字改为浅色
            labels.forEach(label => label.style.color = '#fff');
            valueDisplays.forEach(display => display.style.color = 'rgba(255, 255, 255, 0.8)');
            modeTitles.forEach(title => title.style.color = 'rgba(255, 255, 255, 0.9)');
        }
    }
    
    // 应用灯光模式
    function applyLightMode(mode) {
        const brightness = brightnessSlider.value;
        
        // 移除所有动画类
        lightSource.classList.remove('strobe-active', 'pulse-active', 'sos-active',
                                    'candle-active', 'campfire-active', 'police-active');
        
        switch(mode) {
            case 'normal':
                // 常亮模式，无需动画
                lightSource.style.opacity = brightness / 100;
                lightSource.style.animationDuration = 'initial';
                break;
                
            case 'strobe':
                // 频闪模式
                const duration = 1 / frequencySlider.value;
                lightSource.classList.add('strobe-active');
                lightSource.style.opacity = brightness / 100;
                lightSource.style.animationDuration = `${duration}s`;
                break;
                
            case 'pulse':
                // 呼吸模式
                lightSource.classList.add('pulse-active');
                lightSource.style.opacity = brightness / 100;
                lightSource.style.animationDuration = `${3}s`;
                break;
                
            case 'sos':
                // SOS紧急模式
                lightSource.classList.add('sos-active');
                lightSource.style.opacity = brightness / 100;
                break;
        }
    }
    
    // 应用场景模式
    function applySceneMode(scene) {
        // 退出当前动画模式
        clearCurrentAnimation();
        
        // 保存当前场景
        currentScene = scene;
        
        // 亮度
        const brightness = brightnessSlider.value;
        
        // 将模式按钮重置
        modeButtons.forEach(btn => btn.classList.remove('active'));
        modeButtons[0].classList.add('active');
        
        // 移除所有动画类
        lightSource.classList.remove('strobe-active', 'pulse-active', 'sos-active',
                                    'candle-active', 'campfire-active', 'police-active');
        
        switch(scene) {
            case 'candlelight':
                // 烛光效果
                lightSource.style.backgroundColor = '#ffb84d';
                lightSource.style.opacity = brightness / 100;
                lightSource.classList.add('candle-active');
                showToast('烛光模式');
                break;
                
            case 'campfire':
                // 篝火效果
                lightSource.style.backgroundColor = '#ff7b25';
                lightSource.style.opacity = brightness / 100;
                lightSource.classList.add('campfire-active');
                showToast('篝火模式');
                break;
                
            case 'rainbow':
                // 彩虹效果
                startRainbowEffect();
                showToast('彩虹模式');
                break;
                
            case 'police':
                // 警灯效果
                lightSource.style.opacity = brightness / 100;
                lightSource.classList.add('police-active');
                showToast('警灯模式');
                break;
                
            case 'lightning':
                // 闪电效果
                startLightningEffect();
                showToast('闪电模式');
                break;
                
            case 'nightlight':
                // 夜灯效果
                lightSource.style.backgroundColor = '#ffcc80';
                lightSource.style.opacity = Math.min(brightness / 100, 0.4);
                showToast('夜灯模式');
                break;
                
            case 'sunset':
                // 日落效果
                startSunsetEffect();
                showToast('日落模式');
                break;
                
            case 'party':
                // 派对效果
                startPartyEffect();
                showToast('派对模式');
                break;
        }
    }
    
    // 退出场景模式
    function exitSceneMode() {
        if (currentScene) {
            clearCurrentAnimation();
            currentScene = null;
            updateLight();
        }
    }
    
    // 彩虹效果
    function startRainbowEffect() {
        clearCurrentAnimation();
        
        const brightness = brightnessSlider.value / 100;
        let hue = 0;
        
        animationInterval = setInterval(() => {
            hue = (hue + 1) % 360;
            lightSource.style.backgroundColor = `hsl(${hue}, 100%, 50%)`;
            lightSource.style.opacity = brightness;
        }, 100);
    }
    
    // 闪电效果
    function startLightningEffect() {
        clearCurrentAnimation();
        
        const brightness = brightnessSlider.value / 100;
        lightSource.style.backgroundColor = '#ffffff';
        lightSource.style.opacity = 0;
        
        function flash() {
            // 随机闪烁
            setTimeout(() => {
                if (currentScene === 'lightning') {
                    const flashDuration = Math.random() * 200 + 50;
                    const flashBrightness = Math.random() * 0.3 + 0.7;
                    
                    lightSource.style.opacity = flashBrightness * brightness;
                    
                    setTimeout(() => {
                        lightSource.style.opacity = 0;
                        
                        // 随机决定下一次闪烁时间
                        const nextFlash = Math.random() * 3000 + 500;
                        setTimeout(flash, nextFlash);
                    }, flashDuration);
                }
            }, Math.random() * 2000 + 500);
        }
        
        flash();
    }
    
    // 日落效果
    function startSunsetEffect() {
        clearCurrentAnimation();
        
        const brightness = brightnessSlider.value / 100;
        let progress = 0;
        const duration = 10000; // 10秒完成一个循环
        const interval = 50;
        
        animationInterval = setInterval(() => {
            progress = (progress + interval) % duration;
            const ratio = progress / duration;
            
            // 根据进度计算颜色 - 从橙红色到深红色再回到橙红色
            const r = 255;
            const g = Math.round(130 * Math.sin(ratio * Math.PI) + 50);
            const b = Math.round(80 * Math.sin(ratio * Math.PI * 0.5));
            
            lightSource.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
            lightSource.style.opacity = brightness;
        }, interval);
    }
    
    // 派对效果
    function startPartyEffect() {
        clearCurrentAnimation();
        
        const brightness = brightnessSlider.value / 100;
        const colors = [
            'rgb(255, 0, 0)', // 红
            'rgb(0, 255, 0)', // 绿
            'rgb(0, 0, 255)', // 蓝
            'rgb(255, 255, 0)', // 黄
            'rgb(255, 0, 255)', // 紫
            'rgb(0, 255, 255)', // 青
            'rgb(255, 165, 0)', // 橙
            'rgb(255, 192, 203)' // 粉
        ];
        let colorIndex = 0;
        
        animationInterval = setInterval(() => {
            colorIndex = (colorIndex + 1) % colors.length;
            lightSource.style.backgroundColor = colors[colorIndex];
            lightSource.style.opacity = brightness;
        }, 300);
    }
    
    // 清除当前动画
    function clearCurrentAnimation() {
        lightSource.classList.remove('strobe-active', 'pulse-active', 'sos-active',
                                    'candle-active', 'campfire-active', 'police-active');
                                    
        if (animationInterval) {
            clearInterval(animationInterval);
            animationInterval = null;
        }
    }
    
    // 定时器功能
    function startTimer(minutes) {
        stopTimer();
        
        timerActive = true;
        timerDuration = minutes * 60 * 1000; // 转换为毫秒
        timerStartTime = Date.now();
        timerRemaining = timerDuration;
        
        updateTimerUI();
        
        timerInterval = setInterval(updateTimerUI, 1000);
        
        timerTimeout = setTimeout(() => {
            stopTimer();
            lightSource.style.opacity = 0;
            showToast('定时器结束，手电筒已关闭');
            playAlarmEffect();
            timerStart.textContent = '启动';
        }, timerDuration);
    }
    
    function stopTimer() {
        timerActive = false;
        
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        
        if (timerTimeout) {
            clearTimeout(timerTimeout);
            timerTimeout = null;
        }
        
        timerBar.style.width = '0%';
        timerText.textContent = '未启动';
    }
    
    function updateTimerUI() {
        if (!timerActive) return;
        
        const elapsed = Date.now() - timerStartTime;
        timerRemaining = Math.max(0, timerDuration - elapsed);
        
        // 计算剩余分钟和秒数
        const remainingMinutes = Math.floor(timerRemaining / (60 * 1000));
        const remainingSeconds = Math.floor((timerRemaining % (60 * 1000)) / 1000);
        
        // 更新进度条
        const progressPercent = Math.max(0, 100 - (elapsed / timerDuration * 100));
        timerBar.style.width = `${progressPercent}%`;
        
        // 更新文本显示
        timerText.textContent = `剩余 ${remainingMinutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }
    
    // 应用颜色滤镜
    function applyColorFilter(rgb, filter) {
        switch(filter) {
            case 'none':
                // 不改变颜色
                return rgb;
                
            case 'red':
                return { r: rgb.r, g: Math.floor(rgb.g * 0.3), b: Math.floor(rgb.b * 0.3) };
                
            case 'green':
                return { r: Math.floor(rgb.r * 0.3), g: rgb.g, b: Math.floor(rgb.b * 0.3) };
                
            case 'blue':
                return { r: Math.floor(rgb.r * 0.3), g: Math.floor(rgb.g * 0.3), b: rgb.b };
                
            case 'amber':
                return { r: rgb.r, g: Math.floor(rgb.g * 0.7), b: Math.floor(rgb.b * 0.2) };
                
            case 'purple':
                return { r: Math.floor(rgb.r * 0.8), g: Math.floor(rgb.g * 0.3), b: rgb.b };
                
            default:
                return rgb;
        }
    }
    
    // 电池状态监测
    async function initBatteryStatus() {
        try {
            if ('getBattery' in navigator) {
                const battery = await navigator.getBattery();
                
                // 初始显示
                updateBatteryInfo(battery);
                
                // 监听电池变化
                battery.addEventListener('levelchange', () => updateBatteryInfo(battery));
                battery.addEventListener('chargingchange', () => updateBatteryInfo(battery));
            } else {
                batteryText.textContent = '电池信息不可用';
                batteryEstimate.textContent = '不支持电池API';
            }
        } catch (err) {
            batteryText.textContent = '电池信息不可用';
            batteryEstimate.textContent = '获取电池信息时出错';
        }
    }
    
    // 更新电池信息显示
    function updateBatteryInfo(battery) {
        // 设置电量百分比
        const levelPercent = Math.floor(battery.level * 100);
        batteryLevel.style.width = `${levelPercent}%`;
        
        // 根据电量设置颜色
        if (levelPercent <= 20) {
            batteryLevel.style.background = 'linear-gradient(90deg, #f44336, #ff5722)';
        } else if (levelPercent <= 50) {
            batteryLevel.style.background = 'linear-gradient(90deg, #ff9800, #ffc107)';
        } else {
            batteryLevel.style.background = 'linear-gradient(90deg, #4CAF50, #8BC34A)';
        }
        
        // 显示电量文本
        if (battery.charging) {
            batteryText.textContent = `${levelPercent}% - 正在充电`;
            batteryEstimate.textContent = '电池充电中';
        } else {
            batteryText.textContent = `${levelPercent}%`;
            
            // 估算剩余使用时间
            const estimatedMinutes = Math.floor(battery.level * 90); // 假设90分钟是满电量时间
            const hours = Math.floor(estimatedMinutes / 60);
            const minutes = estimatedMinutes % 60;
            
            if (hours > 0) {
                batteryEstimate.textContent = `估计剩余 ${hours}小时${minutes}分钟`;
            } else {
                batteryEstimate.textContent = `估计剩余 ${minutes}分钟`;
            }
        }
    }
    
    // 色温转RGB算法（基于近似值）
    function colorTemperatureToRGB(kelvin) {
        // 限制色温范围
        kelvin = Math.max(1000, Math.min(40000, kelvin));
        
        let temp = kelvin / 100;
        let r, g, b;
        
        // 红色
        if (temp <= 66) {
            r = 255;
        } else {
            r = temp - 60;
            r = 329.698727446 * Math.pow(r, -0.1332047592);
            r = Math.max(0, Math.min(255, r));
        }
        
        // 绿色
        if (temp <= 66) {
            g = temp;
            g = 99.4708025861 * Math.log(g) - 161.1195681661;
        } else {
            g = temp - 60;
            g = 288.1221695283 * Math.pow(g, -0.0755148492);
        }
        g = Math.max(0, Math.min(255, g));
        
        // 蓝色
        if (temp >= 66) {
            b = 255;
        } else if (temp <= 19) {
            b = 0;
        } else {
            b = temp - 10;
            b = 138.5177312231 * Math.log(b) - 305.0447927307;
            b = Math.max(0, Math.min(255, b));
        }
        
        return {
            r: Math.round(r),
            g: Math.round(g),
            b: Math.round(b)
        };
    }
    
    // 语音识别逻辑
    let recognition = null;
    
    function startVoiceRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            voiceStatus.textContent = '浏览器不支持语音识别';
            showToast('浏览器不支持语音识别功能');
            return;
        }
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.lang = settings.language;
        recognition.continuous = false;
        recognition.interimResults = false;
        
        recognition.onstart = () => {
            voiceStatus.textContent = '正在聆听...';
            voiceAnimation.classList.add('active');
            startVoiceBtn.disabled = true;
        };
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.toLowerCase();
            voiceStatus.textContent = `识别结果: "${transcript}"`;
            
            processVoiceCommand(transcript);
        };
        
        recognition.onerror = (event) => {
            voiceStatus.textContent = `错误: ${event.error}`;
            voiceAnimation.classList.remove('active');
            startVoiceBtn.disabled = false;
        };
        
        recognition.onend = () => {
            voiceAnimation.classList.remove('active');
            startVoiceBtn.disabled = false;
        };
        
        recognition.start();
    }
    
    function stopVoiceRecognition() {
        if (recognition) {
            recognition.stop();
            recognition = null;
        }
    }
    
    function processVoiceCommand(command) {
        // 亮度控制
        if (command.includes('调高亮度') || command.includes('增加亮度')) {
            const currentValue = parseInt(brightnessSlider.value);
            brightnessSlider.value = Math.min(100, currentValue + 20);
            brightnessValue.textContent = `${brightnessSlider.value}%`;
            updateLight();
            showToast(`亮度已增加至 ${brightnessSlider.value}%`);
        }
        else if (command.includes('调低亮度') || command.includes('降低亮度') || command.includes('减少亮度')) {
            const currentValue = parseInt(brightnessSlider.value);
            brightnessSlider.value = Math.max(0, currentValue - 20);
            brightnessValue.textContent = `${brightnessSlider.value}%`;
            updateLight();
            showToast(`亮度已降低至 ${brightnessSlider.value}%`);
        }
        else if (command.includes('亮度') && command.includes('%')) {
            const match = command.match(/(\d+)%/);
            if (match && match[1]) {
                const value = parseInt(match[1]);
                if (value >= 0 && value <= 100) {
                    brightnessSlider.value = value;
                    brightnessValue.textContent = `${value}%`;
                    updateLight();
                    showToast(`亮度已设置为 ${value}%`);
                }
            }
        }
        
        // 色温控制
        if (command.includes('暖光') || command.includes('暖色')) {
            temperatureSlider.value = 3000;
            temperatureValue.textContent = `3000K`;
            updateLight();
            showToast('色温已设置为暖光模式');
        }
        else if (command.includes('冷光') || command.includes('冷色') || command.includes('白光')) {
            temperatureSlider.value = 6500;
            temperatureValue.textContent = `6500K`;
            updateLight();
            showToast('色温已设置为冷光模式');
        }
        else if (command.includes('色温') && /\d+/.test(command)) {
            const match = command.match(/(\d+)/);
            if (match && match[1]) {
                const value = parseInt(match[1]);
                if (value >= 1800 && value <= 10000) {
                    temperatureSlider.value = value;
                    temperatureValue.textContent = `${value}K`;
                    updateLight();
                    showToast(`色温已设置为 ${value}K`);
                }
            }
        }
        
        // 模式控制
        if (command.includes('常亮') || command.includes('普通') || command.includes('正常')) {
            exitSceneMode();
            currentMode = 'normal';
            clearCurrentAnimation();
            applyLightMode('normal');
            updateModeButtons('normal');
            showToast('已切换至常亮模式');
        }
        else if (command.includes('频闪') || command.includes('闪烁')) {
            exitSceneMode();
            currentMode = 'strobe';
            clearCurrentAnimation();
            applyLightMode('strobe');
            updateModeButtons('strobe');
            showToast('已切换至频闪模式');
        }
        else if (command.includes('呼吸')) {
            exitSceneMode();
            currentMode = 'pulse';
            clearCurrentAnimation();
            applyLightMode('pulse');
            updateModeButtons('pulse');
            showToast('已切换至呼吸模式');
        }
        else if (command.includes('sos') || command.includes('求救')) {
            exitSceneMode();
            currentMode = 'sos';
            clearCurrentAnimation();
            applyLightMode('sos');
            updateModeButtons('sos');
            showToast('已切换至SOS求救模式');
        }
        
        // 滤镜控制
        if (command.includes('红色') || command.includes('红光')) {
            currentFilter = 'red';
            updateFilterButtons('red');
            updateLight();
            showToast('已应用红色滤镜');
        }
        else if (command.includes('绿色') || command.includes('绿光')) {
            currentFilter = 'green';
            updateFilterButtons('green');
            updateLight();
            showToast('已应用绿色滤镜');
        }
        else if (command.includes('蓝色') || command.includes('蓝光')) {
            currentFilter = 'blue';
            updateFilterButtons('blue');
            updateLight();
            showToast('已应用蓝色滤镜');
        }
        else if (command.includes('琥珀') || command.includes('黄光')) {
            currentFilter = 'amber';
            updateFilterButtons('amber');
            updateLight();
            showToast('已应用琥珀色滤镜');
        }
        else if (command.includes('紫色') || command.includes('紫光')) {
            currentFilter = 'purple';
            updateFilterButtons('purple');
            updateLight();
            showToast('已应用紫色滤镜');
        }
        else if (command.includes('取消滤镜') || command.includes('清除滤镜') || command.includes('关闭滤镜') || command.includes('去掉滤镜')) {
            currentFilter = 'none';
            updateFilterButtons('none');
            updateLight();
            showToast('已清除颜色滤镜');
        }
        
        // 场景控制
        if (command.includes('烛光')) {
            applySceneMode('candlelight');
        }
        else if (command.includes('篝火')) {
            applySceneMode('campfire');
        }
        else if (command.includes('彩虹')) {
            applySceneMode('rainbow');
        }
        else if (command.includes('警灯') || command.includes('警车')) {
            applySceneMode('police');
        }
        else if (command.includes('闪电')) {
            applySceneMode('lightning');
        }
        else if (command.includes('夜灯')) {
            applySceneMode('nightlight');
        }
        else if (command.includes('日落')) {
            applySceneMode('sunset');
        }
        else if (command.includes('派对')) {
            applySceneMode('party');
        }
        
        // 定时器控制
        if (command.includes('定时') && /\d+/.test(command)) {
            const match = command.match(/(\d+)/);
            if (match && match[1]) {
                const minutes = parseInt(match[1]);
                if (minutes > 0 && minutes <= 120) {
                    timerMinutes.value = minutes;
                    startTimer(minutes);
                    timerStart.textContent = '取消';
                    showToast(`定时器已设置: ${minutes}分钟`);
                }
            }
        }
        else if (command.includes('取消定时') || command.includes('关闭定时') || command.includes('停止定时')) {
            if (timerActive) {
                stopTimer();
                timerStart.textContent = '启动';
                showToast('定时器已取消');
            }
        }
        
        // 其他控制
        if (command.includes('全屏')) {
            toggleFullScreen();
            showToast('已切换全屏模式');
        }
        else if (command.includes('关闭') || command.includes('关灯') || command.includes('熄灭')) {
            brightnessSlider.value = 0;
            brightnessValue.textContent = `0%`;
            updateLight();
            showToast('已关闭灯光');
        }
        else if (command.includes('打开') || command.includes('开灯') || command.includes('亮起')) {
            brightnessSlider.value = 100;
            brightnessValue.textContent = `100%`;
            updateLight();
            showToast('已打开灯光');
        }
        
        // 关闭语音控制面板
        setTimeout(() => {
            closeModal(voiceModal);
        }, 2000);
    }
    
    // 更新对应按钮状态
    function updateModeButtons(mode) {
        modeButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-mode') === mode) {
                btn.classList.add('active');
            }
        });
    }
    
    function updateFilterButtons(filter) {
        colorFilters.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-filter') === filter) {
                btn.classList.add('active');
            }
        });
    }
    
    // 模态框控制
    function openModal(modal) {
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
    }
    
    function closeModal(modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
    
    // 隐藏高级面板
    function hideAdvancedPanel() {
        advancedPanel.classList.remove('visible');
        setTimeout(() => {
            advancedPanel.classList.add('hidden');
            document.querySelector('.arrow').classList.remove('rotated');
        }, 500);
    }
    
    // 生成QR码（简易实现 - 使用外部库）
    function generateQRCode() {
        const qrLoading = document.getElementById('qrLoading');
        const qrCode = document.getElementById('qrCode');
        
        if (!window.QRCode) {
            qrLoading.textContent = '加载QR库失败';
            return;
        }
        
        try {
            qrLoading.style.display = 'none';
            qrCode.style.display = 'block';
            
            // 获取当前页面URL加控制参数
            const controlUrl = `${window.location.href.split('?')[0]}?remote=1`;
            
            // 生成二维码
            new QRCode(qrCode, {
                text: controlUrl,
                width: 150,
                height: 150,
                colorDark: '#000',
                colorLight: '#fff',
                correctLevel: QRCode.CorrectLevel.L
            });
        } catch (err) {
            qrLoading.textContent = '生成二维码失败';
            console.error(err);
        }
    }
    
    // 分享功能
    async function shareApp() {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: '高级手电筒',
                    text: '一个功能强大的手电筒网页应用，支持亮度和色温调节、多种灯光模式和场景',
                    url: window.location.href
                });
                showToast('分享成功');
            } catch (err) {
                if (err.name !== 'AbortError') {
                    showToast('分享失败');
                    console.error(err);
                }
            }
        } else {
            // 回退到复制链接
            const dummy = document.createElement('input');
            dummy.value = window.location.href;
            document.body.appendChild(dummy);
            dummy.select();
            document.execCommand('copy');
            document.body.removeChild(dummy);
            showToast('链接已复制到剪贴板');
        }
    }
    
    // 安装PWA
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (e) => {
        // 阻止Chrome 67及更早版本自动显示安装提示
        e.preventDefault();
        // 存储事件以便稍后触发
        deferredPrompt = e;
        // 更新UI以通知用户可以安装应用
        installBtn.style.display = 'block';
    });
    
    function installApp() {
        if (!deferredPrompt) {
            showToast('应用已安装或不支持安装');
            return;
        }
        
        // 显示安装提示
        deferredPrompt.prompt();
        
        // 等待用户响应提示
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                showToast('应用安装成功');
            } else {
                showToast('应用安装已取消');
            }
            deferredPrompt = null;
        });
    }
    
    // 显示提示消息
    function showToast(message, duration = 2000) {
        toast.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    }
    
    // 音效
    function playClickEffect() {
        if (!settings.soundEffects) return;
        
        const audio = new Audio('data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAeAAAcIAAcHBwcHBwcHBwcHBw8PDw8PDw8PDw8PDxcXFxcXFxcXFxcXFxcfHx8fHx8fHx8fHx8nJycnJycnJycnJycnLy8vLy8vLy8vLy8vNzc3Nzc3Nzc3Nzc3Pz8/Pz8/Pz8/Pz8/P////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAHCDUxJqJAAAAAAAAAAAAAAAAAAAA//sQZAAP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=');
        audio.play();
    }
    
    function playToneEffect(value) {
        if (!settings.soundEffects) return;
        
        // 根据数值变化生成不同频率的声音
        const frequency = 300 + (value * 5);
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        gainNode.gain.value = 0.1;
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.start();
        
        setTimeout(() => {
            oscillator.stop();
            audioCtx.close();
        }, 50);
    }
    
    function playAlarmEffect() {
        if (!settings.soundEffects) return;
        
        const audio = new Audio('data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAsAABXoAAEBAkJDQ0SEhYWGxsfHyQkKCgtLTExNjY6Oj8/Q0NISDc3NztVVVpeTo5OTlJSV1dcXGBgZWVqam5udXV6en5+goKHh4uLj4+UlJiYjlVVVVWOjo6Ol5eXl5qampqenp6ep6enp6qqqqqu/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/P////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAULAAAAAAAAV6A7SWuJAAAAAAAAAAAAAAAAAAAA//tQZAAP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAETE1UMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ==');
        audio.play();
    }
    
    // 设置和存储
    function saveSettings() {
        localStorage.setItem('flashlightSettings', JSON.stringify(settings));
    }
    
    function loadSettings() {
        const storedSettings = localStorage.getItem('flashlightSettings');
        if (storedSettings) {
            try {
                const parsedSettings = JSON.parse(storedSettings);
                settings = { ...settings, ...parsedSettings };
                
                // 应用已加载的设置
                darkModeToggle.checked = settings.darkMode;
                document.body.classList.toggle('dark-mode', settings.darkMode);
                
                wakeLockToggle.checked = settings.wakeLock;
                batteryInfoToggle.checked = settings.batteryInfo;
                autoFullscreenToggle.checked = settings.autoFullscreen;
                soundEffectsToggle.checked = settings.soundEffects;
                
                if (languageSelect) {
                    languageSelect.value = settings.language;
                }
            } catch (err) {
                console.error('设置加载失败:', err);
            }
        }
    }
    
    // 检查是否从远程控制链接打开
    function checkRemoteControl() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('remote')) {
            document.querySelector('.controls').style.display = 'none';
            document.querySelector('.floating-controls').style.display = 'none';
            showToast('远程控制模式');
        } else {
            // 初始化远程控制二维码
            if (window.QRCode) {
                setTimeout(generateQRCode, 1000);
            }
        }
    }
    
    // 初始化页面
    checkRemoteControl();
}); 