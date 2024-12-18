AFRAME.registerComponent('cannonball-launcher', {
  schema: {
    position: { type: 'vec3', default: { x: 0, y: 0, z: 0 } },
    direction: { type: 'vec3', default: { x: 0, y: 0, z: -1 } },
    speed: { type: 'number', default: 10 }
  },

  launchCannonball: function () {
    const scene = this.el.sceneEl;
    const cannonballTemplate = document.querySelector('#cannonball');

    if (!cannonballTemplate) {
      console.warn('Cannonball template not found!');
      return;
    }

    // Clone the cannonball
    const cannonball = cannonballTemplate.cloneNode();
    cannonball.setAttribute('visible', true);
    cannonball.setAttribute('position', this.data.position);

    // Add to the scene
    scene.appendChild(cannonball);

    // Set physics velocity
    const velocity = new CANNON.Vec3(
      this.data.direction.x * this.data.speed,
      this.data.direction.y * this.data.speed,
      this.data.direction.z * this.data.speed
    );
    cannonball.body.velocity.set(velocity.x, velocity.y, velocity.z);

    // Cleanup
    setTimeout(() => {
      if (cannonball.parentNode) {
        cannonball.parentNode.removeChild(cannonball);
      }
    }, 5000);
  }
});
