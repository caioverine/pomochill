// PomoChill App - Simplified and Fixed JavaScript
let pomoApp = null;

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
                "Foco total nos próximos minutos!"
            ],
            breakStart: [
                "Hora de uma pausa merecida!",
                "Relaxe e recarregue as energias.",
                "Respire, alongue, descanse."
            ],
            workComplete: [
                "Excelente trabalho! Pausa merecida.",
                "Foco concluído com sucesso!",
                "Você está indo muito bem!"
            ],
            breakComplete: [
                "Energia renovada! Vamos continuar.",
                "Pausa concluída. Pronto para focar?",
                "Mente descansada, foco renovado!"
            ]
        };
        
        this.breakSuggestions = [
            "Respire profundamente por 30 segundos",
            "Alongue os braços e pescoço",
            "Hidrate-se com um copo d'água",
            "Olhe pela janela por alguns instantes",
            "Faça alguns exercícios oculares",
            "Medite por alguns minutos"
        ];
        
        this.modeLabels = {
            work: 'Foco',
            shortBreak: 'Pausa Rápida',
            longBreak: 'Pausa Longa'
        };
        
        // Initialize
        this.init();
    }
    
    init() {
        console.log('Binding elements...');
        if (!this.bindElements()) {
            console.error('Failed to bind elements');
            return;
        }
        
        console.log('Setting up events...');
        this.setupEvents();
        
        console.log('Updating display...');
        this.updateDisplay();
        this.updateModeButtons();
        this.updateStats();
        this.showMessage("Pronto para começar? Clique em Iniciar!");
        
        console.log('PomoChill initialized successfully');
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
            workDuration: document.getElementById('work-duration'),
            shortBreakDuration: document.getElementById('short-break-duration'),
            longBreakDuration: document.getElementById('long-break-duration'),
            soundEnabled: document.getElementById('sound-enabled')
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
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !e.target.matches('input')) {
                e.preventDefault();
                this.toggleTimer();
            }
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
            <span class="btn-text">Pausar</span>
        `;
        
        // Show skip button for breaks
        if (this.currentMode !== 'work') {
            this.elements.skipBtn.style.display = 'flex';
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
            this.elements.breakSuggestions.classList.remove('hidden');
            this.renderBreakSuggestions();
        } else {
            this.elements.breakSuggestions.classList.add('hidden');
        }
    }
    
    pauseTimer() {
        console.log('Pausing timer...');
        this.isRunning = false;
        this.elements.timerContainer.classList.remove('active');
        clearInterval(this.timer);
        
        this.elements.startPauseBtn.innerHTML = `
            <span class="btn-icon">▶️</span>
            <span class="btn-text">Continuar</span>
        `;
        
        this.showMessage("Pausado. Pronto para continuar?");
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
            <span class="btn-text">Iniciar</span>
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
        
        // Show completion message
        const messageType = this.currentMode === 'work' ? 'workComplete' : 'breakComplete';
        this.showRandomMessage(messageType);
        
        this.updateStats();
        
        // Auto-switch mode after delay
        setTimeout(() => {
            this.autoSwitchMode();
        }, 2000);
    }
    
    autoSwitchMode() {
        let nextMode;
        
        if (this.currentMode === 'work') {
            nextMode = (this.completedCycles % 4 === 0) ? 'longBreak' : 'shortBreak';
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
        
        // Update body class and styles
        document.body.className = mode === 'work' ? '' : 'break-mode';
        this.elements.progressCircle.className = mode === 'work' ? 'timer-progress' : 'timer-progress break-mode';
        this.elements.startPauseBtn.className = mode === 'work' ? 'control-btn primary' : 'control-btn primary break-mode';
        
        // Reset UI state
        this.elements.startPauseBtn.innerHTML = `
            <span class="btn-icon">▶️</span>
            <span class="btn-text">Iniciar</span>
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
        this.elements.modeIndicator.textContent = this.modeLabels[this.currentMode];
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
        
        if (workDuration < 1 || workDuration > 60) {
            alert('Duração do foco deve ser entre 1 e 60 minutos');
            return;
        }
        
        if (shortBreakDuration < 1 || shortBreakDuration > 30) {
            alert('Pausa rápida deve ser entre 1 e 30 minutos');
            return;
        }
        
        if (longBreakDuration < 1 || longBreakDuration > 60) {
            alert('Pausa longa deve ser entre 1 e 60 minutos');
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