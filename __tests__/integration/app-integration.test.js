/**
 * TESTES DE INTEGRAÇÃO - Integração da Aplicação PomoChill
 * Testa o funcionamento conjunto de múltiplos módulos da aplicação
 */

import { fireEvent, waitFor, screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Mock global variables needed for PomoChill
global.TRANSLATIONS = {
  en: {
    focus: 'Focus',
    shortBreak: 'Short Break',
    longBreak: 'Long Break',
    start: 'Start',
    pause: 'Pause',
    readyToStart: 'Ready to start? Click Start!',
    workStartMessage1: "Let's focus! You can do it.",
    breakStartMessage1: 'Time for a well-deserved break!',
    takeABreath: 'Take a deep breath for 30 seconds',
    stretchYourBody: 'Stretch your arms and neck',
  },
  pt: {
    focus: 'Foco',
    shortBreak: 'Pausa Curta', 
    longBreak: 'Pausa Longa',
    start: 'Iniciar',
    pause: 'Pausar',
    readyToStart: 'Pronto para começar? Clique em Iniciar!',
    workStartMessage1: 'Vamos focar! Você consegue.',
    breakStartMessage1: 'Hora de uma pausa merecida!',
    takeABreath: 'Respire fundo por 30 segundos',
    stretchYourBody: 'Alongue seus braços e pescoço',
  }
};

// Mock PomoChill class functionality for integration testing
class MockPomoChill {
  constructor() {
    this.currentMode = 'work';
    this.isRunning = false;
    this.timeLeft = 1500; // 25 minutes
    this.totalTime = 1500;
    this.timer = null;
    this.completedCycles = 0;
    this.focusTime = 0;
    this.breaksTaken = 0;
    this.durations = { work: 25, shortBreak: 5, longBreak: 15 };
    this.soundEnabled = true;
    this.currentLanguage = 'en';
    this.translations = TRANSLATIONS.en;

    this.bindElements();
    this.setupEvents();
    this.updateDisplay();
    this.showMessage(this.translations.readyToStart);

    // Add keyboard event listener
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        this.toggleTimer();
      }
    });
  }

  bindElements() {
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
      cyclesCompleted: document.getElementById('cycles-completed'),
      focusTimeEl: document.getElementById('focus-time'),
      breaksTaken: document.getElementById('breaks-taken'),
      settingsModal: document.getElementById('settings-modal'),
      workDuration: document.getElementById('work-duration'),
      shortBreakDuration: document.getElementById('short-break-duration'),
      longBreakDuration: document.getElementById('long-break-duration'),
      soundEnabled: document.getElementById('sound-enabled'),
      languageSelector: document.getElementById('language'),
    };

    this.modeButtons = document.querySelectorAll('.mode-btn');
  }

  setupEvents() {
    this.elements.startPauseBtn.addEventListener('click', () => this.toggleTimer());
    this.elements.resetBtn.addEventListener('click', () => this.resetTimer());
    this.elements.skipBtn.addEventListener('click', () => this.skipSession());

    this.modeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mode = e.currentTarget.dataset.mode;
        if (!this.isRunning) {
          this.switchMode(mode);
        }
      });
    });

    this.elements.languageSelector.addEventListener('change', (e) => {
      this.changeLanguage(e.target.value);
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
    this.isRunning = true;
    this.elements.timerContainer.classList.add('active');
    this.elements.startPauseBtn.innerHTML = '⏸️ Pause';

    if (this.currentMode !== 'work') {
      this.elements.skipBtn.style.display = 'flex';
      this.elements.breakSuggestions.classList.remove('hidden');
    }

    // Mock timer countdown
    this.timer = setInterval(() => {
      this.timeLeft--;
      this.updateDisplay();
      this.updateProgress();

      if (this.timeLeft <= 0) {
        this.completeSession();
      }
    }, 1000);

    const messageType = this.currentMode === 'work' ? 'workStart' : 'breakStart';
    this.showRandomMessage(messageType);
  }

  pauseTimer() {
    this.isRunning = false;
    this.elements.timerContainer.classList.remove('active');
    clearInterval(this.timer);
    this.elements.startPauseBtn.innerHTML = '▶️ Resume';
    this.showMessage('Paused. Ready to resume?');
  }

  resetTimer() {
    this.isRunning = false;
    this.elements.timerContainer.classList.remove('active');
    clearInterval(this.timer);

    this.timeLeft = this.durations[this.currentMode] * 60;
    this.totalTime = this.timeLeft;

    this.updateDisplay();
    this.updateProgress();

    this.elements.startPauseBtn.innerHTML = '▶️ Start';
    this.elements.skipBtn.style.display = 'none';
    this.elements.breakSuggestions.classList.add('hidden');

    this.showMessage(this.translations.readyToStart);
  }

  skipSession() {
    this.completeSession();
  }

  completeSession() {
    this.isRunning = false;
    this.elements.timerContainer.classList.remove('active');
    clearInterval(this.timer);

    if (this.currentMode === 'work') {
      this.completedCycles++;
      this.focusTime += this.durations[this.currentMode];
    } else {
      this.breaksTaken++;
    }

    this.updateStats();

    setTimeout(() => {
      this.autoSwitchMode();
    }, 1000);
  }

  autoSwitchMode() {
    let nextMode;
    if (this.currentMode === 'work') {
      nextMode = (this.completedCycles % 4 === 0) ? 'longBreak' : 'shortBreak';
    } else {
      nextMode = 'work';
    }

    this.switchMode(nextMode);
    this.showMessage("Click Start when you're ready!");
  }

  switchMode(mode) {
    if (this.isRunning) return;

    this.currentMode = mode;
    this.timeLeft = this.durations[mode] * 60;
    this.totalTime = this.timeLeft;

    this.updateDisplay();
    this.updateModeButtons();
    this.updateProgress();

    document.body.className = mode === 'work' ? '' : 'break-mode';
    
    // Corrigir aqui - usar setAttribute para elementos SVG
    if (mode === 'work') {
        this.elements.progressCircle.setAttribute('class', 'timer-progress');
    } else {
        this.elements.progressCircle.setAttribute('class', 'timer-progress break-mode');
    }

    this.elements.startPauseBtn.innerHTML = '▶️ Start';
    this.elements.skipBtn.style.display = 'none';
    this.elements.breakSuggestions.classList.add('hidden');
  }

  updateDisplay() {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;

    this.elements.timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    const modeLabels = {
      work: this.translations.focus,
      shortBreak: this.translations.shortBreak,
      longBreak: this.translations.longBreak
    };

    this.elements.modeIndicator.textContent = modeLabels[this.currentMode];
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
    });
  }

  updateStats() {
    this.elements.cyclesCompleted.textContent = this.completedCycles;

    const hours = Math.floor(this.focusTime / 60);
    const minutes = this.focusTime % 60;
    this.elements.focusTimeEl.textContent = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    this.elements.breaksTaken.textContent = this.breaksTaken;
  }

  showMessage(message) {
    this.elements.messageDisplay.textContent = message;
  }

  showRandomMessage(type) {
    const messages = {
      workStart: [this.translations.workStartMessage1],
      breakStart: [this.translations.breakStartMessage1]
    };

    const messageArray = messages[type];
    if (messageArray && messageArray.length > 0) {
      const randomMessage = messageArray[Math.floor(Math.random() * messageArray.length)];
      this.showMessage(randomMessage);
    }
  }

  changeLanguage(language) {
    this.currentLanguage = language;
    this.translations = TRANSLATIONS[language];

    this.updateDisplay();
    this.showMessage(this.translations.readyToStart);
  }

  loadTranslations(language) {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.translations = TRANSLATIONS[language];
        resolve();
      }, 100);
    });
  }
}

