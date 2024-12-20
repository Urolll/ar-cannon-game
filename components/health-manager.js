AFRAME.registerComponent('health-manager', {
  schema: {
    maxHealth: { type: 'number', default: 3 },
    side: { type: 'string', default: 'blue' },
    hitCooldown: { type: 'number', default: 1000 }
  },
  
  init() {
    this.currentHealth = this.data.maxHealth;
    this.healthContainer = this.el.querySelector(`#${this.data.side}Health`);
    this.canTakeDamage = true;
    this.gameStateManager = this.el.sceneEl.components['game-state-manager'];
    this.gameOverManager = this.el.components['game-over-manager'];
    
    if (!this.healthContainer) {
      console.error(`Health container for ${this.data.side} side not found`);
    }
  },
  
  decreaseHealth() {
    // Check if game is already over
    if (this.gameStateManager && this.gameStateManager.isOver()) {
      return false;
    }
    
    if (!this.canTakeDamage || this.currentHealth <= 0) {
      return false;
    }
    
    if (this.healthContainer && this.currentHealth > 0) {
      const hearts = Array.from(this.healthContainer.querySelectorAll('a-image[src*="heart"]'))
        .reverse();
      
      if (hearts.length > 0 && this.currentHealth > 0) {
        const heartToHide = hearts[this.data.maxHealth - this.currentHealth];
        if (heartToHide) {
          heartToHide.setAttribute('visible', false);
          this.currentHealth--;
          
          // Start cooldown
          this.canTakeDamage = false;
          setTimeout(() => {
            this.canTakeDamage = true;
          }, this.data.hitCooldown);
          
          // Check for game over
          if (this.currentHealth <= 0) {
            // Hide health container
            this.healthContainer.setAttribute('visible', false);
            
            // Check if other player has already won
            const otherSide = this.data.side === 'blue' ? 'green' : 'blue';
            const otherCannon = document.querySelector(`#${otherSide}CannonContainer`);
            
            if (otherCannon) {
              const otherHealth = otherCannon.components['health-manager'];
              // Only win if other player still has health
              if (otherHealth && otherHealth.getHealth() > 0) {
                const otherGameOverManager = otherCannon.components['game-over-manager'];
                if (otherGameOverManager) {
                  otherGameOverManager.showGameOver(true);
                }
                
                // Show game over for this player
                if (this.gameOverManager) {
                  this.gameOverManager.showGameOver(false);
                }
              }
            }
          }
          
          return true;
        }
      }
    }
    return false;
  },
  
  getHealth() {
    return this.currentHealth;
  }
});