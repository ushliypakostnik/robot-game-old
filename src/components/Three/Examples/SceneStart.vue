<template>
  <div
    id="scene"
    class="scene"
  />
</template>

<script>
import * as Three from 'three';

export default {
  name: 'Scene',

  data() {
    return {
      camera: null,
      scene: null,
      renderer: null,
      mesh: null,
    };
  },

  mounted() {
    this.init();
    this.animate();
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.onWindowResize, false);
  },

  methods: {
    init() {
      let container = document.getElementById('scene');

      this.camera = new Three.PerspectiveCamera(70, container.clientWidth/container.clientHeight, 0.01, 10);
      this.camera.position.z = 1;

      this.scene = new Three.Scene();

      let geometry = new Three.BoxGeometry(0.2, 0.2, 0.2);
      let material = new Three.MeshNormalMaterial();

      this.mesh = new Three.Mesh(geometry, material);
      this.scene.add(this.mesh);

      this.renderer = new Three.WebGLRenderer({antialias: true});
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(container.clientWidth, container.clientHeight);
      container.appendChild(this.renderer.domElement);

      // Resize
      window.addEventListener('resize', this.onWindowResize, false);
    },

    animate() {
      requestAnimationFrame(this.animate);
      this.mesh.rotation.x += 0.01;
      this.mesh.rotation.y += 0.02;
      this.renderer.render(this.scene, this.camera);
    },

    onWindowResize() {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
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
