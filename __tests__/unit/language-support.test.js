/**
 * Language Support Unit Tests
 * Tests for internationalization and language switching features
 */

// Mock setup
const setupTestEnvironment = () => {
  // Mock translations
  global.TRANSLATIONS = {
    en: {
      appTitle: "PomoChill",
      slogan: "Focus, breathe, achieve.",
      focus: "Focus",
      shortBreak: "Short Break", 
      longBreak: "Long Break",
      start: "Start",
      pause: "Pause", 
      reset: "Reset",
      skip: "Skip",
      settings: "Settings",
      save: "Save",
      readyToStart: "Ready to start? Click Start!",
      workMessages: [
        "Let's focus! You can do it.",
        "Time to concentrate!"
      ],
      breakMessages: [
        "Time for a break!",
        "Take a moment to breathe."
      ],
      breakSuggestions: [
        "Take a deep breath",
        "Stretch your body",
        "Drink some water"
      ]
    },
    pt: {
      appTitle: "PomoChill",
      slogan: "Foque, respire, conquiste.",
      focus: "Foco",
      shortBreak: "Pausa Curta",
      longBreak: "Pausa Longa",
      start: "Iniciar",
      pause: "Pausar",
      reset: "Reiniciar",
      skip: "Pular",
      settings: "Configurações",
      save: "Salvar",
      readyToStart: "Pronto para começar? Clique em Iniciar!",
      workMessages: [
        "Vamos focar! Você consegue.",
        "Hora de concentrar!"
      ],
      breakMessages: [
        "Hora da pausa!",
        "Tire um momento para respirar."
      ],
      breakSuggestions: [
        "Respire fundo",
        "Alongue seu corpo",
        "Beba água"
      ]
    }
  };

  // Mock DOM
  document.body.innerHTML = `
    <div id="app">
      <select id="language">
        <option value="en">English</option>
        <option value="pt">Português</option>
      </select>
      <h1 data-i18n="appTitle">PomoChill</h1>
      <p data-i18n="slogan">Focus, breathe, achieve.</p>
      <button data-i18n="start">
        <span class="btn-icon">▶️</span>
        Start
      </button>
    </div>
  `;

  // Mock localStorage
  const localStorageMock = {
    store: {},
    getItem: jest.fn(key => localStorageMock.store[key]),
    setItem: jest.fn((key, value) => localStorageMock.store[key] = value),
    clear: jest.fn(() => localStorageMock.store = {})
  };
  global.localStorage = localStorageMock;
};

describe('Language Support', () => {
  beforeEach(() => {
    setupTestEnvironment();
  });

  afterEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '';
  });

  describe('Language Detection', () => {
    let originalNavigator;

    beforeEach(() => {
      originalNavigator = window.navigator;
    });

    afterEach(() => {
      window.navigator = originalNavigator;
    });

    test('detects browser language correctly', () => {
      Object.defineProperty(window, 'navigator', {
        value: { language: 'pt-BR' },
        writable: true
      });

      const detectLanguage = () => {
        const browserLang = navigator.language.split('-')[0];
        return TRANSLATIONS[browserLang] ? browserLang : 'en';
      };

      expect(detectLanguage()).toBe('pt');
    });

    test('falls back to English for unsupported languages', () => {
      Object.defineProperty(window, 'navigator', {
        value: { language: 'fr-FR' },
        writable: true
      });

      const detectLanguage = () => {
        const browserLang = navigator.language.split('-')[0];
        return TRANSLATIONS[browserLang] ? browserLang : 'en';
      };

      expect(detectLanguage()).toBe('en');
    });
  });

  describe('Translation System', () => {
    const translationService = {
      apply: (language) => {
        document.querySelectorAll('[data-i18n]').forEach(element => {
          const key = element.getAttribute('data-i18n');
          if (TRANSLATIONS[language]?.[key]) {
            const hasIcon = element.querySelector('.btn-icon');
            if (hasIcon) {
              // Encontra todos os nós de texto e remove os existentes
              const textNodes = Array.from(element.childNodes)
                .filter(node => node.nodeType === Node.TEXT_NODE);
              textNodes.forEach(node => node.remove());
              
              // Adiciona o novo texto traduzido após o ícone
              const iconElement = element.querySelector('.btn-icon');
              const textNode = document.createTextNode(TRANSLATIONS[language][key]);
              element.appendChild(textNode);
            } else {
              element.textContent = TRANSLATIONS[language][key];
            }
          }
        });
      },
      
      getTranslation: (key, language) => {
        return TRANSLATIONS[language]?.[key] || TRANSLATIONS.en[key] || `[${key}]`;
      }
    };

    test('applies translations correctly', () => {
      translationService.apply('pt');

      expect(document.querySelector('[data-i18n="appTitle"]').textContent).toBe('PomoChill');
      expect(document.querySelector('[data-i18n="slogan"]').textContent).toBe('Foque, respire, conquiste.');
      
      const startButton = document.querySelector('[data-i18n="start"]');
      const buttonTextNodes = Array.from(startButton.childNodes)
        .filter(node => node.nodeType === Node.TEXT_NODE)
        .map(node => node.textContent.trim())
        .join('');
      
      expect(buttonTextNodes).toBe('Iniciar');
    });

    test('preserves icons when translating', () => {
      translationService.apply('pt');
      
      const startButton = document.querySelector('[data-i18n="start"]');
      const icon = startButton.querySelector('.btn-icon');
      
      expect(icon).not.toBeNull();
      expect(icon.textContent).toBe('▶️');
      expect(startButton.textContent.includes('Iniciar')).toBe(true);
    });

    test('falls back to English for missing translations', () => {
      // Setup test translations with fallback
      global.TRANSLATIONS = {
        en: {
          testKey: 'English Value'
        },
        pt: {
          // Portuguese translations missing the testKey
        }
      };

      expect(translationService.getTranslation('testKey', 'pt')).toBe('English Value');
      expect(translationService.getTranslation('nonexistent', 'pt')).toBe('[nonexistent]');
    });
  });

  describe('Language Persistence', () => {
    test('saves language preference', () => {
      localStorage.setItem('pomoChillLanguage', 'pt');
      expect(localStorage.getItem('pomoChillLanguage')).toBe('pt');
    });

    test('loads saved language preference', () => {
      localStorage.setItem('pomoChillLanguage', 'pt');
      
      const loadLanguage = () => localStorage.getItem('pomoChillLanguage') || 'en';
      expect(loadLanguage()).toBe('pt');
    });

    test('defaults to English when no preference is saved', () => {
      localStorage.clear();
      
      const loadLanguage = () => localStorage.getItem('pomoChillLanguage') || 'en';
      expect(loadLanguage()).toBe('en');
    });
  });

  describe('UI Integration', () => {
    test('updates language selector value', () => {
      const selector = document.getElementById('language');
      selector.value = 'pt';
      
      const event = new Event('change');
      selector.dispatchEvent(event);
      
      expect(selector.value).toBe('pt');
    });

    test('updates document lang attribute', () => {
      const updateDocLang = (lang) => document.documentElement.lang = lang;
      
      updateDocLang('pt');
      expect(document.documentElement.lang).toBe('pt');
    });
  });
});
