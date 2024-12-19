AFRAME.registerComponent('cannonball-manager', {
  schema: {
    position: { type: 'vec3', default: { x: 0, y: 0, z: 0 } },
    direction: { type: 'vec3', default: { x: 0, y: 0, z: -1 } },
    speed: { type: 'number', default: 3 }
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

    const initialVelocity = {
      x: direction.x * this.data.speed,
      y: direction.y * this.data.speed,
      z: direction.z * this.data.speed
    };

    cannonball.setAttribute('velocity', `${initialVelocity.x} ${initialVelocity.y} ${initialVelocity.z}`);
    console.log('Initial velocity applied:', initialVelocity);

    this.scene.appendChild(cannonball);
    console.log('Cannonball added to scene at:', cannonball.getAttribute('position'));

    // Flag to control collision detection
    let canCollide = false;

    // Delay collision detection for 0.1 seconds
    setTimeout(() => {
      canCollide = true;
    }, 100); // 0.1 seconds

    // Detect collision only if allowed by the flag
    cannonball.addEventListener('collide', function (event) {
      if (canCollide) {
        console.log('Cannonball collided with:', event.detail.body.el);
        
        if (event.detail.body.el.classList.contains('marker')) {
          console.log('Cannonball collided with a marker:', event.detail.body.el);
          if (cannonball.parentNode) {
            cannonball.parentNode.removeChild(cannonball);
          }
        }
      }
    });

    setTimeout(() => {
      if (cannonball.parentNode) {
        cannonball.parentNode.removeChild(cannonball);
      }
    }, 5000);
  }
});
