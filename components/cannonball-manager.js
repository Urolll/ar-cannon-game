AFRAME.registerComponent('cannonball-manager', {
  schema: {
    position: { 
      type: 'vec3', 
      default: { x: 0, y: 0, z: 0 } 
    },
    direction: { 
      type: 'vec3', 
      default: { x: 0, y: 0, z: -1 } 
    },
    speed: { 
      type: 'number', 
      default: 2.5 
    }
  },

  init() {
    this.scene = this.el.sceneEl;
  },

  launchCannonball(data) {
    const { marker, isGreenTurn } = data;
    const direction = isGreenTurn ? { x: 1, y: 0, z: 0 } : { x: -1, y: 0, z: 0 };
    
    // Create and configure cannonball
    const cannonball = this.createCannonball(marker, isGreenTurn, direction);
    
    // Add collision detection with delayed activation
    this.setupCollisionDetection(cannonball);
    
    // Add cleanup timeout
    this.setupCleanupTimeout(cannonball);
  },

  createCannonball(marker, isGreenTurn, direction) {
    const cannonball = document.createElement('a-sphere');
    
    // Calculate spawn position
    const cannonHolePosition = {
      x: marker.object3D.position.x + (isGreenTurn ? 0.5 : -0.5),
      y: marker.object3D.position.y,
      z: marker.object3D.position.z + 1
    };

    // Set cannonball properties
    cannonball.setAttribute('radius', 0.1);
    cannonball.setAttribute('color', '#505050');
    cannonball.setAttribute('position', `${cannonHolePosition.x} ${cannonHolePosition.y} ${cannonHolePosition.z}`);
    cannonball.setAttribute('dynamic-body', { mass: 1, shape: 'sphere' });

    // Apply initial velocity
    const initialVelocity = new THREE.Vector3(
      direction.x * this.data.speed,
      direction.y * this.data.speed,
      direction.z * this.data.speed
    );
    cannonball.setAttribute('velocity', initialVelocity);

    // Add to scene
    this.scene.appendChild(cannonball);
    console.log('Cannonball spawned at:', cannonball.getAttribute('position'));
    
    return cannonball;
  },

  setupCollisionDetection(cannonball) {
    let canCollide = false;
    
    // Delay collision detection activation
    setTimeout(() => {
      canCollide = true;
    }, 100);

    cannonball.addEventListener('collide', (event) => {
      if (!event.detail.body) {
        console.error('Collision event body is undefined');
        return;
      }

      const targetEl = event.detail.body.el;
      if (!targetEl) return;

      // Check for collision with cannon
      if (targetEl.id && targetEl.id.includes('Cannon')) {
        console.log('Cannonball hit cannon:', targetEl.id);
        this.removeCannonball(cannonball);
      }
    });
  },

  setupCleanupTimeout(cannonball) {
    setTimeout(() => {
      this.removeCannonball(cannonball);
    }, 5000);
  },

  removeCannonball(cannonball) {
    if (cannonball.parentNode) {
      cannonball.removeAttribute('dynamic-body');
      cannonball.parentNode.removeChild(cannonball);
      console.log('Cannonball removed');
    }
  }
});