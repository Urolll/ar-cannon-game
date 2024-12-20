AFRAME.registerComponent('cannonball-collider', {
  init: function () {
    this.el.addEventListener('collide', (event) => {
      const body = event.detail.body;

      if (body) {
        const targetEl = body.el;

        if (targetEl && targetEl.id && targetEl.id.includes('Cannon')) {
          console.log('Cannon collision detected');

          const parentEl = targetEl.parentElement;

          if (parentEl) {
            // Find the health container and reduce hearts
            const healthContainer = parentEl.querySelector('#blueHealth');
            if (healthContainer) {
              const hearts = Array.from(healthContainer.querySelectorAll('a-image[id^="heart"]'));

              // Hide the first visible heart
              for (let heart of hearts) {
                if (heart.getAttribute('visible') !== 'false') {
                  heart.setAttribute('visible', false);
                  console.log(`Heart ${heart.id} removed`);
                  break;
                }
              }
            } else {
              console.error('Health container not found');
            }
          }
        }
      }
    });
  }
});