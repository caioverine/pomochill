// Jest setup for PomoChill tests
import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock AudioContext for notification sounds
global.AudioContext = jest.fn(() => ({
  createOscillator: jest.fn(() => ({
    connect: jest.fn(),
    frequency: { value: 0 },
    type: 'sine',
    start: jest.fn(),
    stop: jest.fn(),
  })),
  createGain: jest.fn(() => ({
    connect: jest.fn(),
    gain: {
      setValueAtTime: jest.fn(),
      exponentialRampToValueAtTime: jest.fn(),
    },
  })),
  currentTime: 0,
  destination: {},
}));

global.webkitAudioContext = global.AudioContext;

// Mock YouTube API
global.YT = {
  Player: jest.fn(() => ({
    playVideo: jest.fn(),
    pauseVideo: jest.fn(),
    stopVideo: jest.fn(),
  })),
};

// Mock console.log/error for cleaner test output
const originalConsole = { ...console };
beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  // Restore console after each test
  console.log = originalConsole.log;
  console.error = originalConsole.error;
});

// Global test helpers
global.createMockElement = (id, properties = {}) => {
  const element = document.createElement('div');
  element.id = id;
  Object.assign(element, properties);
  return element;
};

global.setupMockDOM = () => {
  document.body.innerHTML = `
    <div id="time-display">25:00</div>
    <div id="mode-indicator">Focus</div>
    <svg><circle id="progress-circle"></circle></svg>
    <div class="timer-container"></div>
    <button id="start-pause-btn">Start</button>
    <button id="reset-btn">Reset</button>
    <button id="skip-btn">Skip</button>
    <div id="encouraging-message">Ready!</div>
    <div id="break-suggestions" class="hidden"></div>
    <div id="suggestions-list"></div>
    <div id="cycles-completed">0</div>
    <div id="focus-time">0h</div>
    <div id="breaks-taken">0</div>
    <button id="settings-btn">Settings</button>
    <div id="settings-modal" class="hidden"></div>
    <button id="close-settings">Close</button>
    <button id="save-settings">Save</button>
    <button id="stats-btn">Stats</button>
    <div id="stats-modal" class="hidden"></div>
    <button id="close-stats">Close</button>
    <input id="work-duration" type="number" value="25">
    <input id="short-break-duration" type="number" value="5">
    <input id="long-break-duration" type="number" value="15">
    <input id="sound-enabled" type="checkbox" checked>
    <select id="language">
      <option value="en">English</option>
      <option value="pt">Português</option>
    </select>
    <div class="mode-btn" data-mode="work">
      <span class="mode-duration">25 min</span>
    </div>
    <div class="mode-btn" data-mode="shortBreak">
      <span class="mode-duration">5 min</span>
    </div>
    <div class="mode-btn" data-mode="longBreak">
      <span class="mode-duration">15 min</span>
    </div>
  `;

  // Make TRANSLATIONS available globally
  global.TRANSLATIONS = {
    en: {
      focus: 'Focus',
      shortBreak: 'Short Break',
      longBreak: 'Long Break',
      readyToStart: 'Ready to start? Click Start!',
    },
    pt: {
      focus: 'Foco',
      shortBreak: 'Pausa Curta', 
      longBreak: 'Pausa Longa',
      readyToStart: 'Pronto para começar? Clique em Iniciar!',
    }
  };
};
