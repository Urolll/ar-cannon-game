AFRAME.registerComponent('countdown-manager', {
  init: function () {
    this.isGreenTurn = true; // Start with green
    this.countdown = 5;
    this.isRunning = false;
    this.isShutdown = false; // Add permanent shutdown flag
    this.greenText = document.querySelector('#greenTimer');
    this.blueText = document.querySelector('#blueTimer');
    this.currentTimer = null;
    this.el.sceneEl.addEventListener('markerFound', () => {
      if (!this.isRunning && !this.isShutdown) { // Check shutdown state
        this.startCountdown();
      }
    });
  },
  
  shutdownCountdowns: function() {
    this.isRunning = false;
    this.isShutdown = true; // Set permanent shutdown
    if (this.currentTimer) {
      clearInterval(this.currentTimer);
    }
    
    // Remove timer elements from the scene
    if (this.greenText && this.greenText.parentNode) {
      this.greenText.parentNode.removeChild(this.greenText);
    }
    if (this.blueText && this.blueText.parentNode) {
      this.blueText.parentNode.removeChild(this.blueText);
    }
    
    // Clear references
    this.greenText = null;
    this.blueText = null;
  },
  
  startCountdown: function () {
    if (this.isShutdown) return; // Don't start if permanently shut down
    
    this.isRunning = true;
    this.countdown = 1;
    this.currentTimer = setInterval(() => {
      if (this.isShutdown) { // Check for shutdown during interval
        clearInterval(this.currentTimer);
        return;
      }
      
      // Update the timer display based on whose turn it is
      if (this.isGreenTurn && this.greenText) {
        this.greenText.setAttribute('value', this.countdown.toString());
        if (this.blueText) {
          this.blueText.setAttribute('value', '');
        }
      } else if (!this.isGreenTurn && this.blueText) {
        this.blueText.setAttribute('value', this.countdown.toString());
        if (this.greenText) {
          this.greenText.setAttribute('value', '');
        }
      }
      this.countdown--;
      if (this.countdown < 0) {
        clearInterval(this.currentTimer);
        // Get the marker based on the current turn (Green or Blue)
        const marker = this.isGreenTurn
          ? document.querySelector('#greenMarker')
          : document.querySelector('#blueMarker');
        // Launch the cannonball with the correct marker and turn state
        const cannonballManager = document.querySelector('#cannonballManager');
        cannonballManager.components['cannonball-manager'].launchCannonball({
          marker: marker,
          isGreenTurn: this.isGreenTurn,
          speed: 10
        });
        // Switch turns
        this.isGreenTurn = !this.isGreenTurn;
        this.countdown = 1;
        if (this.isRunning && !this.isShutdown) { // Only restart if not shut down
          setTimeout(() => {
            this.startCountdown();
          }, 500);
        }
      }
    }, 1000);
  }
});