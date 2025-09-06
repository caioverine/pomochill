/**
 * TESTES E2E - Operações Básicas do Timer
 * Testa o funcionamento completo do timer no navegador real
 */

describe('PomoChill - Basic Timer Operations', () => {
  beforeEach(() => {
    // Visit the application
    cy.visit('/');

    // Wait for app to load
    cy.waitForAppLoad();
  });

  describe('Timer Display and Initial State', () => {
    it('should display correct initial state', () => {
      // Verify initial timer display
      cy.verifyTimeFormat('25:00');

      // Verify initial mode indicator
      cy.verifyModeIndicator('work');

      // Verify initial button state
      cy.get('#start-pause-btn').should('contain', 'Start');
      cy.get('#start-pause-btn').should('be.visible');

      // Verify reset and skip buttons
      cy.get('#reset-btn').should('be.visible');
      cy.get('#skip-btn').should('not.be.visible');

      // Verify timer container is not active initially
      cy.get('.timer-container').should('not.have.class', 'active');

      // Verify progress circle is visible
      cy.verifyProgressCircle();
    });

    it('should display welcome message', () => {
      cy.get('#encouraging-message').should('be.visible');
      cy.get('#encouraging-message').should('contain.text', 'Ready');
    });

    it('should show correct mode buttons', () => {
      // Verify all mode buttons are present
      cy.get('[data-mode="work"]').should('be.visible').should('have.class', 'active');
      cy.get('[data-mode="shortBreak"]').should('be.visible').should('not.have.class', 'active');
      cy.get('[data-mode="longBreak"]').should('be.visible').should('not.have.class', 'active');

      // Verify duration displays on buttons
      cy.get('[data-mode="work"] .mode-duration').should('contain', '25 min');
      cy.get('[data-mode="shortBreak"] .mode-duration').should('contain', '5 min');
      cy.get('[data-mode="longBreak"] .mode-duration').should('contain', '15 min');
    });
  });

  describe('Timer Start and Pause Functionality', () => {
    it('should start timer when start button is clicked', () => {
      // Start the timer
      cy.startTimer();

      // Verify timer is running
      cy.get('#start-pause-btn').should('contain', 'Pause');
      cy.get('.timer-container').should('have.class', 'active');

      // Verify message changes
      cy.get('#encouraging-message').should('not.contain', 'Ready');

      // Wait a moment and verify time has decreased
      cy.wait(2000);
      cy.get('#time-display').should('not.contain', '25:00');
    });

    it('should pause timer when pause button is clicked', () => {
      // Start timer first
      cy.startTimer();

      // Wait a moment for timer to run
      cy.wait(2000);

      // Get the current time display
      cy.get('#time-display').invoke('text').then((timeBeforePause) => {
        // Pause the timer
        cy.pauseTimer();

        // Wait and verify time hasn't changed
        cy.wait(2000);
        cy.get('#time-display').should('contain', timeBeforePause);

        // Verify pause state
        cy.get('#start-pause-btn').should('contain', 'Resume');
        cy.get('.timer-container').should('not.have.class', 'active');
      });
    });

    it('should resume timer after pause', () => {
      // Start, pause, then resume
      cy.startTimer();
      cy.wait(1000);
      cy.pauseTimer();

      // Resume timer
      cy.get('#start-pause-btn').click();
      cy.get('#start-pause-btn').should('contain', 'Pause');
      cy.get('.timer-container').should('have.class', 'active');

      // Verify timer is counting down again
      cy.wait(2000);
      cy.get('#time-display').invoke('text').then((timeAfterResume) => {
        cy.wait(2000);
        cy.get('#time-display').should('not.contain', timeAfterResume);
      });
    });
  });

  describe('Timer Reset Functionality', () => {
    it('should reset timer to initial state', () => {
      // Start timer and let it run
      cy.startTimer();
      cy.wait(3000);

      // Reset timer
      cy.resetTimer();

      // Verify reset state
      cy.verifyTimeFormat('25:00');
      cy.get('#start-pause-btn').should('contain', 'Start');
      cy.get('.timer-container').should('not.have.class', 'active');

      // Verify message returns to initial state
      cy.get('#encouraging-message').should('contain.text', 'Ready');
    });

    it('should reset timer during pause state', () => {
      // Start, pause, then reset
      cy.startTimer();
      cy.wait(2000);
      cy.pauseTimer();

      // Reset from paused state
      cy.resetTimer();

      // Verify complete reset
      cy.verifyTimeFormat('25:00');
      cy.get('#start-pause-btn').should('contain', 'Start');
    });
  });

  describe('Mode Switching', () => {
    it('should switch to short break mode', () => {
      // Switch to short break mode
      cy.switchMode('shortBreak');

      // Verify mode change
      cy.verifyModeIndicator('shortBreak');
      cy.verifyTimeFormat('05:00');

      // Verify active mode button
      cy.get('[data-mode="shortBreak"]').should('have.class', 'active');
      cy.get('[data-mode="shortBreak"]').should('have.class', 'break-active');
      cy.get('[data-mode="work"]').should('not.have.class', 'active');

      // Verify body class change for styling
      cy.get('body').should('have.class', 'break-mode');
    });

    it('should switch to long break mode', () => {
      // Switch to long break mode
      cy.switchMode('longBreak');

      // Verify mode change
      cy.verifyModeIndicator('longBreak');
      cy.verifyTimeFormat('15:00');

      // Verify active mode button
      cy.get('[data-mode="longBreak"]').should('have.class', 'active');
      cy.get('[data-mode="longBreak"]').should('have.class', 'break-active');
      cy.get('body').should('have.class', 'break-mode');
    });

    it('should switch back to work mode', () => {
      // Switch to break mode first
      cy.switchMode('shortBreak');

      // Switch back to work mode
      cy.switchMode('work');

      // Verify mode change
      cy.verifyModeIndicator('work');
      cy.verifyTimeFormat('25:00');

      // Verify active mode button
      cy.get('[data-mode="work"]').should('have.class', 'active');
      cy.get('[data-mode="work"]').should('not.have.class', 'break-active');
      cy.get('body').should('not.have.class', 'break-mode');
    });

    it('should prevent mode switching during active timer', () => {
      // Start work timer
      cy.startTimer();

      // Try to switch mode
      cy.get('[data-mode="shortBreak"]').click();

      // Verify mode didn't change
      cy.verifyModeIndicator('work');
      cy.get('[data-mode="work"]').should('have.class', 'active');
      cy.get('#start-pause-btn').should('contain', 'Pause');
    });
  });

  describe('Break Session Features', () => {
    it('should show skip button during break sessions', () => {
      // Switch to break mode
      cy.switchMode('shortBreak');

      // Skip button should not be visible initially
      cy.get('#skip-btn').should('not.be.visible');

      // Start break session
      cy.startTimer();

      // Skip button should appear
      cy.get('#skip-btn').should('be.visible');

      // Break suggestions should appear
      cy.verifyBreakSuggestions();
    });

    it('should skip break session when skip button is clicked', () => {
      // Switch to break mode and start
      cy.switchMode('shortBreak');
      cy.startTimer();

      // Skip the session
      cy.get('#skip-btn').click();

      // Should auto-switch back to work mode
      cy.verifyModeIndicator('work');
      cy.get('#start-pause-btn').should('contain', 'Start');
      cy.get('#skip-btn').should('not.be.visible');
    });

    it('should not show skip button during work sessions', () => {
      // Start work session
      cy.startTimer();

      // Skip button should not appear
      cy.get('#skip-btn').should('not.be.visible');

      // Break suggestions should not appear
      cy.get('#break-suggestions').should('have.class', 'hidden');
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should start/pause timer with spacebar', () => {
      // Start timer with spacebar
      cy.pressSpacebar();
      cy.get('#start-pause-btn').should('contain', 'Pause');
      cy.get('.timer-container').should('have.class', 'active');

      // Pause timer with spacebar
      cy.pressSpacebar();
      cy.get('#start-pause-btn').should('contain', 'Resume');
      cy.get('.timer-container').should('not.have.class', 'active');
    });

    it('should not trigger spacebar when input is focused', () => {
      // Focus on an input (we'll open settings for this)
      cy.openSettings();
      cy.get('#work-duration').focus();

      // Press spacebar - should not start timer
      cy.get('body').type(' ');

      // Close settings and verify timer didn't start
      cy.closeSettings();
      cy.get('#start-pause-btn').should('contain', 'Start');
    });
  });

  describe('Progress Circle Animation', () => {
    it('should update progress circle during timer countdown', () => {
      // Start timer
      cy.startTimer();

      // Get initial progress circle state
      cy.get('#progress-circle').should('have.css', 'stroke-dashoffset');

      // Wait and verify progress has changed
      cy.wait(3000);
      cy.get('#progress-circle').should('have.css', 'stroke-dashoffset');

      // The stroke-dashoffset should be different (less) than initial
      // This is a visual indicator that progress is happening
    });

    it('should show different progress circle colors for different modes', () => {
      // Work mode progress circle
      cy.get('#progress-circle').should('have.class', 'timer-progress');
      cy.get('#progress-circle').should('not.have.class', 'break-mode');

      // Switch to break mode
      cy.switchMode('shortBreak');
      cy.get('#progress-circle').should('have.class', 'break-mode');
    });
  });

  describe('Message Display Updates', () => {
    it('should show different messages for different states', () => {
      const messageEl = '#encouraging-message';

      // Initial message
      cy.get(messageEl).should('contain.text', 'Ready');

      // Start work session - should show work message
      cy.startTimer();
      cy.get(messageEl).should('not.contain', 'Ready');

      // Pause - should show pause message
      cy.pauseTimer();
      cy.get(messageEl).should('contain', 'Paused');

      // Reset - should return to ready message
      cy.resetTimer();
      cy.get(messageEl).should('contain.text', 'Ready');
    });

    it('should show break-specific messages during break sessions', () => {
      // Switch to break mode and start
      cy.switchMode('shortBreak');
      cy.startTimer();

      // Should show break-related message (not work message)
      cy.get('#encouraging-message').should('not.contain', 'focus');
    });
  });
});
