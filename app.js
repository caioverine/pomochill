class PomodoroTimer {
    constructor() {
        // Configuração de tempos (em segundos)
        this.workTime = 25 * 60;      // 25 minutos
        this.shortBreak = 5 * 60;     // 5 minutos
        this.longBreak = 15 * 60;     // 15 minutos
        
        // Estado
        this.currentTime = this.workTime;
        this.isRunning = false;
        this.currentMode = 'work';
        this.sessionsCompleted = 0;
        this.sessionStartTime = null;
        
        // Elementos DOM
        this.timeDisplay = document.getElementById('time-display');
        this.modeIndicator = document.getElementById('mode-indicator');
        this.startPauseBtn = document.getElementById('start-pause-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.modeBtns = document.querySelectorAll('.mode-btn');
        this.statsDisplay = document.getElementById('stats-display');
        this.progressCircle = document.getElementById('progress-circle');
        this.weeklyChart = document.getElementById('weekly-chart');
        
        // Timer
        this.timerInterval = null;
        this.circumference = 565.48; // 2πr onde r=90
        
        // NOVA FUNCIONALIDADE 1: Persistência
        this.loadFromStorage();
        
        // Event listeners
        this.setupEventListeners();
        
        // NOVA FUNCIONALIDADE 2: Wake Lock
        this.setupWakeLock();
        
        // NOVA FUNCIONALIDADE 5: Keyboard Shortcuts
        this.setupKeyboardShortcuts();
        
        // Renderizar
        this.updateDisplay();
        this.updateChart();
    }
    
    // ============================================
    // FUNCIONALIDADE 1: PERSISTÊNCIA
    // ============================================
    loadFromStorage() {
        const saved = localStorage.getItem('pomodoroState');
        if (saved) {
            const state = JSON.parse(saved);
            this.currentTime = state.currentTime;
            this.currentMode = state.currentMode;
            this.sessionsCompleted = state.sessionsCompleted;
            
            // Se estava rodando, continua de onde parou
            if (state.isRunning) {
                this.isRunning = true;
                this.sessionStartTime = Date.now() - state.elapsedMs;
                this.startTimer();
            }
        }
    }
    
    saveToStorage() {
        const state = {
            currentTime: this.currentTime,
            currentMode: this.currentMode,
            sessionsCompleted: this.sessionsCompleted,
            isRunning: this.isRunning,
            elapsedMs: this.isRunning ? Date.now() - this.sessionStartTime : 0
        };
        localStorage.setItem('pomodoroState', JSON.stringify(state));
    }
    
    // ============================================
    // FUNCIONALIDADE 2: WAKE LOCK
    // ============================================
    setupWakeLock() {
        this.wakeLock = null;
    }
    
    async requestWakeLock() {
        try {
            if ('wakeLock' in navigator && this.currentMode === 'work') {
                this.wakeLock = await navigator.wakeLock.request('screen');
                console.log('Wake Lock ativado - tela não dorme');
            }
        } catch (err) {
            console.log('Wake Lock não disponível:', err);
        }
    }
    
    releaseWakeLock() {
        if (this.wakeLock) {
            this.wakeLock.release();
            this.wakeLock = null;
        }
    }
    
    // ============================================
    // FUNCIONALIDADE 3: NOTIFICAÇÕES DESKTOP
    // ============================================
    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }
    
    showNotification() {
        if ('Notification' in window && Notification.permission === 'granted') {
            const modeText = {
                'work': 'Pomodoro completado!',
                'shortBreak': 'Pausa curta terminou!',
                'longBreak': 'Pausa longa terminou!'
            };
            
            new Notification('⏱️ PomoChill', {
                body: modeText[this.currentMode],
                icon: '⏱️',
                tag: 'pomodoro',
                requireInteraction: false
            });
        }
    }
    
    // ============================================
    // FUNCIONALIDADE 4: HISTÓRICO SEMANAL
    // ============================================
    loadWeeklyData() {
        const today = new Date();
        const weekData = {};
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const key = `pomodoros_${dateStr}`;
            weekData[dateStr] = parseInt(localStorage.getItem(key) || '0');
        }
        
        return Object.entries(weekData).reverse();
    }
    
    addCompletedPomodoro() {
        const today = new Date().toISOString().split('T')[0];
        const key = `pomodoros_${today}`;
        const current = parseInt(localStorage.getItem(key) || '0');
        localStorage.setItem(key, current + 1);
    }
    
    updateChart() {
        if (!this.weeklyChart) return;
        
        const data = this.loadWeeklyData();
        const maxValue = Math.max(...data.map(d => d[1]), 1);
        
        let html = '<div class="chart-container">';
        
        data.forEach(([date, count]) => {
            const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
            const dateObj = new Date(date + 'T00:00:00');
            const dayName = days[dateObj.getDay()];
            const percentage = (count / maxValue) * 100;
            
            html += `
                <div class="chart-bar">
                    <div class="bar-value">${count}</div>
                    <div class="bar-fill" style="height: ${percentage}%"></div>
                    <div class="bar-label">${dayName}</div>
                </div>
            `;
        });
        
        html += '</div>';
        this.weeklyChart.innerHTML = html;
    }
    
    // ============================================
    // FUNCIONALIDADE 5: KEYBOARD SHORTCUTS
    // ============================================
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // ESPAÇO = Play/Pause
            if (e.code === 'Space' && e.target === document.body) {
                e.preventDefault();
                this.toggleTimer();
            }
            // R = Reset
            if (e.key === 'r' || e.key === 'R') {
                this.reset();
            }
            // N = Próximo modo
            if (e.key === 'n' || e.key === 'N') {
                this.nextMode();
            }
            // S = Mostrar stats
            if (e.key === 's' || e.key === 'S') {
                this.toggleStats();
            }
        });
    }
    
    nextMode() {
        const modes = ['work', 'shortBreak', 'longBreak'];
        const currentIndex = modes.indexOf(this.currentMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        this.setMode(modes[nextIndex]);
    }
    
    toggleStats() {
        this.statsDisplay.style.display = 
            this.statsDisplay.style.display === 'none' ? 'block' : 'none';
    }
    
    // ============================================
    // LÓGICA PRINCIPAL (MANTÉM ORIGINAL)
    // ============================================
    setupEventListeners() {
        this.startPauseBtn.addEventListener('click', () => this.toggleTimer());
        this.resetBtn.addEventListener('click', () => this.reset());
        
        this.modeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;
                this.setMode(mode);
            });
        });
        
        // Pedir permissão para notificações
        this.requestNotificationPermission();
    }
    
    toggleTimer() {
        if (this.isRunning) {
            this.pause();
        } else {
            this.start();
        }
    }
    
    start() {
        this.isRunning = true;
        this.sessionStartTime = Date.now();
        this.updateStartButton();
        this.requestWakeLock();
        this.startTimer();
        this.saveToStorage();
    }
    
    pause() {
        this.isRunning = false;
        this.updateStartButton();
        this.releaseWakeLock();
        clearInterval(this.timerInterval);
        this.saveToStorage();
    }
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            const elapsed = Date.now() - this.sessionStartTime;
            this.currentTime = Math.max(0, this.getModeDuration() - Math.floor(elapsed / 1000));
            this.updateDisplay();
            this.saveToStorage();
            
            if (this.currentTime === 0) {
                this.complete();
            }
        }, 100);
    }
    
    complete() {
        clearInterval(this.timerInterval);
        this.pause();
        
        // Adicionar ao histórico se for work
        if (this.currentMode === 'work') {
            this.sessionsCompleted++;
            this.addCompletedPomodoro();
            this.updateChart();
        }
        
        // Mostrar notificação
        this.showNotification();
        
        // Reproduzir som
        this.playSound();
        
        // Mudar modo automaticamente
        if (this.currentMode === 'work') {
            this.sessionsCompleted % 4 === 0 
                ? this.setMode('longBreak') 
                : this.setMode('shortBreak');
        } else {
            this.setMode('work');
        }
        
        this.saveToStorage();
    }
    
    reset() {
        clearInterval(this.timerInterval);
        this.isRunning = false;
        this.currentTime = this.getModeDuration();
        this.sessionStartTime = null;
        this.updateDisplay();
        this.updateStartButton();
        this.releaseWakeLock();
        this.saveToStorage();
    }
    
    setMode(mode) {
        this.currentMode = mode;
        this.reset();
        
        // Atualizar botões
        this.modeBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
        
        this.updateModeIndicator();
        this.saveToStorage();
    }
    
    getModeDuration() {
        const modes = {
            'work': this.workTime,
            'shortBreak': this.shortBreak,
            'longBreak': this.longBreak
        };
        return modes[this.currentMode];
    }
    
    updateDisplay() {
        const minutes = Math.floor(this.currentTime / 60);
        const seconds = this.currentTime % 60;
        this.timeDisplay.textContent = 
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        this.updateProgressCircle();
        this.updateStats();
    }
    
    updateProgressCircle() {
        const totalDuration = this.getModeDuration();
        const progress = (totalDuration - this.currentTime) / totalDuration;
        const offset = this.circumference * (1 - progress);
        
        if (this.progressCircle) {
            this.progressCircle.style.strokeDashoffset = offset;
        }
    }
    
    updateStats() {
        if (this.statsDisplay) {
            this.statsDisplay.innerHTML = `
                <div class="stats-box">
                    <p>Sessões completadas: <strong>${this.sessionsCompleted}</strong></p>
                    <p>Modo: <strong>${this.getModeLabel()}</strong></p>
                </div>
            `;
        }
    }
    
    getModeLabel() {
        const labels = {
            'work': 'Foco',
            'shortBreak': 'Pausa Curta',
            'longBreak': 'Pausa Longa'
        };
        return labels[this.currentMode];
    }
    
    updateModeIndicator() {
        if (this.modeIndicator) {
            this.modeIndicator.textContent = this.getModeLabel();
        }
    }
    
    updateStartButton() {
        const icon = this.isRunning ? '⏸️' : '▶️';
        const text = this.isRunning ? 'Pausar' : 'Iniciar';
        this.startPauseBtn.innerHTML = `<span class="btn-icon">${icon}</span><span>${text}</span>`;
    }
    
    playSound() {
        // Usar Web Audio API para notificação sonora
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gain = audioContext.createGain();
            
            oscillator.connect(gain);
            gain.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gain.gain.setValueAtTime(0.3, audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            console.log('Som não disponível');
        }
    }
}

// Inicializar quando o DOM está pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.pomodoroTimer = new PomodoroTimer();
    });
} else {
    window.pomodoroTimer = new PomodoroTimer();
}
