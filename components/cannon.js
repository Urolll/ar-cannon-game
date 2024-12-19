AFRAME.registerComponent('model-physics', {
init: function() {
    this.el.addEventListener('model-loaded', () => {
    // Add physics body after model loads
    this.el.setAttribute('static-body', {
        shape: 'hull',
        mass: 0,
        scale: '0.8 0.8 0.8'
    });
    });
}
});