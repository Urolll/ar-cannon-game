AFRAME.registerComponent('game-over-manager', {
  schema: {
    side: { type: 'string', default: 'blue' }
  },
  
  init() {
    this.textRotation = this.data.side === 'blue' ? '-90 0 0' : '-90 180 0';
    this.createGameOverText();
    this.gameStateManager = this.el.sceneEl.components['game-state-manager'];
    
    // Listen for game over events
    this.el.sceneEl.addEventListener('cannon-game-over', (evt) => {
      // If the other player won first, make sure we show a loss
      if (evt.detail.side !== this.data.side && evt.detail.isWinner) {
        this.showGameOver(false, true);
      }
    });
  },
  
  createGameOverText() {
    this.lostText = document.createElement('a-text');
    this.lostText.setAttribute('value', 'YOU LOST');
    this.lostText.setAttribute('color', '#FF0000');
    this.lostText.setAttribute('scale', '2 2 2');
    this.lostText.setAttribute('align', 'center');
    this.lostText.setAttribute('rotation', this.textRotation);
    this.lostText.setAttribute('position', '0 0.5 0');
    this.lostText.setAttribute('visible', false);
    this.el.appendChild(this.lostText);
    
    this.wonText = document.createElement('a-text');
    this.wonText.setAttribute('value', 'YOU WON!');
    this.wonText.setAttribute('color', '#00FF00');
    this.wonText.setAttribute('scale', '2 2 2');
    this.wonText.setAttribute('align', 'center');
    this.wonText.setAttribute('rotation', this.textRotation);
    this.wonText.setAttribute('position', '0 0.5 0');
    this.wonText.setAttribute('visible', false);
    this.el.appendChild(this.wonText);
  },
  
  showGameOver(isWinner, force = false) {
    // Check if game is already over unless forced
    if (!force && this.gameStateManager && this.gameStateManager.isOver()) {
      return;
    }
    
    // Hide both texts first
    this.wonText.setAttribute('visible', false);
    this.lostText.setAttribute('visible', false);
    
    // Show appropriate text
    if (isWinner) {
      this.wonText.setAttribute('visible', true);
    } else {
      this.lostText.setAttribute('visible', true);
    }
    
    // Shutdown countdown timers
    const countdownManager = document.querySelector('[countdown-manager]');
    if (countdownManager && countdownManager.components['countdown-manager']) {
      countdownManager.components['countdown-manager'].shutdownCountdowns();
    }
    
    // Emit global game over event
    this.el.sceneEl.emit('cannon-game-over', {
      side: this.data.side,
      isWinner
    });
  }
});