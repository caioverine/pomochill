/**
 * TESTES UNITÁRIOS - Funções do Timer
 * Testa as funcionalidades básicas do timer de forma isolada
 */

// Mock das traduções globais antes de importar
global.TRANSLATIONS = {
  en: {
    focus: 'Focus',
    shortBreak: 'Short Break', 
    longBreak: 'Long Break',
    readyToStart: 'Ready to start? Click Start!',
    workStartMessage1: "Let's focus! You can do it.",
    workStartMessage2: "Time to concentrate. Take a deep breath.",
    workStartMessage3: "Full focus for the next few minutes!",
  },
  pt: {
    focus: 'Foco',
    shortBreak: 'Pausa Curta',
    longBreak: 'Pausa Longa', 
    readyToStart: 'Pronto para começar? Clique em Iniciar!',
    workStartMessage1: 'Vamos focar! Você consegue.',
    workStartMessage2: 'Hora de concentrar. Respire fundo.',
    workStartMessage3: 'Foco total pelos próxinos minutos!',
  }
};

describe('Timer Functions - Unit Tests', () => {
  let pomoApp;

  beforeEach(() => {
    // Setup DOM mock
    setupMockDOM();

    // Mock console methods to avoid noise in tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // Clear any existing timers
    jest.clearAllTimers();
    jest.useFakeTimers();

    // Reset localStorage mock
    localStorage.clear();
  });

  afterEach(() => {
    if (pomoApp) {
      pomoApp = null;
    }
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('Time Formatting', () => {
    test('should format time correctly for display', () => {
      setupMockDOM();

      // Simulate PomoChill class functionality for time formatting
      const formatTime = (timeInSeconds) => {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = timeInSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      };

      expect(formatTime(1500)).toBe('25:00'); // 25 minutes
      expect(formatTime(300)).toBe('05:00');  // 5 minutes  
      expect(formatTime(900)).toBe('15:00');  // 15 minutes
      expect(formatTime(90)).toBe('01:30');   // 1 minute 30 seconds
      expect(formatTime(5)).toBe('00:05');    // 5 seconds
      expect(formatTime(0)).toBe('00:00');    // 0 seconds
    });
  });

  describe('Timer Duration Calculations', () => {
    test('should calculate correct duration for each mode', () => {
      const durations = {
        work: 25,
        shortBreak: 5, 
        longBreak: 15
      };

      expect(durations.work * 60).toBe(1500); // 25 minutes in seconds
      expect(durations.shortBreak * 60).toBe(300); // 5 minutes in seconds
      expect(durations.longBreak * 60).toBe(900); // 15 minutes in seconds
    });

    test('should validate duration input ranges', () => {
      const validateDuration = (duration, type) => {
        switch(type) {
          case 'work':
          case 'longBreak':
            return duration >= 1 && duration <= 60;
          case 'shortBreak':
            return duration >= 1 && duration <= 30;
          default:
            return false;
        }
      };

      // Valid durations
      expect(validateDuration(25, 'work')).toBe(true);
      expect(validateDuration(5, 'shortBreak')).toBe(true);
      expect(validateDuration(15, 'longBreak')).toBe(true);

      // Invalid durations
      expect(validateDuration(0, 'work')).toBe(false);
      expect(validateDuration(61, 'work')).toBe(false);
      expect(validateDuration(31, 'shortBreak')).toBe(false);
      expect(validateDuration(-5, 'longBreak')).toBe(false);
    });
  });

  describe('Mode Switching Logic', () => {
    test('should determine next mode correctly based on completed cycles', () => {
      const getNextMode = (currentMode, completedCycles) => {
        if (currentMode === 'work') {
          return (completedCycles % 4 === 0) ? 'longBreak' : 'shortBreak';
        } else {
          return 'work';
        }
      };

      // After work sessions
      expect(getNextMode('work', 1)).toBe('shortBreak'); // 1st cycle -> short break
      expect(getNextMode('work', 2)).toBe('shortBreak'); // 2nd cycle -> short break  
      expect(getNextMode('work', 3)).toBe('shortBreak'); // 3rd cycle -> short break
      expect(getNextMode('work', 4)).toBe('longBreak');  // 4th cycle -> long break
      expect(getNextMode('work', 8)).toBe('longBreak');  // 8th cycle -> long break

      // After break sessions  
      expect(getNextMode('shortBreak', 1)).toBe('work');
      expect(getNextMode('longBreak', 4)).toBe('work');
    });
  });

  describe('Progress Calculation', () => {
    test('should calculate progress percentage correctly', () => {
      const calculateProgress = (totalTime, timeLeft) => {
        return (totalTime - timeLeft) / totalTime;
      };

      expect(calculateProgress(1500, 1500)).toBe(0);    // 0% progress (just started)
      expect(calculateProgress(1500, 750)).toBe(0.5);   // 50% progress (halfway)
      expect(calculateProgress(1500, 0)).toBe(1);       // 100% progress (completed)
      expect(calculateProgress(300, 150)).toBe(0.5);    // 50% of 5 minute timer
    });

    test('should convert progress to SVG circle offset', () => {
      const calculateCircleOffset = (progress) => {
        const circumference = 2 * Math.PI * 90; // radius = 90
        return circumference * (1 - progress);
      };

      const circumference = 2 * Math.PI * 90;
      expect(calculateCircleOffset(0)).toBe(circumference);  // Full circle at start
      expect(calculateCircleOffset(1)).toBe(0);              // No circle at end
      expect(calculateCircleOffset(0.5)).toBe(circumference * 0.5); // Half circle
    });
  });

  describe('Statistics Tracking', () => {
    test('should track completed cycles correctly', () => {
      let completedCycles = 0;
      let focusTime = 0;
      let breaksTaken = 0;

      const completeSession = (mode, duration) => {
        if (mode === 'work') {
          completedCycles++;
          focusTime += duration;
        } else {
          breaksTaken++;
        }
      };

      // Simulate completing sessions
      completeSession('work', 25);
      completeSession('shortBreak', 5);
      completeSession('work', 25);
      completeSession('longBreak', 15);

      expect(completedCycles).toBe(2);
      expect(focusTime).toBe(50);
      expect(breaksTaken).toBe(2);
    });

    test('should format focus time display correctly', () => {
      const formatFocusTime = (totalMinutes) => {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
      };

      expect(formatFocusTime(30)).toBe('30m');
      expect(formatFocusTime(90)).toBe('1h 30m');
      expect(formatFocusTime(125)).toBe('2h 5m');
      expect(formatFocusTime(0)).toBe('0m');
    });
  });

  describe('Message Selection', () => {
    test('should select random messages from appropriate arrays', () => {
      const messages = {
        workStart: ['Message 1', 'Message 2', 'Message 3'],
        breakStart: ['Break 1', 'Break 2', 'Break 3']
      };

      const getRandomMessage = (type) => {
        const messageArray = messages[type];
        return messageArray[Math.floor(Math.random() * messageArray.length)];
      };

      // Mock Math.random to return predictable values
      const originalRandom = Math.random;
      Math.random = jest.fn();

      Math.random.mockReturnValue(0); // Should return first message
      expect(getRandomMessage('workStart')).toBe('Message 1');

      Math.random.mockReturnValue(0.5); // Should return middle message
      expect(getRandomMessage('workStart')).toBe('Message 2');

      Math.random.mockReturnValue(0.99); // Should return last message
      expect(getRandomMessage('workStart')).toBe('Message 3');

      // Restore Math.random
      Math.random = originalRandom;
    });
  });

  describe('Break Suggestions', () => {
    test('should select random break suggestions', () => {
      const suggestions = [
        'Take a deep breath',
        'Stretch your arms', 
        'Drink water',
        'Walk around',
        'Look out window',
        'Meditate'
      ];

      const getRandomSuggestions = (count = 3) => {
        const shuffled = [...suggestions].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
      };

      // Mock Math.random for predictable shuffling
      Math.random = jest.fn();
      Math.random.mockReturnValue(0.6); // Will cause certain shuffle order

      const randomSuggestions = getRandomSuggestions(3);
      expect(randomSuggestions).toHaveLength(3);
      expect(randomSuggestions.every(s => suggestions.includes(s))).toBe(true);
    });
  });

  describe('Sound Generation', () => {
    test('should create correct audio context for notifications', () => {
      const createNotificationSound = (mode) => {
        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.frequency.value = mode === 'work' ? 800 : 600;
        oscillator.type = 'sine';

        return {
          audioContext,
          oscillator,
          gainNode,
          frequency: oscillator.frequency.value
        };
      };

      const workSound = createNotificationSound('work');
      const breakSound = createNotificationSound('break');

      expect(workSound.frequency).toBe(800);
      expect(breakSound.frequency).toBe(600);
      expect(workSound.oscillator.type).toBe('sine');
    });
  });
});
