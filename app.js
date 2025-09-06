// PomoChill App - Simplified and Fixed JavaScript
let pomoApp = null;

// Callback global obrigatório
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
                "Let's focus! You can do it.",
                "Time to concentrate. Take a deep breath.",
                "Full focus for the next few minutes!"
            ],
            breakStart: [
                "Time for a well-deserved break!",
                "Relax and recharge.",
                "Breathe, stretch, and rest."
            ],
            workComplete: [
                "Great job! Time for a break.",
                "Focus session completed successfully!",
                "You're doing really well!"
            ],
            breakComplete: [
                "Energy renewed! Let's continue.",
                "Break completed. Ready to focus?",
                "Rested mind, renewed focus!"
            ]
        };
        
        this.breakSuggestions = [
            "Take a deep breath for 30 seconds",
            "Stretch your arms and neck",
            "Hydrate with a glass of water",
            "Look out the window for a moment",
            "Do some eye exercises",
            "Meditate for a few minutes"
        ];
        
        this.modeLabels = {
            work: 'Focus',
            shortBreak: 'Short Break',
            longBreak: 'Long Break'
        };
        
        // Language settings
        this.currentLanguage = localStorage.getItem('pomoChillLanguage') || 'en';
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
        
        // Carregar traduções antes de continuar
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
            <span class="btn-text">Pause</span>
        `;

        // Play video only during work mode
        console.log(this.currentMode, this.ytPlayer);
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
            <span class="btn-text">Resume</span>
        `;
        
        this.showMessage("Paused. Ready to resume?");
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
            <span class="btn-text">Start</span>
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
                // Força retorno para modo work após pausa
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
        this.showMessage("Click Start when you're ready!");
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
            <span class="btn-text">Start</span>
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
            this.showError('Duration, Short break and Long break values must be numbers');
            return;
        }
        
        // Validate ranges
        if (workDuration < 1 || workDuration > 60) {
            this.showError('Focus duration must be between 1 and 60 minutes');
            return;
        }
        
        if (shortBreakDuration < 1 || shortBreakDuration > 30) {
            this.showError('Short break must be between 1 and 30 minutes');
            return;
        }
        
        if (longBreakDuration < 1 || longBreakDuration > 60) {
            this.showError('Long break must be between 1 and 60 minutes');
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
        this.showMessage('Settings saved successfully!');
    }

    openStats() {
        this.elements.statsModal.classList.remove('hidden');
    }

    closeStats() {
        this.elements.statsModal.classList.add('hidden');
    }

    // Callback global chamado pelo SDK
    handleCredentialResponse(response) {
        const user = this.parseJwt(response.credential);
        console.log('Logado como:', user);
        localStorage.setItem('googleUser', JSON.stringify(user));
    }

    // Função para decodificar JWT
    parseJwt(token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
            '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join(''));
        return JSON.parse(jsonPayload);
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
            
            // Atualizar interface após carregar traduções
            this.updateDisplay();
            this.updateModeButtons();
            this.updateStats();
            
            // Mostrar mensagem de confirmação
            const message = language === 'pt' ? 
                'Idioma alterado para Português!' : 
                'Language changed to English!';
            this.showMessage(message);
            
            return true;
        } catch (error) {
            console.error('Error changing language:', error);
            this.showMessage('Error changing language. Please try again.');
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
            console.log(`Translating element with key: ${key}`, element);
            
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
                console.log(`Translated to: ${this.translations[key]}`);
            } else {
                console.warn(`Translation missing for key: ${key}`);
            }
        });
    
        // Update break suggestions if they're visible
        if (!this.elements.breakSuggestions.classList.contains('hidden')) {
            this.renderBreakSuggestions();
        }

        // Update document language
        document.documentElement.lang = this.currentLanguage;

        // Update messages for the current mode
        this.messages = {
            workStart: [
                this.translations.workStartMessage1 || "Let's focus! You can do it.",
                this.translations.workStartMessage2 || "Time to concentrate. Take a deep breath.",
                this.translations.workStartMessage3 || "Full focus for the next few minutes!"
            ],
            breakStart: [
                this.translations.breakStartMessage1 || "Time for a well-deserved break!",
                this.translations.breakStartMessage2 || "Relax and recharge.",
                this.translations.breakStartMessage3 || "Breathe, stretch, and rest."
            ],
            workComplete: [
                this.translations.workCompleteMessage1 || "Great job! Time for a break.",
                this.translations.workCompleteMessage2 || "Focus session completed successfully!",
                this.translations.workCompleteMessage3 || "You're doing really well!"
            ],
            breakComplete: [
                this.translations.breakCompleteMessage1 || "Energy renewed! Let's continue.",
                this.translations.breakCompleteMessage2 || "Break completed. Ready to focus?",
                this.translations.breakCompleteMessage3 || "Rested mind, renewed focus!"
            ]
        };

        // Update break suggestions array
        this.breakSuggestions = [
            this.translations.takeABreath || "Take a deep breath for 30 seconds",
            this.translations.stretchYourBody || "Stretch your arms and neck",
            this.translations.drinkWater || "Hydrate with a glass of water",
            this.translations.walkAround || "Walk around a bit",
            this.translations.listenToMusic || "Listen to your favorite music",
            this.translations.meditate || "Meditate for a few minutes",
            this.translations.readSomething || "Read a few pages of a book",
            this.translations.checkYourMessages || "Check your messages or emails"
        ];

        // Update mode labels
        this.modeLabels = {
            work: this.translations.focus || 'Focus',
            shortBreak: this.translations.shortBreak || 'Short Break',
            longBreak: this.translations.longBreak || 'Long Break'
        };

        // Refresh current display
        this.updateDisplay();
        this.updateModeButtons();
        this.showMessage(this.translations.readyToStart || "Ready to start? Click Start!");

        console.log(`Language updated to: ${this.currentLanguage}`);
    }

    showError(message) {
        const errorEl = document.querySelector('.error-message');
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');

        setTimeout(() => {
            errorEl.classList.add('hidden');
        }, 3000);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing PomoChill...');
    try {
        pomoApp = new PomoChill();
        window.pomoChillApp = pomoApp;
        window.handleCredentialResponse = (response) => pomoApp.handleCredentialResponse(response);
        console.log('PomoChill app initialized successfully');
    } catch (error) {
        console.error('Failed to initialize PomoChill:', error);
    }
});

// Prevent page refresh during active session
window.addEventListener('beforeunload', (e) => {
    if (pomoApp && pomoApp.isRunning) {
        e.preventDefault();
        e.returnValue = 'You have an active session. Are you sure you want to leave?';
        return e.returnValue;
    }
});