// PomoChill App - Versão Reestruturada para AdSense
let pomoApp = null;

// Callback global obrigatório para YouTube API
function onYouTubeIframeAPIReady() {
    if (pomoApp) {
        pomoApp.ytPlayer = new YT.Player('chill-video', {
            height: '0',
            width: '0',
            videoId: 'CfPxlb8-ZQ0',
            playerVars: {
                'autoplay': 0,
                'controls': 1,
                'playsinline': 1,
                'rel': 0
            },
            events: {
                'onReady': (event) => {
                    console.log('YouTube Player ready');
                    pomoApp.ytPlayer = event.target;
                },
                'onStateChange': (event) => {
                    console.log('Player state changed:', event.data);
                }
            }
        });
    }
}

class PomoChill {
    constructor() {
        console.log('Initializing PomoChill...');
        
        // App state
        this.currentMode = 'work';
        this.isRunning = false;
        this.timeLeft = 1500; // 25 minutes in seconds
        this.totalTime = 1500;
        this.timer = null;
        this.completedCycles = 0;
        this.focusTime = 0;
        this.breaksTaken = 0;
        
        // Settings
        this.durations = {
            work: 25,
            shortBreak: 5,
            longBreak: 15
        };
        
        this.soundEnabled = true;
        
        // Messages
        this.messages = {
            workStart: [
                "Vamos focar! Você consegue.",
                "Hora de concentrar. Respire fundo.",
                "Foco total pelos próximos minutos!"
            ],
            breakStart: [
                "Hora de uma pausa merecida!",
                "Relaxe e recarregue suas energias.",
                "Respire, alongue e descanse."
            ],
            workComplete: [
                "Ótimo trabalho! Hora da pausa.",
                "Sessão de foco concluída com sucesso!",
                "Você está indo muito bem!"
            ],
            breakComplete: [
                "Energia renovada! Vamos continuar.",
                "Pausa concluída. Pronto para focar?",
                "Mente descansada, foco renovado!"
            ]
        };
        
        this.breakSuggestions = [
            "Respire fundo por 30 segundos",
            "Alongue seus braços e pescoço",
            "Hidrate-se com um copo d'água",
            "Olhe pela janela por um momento",
            "Faça alguns exercícios oculares",
            "Medite por alguns minutos",
            "Dê uma volta rápida",
            "Ouça uma música relaxante"
        ];
        
        this.modeLabels = {
            work: 'Foco',
            shortBreak: 'Pausa Curta',
            longBreak: 'Pausa Longa'
        };
        
        // Language settings
        this.currentLanguage = localStorage.getItem('pomoChillLanguage') || 'pt';
        this.translations = {};

        pomoApp = this;
        this.ytPlayer = null;
        
        // Initialize
        this.init();
    }
    
    async init() {
        console.log('Binding elements...');
        if (!this.bindElements()) {
            console.error('Failed to bind elements');
            return;
        }
        
        // Load translations
        try {
            await this.loadTranslations(this.currentLanguage);
            this.elements.languageSelector.value = this.currentLanguage;
            
            console.log('Setting up events...');
            this.setupEvents();
            
            console.log('Updating display...');
            this.updateDisplay();
            this.updateModeButtons();
            this.updateStats();
            this.showMessage(this.translations.readyToStart || "Ready to start? Click Start!");
            
            console.log('PomoChill initialized successfully');
        } catch (error) {
            console.error('Failed to load translations:', error);
        }
    }
    
    bindElements() {
        // Get all required elements
        this.elements = {
            timeDisplay: document.getElementById('time-display'),
            modeIndicator: document.getElementById('mode-indicator'),
            progressCircle: document.getElementById('progress-circle'),
            timerContainer: document.querySelector('.timer-container'),
            startPauseBtn: document.getElementById('start-pause-btn'),
            resetBtn: document.getElementById('reset-btn'),
            skipBtn: document.getElementById('skip-btn'),
            messageDisplay: document.getElementById('encouraging-message'),
            breakSuggestions: document.getElementById('break-suggestions'),
            suggestionsList: document.getElementById('suggestions-list'),
            cyclesCompleted: document.getElementById('cycles-completed'),
            focusTimeEl: document.getElementById('focus-time'),
            breaksTaken: document.getElementById('breaks-taken'),
            settingsBtn: document.getElementById('settings-btn'),
            settingsModal: document.getElementById('settings-modal'),
            closeSettings: document.getElementById('close-settings'),
            saveSettings: document.getElementById('save-settings'),
            statsBtn: document.getElementById('stats-btn'),
            statsModal: document.getElementById('stats-modal'),
            closeStats: document.getElementById('close-stats'),
            workDuration: document.getElementById('work-duration'),
            shortBreakDuration: document.getElementById('short-break-duration'),
            longBreakDuration: document.getElementById('long-break-duration'),
            soundEnabled: document.getElementById('sound-enabled'),
            languageSelector: document.getElementById('language'),
        };
        
        this.modeButtons = document.querySelectorAll('.mode-btn');
        
        // Check if all elements exist
        const missingElements = [];
        for (let [key, element] of Object.entries(this.elements)) {
            if (!element) {
                missingElements.push(key);
            }
        }
        
        if (missingElements.length > 0) {
            console.error('Missing elements:', missingElements);
            return false;
        }
        
        if (this.modeButtons.length === 0) {
            console.error('No mode buttons found');
            return false;
        }
        
        return true;
    }
    