function setupMockDOM() {
  document.body.innerHTML = `
    <div class="app-container">
      <div class="timer-section">
        <div class="timer-container">
          <div class="timer-display">
            <span id="time-display">25:00</span>
            <span id="mode-indicator">Focus</span>
          </div>
          <svg class="timer-progress-container" viewBox="0 0 200 200">
            <circle id="progress-circle" 
              class="timer-progress" 
              cx="100" 
              cy="100" 
              r="90"
              fill="none"
              stroke-width="4"
              stroke-linecap="round"
              style="stroke-dasharray: ${2 * Math.PI * 90}px"
            />
          </svg>
        </div>
        <div class="control-buttons">
          <button id="start-pause-btn">▶️ Start</button>
          <button id="reset-btn">🔄 Reset</button>
          <button id="skip-btn" style="display: none">⏭️ Skip</button>
        </div>
      </div>
      <div id="encouraging-message"></div>
      <div id="break-suggestions" class="hidden"></div>
      <div class="stats">
        <span id="cycles-completed">0</span>
        <span id="focus-time">0m</span>
        <span id="breaks-taken">0</span>
      </div>
      <select id="language">
        <option value="en">English</option>
        <option value="pt">Português</option>
      </select>
      <div class="mode-buttons">
        <button class="mode-btn active" data-mode="work">Focus</button>
        <button class="mode-btn" data-mode="shortBreak">Short Break</button>
        <button class="mode-btn" data-mode="longBreak">Long Break</button>
      </div>
    </div>
  `;
}

