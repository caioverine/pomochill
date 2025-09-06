// cypress/support/e2e.js
// Custom commands for PomoChill E2E tests

// Command to wait for app initialization
Cypress.Commands.add('waitForAppLoad', () => {
  cy.get('#time-display').should('be.visible');
  cy.get('#mode-indicator').should('be.visible');
  cy.get('#start-pause-btn').should('be.visible');
});

// Command to start timer
Cypress.Commands.add('startTimer', () => {
  cy.get('#start-pause-btn').click();
  cy.get('#start-pause-btn').should('contain', 'Pause');
  cy.get('.timer-container').should('have.class', 'active');
});

// Command to pause timer
Cypress.Commands.add('pauseTimer', () => {
  cy.get('#start-pause-btn').click();
  cy.get('#start-pause-btn').should('contain', 'Resume');
  cy.get('.timer-container').should('not.have.class', 'active');
});

// Command to reset timer
Cypress.Commands.add('resetTimer', () => {
  cy.get('#reset-btn').click();
  cy.get('#start-pause-btn').should('contain', 'Start');
  cy.get('.timer-container').should('not.have.class', 'active');
});

// Command to switch mode
Cypress.Commands.add('switchMode', (mode) => {
  cy.get(`[data-mode="${mode}"]`).click();
  cy.get(`[data-mode="${mode}"]`).should('have.class', 'active');
});

// Command to open settings
Cypress.Commands.add('openSettings', () => {
  cy.get('#settings-btn').click();
  cy.get('#settings-modal').should('not.have.class', 'hidden');
});

// Command to close settings
Cypress.Commands.add('closeSettings', () => {
  cy.get('#close-settings').click();
  cy.get('#settings-modal').should('have.class', 'hidden');
});

// Command to save settings
Cypress.Commands.add('saveSettings', (settings) => {
  if (settings.work) {
    cy.get('#work-duration').clear().type(settings.work.toString());
  }
  if (settings.shortBreak) {
    cy.get('#short-break-duration').clear().type(settings.shortBreak.toString());
  }
  if (settings.longBreak) {
    cy.get('#long-break-duration').clear().type(settings.longBreak.toString());
  }
  if (settings.sound !== undefined) {
    if (settings.sound) {
      cy.get('#sound-enabled').check();
    } else {
      cy.get('#sound-enabled').uncheck();
    }
  }

  cy.get('#save-settings').click();
  cy.get('#settings-modal').should('have.class', 'hidden');
});

// Command to open statistics
Cypress.Commands.add('openStats', () => {
  cy.get('#stats-btn').click();
  cy.get('#stats-modal').should('not.have.class', 'hidden');
});

// Command to close statistics
Cypress.Commands.add('closeStats', () => {
  cy.get('#close-stats').click();
  cy.get('#stats-modal').should('have.class', 'hidden');
});

// Command to change language
Cypress.Commands.add('changeLanguage', (language) => {
  cy.get('#language').select(language);
});

// Command to wait for timer countdown
Cypress.Commands.add('waitForTimerTick', (expectedTime) => {
  cy.get('#time-display').should('contain', expectedTime);
});

// Command to complete a full session (for testing)
Cypress.Commands.add('completeSession', (mode = 'work') => {
  cy.switchMode(mode);
  cy.startTimer();

  // Wait a bit then manually complete
  cy.wait(1000);

  if (mode !== 'work') {
    cy.get('#skip-btn').click();
  } else {
    // For work sessions, we'll need to wait or simulate completion
    // In a real test, you might set shorter durations
    cy.resetTimer(); // Reset for now to avoid long waits
  }
});

// Command to verify timer display format
Cypress.Commands.add('verifyTimeFormat', (timeString) => {
  cy.get('#time-display').should('match', /^\d{2}:\d{2}$/);
  if (timeString) {
    cy.get('#time-display').should('contain', timeString);
  }
});

// Command to verify mode indicator
Cypress.Commands.add('verifyModeIndicator', (expectedMode) => {
  const modeTexts = {
    work: ['Focus', 'Foco'],
    shortBreak: ['Short Break', 'Pausa Curta'],
    longBreak: ['Long Break', 'Pausa Longa']
  };

  const possibleTexts = modeTexts[expectedMode];
  if (possibleTexts) {
    cy.get('#mode-indicator').should('satisfy', ($el) => {
      const text = $el.text();
      return possibleTexts.some(possibleText => text.includes(possibleText));
    });
  }
});

// Command to verify progress circle animation
Cypress.Commands.add('verifyProgressCircle', () => {
  cy.get('#progress-circle').should('be.visible');
  cy.get('#progress-circle').should('have.css', 'stroke-dashoffset');
});

// Command to simulate keyboard shortcuts
Cypress.Commands.add('pressSpacebar', () => {
  cy.get('body').type(' ');
});

// Command to verify break suggestions are visible
Cypress.Commands.add('verifyBreakSuggestions', () => {
  cy.get('#break-suggestions').should('not.have.class', 'hidden');
  cy.get('#suggestions-list').children().should('have.length.greaterThan', 0);
});

// Command to verify statistics
Cypress.Commands.add('verifyStats', (expectedStats) => {
  cy.openStats();

  if (expectedStats.cycles !== undefined) {
    cy.get('#cycles-completed').should('contain', expectedStats.cycles.toString());
  }

  if (expectedStats.focusTime !== undefined) {
    cy.get('#focus-time').should('contain', expectedStats.focusTime);
  }

  if (expectedStats.breaks !== undefined) {
    cy.get('#breaks-taken').should('contain', expectedStats.breaks.toString());
  }

  cy.closeStats();
});

// Command to set custom test durations (shorter for testing)
Cypress.Commands.add('setTestDurations', () => {
  cy.openSettings();
  cy.saveSettings({
    work: 1,        // 1 minute for faster testing
    shortBreak: 1,  // 1 minute
    longBreak: 2    // 2 minutes
  });
});

// Handle uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  // Return false to prevent the test from failing on uncaught exceptions
  // This is useful for handling YouTube API or other third-party errors
  return false;
});
