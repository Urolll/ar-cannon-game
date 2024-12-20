// Main cannonball manager component
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
    
    const cannonball = this.createCannonball(marker, isGreenTurn, direction);
    this.setupCollisionDetection(cannonball);
    this.setupCleanupTimeout(cannonball);
  },

  createCannonball(marker, isGreenTurn, direction) {
    const cannonball = document.createElement('a-sphere');
    
    const cannonHolePosition = {
      x: marker.object3D.position.x + (isGreenTurn ? 0.5 : -0.5),
      y: marker.object3D.position.y,
      z: marker.object3D.position.z + 1
    };

    cannonball.setAttribute('radius', 0.1);
    cannonball.setAttribute('color', '#505050');
    cannonball.setAttribute('position', `${cannonHolePosition.x} ${cannonHolePosition.y} ${cannonHolePosition.z}`);
    cannonball.setAttribute('dynamic-body', { mass: 1, shape: 'sphere' });

    const initialVelocity = new THREE.Vector3(
      direction.x * this.data.speed,
      direction.y * this.data.speed,
      direction.z * this.data.speed
    );
    cannonball.setAttribute('velocity', initialVelocity);
    
    // Add a property to track if this cannonball has already caused damage
    cannonball.hasDealtDamage = false;

    this.scene.appendChild(cannonball);
    console.log('Cannonball spawned at:', cannonball.getAttribute('position'));
    
    return cannonball;
  },

  setupCollisionDetection(cannonball) {
    let canCollide = false;
    
    setTimeout(() => {
      canCollide = true;
    }, 100);

    cannonball.addEventListener('collide', (event) => {
      if (!canCollide || cannonball.hasDealtDamage) return;
      
      const targetEl = event.detail.body?.el;
      if (!targetEl || !targetEl.id || !targetEl.id.includes('Cannon')) return;

      const parentEl = targetEl.parentElement;
      if (!parentEl) return;

      // Handle hit effect
      const hitEffectComponent = parentEl.components['hit-effect'];
      if (hitEffectComponent) {
        hitEffectComponent.showHitEffect();
      }

      // Handle health decrease
      const healthManager = parentEl.components['health-manager'];
      if (healthManager) {
        const healthDecreased = healthManager.decreaseHealth();
        if (healthDecreased) {
          // Mark this cannonball as having dealt damage
          cannonball.hasDealtDamage = true;
        }
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