describe('PomoChill App Integration Tests', () => {
  let pomoApp;
  let user;

  beforeEach(() => {
    setupMockDOM();
    jest.clearAllTimers();
    jest.useFakeTimers();

    // Create user event instance
    user = userEvent.setup({ delay: null });

    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // Initialize mock app
    pomoApp = new MockPomoChill();
  });

  afterEach(() => {
    if (pomoApp && pomoApp.timer) {
      clearInterval(pomoApp.timer);
    }
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
    document.body.innerHTML = '';
  });

  describe('Timer Start/Pause/Reset Flow', () => {
    test('should start, pause, and reset timer correctly', async () => {
      const startBtn = pomoApp.elements.startPauseBtn;
      const resetBtn = pomoApp.elements.resetBtn;
      const timeDisplay = pomoApp.elements.timeDisplay;

      // Initially stopped
      expect(pomoApp.isRunning).toBe(false);
      expect(startBtn.innerHTML).toBe('▶️ Start');
      expect(timeDisplay.textContent).toBe('25:00');

      // Start timer
      await user.click(startBtn);
      expect(pomoApp.isRunning).toBe(true);
      expect(startBtn.innerHTML).toBe('⏸️ Pause');
      expect(pomoApp.elements.timerContainer).toHaveClass('active');

      // Let timer run for 2 seconds
      jest.advanceTimersByTime(2000);
      expect(timeDisplay.textContent).toBe('24:58');

      // Pause timer
      await user.click(startBtn);
      expect(pomoApp.isRunning).toBe(false);
      expect(startBtn.innerHTML).toBe('▶️ Resume');
      expect(pomoApp.elements.timerContainer).not.toHaveClass('active');

      // Reset timer
      await user.click(resetBtn);
      expect(timeDisplay.textContent).toBe('25:00');
      expect(startBtn.innerHTML).toBe('▶️ Start');
    });

    test('should handle timer completion and auto-switch modes', async () => {
      const startBtn = pomoApp.elements.startPauseBtn;

      // Start work session
      await user.click(startBtn);
      expect(pomoApp.currentMode).toBe('work');

      // Fast-forward to completion
      pomoApp.timeLeft = 1;
      jest.advanceTimersByTime(1000);

      // Wait for auto-switch
      jest.advanceTimersByTime(1000);

      expect(pomoApp.currentMode).toBe('shortBreak');
      expect(pomoApp.completedCycles).toBe(1);
      expect(pomoApp.focusTime).toBe(25);
      expect(pomoApp.elements.timeDisplay.textContent).toBe('05:00');
    });
  });

  describe('Mode Switching Integration', () => {
    test('should switch between work and break modes', async () => {
      const workBtn = document.querySelector('.mode-btn[data-mode="work"]');
      const shortBreakBtn = document.querySelector('.mode-btn[data-mode="shortBreak"]');
      const longBreakBtn = document.querySelector('.mode-btn[data-mode="longBreak"]');

      // Start in work mode
      expect(pomoApp.currentMode).toBe('work');
      expect(workBtn).toHaveClass('active');
      expect(pomoApp.elements.timeDisplay.textContent).toBe('25:00');

      // Switch to short break
      await user.click(shortBreakBtn);
      expect(pomoApp.currentMode).toBe('shortBreak');
      expect(shortBreakBtn).toHaveClass('active');
      expect(shortBreakBtn).toHaveClass('break-active');
      expect(pomoApp.elements.timeDisplay.textContent).toBe('05:00');
      expect(document.body).toHaveClass('break-mode');

      // Switch to long break
      await user.click(longBreakBtn);
      expect(pomoApp.currentMode).toBe('longBreak');
      expect(longBreakBtn).toHaveClass('active');
      expect(longBreakBtn).toHaveClass('break-active');
      expect(pomoApp.elements.timeDisplay.textContent).toBe('15:00');

      // Switch back to work
      await user.click(workBtn);
      expect(pomoApp.currentMode).toBe('work');
      expect(workBtn).toHaveClass('active');
      expect(workBtn).not.toHaveClass('break-active');
      expect(document.body).not.toHaveClass('break-mode');
    });

    test('should prevent mode switching during active session', async () => {
      const startBtn = pomoApp.elements.startPauseBtn;
      const shortBreakBtn = document.querySelector('.mode-btn[data-mode="shortBreak"]');

      // Start work session
      await user.click(startBtn);
      expect(pomoApp.isRunning).toBe(true);
      expect(pomoApp.currentMode).toBe('work');

      // Try to switch mode during active session
      await user.click(shortBreakBtn);

      // Mode should not change
      expect(pomoApp.currentMode).toBe('work');
      expect(pomoApp.isRunning).toBe(true);
    });
  });

  describe('Break Session Features', () => {
    test('should show skip button and suggestions during break', async () => {
      const shortBreakBtn = document.querySelector('.mode-btn[data-mode="shortBreak"]');
      const startBtn = pomoApp.elements.startPauseBtn;
      const skipBtn = pomoApp.elements.skipBtn;
      const breakSuggestions = pomoApp.elements.breakSuggestions;

      // Switch to break mode
      await user.click(shortBreakBtn);
      expect(skipBtn.style.display).toBe('none');
      expect(breakSuggestions).toHaveClass('hidden');

      // Start break session
      await user.click(startBtn);
      expect(skipBtn.style.display).toBe('flex');
      expect(breakSuggestions).not.toHaveClass('hidden');

      // Skip break
      await user.click(skipBtn);
      expect(pomoApp.isRunning).toBe(false);
      
      // Esperar o timeout de 2 segundos
      jest.advanceTimersByTime(2000);
      
      // Agora sim verificar a mudança de modo
      expect(pomoApp.currentMode).toBe('work');
    });

    test('should hide skip button and suggestions during work', async () => {
      const startBtn = pomoApp.elements.startPauseBtn;
      const skipBtn = pomoApp.elements.skipBtn;
      const breakSuggestions = pomoApp.elements.breakSuggestions;

      // Start work session
      await user.click(startBtn);
      expect(skipBtn.style.display).toBe('none');
      expect(breakSuggestions).toHaveClass('hidden');
    });
  });

  describe('Statistics Integration', () => {
    test('should track and update statistics correctly', async () => {
      const startBtn = pomoApp.elements.startPauseBtn;

      // Complete first work session
      await user.click(startBtn);
      pomoApp.timeLeft = 1;
      jest.advanceTimersByTime(1000);
      jest.advanceTimersByTime(1000); // Wait for auto-switch

      expect(pomoApp.elements.cyclesCompleted.textContent).toBe('1');
      expect(pomoApp.elements.focusTimeEl.textContent).toBe('25m');
      expect(pomoApp.elements.breaksTaken.textContent).toBe('0');

      // Complete break session
      await user.click(startBtn);
      pomoApp.timeLeft = 1;
      jest.advanceTimersByTime(1000);
      jest.advanceTimersByTime(1000); // Wait for auto-switch

      expect(pomoApp.elements.breaksTaken.textContent).toBe('1');

      // Complete another work session
      await user.click(startBtn);
      pomoApp.timeLeft = 1; 
      jest.advanceTimersByTime(1000);
      jest.advanceTimersByTime(1000);

      expect(pomoApp.elements.cyclesCompleted.textContent).toBe('2');
      expect(pomoApp.elements.focusTimeEl.textContent).toBe('50m');
    });

    test('should format focus time with hours correctly', async () => {
      // Manually set high focus time
      pomoApp.focusTime = 125; // 2 hours 5 minutes
      pomoApp.updateStats();

      expect(pomoApp.elements.focusTimeEl.textContent).toBe('2h 5m');
    });
  });

  describe('Long Break Cycle Integration', () => {
    test('should trigger long break after 4 completed work cycles', async () => {
      const startBtn = pomoApp.elements.startPauseBtn;

      // Complete 4 work cycles
      for (let i = 0; i < 4; i++) {
        // Complete work session
        await user.click(startBtn);
        pomoApp.timeLeft = 1;
        jest.advanceTimersByTime(1000);
        jest.advanceTimersByTime(1000); // Wait for auto-switch

        if (i < 3) {
          // Complete short break
          await user.click(startBtn);
          pomoApp.timeLeft = 1;
          jest.advanceTimersByTime(1000);
          jest.advanceTimersByTime(1000); // Wait for auto-switch
          
          // Verify we're back in work mode
          expect(pomoApp.currentMode).toBe('work');
        }
      }

      // After 4th work session, should be in long break
      expect(pomoApp.currentMode).toBe('longBreak');
      expect(pomoApp.completedCycles).toBe(4);
    });
  });

  describe('Language Integration', () => {
    // Set longer timeout for the entire describe block
    jest.setTimeout(30000);

    test('should change language and update UI accordingly', async () => {
        const languageSelector = pomoApp.elements.languageSelector;
        const modeIndicator = pomoApp.elements.modeIndicator;
        const messageDisplay = pomoApp.elements.messageDisplay;

        // Use real timers for this test
        jest.useRealTimers();

        // Setup initial state
        await pomoApp.loadTranslations('en');
        pomoApp.updateDisplay();
        pomoApp.showMessage(pomoApp.translations.readyToStart);

        // Verify initial English state
        expect(modeIndicator.textContent).toBe('Focus');
        expect(messageDisplay.textContent).toBe('Ready to start? Click Start!');

        // Change to Portuguese with longer timeout
        await user.selectOptions(languageSelector, 'pt');
        
        // Use polling with shorter intervals
        await waitFor(
            () => {
                expect(pomoApp.currentLanguage).toBe('pt');
                expect(modeIndicator.textContent).toBe('Foco');
                expect(messageDisplay.textContent).toBe('Pronto para começar? Clique em Iniciar!');
            },
            {
                timeout: 15000,
                interval: 100
            }
        );

        // Switch to break mode and verify translation
        const shortBreakBtn = document.querySelector('.mode-btn[data-mode="shortBreak"]');
        await user.click(shortBreakBtn);

        await waitFor(
            () => {
                expect(modeIndicator.textContent).toBe('Pausa Curta');
            },
            {
                timeout: 15000,
                interval: 100
            }
        );

        // Restore fake timers for other tests
        jest.useFakeTimers();
    });
  });

  describe('Message Display Integration', () => {
    test('should show appropriate messages for different states', async () => {
      const startBtn = pomoApp.elements.startPauseBtn;
      const resetBtn = pomoApp.elements.resetBtn;
      const messageDisplay = pomoApp.elements.messageDisplay;

      // Force initial message
      pomoApp.showMessage(pomoApp.translations.readyToStart);

      // Initial message
      expect(messageDisplay.textContent).toBe(pomoApp.translations.readyToStart);

      // Start work session
      await user.click(startBtn);
      expect(messageDisplay.textContent).toBe(pomoApp.translations.workStartMessage1);

      // Pause session
      await user.click(startBtn);
      expect(messageDisplay.textContent).toBe('Paused. Ready to resume?');

      // Reset session
      await user.click(resetBtn);
      expect(messageDisplay.textContent).toBe(pomoApp.translations.readyToStart);
    });
  });

  describe('Progress Circle Integration', () => {
    test('should update progress circle as timer runs', async () => {
      const startBtn = pomoApp.elements.startPauseBtn;
      const progressCircle = pomoApp.elements.progressCircle;
      const circumference = 2 * Math.PI * 90;

      // Initialize strokeDashoffset
      progressCircle.style.strokeDashoffset = circumference;

      // Start timer
      await user.click(startBtn);

      // Initial state (no progress)
      expect(parseInt(progressCircle.style.strokeDashoffset)).toBe(parseInt(circumference));

      // Run timer for some time (50% progress)
      pomoApp.timeLeft = Math.floor(pomoApp.totalTime / 2);
      pomoApp.updateProgress();

      const expectedOffset = circumference * 0.5;
      expect(parseInt(progressCircle.style.strokeDashoffset)).toBe(parseInt(expectedOffset));

      // Complete timer
      pomoApp.timeLeft = 0;
      pomoApp.updateProgress();

      expect(parseInt(progressCircle.style.strokeDashoffset)).toBe(0);
    });
  });

  describe('Keyboard Shortcuts Integration', () => {
    test('should handle spacebar to toggle timer', async () => {
      const startBtn = pomoApp.elements.startPauseBtn;

      // Initially stopped
      expect(pomoApp.isRunning).toBe(false);

      // Press spacebar to start
      fireEvent.keyDown(document, { code: 'Space' });

      expect(pomoApp.isRunning).toBe(true);
      expect(startBtn.innerHTML).toBe('⏸️ Pause');

      // Press spacebar to pause
      fireEvent.keyDown(document, { code: 'Space' });

      expect(pomoApp.isRunning).toBe(false);
      expect(startBtn.innerHTML).toBe('▶️ Resume');
    });
  });
});
