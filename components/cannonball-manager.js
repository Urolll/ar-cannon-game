// Health management component
AFRAME.registerComponent('health-manager', {
  schema: {
    maxHealth: { type: 'number', default: 3 },
    side: { type: 'string', default: 'blue' },
    hitCooldown: { type: 'number', default: 1000 }
  },

  init() {
    this.currentHealth = this.data.maxHealth;
    this.healthContainer = this.el.querySelector(`#${this.data.side}Health`);
    this.canTakeDamage = true;
    
    if (!this.healthContainer) {
      console.error(`Health container for ${this.data.side} side not found`);
    }

    // Create game over text entities but keep them hidden
    this.createGameOverText();
  },

  createGameOverText() {
    // Create "You Lost" text
    this.lostText = document.createElement('a-text');
    this.lostText.setAttribute('value', 'YOU LOST');
    this.lostText.setAttribute('color', '#FF0000');
    this.lostText.setAttribute('scale', '2 2 2');
    this.lostText.setAttribute('align', 'center');
    this.lostText.setAttribute('rotation', '-90 180 0');
    this.lostText.setAttribute('position', '0 0.1 0');
    this.lostText.setAttribute('visible', false);
    this.el.appendChild(this.lostText);

    // Create "You Won" text
    this.wonText = document.createElement('a-text');
    this.wonText.setAttribute('value', 'YOU WON!');
    this.wonText.setAttribute('color', '#00FF00');
    this.wonText.setAttribute('scale', '2 2 2');
    this.wonText.setAttribute('align', 'center');
    this.wonText.setAttribute('rotation', '-90 180 0');
    this.wonText.setAttribute('position', '0 0.1 0');
    this.wonText.setAttribute('visible', false);
    this.el.appendChild(this.wonText);
  },

  gameOver(isWinner) {
    // Hide health container
    if (this.healthContainer) {
      this.healthContainer.setAttribute('visible', false);
    }

    // Show appropriate text
    if (isWinner) {
      this.wonText.setAttribute('visible', true);
    } else {
      this.lostText.setAttribute('visible', true);
    }

    // Emit event for other components/cannons to react
    this.el.emit('gameOver', { side: this.data.side, isWinner });
  },

  decreaseHealth() {
    if (!this.canTakeDamage || this.currentHealth <= 0) {
      return false;
    }

    if (this.healthContainer && this.currentHealth > 0) {
      const hearts = Array.from(this.healthContainer.querySelectorAll('a-image[src*="heart"]'))
        .reverse();
      
      if (hearts.length > 0 && this.currentHealth > 0) {
        const heartToHide = hearts[this.data.maxHealth - this.currentHealth];
        if (heartToHide) {
          heartToHide.setAttribute('visible', false);
          this.currentHealth--;
          
          // Start cooldown
          this.canTakeDamage = false;
          setTimeout(() => {
            this.canTakeDamage = true;
          }, this.data.hitCooldown);

          // Check for game over
          if (this.currentHealth <= 0) {
            // Find and notify the other cannon
            const otherSide = this.data.side === 'blue' ? 'green' : 'blue';
            const otherCannon = document.querySelector(`#${otherSide}CannonContainer`);
            
            if (otherCannon) {
              const otherHealthManager = otherCannon.components['health-manager'];
              if (otherHealthManager) {
                otherHealthManager.gameOver(true);
              }
            }
            
            // Trigger game over for this cannon
            this.gameOver(false);
          }
          
          return true;
        }
      }
    }
    return false;
  },

  getHealth() {
    return this.currentHealth;
  }
});

// Hit effect component
AFRAME.registerComponent('hit-effect', {
  schema: {
    effectDuration: { type: 'number', default: 1000 }
  },

  init() {
    const side = this.el.getAttribute('health-manager').side;
    this.hitPlane = this.el.querySelector(`#hit${side.charAt(0).toUpperCase() + side.slice(1)}`);
    this.canShowEffect = true;
  },

  showHitEffect() {
    if (this.hitPlane && this.canShowEffect) {
      this.canShowEffect = false;
      this.hitPlane.setAttribute('visible', true);
      
      setTimeout(() => {
        this.hitPlane.setAttribute('visible', false);
        this.canShowEffect = true;
      }, this.data.effectDuration);
    }
  }
});

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