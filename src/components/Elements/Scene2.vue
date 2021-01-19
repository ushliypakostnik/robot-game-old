<template>
  <div
    id="scene"
    class="scene"
  />
</template>

<script>
import * as Three from 'three';

import { OrbitControls } from './Three/OrbitControls.js';

export default {
  name: 'Scene2',

  data() {
    return {
      camera: null,
      scene: null,
      renderer: null,

      cube: null,
      light: null,
      light1: null,
      light2: null,
      ground: null,
    };
  },

  mounted() {
    this.init();
    this.animate();
  },

  beforeDestroy() {
    window.removeEventListener( 'resize', this.onWindowResize, false );
  },

  methods: {
    init() {

      // Core

      let container = document.getElementById('scene');

      this.camera = new Three.PerspectiveCamera(50, container.clientWidth/container.clientHeight, 1, 4000);
      this.camera.position.x = 0;
      this.camera.position.y = 150;
      this.camera.position.z = 400;

      this.scene = new Three.Scene();
      this.scene.background = new Three.Color( 0x050505 );
      this.scene.fog = new Three.Fog( 0x050505, 50, 1000 );

      this.renderer = new Three.WebGLRenderer({antialias: true});
      this.renderer.setPixelRatio( window.devicePixelRatio );
      this.renderer.setSize(container.clientWidth, container.clientHeight);
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = Three.PCFSoftShadowMap;
      container.appendChild(this.renderer.domElement);

      this.scene.add(this.camera);

      // Grid

      // const grid = new Three.GridHelper( 50, 50, 0xffffff, 0xffffff );

      // this.scene.add( grid );

      // LIGHTS

      this.light = new Three.DirectionalLight(0xffffff);
      this.light.position.set(0.5, 1.0, 0.5).normalize();

      this.scene.add(this.light);

      this.scene.add( new Three.AmbientLight(0x222222));

      this.light1 = new Three.SpotLight(0xffffff, 5, 1000);
      this.light1.position.set(200, 250, 500);
      this.light1.angle = 0.5;
      this.light1.penumbra = 0.5;

      this.light1.castShadow = true;
      this.light1.shadow.mapSize.width = 1024;
      this.light1.shadow.mapSize.height = 1024;

      this.scene.add(this.light1);

      this.light2 = new Three.SpotLight(0xffffff, 5, 1000);
      this.light2.position.set(-100, 350, 350);
      this.light2.angle = 0.5;
      this.light2.penumbra = 0.5;

      this.light2.castShadow = true;
      this.light2.shadow.mapSize.width = 1024;
      this.light2.shadow.mapSize.height = 1024;

      this.scene.add(this.light2);

      // Cube

      let geometry = new Three.BoxGeometry(100, 100, 100);
      let material = new Three.MeshPhongMaterial();
      material.color.set(0x000000);

      this.cube = new Three.Mesh(geometry, material);
      this.cube.position.y = 50;
      this.scene.add(this.cube);

      // Grass

      const gt = new Three.TextureLoader().load( "./img/grass.jpg" );
      const gg = new Three.PlaneBufferGeometry( 4000, 4000 );
      const gm = new Three.MeshPhongMaterial( { color: 0xffaaaa, map: gt } );

      const ground = new Three.Mesh( gg, gm );
      ground.rotation.x = - Math.PI / 2;
      ground.material.map.repeat.set( 16, 16 );
      ground.material.map.wrapS = ground.material.map.wrapT = Three.RepeatWrapping;
      ground.material.map.encoding = Three.sRGBEncoding;
      ground.receiveShadow = true;

      this.scene.add(ground);

      // Controls
      const controls = new OrbitControls( this.camera, this.renderer.domElement );
      controls.addEventListener( 'change', this.render );
      controls.update();

      // Resize
      window.addEventListener( 'resize', this.onWindowResize, false );
    },

    animate() {
      requestAnimationFrame(this.animate);

      this.render();
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

<style lang="scss" scoped>
  @import "@/styles/_stylebase.scss";

  .scene {
    width: 100vw;
    height: 100vh;
  }
</style>
