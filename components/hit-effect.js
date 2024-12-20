//Artem Kiselev, 6580846
//Thanatat Aruntaravanit, 6580998

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
