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
      if (!canCollide) return;
      const body = event.detail.body;
        
        if (body) {
          const targetEl = body.el;

          if (targetEl && targetEl.id && targetEl.id.includes('Cannon')) {
            console.log('Cannon collision detected');

            // Get the parent of the collided object
            const parentEl = targetEl.parentElement;

            if (parentEl) {
              // Find the a-plane within the parent element
              const planeEl = parentEl.querySelector('a-plane[id*="hit"]');
              
              if (planeEl) {
                // Set visibility of the plane to true for 1 second
                planeEl.setAttribute('visible', true);

                // Set a timeout to hide the plane again after 1 second
                setTimeout(() => {
                  planeEl.setAttribute('visible', false);
                }, 1000); // 1 second
              } else {
                console.log('No a-plane found with id containing "hit" in parent');
              }
            } else {
              console.error('Parent element not found');
            }
          }
        } else {
          console.error('No body in collision event');
        }
      });
    },

  setupCleanupTimeout(cannonball) {
    setTimeout(() => {
      this.removeCannonball(cannonball);
    }, 3000);
  },

  removeCannonball(cannonball) {
    if (cannonball.parentNode) {
      cannonball.removeAttribute('dynamic-body');
      cannonball.parentNode.removeChild(cannonball);
      console.log('Cannonball removed');
    }
  }
});