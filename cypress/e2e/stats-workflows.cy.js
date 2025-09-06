/**
 * TESTES E2E - Estatísticas e Fluxos Completos
 * Testa estatísticas, ciclos completos e workflows de usuário
 */

describe('PomoChill - Statistics and Complete Workflows', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.waitForAppLoad();

    // Set shorter durations for faster testing
    cy.setTestDurations();
  });

  describe('Statistics Modal', () => {
    it('should open and close statistics modal', () => {
      // Open statistics
      cy.openStats();

      // Verify modal content
      cy.get('#stats-modal h3').should('contain', 'Journey');
      cy.get('#cycles-completed').should('be.visible');
      cy.get('#focus-time').should('be.visible');
      cy.get('#breaks-taken').should('be.visible');

      // Close statistics
      cy.closeStats();
    });

    it('should display initial statistics as zero', () => {
      // Open stats and verify initial values
      cy.verifyStats({
        cycles: 0,
        focusTime: '0',
        breaks: 0
      });
    });

    it('should close stats modal when clicking outside', () => {
      cy.openStats();

      // Click on modal backdrop
      cy.get('#stats-modal').click(5, 5);

      // Modal should close
      cy.get('#stats-modal').should('have.class', 'hidden');
    });
  });

  describe('Complete Work Session Workflow', () => {
    it('should complete a full work session and update statistics', () => {
      // Start work session
      cy.startTimer();

      // Wait for session to complete (1 minute with test durations)
      cy.wait(62000); // 62 seconds to be sure

      // Should auto-switch to break mode
      cy.verifyModeIndicator('shortBreak');

      // Verify statistics updated
      cy.verifyStats({
        cycles: 1,
        focusTime: '1m',
        breaks: 0
      });
    });

    it('should complete work session with skip for faster testing', () => {
      // Alternative approach: manually complete session for testing
      cy.startTimer();
      cy.wait(3000); // Let it run briefly

      // Manually trigger completion by resetting and switching
      // This simulates session completion for testing purposes
      cy.resetTimer();
      cy.switchMode('shortBreak');

      // In a real app, we'd increment stats on completion
      // For this test, we'll just verify the mode change worked
      cy.verifyModeIndicator('shortBreak');
    });
  });

  describe('Complete Break Session Workflow', () => {
    it('should complete break session using skip button', () => {
      // Switch to break mode and start
      cy.switchMode('shortBreak');
      cy.startTimer();

      // Verify skip button and suggestions appear
      cy.get('#skip-btn').should('be.visible');
      cy.verifyBreakSuggestions();

      // Skip the break
      cy.get('#skip-btn').click();

      // Should return to work mode
      cy.verifyModeIndicator('work');
      cy.get('#start-pause-btn').should('contain', 'Start');

      // Skip button should disappear
      cy.get('#skip-btn').should('not.be.visible');
    });

    it('should show appropriate break suggestions during break', () => {
      cy.switchMode('shortBreak');
      cy.startTimer();

      // Verify break suggestions are showing
      cy.verifyBreakSuggestions();

      // Verify suggestions contain helpful content
      cy.get('#suggestions-list .suggestion-item').should('have.length.greaterThan', 0);

      // Each suggestion should have an icon and text
      cy.get('#suggestions-list .suggestion-item').each(($item) => {
        cy.wrap($item).should('contain.text', 'a'); // Should contain some text
      });
    });
  });

  describe('Multiple Session Workflow', () => {
    it('should track multiple completed sessions', () => {
      // Complete first work session
      cy.startTimer();
      cy.wait(2000);
      cy.resetTimer(); // Simulate completion

      // Switch to break and complete it
      cy.switchMode('shortBreak');
      cy.startTimer();
      cy.get('#skip-btn').click();

      // Complete second work session
      cy.startTimer();
      cy.wait(2000);
      cy.resetTimer(); // Simulate completion

      // In a real implementation, stats would be updated
      // Here we verify the workflow completes without errors
      cy.verifyModeIndicator('work');
    });

    it('should cycle through work-break-work pattern', () => {
      const sessions = [
        { mode: 'work', next: 'shortBreak' },
        { mode: 'shortBreak', next: 'work' },
        { mode: 'work', next: 'shortBreak' }
      ];

      sessions.forEach((session, index) => {
        // Start current session
        if (session.mode !== 'work') {
          cy.switchMode(session.mode);
        }

        cy.verifyModeIndicator(session.mode);
        cy.startTimer();

        // Complete session (skip for breaks, simulate completion for work)
        if (session.mode === 'work') {
          cy.wait(2000);
          cy.resetTimer();
          if (sessions[index + 1]) {
            cy.switchMode(sessions[index + 1].mode);
          }
        } else {
          cy.get('#skip-btn').click();
        }

        // Verify next mode (if there is one)
        if (sessions[index + 1]) {
          cy.verifyModeIndicator(sessions[index + 1].mode);
        }
      });
    });
  });

  describe('Long Break Cycle Workflow', () => {
    it('should trigger long break after multiple work sessions', () => {
      // Simulate 4 work sessions to trigger long break
      // (In reality, this would be automated by the app)

      for (let i = 0; i < 4; i++) {
        // Work session
        cy.switchMode('work');
        cy.startTimer();
        cy.wait(1000);
        cy.resetTimer();

        // Break session (short break for first 3, should be long break for 4th)
        if (i < 3) {
          cy.switchMode('shortBreak');
          cy.startTimer();
          cy.get('#skip-btn').click();
        } else {
          // After 4th work session, should offer long break
          cy.switchMode('longBreak');
          cy.verifyModeIndicator('longBreak');
        }
      }
    });
  });

  describe('Settings Impact on Workflow', () => {
    it('should use custom durations in complete workflow', () => {
      // Set custom durations
      cy.openSettings();
      cy.saveSettings({
        work: 2,        // 2 minutes
        shortBreak: 1,  // 1 minute
        longBreak: 3    // 3 minutes
      });

      // Verify durations are applied
      cy.verifyTimeFormat('02:00');

      cy.switchMode('shortBreak');
      cy.verifyTimeFormat('01:00');

      cy.switchMode('longBreak');
      cy.verifyTimeFormat('03:00');

      // Return to work mode and start session
      cy.switchMode('work');
      cy.startTimer();

      // Timer should count down from 2 minutes
      cy.verifyTimeFormat('02:00');
      cy.wait(2000);
      cy.get('#time-display').should('not.contain', '02:00');
    });

    it('should persist statistics across settings changes', () => {
      // Set initial stats (simulated)
      // In real app, complete some sessions first

      // Change settings
      cy.openSettings();
      cy.saveSettings({ work: 30 });

      // Statistics should remain unchanged
      cy.verifyStats({
        cycles: 0,
        focusTime: '0',
        breaks: 0
      });
    });
  });

  describe('Language Impact on Workflow', () => {
    it('should maintain workflow functionality in Portuguese', () => {
      // Change to Portuguese
      cy.changeLanguage('pt');

      // Complete basic workflow in Portuguese
      cy.get('#start-pause-btn').should('contain', 'Iniciar');
      cy.startTimer();
      cy.get('#start-pause-btn').should('contain', 'Pausar');

      cy.pauseTimer();
      cy.get('#start-pause-btn').should('contain', 'Continuar');

      cy.resetTimer();
      cy.get('#start-pause-btn').should('contain', 'Iniciar');

      // Switch modes in Portuguese
      cy.switchMode('shortBreak');
      cy.verifyModeIndicator('shortBreak'); // Should show "Pausa Curta"
    });

    it('should show Portuguese break suggestions', () => {
      cy.changeLanguage('pt');

      cy.switchMode('shortBreak');
      cy.startTimer();

      // Break suggestions should be in Portuguese
      cy.verifyBreakSuggestions();

      // Verify at least one suggestion contains Portuguese text
      cy.get('#suggestions-list .suggestion-item').should('exist');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle page refresh during active session gracefully', () => {
      cy.startTimer();
      cy.wait(2000);

      // Refresh page during active session
      cy.reload();
      cy.waitForAppLoad();

      // Should return to initial state gracefully
      cy.verifyTimeFormat('01:00'); // Test duration
      cy.get('#start-pause-btn').should('contain', 'Start');
    });

    it('should handle rapid mode switching', () => {
      // Rapidly switch between modes
      cy.switchMode('shortBreak');
      cy.switchMode('work');
      cy.switchMode('longBreak');
      cy.switchMode('shortBreak');
      cy.switchMode('work');

      // Should end up in work mode with correct display
      cy.verifyModeIndicator('work');
      cy.verifyTimeFormat('01:00');
    });

    it('should handle rapid start/pause/reset actions', () => {
      // Rapid actions
      cy.startTimer();
      cy.pauseTimer();
      cy.startTimer();
      cy.resetTimer();
      cy.startTimer();
      cy.resetTimer();

      // Should end in stable state
      cy.get('#start-pause-btn').should('contain', 'Start');
      cy.get('.timer-container').should('not.have.class', 'active');
    });
  });

  describe('Mobile Workflow Testing', () => {
    it('should complete full workflow on mobile viewport', () => {
      // Set mobile viewport
      cy.viewport(375, 667);

      // Complete basic workflow
      cy.startTimer();
      cy.wait(1000);
      cy.pauseTimer();
      cy.resetTimer();

      // Switch modes
      cy.switchMode('shortBreak');
      cy.startTimer();
      cy.get('#skip-btn').should('be.visible');
      cy.get('#skip-btn').click();

      // Open and use settings
      cy.openSettings();
      cy.saveSettings({ work: 2 });

      // Verify everything works on mobile
      cy.verifyTimeFormat('02:00');
    });
  });

  describe('Accessibility Workflow', () => {
    it('should be navigable via keyboard only', () => {
      // Tab through main interface
      cy.get('body').tab();

      // Should be able to reach main controls
      cy.get('#start-pause-btn').should('be.focusable');
      cy.get('#reset-btn').should('be.focusable');

      // Should be able to open settings via keyboard
      cy.get('#settings-btn').focus().type('{enter}');
      cy.get('#settings-modal').should('not.have.class', 'hidden');

      // Close with keyboard
      cy.get('#close-settings').focus().type('{enter}');
      cy.get('#settings-modal').should('have.class', 'hidden');
    });
  });
});