    setupEvents() {
        // Start/Pause button
        this.elements.startPauseBtn.addEventListener('click', () => {
            console.log('Start/Pause clicked');
            this.toggleTimer();
        });
        
        // Reset button
        this.elements.resetBtn.addEventListener('click', () => {
            console.log('Reset clicked');
            this.resetTimer();
        });
        
        // Skip button
        this.elements.skipBtn.addEventListener('click', () => {
            console.log('Skip clicked');
            this.skipSession();
        });
        
        // Mode buttons
        this.modeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.currentTarget.dataset.mode;
                console.log('Mode clicked:', mode);
                if (!this.isRunning) {
                    this.switchMode(mode);
                }
            });
        });
        
        // Settings button
        this.elements.settingsBtn.addEventListener('click', () => {
            console.log('Settings clicked');
            this.openSettings();
        });
        
        // Close settings
        this.elements.closeSettings.addEventListener('click', () => {
            this.closeSettings();
        });
        
        // Save settings
        this.elements.saveSettings.addEventListener('click', () => {
            this.saveSettings();
        });
        
        // Modal background click
        this.elements.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.elements.settingsModal) {
                this.closeSettings();
            }
        });

        // Stats button
        this.elements.statsBtn.addEventListener('click', () => {
            this.openStats();
        });

        // Close stats
        this.elements.closeStats.addEventListener('click', () => {
            this.closeStats();
        });

        // Modal background click for stats
        this.elements.statsModal.addEventListener('click', (e) => {
            if (e.target === this.elements.statsModal) {
                this.closeStats();
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !e.target.matches('input')) {
                e.preventDefault();
                this.toggleTimer();
            }
        });
        
        // Language selector
        const languageSelector = document.getElementById('language');
        languageSelector.addEventListener('change', async (e) => {
            const selectedLanguage = e.target.value;
            await this.changeLanguage(selectedLanguage);
        });
    }
    
    toggleTimer() {
        if (this.isRunning) {
            this.pauseTimer();
        } else {
            this.startTimer();
        }
    }
    
    startTimer() {
        console.log('Starting timer...');
        this.isRunning = true;
        
        // Update UI
        this.elements.timerContainer.classList.add('active');
        this.elements.startPauseBtn.innerHTML = `
            <span class="btn-icon">⏸️</span>
            <span data-i18n="pause">Pausar</span>
        `;

        // Play video only during work mode
        if (this.currentMode === 'work' && this.ytPlayer) {
            console.log('Playing video...');
            this.ytPlayer.playVideo();
        }
        
        // Start countdown
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            this.updateProgress();
            
            if (this.timeLeft <= 0) {
                this.completeSession();
            }
        }, 1000);
        
        // Show appropriate message
        const messageType = this.currentMode === 'work' ? 'workStart' : 'breakStart';
        this.showRandomMessage(messageType);
        
        // Handle break suggestions
        if (this.currentMode !== 'work') {
            this.elements.skipBtn.style.display = 'flex';
            this.elements.breakSuggestions.classList.remove('hidden');
            this.renderBreakSuggestions();
        } else {
            this.elements.skipBtn.style.display = 'none';
            this.elements.breakSuggestions.classList.add('hidden');
        }
    }
    
    pauseTimer() {
        console.log('Pausing timer...');
        this.isRunning = false;
        this.elements.timerContainer.classList.remove('active');
        clearInterval(this.timer);

        // Pause video if it exists
        if (this.ytPlayer && this.ytPlayer.pauseVideo) {
            this.ytPlayer.pauseVideo();
        }
        
        this.elements.startPauseBtn.innerHTML = `
            <span class="btn-icon">▶️</span>
            <span data-i18n="start">Retomar</span>
        `;
        
        this.showMessage("Pausado. Pronto para retomar?");
    }
    
    resetTimer() {
        console.log('Resetting timer...');
        this.isRunning = false;
        this.elements.timerContainer.classList.remove('active');
        clearInterval(this.timer);
        
        // Reset time
        this.timeLeft = this.durations[this.currentMode] * 60;
        this.totalTime = this.timeLeft;
        
        this.updateDisplay();
        this.updateProgress();
        
        // Reset UI
        this.elements.startPauseBtn.innerHTML = `
            <span class="btn-icon">▶️</span>
            <span data-i18n="start">Iniciar</span>
        `;
        
        this.elements.skipBtn.style.display = 'none';
        this.elements.breakSuggestions.classList.add('hidden');
        
        const messageType = this.currentMode === 'work' ? 'workStart' : 'breakStart';
        this.showRandomMessage(messageType);
    }
    
    skipSession() {
        console.log('Skipping session...');
        this.completeSession();
    }
    
    completeSession() {
        console.log('Completing session...');
        this.isRunning = false;
        this.elements.timerContainer.classList.remove('active');
        clearInterval(this.timer);
        
        // Update statistics
        if (this.currentMode === 'work') {
            this.completedCycles++;
            this.focusTime += this.durations[this.currentMode];
        } else {
            this.breaksTaken++;
        }
        
        // Play sound
        if (this.soundEnabled) {
            this.playNotificationSound();
        }

        // Pause video when session completes
        if (this.ytPlayer && this.ytPlayer.pauseVideo) {
            this.ytPlayer.pauseVideo();
        }
        
        // Show completion message
        const messageType = this.currentMode === 'work' ? 'workComplete' : 'breakComplete';
        this.showRandomMessage(messageType);
        
        this.updateStats();
        
        // Auto-switch mode after delay
        setTimeout(() => {
            if (this.currentMode !== 'work') {
                this.switchMode('work');
            } else {
                this.autoSwitchMode();
            }
        }, 2000);
    }
    
    autoSwitchMode() {
        let nextMode;
        
        if (this.currentMode === 'work') {
            nextMode = (this.completedCycles > 0 && this.completedCycles % 4 === 0) ? 'longBreak' : 'shortBreak';
        } else {
            nextMode = 'work';
        }
        
        this.switchMode(nextMode);
        this.showMessage("Clique em Iniciar quando estiver pronto!");
    }
    
    switchMode(mode) {
        if (this.isRunning) return;
        
        console.log('Switching to mode:', mode);
        this.currentMode = mode;
        
        // Update time
        this.timeLeft = this.durations[mode] * 60;
        this.totalTime = this.timeLeft;
        
        // Update UI
        this.updateDisplay();
        this.updateModeButtons();
        this.updateProgress();
        
        // Update body class
        document.body.className = mode === 'work' ? '' : 'break-mode';
        
        // Fix: Use setAttribute for SVG element
        if (mode === 'work') {
            this.elements.progressCircle.setAttribute('class', 'timer-progress');
        } else {
            this.elements.progressCircle.setAttribute('class', 'timer-progress break-mode');
        }
        
        // Update button classes
        this.elements.startPauseBtn.className = mode === 'work' ? 
            'control-btn primary' : 
            'control-btn primary break-mode';
        
        // Reset UI state
        this.elements.startPauseBtn.innerHTML = `
            <span class="btn-icon">▶️</span>
            <span data-i18n="start">Iniciar</span>
        `;
        this.elements.skipBtn.style.display = 'none';
        this.elements.breakSuggestions.classList.add('hidden');
        
        // Show message
        const messageType = mode === 'work' ? 'workStart' : 'breakStart';
        this.showRandomMessage(messageType);
    }
    
    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        
        this.elements.timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        const modeText = this.translations[this.currentMode] || this.modeLabels[this.currentMode];
        this.elements.modeIndicator.textContent = modeText;
    }
    
    updateProgress() {
        const progress = (this.totalTime - this.timeLeft) / this.totalTime;
        const circumference = 2 * Math.PI * 90;
        const offset = circumference * (1 - progress);
        this.elements.progressCircle.style.strokeDashoffset = offset;
    }
    
    updateModeButtons() {
        this.modeButtons.forEach(btn => {
            const mode = btn.dataset.mode;
            btn.classList.remove('active', 'break-active');
            
            if (mode === this.currentMode) {
                btn.classList.add('active');
                if (mode !== 'work') {
                    btn.classList.add('break-active');
                }
            }
            
            // Update duration display
            const durationEl = btn.querySelector('.mode-duration');
            if (durationEl) {
                durationEl.textContent = `${this.durations[mode]} min`;
            }
        });
    }
    
    showRandomMessage(type) {
        const messages = this.messages[type];
        if (messages && messages.length > 0) {
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            this.showMessage(randomMessage);
        }
    }
    
    showMessage(message) {
        this.elements.messageDisplay.textContent = message;
    }
    
    renderBreakSuggestions() {
        this.elements.suggestionsList.innerHTML = '';
        
        // Show 3 random suggestions
        const shuffled = [...this.breakSuggestions].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3);
        const icons = ['🌱', '💧', '👁️', '🧘', '🔄', '✨'];
        
        selected.forEach((suggestion, index) => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.innerHTML = `
                <span class="suggestion-icon">${icons[index] || '•'}</span>
                <span>${suggestion}</span>
            `;
            this.elements.suggestionsList.appendChild(div);
        });
    }
    
    updateStats() {
        this.elements.cyclesCompleted.textContent = this.completedCycles;
        const hours = Math.floor(this.focusTime / 60);
        const minutes = this.focusTime % 60;
        this.elements.focusTimeEl.textContent = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
        this.elements.breaksTaken.textContent = this.breaksTaken;
    }
    
    playNotificationSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = this.currentMode === 'work' ? 800 : 600;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
            console.log('Audio notification not available');
        }
    }
    
    openSettings() {
        console.log('Opening settings...');
        
        // Load current values
        this.elements.workDuration.value = this.durations.work;
        this.elements.shortBreakDuration.value = this.durations.shortBreak;
        this.elements.longBreakDuration.value = this.durations.longBreak;
        this.elements.soundEnabled.checked = this.soundEnabled;
        
        this.elements.settingsModal.classList.remove('hidden');
    }
    
    closeSettings() {
        this.elements.settingsModal.classList.add('hidden');
    }
    
    saveSettings() {
        const workDuration = parseInt(this.elements.workDuration.value);
        const shortBreakDuration = parseInt(this.elements.shortBreakDuration.value);
        const longBreakDuration = parseInt(this.elements.longBreakDuration.value);
        
        // Validate numeric values
        if (isNaN(workDuration) || isNaN(shortBreakDuration) || isNaN(longBreakDuration)) {
            this.showError('Valores de duração devem ser números');
            return;
        }
        
        // Validate ranges
        if (workDuration < 1 || workDuration > 60) {
            this.showError('Duração do foco deve ser entre 1 e 60 minutos');
            return;
        }
        
        if (shortBreakDuration < 1 || shortBreakDuration > 30) {
            this.showError('Pausa curta deve ser entre 1 e 30 minutos');
            return;
        }
        
        if (longBreakDuration < 1 || longBreakDuration > 60) {
            this.showError('Pausa longa deve ser entre 1 e 60 minutos');
            return;
        }
        
        // Update settings
        this.durations.work = workDuration;
        this.durations.shortBreak = shortBreakDuration;
        this.durations.longBreak = longBreakDuration;
        this.soundEnabled = this.elements.soundEnabled.checked;
        
        // Update current session if not running
        if (!this.isRunning) {
            this.timeLeft = this.durations[this.currentMode] * 60;
            this.totalTime = this.timeLeft;
            this.updateDisplay();
            this.updateProgress();
        }
        
        this.updateModeButtons();
        this.closeSettings();
        this.showMessage('Configurações salvas com sucesso!');
    }

    openStats() {
        this.elements.statsModal.classList.remove('hidden');
    }

    closeStats() {
        this.elements.statsModal.classList.add('hidden');
    }
    
    // Language support
    async changeLanguage(language) {
        try {
            console.log('Changing language to:', language);
            
            const success = await this.loadTranslations(language);
            if (!success) {
                throw new Error('Failed to load translations');
            }
            
            this.currentLanguage = language;
            localStorage.setItem('pomoChillLanguage', language);
            document.documentElement.lang = language;
            
            // Update interface after loading translations
            this.updateDisplay();
            this.updateModeButtons();
            this.updateStats();
            
            // Show confirmation message
            const message = language === 'pt' ? 
                'Idioma alterado para Português!' : 
                'Language changed to English!';
            this.showMessage(message);
            
            return true;
        } catch (error) {
            console.error('Error changing language:', error);
            this.showMessage('Erro ao alterar idioma. Tente novamente.');
            return false;
        }
    }

    async loadTranslations(language) {
        try {
            if (!TRANSLATIONS[language]) {
                throw new Error(`Translation not available for ${language}`);
            }
            this.translations = TRANSLATIONS[language];
            this.applyTranslations();
            console.log(`Translations loaded successfully for ${language}`);
            return true;
        } catch (error) {
            console.error('Error loading translations:', error);
            return false;
        }
    }

    applyTranslations() {
        console.log('Applying translations...', this.translations);
        
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            
            if (this.translations[key]) {
                if (element.tagName === 'TITLE') {
                    element.textContent = this.translations[key];
                } else if (element.children.length > 0) {
                    const textElement = Array.from(element.childNodes).find(node => 
                        node.nodeType === Node.TEXT_NODE || 
                        (node.nodeType === Node.ELEMENT_NODE && !node.classList.contains('btn-icon'))
                    );
                    if (textElement) {
                        textElement.textContent = this.translations[key];
                    }
                } else {
                    element.textContent = this.translations[key];
                }
            }
        });
        
        // Update break suggestions if they're visible
        if (!this.elements.breakSuggestions.classList.contains('hidden')) {
            this.renderBreakSuggestions();
        }

        // Update document language
        document.documentElement.lang = this.currentLanguage;

        // Update messages for the current mode
        this.updateMessagesFromTranslations();

        // Refresh current display
        this.updateDisplay();
        this.updateModeButtons();
        this.showMessage(this.translations.readyToStart || "Ready to start? Click Start!");
    }

    updateMessagesFromTranslations() {
        this.messages = {
            workStart: [
                this.translations.workStartMessage1 || "Vamos focar! Você consegue.",
                this.translations.workStartMessage2 || "Hora de concentrar. Respire fundo.",
                this.translations.workStartMessage3 || "Foco total pelos próximos minutos!"
            ],
            breakStart: [
                this.translations.breakStartMessage1 || "Hora de uma pausa merecida!",
                this.translations.breakStartMessage2 || "Relaxe e recarregue.",
                this.translations.breakStartMessage3 || "Respire, alongue e descanse."
            ],
            workComplete: [
                this.translations.workCompleteMessage1 || "Ótimo trabalho! Hora da pausa.",
                this.translations.workCompleteMessage2 || "Sessão de foco concluída com sucesso!",
                this.translations.workCompleteMessage3 || "Você está indo muito bem!"
            ],
            breakComplete: [
                this.translations.breakCompleteMessage1 || "Energia renovada! Vamos continuar.",
                this.translations.breakCompleteMessage2 || "Pausa concluída. Pronto para focar?",
                this.translations.breakCompleteMessage3 || "Mente descansada, foco renovado!"
            ]
        };

        // Update break suggestions array
        this.breakSuggestions = [
            this.translations.takeABreath || "Respire fundo por 30 segundos",
            this.translations.stretchYourBody || "Alongue seus braços e pescoço",
            this.translations.drinkWater || "Hidrate-se com um copo d'água",
            this.translations.walkAround || "Dê uma volta",
            this.translations.listenToMusic || "Ouça sua música favorita",
            this.translations.meditate || "Medite por alguns minutos",
            this.translations.readSomething || "Leia algumas páginas de um livro",
            this.translations.checkYourMessages || "Verifique suas mensagens ou e-mails"
        ];

        // Update mode labels
        this.modeLabels = {
            work: this.translations.focus || 'Foco',
            shortBreak: this.translations.shortBreak || 'Pausa Curta',
            longBreak: this.translations.longBreak || 'Pausa Longa'
        };
    }

    showError(message) {
        const errorEl = document.querySelector('.error-message');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.classList.remove('hidden');

            setTimeout(() => {
                errorEl.classList.add('hidden');
            }, 3000);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing PomoChill...');
    try {
        pomoApp = new PomoChill();
        window.pomoChillApp = pomoApp;
        console.log('PomoChill app initialized successfully');
    } catch (error) {
        console.error('Failed to initialize PomoChill:', error);
    }
});

// Prevent page refresh during active session
window.addEventListener('beforeunload', (e) => {
    if (pomoApp && pomoApp.isRunning) {
        e.preventDefault();
        e.returnValue = 'Você tem uma sessão ativa. Tem certeza que deseja sair?';
        return e.returnValue;
    }
});

// Initialize AdSense ads when page loads
window.addEventListener('load', function() {
    // Initialize AdSense ads if they exist
    const adsElements = document.querySelectorAll('.adsbygoogle');
    adsElements.forEach(ad => {
        if (ad.getAttribute('data-adsbygoogle-status') !== 'done') {
            (adsbygoogle = window.adsbygoogle || []).push({});
        }
    });
});
