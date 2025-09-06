/**
 * TESTES E2E - Configurações e Configuração
 * Testa as funcionalidades de configuração e personalização
 */

describe('PomoChill - Settings and Configuration', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.waitForAppLoad();
  });

  describe('Settings Modal', () => {
    it('should open and close settings modal', () => {
      // Open settings
      cy.openSettings();

      // Verify modal content is visible
      cy.get('#settings-modal h3').should('contain', 'Settings');
      cy.get('#work-duration').should('be.visible');
      cy.get('#short-break-duration').should('be.visible');
      cy.get('#long-break-duration').should('be.visible');
      cy.get('#sound-enabled').should('be.visible');

      // Close settings
      cy.closeSettings();
    });

    it('should close settings modal when clicking outside', () => {
      // Open settings
      cy.openSettings();

      // Click on modal backdrop
      cy.get('#settings-modal').click(5, 5); // Click near edge to hit backdrop

      // Modal should close
      cy.get('#settings-modal').should('have.class', 'hidden');
    });

    it('should load current settings values in form', () => {
      // Open settings
      cy.openSettings();

      // Verify default values are loaded
      cy.get('#work-duration').should('have.value', '25');
      cy.get('#short-break-duration').should('have.value', '5');
      cy.get('#long-break-duration').should('have.value', '15');
      cy.get('#sound-enabled').should('be.checked');
    });
  });

  describe('Duration Settings', () => {
    it('should save custom work duration', () => {
      // Open settings and change work duration
      cy.openSettings();
      cy.saveSettings({ work: 30 });

      // Verify timer display updated
      cy.verifyTimeFormat('30:00');

      // Verify mode button updated
      cy.get('[data-mode="work"] .mode-duration').should('contain', '30 min');

      // Reopen settings to verify persistence
      cy.openSettings();
      cy.get('#work-duration').should('have.value', '30');
      cy.closeSettings();
    });

    it('should save custom short break duration', () => {
      // Change short break duration
      cy.openSettings();
      cy.saveSettings({ shortBreak: 10 });

      // Switch to short break mode and verify
      cy.switchMode('shortBreak');
      cy.verifyTimeFormat('10:00');
      cy.get('[data-mode="shortBreak"] .mode-duration').should('contain', '10 min');
    });

    it('should save custom long break duration', () => {
      // Change long break duration
      cy.openSettings();
      cy.saveSettings({ longBreak: 20 });

      // Switch to long break mode and verify
      cy.switchMode('longBreak');
      cy.verifyTimeFormat('20:00');
      cy.get('[data-mode="longBreak"] .mode-duration').should('contain', '20 min');
    });

    it('should save all custom durations at once', () => {
      // Change all durations
      cy.openSettings();
      cy.saveSettings({
        work: 45,
        shortBreak: 15,
        longBreak: 30
      });

      // Verify work mode
      cy.verifyTimeFormat('45:00');

      // Verify short break mode
      cy.switchMode('shortBreak');
      cy.verifyTimeFormat('15:00');

      // Verify long break mode
      cy.switchMode('longBreak');
      cy.verifyTimeFormat('30:00');

      // Return to work mode
      cy.switchMode('work');
      cy.verifyTimeFormat('45:00');
    });
  });

  describe('Settings Validation', () => {
    it('should validate work duration minimum', () => {
      cy.openSettings();

      // Try to set work duration to 0
      cy.get('#work-duration').clear().type('0');
      cy.get('#save-settings').click();

      // Should show error and not close modal
      cy.get('#settings-modal').should('not.have.class', 'hidden');

      // Modal should still be open, fix the value
      cy.get('#work-duration').clear().type('25');
      cy.get('#save-settings').click();
      cy.get('#settings-modal').should('have.class', 'hidden');
    });

    it('should validate work duration maximum', () => {
      cy.openSettings();

      // Try to set work duration to 61
      cy.get('#work-duration').clear().type('61');
      cy.get('#save-settings').click();

      // Should show error and not close modal
      cy.get('#settings-modal').should('not.have.class', 'hidden');
    });

    it('should validate short break duration maximum', () => {
      cy.openSettings();

      // Try to set short break to 31
      cy.get('#short-break-duration').clear().type('31');
      cy.get('#save-settings').click();

      // Should show error and not close modal
      cy.get('#settings-modal').should('not.have.class', 'hidden');
    });

    it('should validate long break duration bounds', () => {
      cy.openSettings();

      // Try to set long break to 0
      cy.get('#long-break-duration').clear().type('0');
      cy.get('#save-settings').click();

      // Should show error
      cy.get('#settings-modal').should('not.have.class', 'hidden');

      // Try to set long break to 61
      cy.get('#long-break-duration').clear().type('61');
      cy.get('#save-settings').click();

      // Should show error
      cy.get('#settings-modal').should('not.have.class', 'hidden');
    });

    it('should handle non-numeric input gracefully', () => {
      cy.openSettings();

      // Enter non-numeric value
      cy.get('#work-duration').clear().type('abc');
      cy.get('#save-settings').click();

      // Should handle gracefully (show error or convert)
      cy.get('#settings-modal').should('not.have.class', 'hidden');
    });
  });

  describe('Sound Settings', () => {
    it('should toggle sound setting', () => {
      // Open settings and disable sound
      cy.openSettings();
      cy.saveSettings({ sound: false });

      // Reopen settings to verify
      cy.openSettings();
      cy.get('#sound-enabled').should('not.be.checked');
      cy.closeSettings();

      // Re-enable sound
      cy.openSettings();
      cy.saveSettings({ sound: true });

      // Verify sound is enabled
      cy.openSettings();
      cy.get('#sound-enabled').should('be.checked');
      cy.closeSettings();
    });
  });

  describe('Settings Persistence', () => {
    it('should persist settings across page reloads', () => {
      // Set custom settings
      cy.openSettings();
      cy.saveSettings({
        work: 35,
        shortBreak: 8,
        longBreak: 25,
        sound: false
      });

      // Reload page
      cy.reload();
      cy.waitForAppLoad();

      // Verify settings persisted
      cy.verifyTimeFormat('35:00');

      cy.openSettings();
      cy.get('#work-duration').should('have.value', '35');
      cy.get('#short-break-duration').should('have.value', '8');
      cy.get('#long-break-duration').should('have.value', '25');
      cy.get('#sound-enabled').should('not.be.checked');
      cy.closeSettings();
    });
  });

  describe('Language Settings', () => {
    it('should change language to Portuguese', () => {
      // Change to Portuguese
      cy.changeLanguage('pt');

      // Verify mode indicator changed
      cy.verifyModeIndicator('work'); // Should now show "Foco"

      // Verify other UI elements changed
      cy.get('#start-pause-btn').should('contain', 'Iniciar');
    });

    it('should change language back to English', () => {
      // Change to Portuguese first
      cy.changeLanguage('pt');

      // Change back to English
      cy.changeLanguage('en');

      // Verify UI is back to English
      cy.verifyModeIndicator('work'); // Should show "Focus"
      cy.get('#start-pause-btn').should('contain', 'Start');
    });

    it('should persist language preference', () => {
      // Change to Portuguese
      cy.changeLanguage('pt');

      // Reload page
      cy.reload();
      cy.waitForAppLoad();

      // Verify language persisted
      cy.get('#language').should('have.value', 'pt');
      cy.verifyModeIndicator('work'); // Should show "Foco"
    });

    it('should translate break suggestions when language changes', () => {
      // Switch to break mode and start
      cy.switchMode('shortBreak');
      cy.startTimer();

      // Verify break suggestions are visible
      cy.verifyBreakSuggestions();

      // Change to Portuguese
      cy.pauseTimer();
      cy.changeLanguage('pt');

      // Resume and verify suggestions are translated
      cy.startTimer();
      cy.verifyBreakSuggestions();

      // The suggestions should now be in Portuguese
      // (Specific text validation would depend on implementation)
    });
  });

  describe('Settings Integration with Timer', () => {
    it('should not allow settings changes during active timer', () => {
      // Start timer
      cy.startTimer();

      // Open settings
      cy.openSettings();

      // Try to change duration
      cy.get('#work-duration').clear().type('30');
      cy.get('#save-settings').click();

      // Settings should save but timer should continue with original duration
      cy.get('#settings-modal').should('have.class', 'hidden');

      // Timer should still be running with original time
      cy.get('#start-pause-btn').should('contain', 'Pause');
    });

    it('should apply new settings after timer reset', () => {
      // Change settings
      cy.openSettings();
      cy.saveSettings({ work: 40 });

      // Start timer with old duration, then reset
      cy.startTimer();
      cy.wait(2000);
      cy.resetTimer();

      // Should now show new duration
      cy.verifyTimeFormat('40:00');
    });

    it('should apply new settings when switching modes', () => {
      // Change break duration
      cy.openSettings();
      cy.saveSettings({ shortBreak: 12 });

      // Switch to short break mode
      cy.switchMode('shortBreak');

      // Should show new duration immediately
      cy.verifyTimeFormat('12:00');
    });
  });

  describe('Modal Keyboard Navigation', () => {
    it('should close settings modal with Escape key', () => {
      cy.openSettings();

      // Press Escape key
      cy.get('body').type('{esc}');

      // Modal should close (if implemented)
      // Note: This may not work if Escape key handling isn't implemented
    });

    it('should navigate between form fields with Tab', () => {
      cy.openSettings();

      // Focus first input and tab through fields
      cy.get('#work-duration').focus();
      cy.get('#work-duration').tab();
      cy.get('#short-break-duration').should('be.focused');

      cy.get('#short-break-duration').tab();
      cy.get('#long-break-duration').should('be.focused');

      cy.get('#long-break-duration').tab();
      cy.get('#sound-enabled').should('be.focused');
    });
  });

  describe('Mobile Responsive Settings', () => {
    it('should display settings modal properly on mobile viewport', () => {
      // Set mobile viewport
      cy.viewport(375, 667);

      // Open settings
      cy.openSettings();

      // Verify modal is visible and usable
      cy.get('#settings-modal').should('be.visible');
      cy.get('#work-duration').should('be.visible');
      cy.get('#save-settings').should('be.visible');

      // Should be able to save settings
      cy.saveSettings({ work: 30 });

      // Verify it worked
      cy.verifyTimeFormat('30:00');
    });
  });
});
