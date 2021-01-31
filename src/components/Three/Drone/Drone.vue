<template>
  <div
    id="drone"
    class="scene"
  />
</template>

<script>
/* eslint-disable no-use-before-define, import/first, import/order */
import * as Three from 'three';

import { mapGetters, mapActions } from 'vuex';

import { OrbitControls } from '@/components/Three/Modules/Controls/OrbitControls';

import { DESIGN, OBJECTS } from '@/utils/constants';

import Atmosphere from './Atmosphere';
//import Grass from './Grass';
import Waters from './Waters';
import Sands from './Sands';
// import Stones from './Stones';
// import Plants from './Plants';
// import Hero from './Hero';
// import Horses from './Horses';
// import Parrots from './Parrots';

export default {
  name: 'Drone',

  data() {
    return {
      camera: null,
      scene: null,
      renderer: null,

      controls: null,
      counter: 0,

      atmosphere: null,
      grass: null,
      plants: null,
      waters: null,
      sands: null,
      stones: null,
      hero: null,
      // horses: null,
      // parrots: null,
    };
  },

  mounted() {
    this.init();
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.onWindowResize, false);
    document.removeEventListener('keydown', this.onKeyDown, false);
  },

  computed: {
    ...mapGetters({
      waterTexture: 'drone/waterTexture',
      sandsTexture: 'drone/sandsTexture',
      isPause: 'layout/isPause',
    }),
  },

  methods: {
    ...mapActions({
      changePause: 'layout/changePause',
    }),

    init() {
      // Core
      const container = document.getElementById('drone');

      // eslint-disable-next-line max-len
      this.camera = new Three.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 1, DESIGN.GROUND_SIZE);
      this.camera.position.x = 0;
      this.camera.position.y = 150;
      this.camera.position.z = 0;

      this.scene = new Three.Scene();
      this.scene.background = new Three.Color(0x4542a0);
      this.scene.fog = new Three.Fog(0x615ebc, DESIGN.GROUND_SIZE / 10, DESIGN.GROUND_SIZE / 2);

      this.renderer = new Three.WebGLRenderer({ antialias: true });
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(container.clientWidth, container.clientHeight);

      container.appendChild(this.renderer.domElement);

      this.scene.add(this.camera);
      // console.log(this.camera.position.x, this.camera.position.y, this.camera.position.z);

      // Control
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.addEventListener('change', this.render);
      this.controls.update();

      // Atmosphere
      this.atmosphere = new Atmosphere();
      this.atmosphere.init(this);

      // Objects

      // Waters
      this.waters = new Waters(this);
      this.waters.init(this);

      // Sands
      this.sands = new Sands();
      this.sands.init(this);

      /*
      // Ground
      this.grass = new Grass();
      this.grass.init(this);

      // Plants
      this.plants = new Plants();
      this.plants.init(this);

      // Stones
      this.stones = new Stones();
      this.stones.init(this);

      // Сharacters
      this.hero = new Hero();
      this.hero.init(this);

      // Horses
      this.horses = new Horses();
      this.horses.init(this);

      // Parrots
      this.parrots = new Parrots();
      this.parrots.init(this);
      */

      // Listeners
      window.addEventListener('resize', this.onWindowResize, false);
      document.addEventListener('keydown', this.onKeyDown, false);

      // First render
      this.render();
    },

    onKeyDown(event) {
      // eslint-disable-next-line default-case
      switch (event.keyCode) {
        case 9: // TAB
          event.preventDefault();
          event.stopPropagation();
          if (!this.isPause) this.$emit('off');
          break;
      }

      switch (event.keyCode) {
        case 27: // Esc
          event.preventDefault();
          event.stopPropagation();
          this.changePause(!this.isPause);
          break;
      }
    },

    onWindowResize() {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    },

    render() {
      this.renderer.render(this.scene, this.camera);
    },
  },
};
</script>

<style scoped>
.scene {
  width: 100vw;
  height: 100vh;
}
</style>
