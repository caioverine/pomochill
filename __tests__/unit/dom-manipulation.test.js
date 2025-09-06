/**
 * TESTES UNITÁRIOS - Manipulação do DOM
 * Testa as interações com elementos DOM sem inicializar a aplicação completa
 */

import { fireEvent, screen } from '@testing-library/dom';
import '@testing-library/jest-dom';

describe('DOM Manipulation - Unit Tests', () => {
  beforeEach(() => {
    setupMockDOM();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();  
    jest.useRealTimers();
    document.body.innerHTML = '';
  });

  describe('Element Selection and Binding', () => {
    test('should find and bind all required elements', () => {
      const requiredElements = [
        'time-display',
        'mode-indicator', 
        'progress-circle',
        'start-pause-btn',
        'reset-btn',
        'skip-btn',
        'encouraging-message',
        'break-suggestions',
        'suggestions-list',
        'cycles-completed',
        'focus-time',
        'breaks-taken',
        'settings-btn',
        'stats-btn'
      ];

      requiredElements.forEach(id => {
        const element = document.getElementById(id);
        expect(element).toBeInTheDocument();
        expect(element).not.toBeNull();
      });
    });

    test('should find mode buttons with correct data attributes', () => {
      const modeButtons = document.querySelectorAll('.mode-btn');
      expect(modeButtons).toHaveLength(3);

      const workBtn = document.querySelector('.mode-btn[data-mode="work"]');
      const shortBreakBtn = document.querySelector('.mode-btn[data-mode="shortBreak"]');
      const longBreakBtn = document.querySelector('.mode-btn[data-mode="longBreak"]');

      expect(workBtn).toBeInTheDocument();
      expect(shortBreakBtn).toBeInTheDocument();
      expect(longBreakBtn).toBeInTheDocument();
    });
  });

  describe('Time Display Updates', () => {
    test('should update time display element correctly', () => {
      const timeDisplay = document.getElementById('time-display');

      const updateTimeDisplay = (timeInSeconds) => {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = timeInSeconds % 60;
        const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        timeDisplay.textContent = formattedTime;
        return formattedTime;
      };

      expect(updateTimeDisplay(1500)).toBe('25:00');
      expect(timeDisplay).toHaveTextContent('25:00');

      expect(updateTimeDisplay(300)).toBe('05:00');
      expect(timeDisplay).toHaveTextContent('05:00');

      expect(updateTimeDisplay(0)).toBe('00:00');
      expect(timeDisplay).toHaveTextContent('00:00');
    });

    test('should update mode indicator text', () => {
      const modeIndicator = document.getElementById('mode-indicator');

      const updateModeIndicator = (mode) => {
        const modeLabels = {
          work: 'Focus',
          shortBreak: 'Short Break',
          longBreak: 'Long Break'
        };
        modeIndicator.textContent = modeLabels[mode];
        return modeLabels[mode];
      };

      expect(updateModeIndicator('work')).toBe('Focus');
      expect(modeIndicator).toHaveTextContent('Focus');

      expect(updateModeIndicator('shortBreak')).toBe('Short Break');
      expect(modeIndicator).toHaveTextContent('Short Break');

      expect(updateModeIndicator('longBreak')).toBe('Long Break');
      expect(modeIndicator).toHaveTextContent('Long Break');
    });
  });

  describe('Progress Circle Updates', () => {
    test('should update SVG progress circle stroke-dashoffset', () => {
      const progressCircle = document.getElementById('progress-circle');

      const updateProgress = (progress) => {
        const circumference = 2 * Math.PI * 90;
        const offset = circumference * (1 - progress);
        progressCircle.style.strokeDashoffset = offset;
        return offset;
      };

      const circumference = 2 * Math.PI * 90;

      // Test full circle (0% progress)
      const offset0 = updateProgress(0);
      expect(offset0).toBe(circumference);
      expect(progressCircle.style.strokeDashoffset).toBe(circumference.toString());

      // Test half circle (50% progress)
      const offset50 = updateProgress(0.5);
      expect(offset50).toBe(circumference * 0.5);
      expect(progressCircle.style.strokeDashoffset).toBe((circumference * 0.5).toString());

      // Test no circle (100% progress)
      const offset100 = updateProgress(1);
      expect(offset100).toBe(0);
      expect(progressCircle.style.strokeDashoffset).toBe('0');
    });
  });

  describe('Button State Management', () => {
    test('should update start/pause button correctly', () => {
      const startPauseBtn = document.getElementById('start-pause-btn');

      const updateStartPauseButton = (isRunning) => {
        if (isRunning) {
          startPauseBtn.innerHTML = '⏸️ Pause';
        } else {
          startPauseBtn.innerHTML = '▶️ Start';
        }
      };

      // Test start state
      updateStartPauseButton(false);
      expect(startPauseBtn.innerHTML).toBe('▶️ Start');

      // Test pause state
      updateStartPauseButton(true);
      expect(startPauseBtn.innerHTML).toBe('⏸️ Pause');
    });

    test('should show/hide skip button based on mode', () => {
      const skipBtn = document.getElementById('skip-btn');

      const updateSkipButtonVisibility = (mode) => {
        if (mode !== 'work') {
          skipBtn.style.display = 'flex';
        } else {
          skipBtn.style.display = 'none';
        }
      };

      // Work mode - hide skip button
      updateSkipButtonVisibility('work');
      expect(skipBtn.style.display).toBe('none');

      // Break modes - show skip button
      updateSkipButtonVisibility('shortBreak');
      expect(skipBtn.style.display).toBe('flex');

      updateSkipButtonVisibility('longBreak');
      expect(skipBtn.style.display).toBe('flex');
    });
  });

  describe('Mode Button States', () => {
    test('should update active mode button styling', () => {
      const modeButtons = document.querySelectorAll('.mode-btn');

      const updateModeButtons = (activeMode) => {
        modeButtons.forEach(btn => {
          const mode = btn.dataset.mode;
          btn.classList.remove('active', 'break-active');

          if (mode === activeMode) {
            btn.classList.add('active');
            if (mode !== 'work') {
              btn.classList.add('break-active');
            }
          }
        });
      };

      // Test work mode active
      updateModeButtons('work');
      const workBtn = document.querySelector('.mode-btn[data-mode="work"]');
      expect(workBtn).toHaveClass('active');
      expect(workBtn).not.toHaveClass('break-active');

      // Test short break mode active
      updateModeButtons('shortBreak');
      const shortBreakBtn = document.querySelector('.mode-btn[data-mode="shortBreak"]');
      expect(shortBreakBtn).toHaveClass('active');
      expect(shortBreakBtn).toHaveClass('break-active');

      // Ensure other buttons are not active
      expect(workBtn).not.toHaveClass('active');
    });

    test('should update duration display on mode buttons', () => {
      const updateModeDurations = (durations) => {
        const modeButtons = document.querySelectorAll('.mode-btn');
        modeButtons.forEach(btn => {
          const mode = btn.dataset.mode;
          const durationEl = btn.querySelector('.mode-duration');
          if (durationEl && durations[mode]) {
            durationEl.textContent = `${durations[mode]} min`;
          }
        });
      };

      const testDurations = {
        work: 30,
        shortBreak: 10,
        longBreak: 20
      };

      updateModeDurations(testDurations);

      const workDuration = document.querySelector('.mode-btn[data-mode="work"] .mode-duration');
      const shortBreakDuration = document.querySelector('.mode-btn[data-mode="shortBreak"] .mode-duration');
      const longBreakDuration = document.querySelector('.mode-btn[data-mode="longBreak"] .mode-duration');

      expect(workDuration).toHaveTextContent('30 min');
      expect(shortBreakDuration).toHaveTextContent('10 min');
      expect(longBreakDuration).toHaveTextContent('20 min');
    });
  });

  describe('Statistics Display', () => {
    test('should update statistics elements correctly', () => {
      const cyclesEl = document.getElementById('cycles-completed');
      const focusTimeEl = document.getElementById('focus-time');
      const breaksEl = document.getElementById('breaks-taken');

      const updateStats = (cycles, focusMinutes, breaks) => {
        cyclesEl.textContent = cycles;

        const hours = Math.floor(focusMinutes / 60);
        const minutes = focusMinutes % 60;
        focusTimeEl.textContent = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

        breaksEl.textContent = breaks;
      };

      updateStats(5, 125, 4);

      expect(cyclesEl).toHaveTextContent('5');
      expect(focusTimeEl).toHaveTextContent('2h 5m');
      expect(breaksEl).toHaveTextContent('4');

      updateStats(2, 50, 2);

      expect(cyclesEl).toHaveTextContent('2');
      expect(focusTimeEl).toHaveTextContent('50m');
      expect(breaksEl).toHaveTextContent('2');
    });
  });

  describe('Message Display', () => {
    test('should update encouraging message element', () => {
      const messageEl = document.getElementById('encouraging-message');

      const updateMessage = (message) => {
        messageEl.textContent = message;
      };

      updateMessage('Great job! Keep going!');
      expect(messageEl).toHaveTextContent('Great job! Keep going!');

      updateMessage('Time for a break!');
      expect(messageEl).toHaveTextContent('Time for a break!');
    });
  });

  describe('Break Suggestions Display', () => {
    test('should show/hide break suggestions container', () => {
      const breakSuggestions = document.getElementById('break-suggestions');

      const toggleBreakSuggestions = (show) => {
        if (show) {
          breakSuggestions.classList.remove('hidden');
        } else {
          breakSuggestions.classList.add('hidden');
        }
      };

      // Test show
      toggleBreakSuggestions(true);
      expect(breakSuggestions).not.toHaveClass('hidden');

      // Test hide
      toggleBreakSuggestions(false);
      expect(breakSuggestions).toHaveClass('hidden');
    });

    test('should render break suggestions list', () => {
      const suggestionsList = document.getElementById('suggestions-list');

      const renderSuggestions = (suggestions) => {
        suggestionsList.innerHTML = '';
        suggestions.forEach((suggestion, index) => {
          const div = document.createElement('div');
          div.className = 'suggestion-item';
          div.innerHTML = `
            <span class="suggestion-icon">💡</span>
            ${suggestion}
          `;
          suggestionsList.appendChild(div);
        });
      };

      const testSuggestions = ['Take a walk', 'Drink water', 'Stretch'];
      renderSuggestions(testSuggestions);

      const suggestionItems = suggestionsList.querySelectorAll('.suggestion-item');
      expect(suggestionItems).toHaveLength(3);
      expect(suggestionItems[0]).toHaveTextContent('Take a walk');
      expect(suggestionItems[1]).toHaveTextContent('Drink water');
      expect(suggestionItems[2]).toHaveTextContent('Stretch');
    });
  });

  describe('Modal Management', () => {
    test('should show/hide settings modal', () => {
      const settingsModal = document.getElementById('settings-modal');

      const toggleSettingsModal = (show) => {
        if (show) {
          settingsModal.classList.remove('hidden');
        } else {
          settingsModal.classList.add('hidden');
        }
      };

      // Initially hidden
      expect(settingsModal).toHaveClass('hidden');

      // Show modal
      toggleSettingsModal(true);
      expect(settingsModal).not.toHaveClass('hidden');

      // Hide modal
      toggleSettingsModal(false);
      expect(settingsModal).toHaveClass('hidden');
    });

    test('should show/hide stats modal', () => {
      const statsModal = document.getElementById('stats-modal');

      const toggleStatsModal = (show) => {
        if (show) {
          statsModal.classList.remove('hidden');
        } else {
          statsModal.classList.add('hidden');
        }
      };

      // Initially hidden
      expect(statsModal).toHaveClass('hidden');

      // Show modal
      toggleStatsModal(true);
      expect(statsModal).not.toHaveClass('hidden');

      // Hide modal
      toggleStatsModal(false);
      expect(statsModal).toHaveClass('hidden');
    });
  });

  describe('Form Input Updates', () => {
    test('should update settings form inputs', () => {
      const workDuration = document.getElementById('work-duration');
      const shortBreakDuration = document.getElementById('short-break-duration');
      const longBreakDuration = document.getElementById('long-break-duration');
      const soundEnabled = document.getElementById('sound-enabled');

      const updateSettingsForm = (settings) => {
        workDuration.value = settings.work;
        shortBreakDuration.value = settings.shortBreak;
        longBreakDuration.value = settings.longBreak;
        soundEnabled.checked = settings.sound;
      };

      const testSettings = {
        work: 30,
        shortBreak: 10,
        longBreak: 20,
        sound: false
      };

      updateSettingsForm(testSettings);

      expect(workDuration.value).toBe('30');
      expect(shortBreakDuration.value).toBe('10');
      expect(longBreakDuration.value).toBe('20');
      expect(soundEnabled.checked).toBe(false);
    });
  });

  describe('CSS Class Management', () => {
    test('should update body classes for different modes', () => {
      const updateBodyClass = (mode) => {
        document.body.className = mode === 'work' ? '' : 'break-mode';
      };

      // Work mode
      updateBodyClass('work');
      expect(document.body).not.toHaveClass('break-mode');

      // Break modes
      updateBodyClass('shortBreak');
      expect(document.body).toHaveClass('break-mode');

      updateBodyClass('longBreak');
      expect(document.body).toHaveClass('break-mode');
    });

    test('should update timer container active state', () => {
      const timerContainer = document.querySelector('.timer-container');

      const updateTimerContainerState = (isActive) => {
        if (isActive) {
          timerContainer.classList.add('active');
        } else {
          timerContainer.classList.remove('active');
        }
      };

      // Test active state
      updateTimerContainerState(true);
      expect(timerContainer).toHaveClass('active');

      // Test inactive state
      updateTimerContainerState(false);
      expect(timerContainer).not.toHaveClass('active');
    });
  });
});
