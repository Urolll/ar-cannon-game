AFRAME.registerComponent('cannonball-manager', {
  schema: {
    position: { type: 'vec3', default: { x: 0, y: 0, z: 0 } }, // Starting position
    direction: { type: 'vec3', default: { x: 0, y: 0, z: -1 } }, // Launch direction
    speed: { type: 'number', default: 10 } // Launch speed
  },

  init: function () {
    this.scene = this.el.sceneEl;
  },

    launchCannonball: function (data) {
    const marker = data.marker;  // The marker passed into the function (either green or blue)
    const isGreenTurn = data.isGreenTurn;  // Get the turn information from the data passed

    // Determine direction based on the cannon color (green or blue)
    const direction = isGreenTurn
      ? { x: 1, y: 0.5, z: 0 }  // Green cannon shoots to the right (positive x-axis)
      : { x: -1, y: 0.5, z: 0 };   // Blue cannon shoots to the left (negative x-axis)

    // Create the cannonball entity
    const cannonball = document.createElement('a-sphere');
    cannonball.setAttribute('radius', 0.1);  // Increased size of the cannonball
    cannonball.setAttribute('color', '#505050');  // Darker gray color for the cannonball

    // Calculate the cannonball's position relative to the marker (cannon hole position)
    let cannonHolePosition = {
      x: marker.object3D.position.x + (isGreenTurn ? 0.5 : -0.5),  // Adjust based on color
      y: marker.object3D.position.y, 
      z: marker.object3D.position.z + 1  // Adjust to be in front of the cannon
    };

    // Set the cannonball's position
    cannonball.setAttribute('position', `${cannonHolePosition.x} ${cannonHolePosition.y} ${cannonHolePosition.z}`);
    console.log('Cannonball initial position set to:', cannonball.getAttribute('position'));

    // Set up the cannonball with physics (dynamic body)
    cannonball.setAttribute('dynamic-body', { 
      shape: 'sphere',
      mass: 1 
    });

    console.log('Dynamic body applied:', cannonball.getAttribute('dynamic-body'));

    // Append the cannonball to the scene
    this.scene.appendChild(cannonball);

    // Log the position after adding to the scene
    console.log('Cannonball added to scene at:', cannonball.getAttribute('position'));

    // Cleanup the cannonball after 5 seconds
    setTimeout(() => {
      if (cannonball.parentNode) {
        cannonball.parentNode.removeChild(cannonball);
      }
    }, 5000);
  }
});
