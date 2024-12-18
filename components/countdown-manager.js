AFRAME.registerComponent('countdown-manager', {
  init: function () {
    this.isGreenTurn = true; // Start with green
    this.countdown = 1;
    this.isRunning = false;

    this.greenText = document.querySelector('#greenTimer');
    this.blueText = document.querySelector('#blueTimer');

    this.el.sceneEl.addEventListener('markerFound', () => {
      if (!this.isRunning) {
        this.startCountdown();
      }
    });
  },

  startCountdown: function () {
    this.isRunning = true;
    this.countdown = 1;

    const timer = setInterval(() => {
      // Update the timer display based on whose turn it is
      if (this.isGreenTurn) {
        this.greenText.setAttribute('value', this.countdown.toString());
        this.blueText.setAttribute('value', '');
      } else {
        this.blueText.setAttribute('value', this.countdown.toString());
        this.greenText.setAttribute('value', '');
      }

      this.countdown--;

      if (this.countdown < 0) {
        clearInterval(timer);

        // Get the marker based on the current turn (Green or Blue)
        const marker = this.isGreenTurn
          ? document.querySelector('#greenMarker')
          : document.querySelector('#blueMarker');

        // Launch the cannonball with the correct marker and turn state
        const cannonballManager = document.querySelector('#cannonballManager');
        cannonballManager.components['cannonball-manager'].launchCannonball({
          marker: marker,  // Pass the correct marker
          isGreenTurn: this.isGreenTurn,  // Pass the current turn
          speed: 10  // Specify the cannonball speed
        });

        // Switch turns
        this.isGreenTurn = !this.isGreenTurn;
        this.countdown = 1;

        setTimeout(() => {
          this.startCountdown();  // Restart the countdown after a brief delay
        }, 500);
      }
    }, 1000);
  }
});
