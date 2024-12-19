AFRAME.registerComponent('cannonball-manager', {
  schema: {
    position: { type: 'vec3', default: { x: 0, y: 0, z: 0 } },
    direction: { type: 'vec3', default: { x: 0, y: 0, z: -1 } },
    speed: { type: 'number', default: 2.5 }
  },

  init: function () {
    this.scene = this.el.sceneEl;
  },

  launchCannonball: function (data) {
    const marker = data.marker;
    const isGreenTurn = data.isGreenTurn;

    const direction = isGreenTurn
      ? { x: 1, y: 0, z: 0 }
      : { x: -1, y: 0, z: 0 };

    const cannonball = document.createElement('a-sphere');
    cannonball.setAttribute('radius', 0.1);
    cannonball.setAttribute('color', '#505050');

    let cannonHolePosition = {
      x: marker.object3D.position.x + (isGreenTurn ? 0.5 : -0.5),
      y: marker.object3D.position.y,
      z: marker.object3D.position.z + 1
    };

    cannonball.setAttribute('position', `${cannonHolePosition.x} ${cannonHolePosition.y} ${cannonHolePosition.z}`);
    console.log('Cannonball initial position set to:', cannonball.getAttribute('position'));

    cannonball.setAttribute('dynamic-body', { mass: 1 });

    // Use a vec3 for velocity instead of a string
    const initialVelocity = new THREE.Vector3(
      direction.x * this.data.speed,
      direction.y * this.data.speed,
      direction.z * this.data.speed
    );
    cannonball.setAttribute('velocity', initialVelocity);

    console.log('Initial velocity applied:', initialVelocity);

    this.scene.appendChild(cannonball);
    console.log('Cannonball added to scene at:', cannonball.getAttribute('position'));

    // Flag to control collision detection
    let canCollide = false;

    // Delay collision detection for 0.1 seconds
    setTimeout(() => {
      canCollide = true;
    }, 100); // 0.1 seconds

    // Add event listener for collisions
    cannonball.addEventListener('collide', (event) => {
      if (canCollide) {
        const body = event.detail.body;
        const targetEl = body ? body.el : null;

        // Check if the body and target element are valid
        if (targetEl) {
          console.log('Cannonball collided with:', targetEl);

          // Ensure the target has the right id to handle the collision
          if (targetEl.id && targetEl.id.includes('HB')) {
            console.log('Cannonball hit a HitBox!');

            // Remove the cannonball from the scene safely
            if (cannonball.parentNode) {
              // Remove the collision listener before removing the cannonball
              cannonball.removeEventListener('collide', arguments.callee);

              cannonball.parentNode.removeChild(cannonball);
              console.log('Cannonball removed after collision.');
            }
          }
        } else {
          console.warn('No valid body or element found in the collision event.');
        }
      }
    });

    // Remove the cannonball from the scene after 5 seconds, regardless of collision
    setTimeout(() => {
      if (cannonball.parentNode) {
        // Ensure collision listener is removed before removal
        cannonball.removeEventListener('collide', arguments.callee);

        cannonball.parentNode.removeChild(cannonball);
        console.log('Cannonball removed after timeout.');
      }
    }, 5000);
  }
});
