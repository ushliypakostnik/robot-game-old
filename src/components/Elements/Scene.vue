<template>
  <div
    id="scene"
    class="scene"
  >
    <div
      id="blocker"
      class="blocker"
    >

      <div
        id="instructions"
        class="instructions"
      >
        <h3>Click to play</h3>
        <h4>Move: WASD</h4>
        <h4>Jump: SPACE</h4>
        <h4>Look: MOUSE</h4>
      </div>

    </div>
  </div>
</template>

<script>
import * as Three from 'three';

import { PointerLockControls } from './Three/PointerLockControls.js';
import { TGALoader } from './Three/TGALoader.js';
import { Sky } from './Three/Sky.js';

const UNDER_FLOOR = 20;

export default {
  name: 'Scene',

  data() {
    return {
      camera: null,
      scene: null,
      renderer: null,

      prevTime: null,
      velocity: null,
      direction: null,
      vertex: null,
      color: null,

      controls: null,

      moveForward: false,
      moveBackward: false,
      moveLeft: false,
      moveRight: false,
      canJump: false,

      raycasterDown: null,
      raycasterMouse: null,
      mouse: null,

      objects: [],

      sky: null,
      sun: null,
      light: null,
      ground: null,
    };
  },

  mounted() {
    this.prevTime = performance.now();
    this.velocity = new Three.Vector3();
    this.direction = new Three.Vector3();
    this.vertex = new Three.Vector3();
    this.color = new Three.Color();
    this.mouse = new Three.Vector2();
    this.sun = new Three.Vector3();

    this.init();
    this.animate();
  },

  beforeDestroy() {
    window.removeEventListener( 'resize', this.onWindowResize, false );
    window.removeEventListener( 'keydown', this.onKeyDown, false );
    window.removeEventListener( 'keyup', this.onKeyUp, false );
    window.removeEventListener( 'mousemove', this.onMouseMove, false );
  },

  methods: {
    init() {

      // Core

      let container = document.getElementById('scene');

      // eslint-disable-next-line max-len
      this.camera = new Three.PerspectiveCamera(75, container.clientWidth/container.clientHeight, 1, 1000);
      this.camera.position.y = UNDER_FLOOR;

      this.scene = new Three.Scene();
      this.scene.background = new Three.Color(0x050505);
      this.scene.fog = new Three.Fog(0x050505, 50, 1000);

      this.renderer = new Three.WebGLRenderer({antialias: true});
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(container.clientWidth, container.clientHeight);

      this.renderer.outputEncoding = Three.sRGBEncoding;
      this.renderer.toneMapping = Three.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 0.5;

      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = Three.PCFSoftShadowMap;

      container.appendChild(this.renderer.domElement);

      this.scene.add(this.camera);

      // Sky

      this.sky = new Sky();
      this.sky.scale.setScalar(450000);
      this.scene.add(this.sky);

      const effectController = {
        turbidity: 10,
        rayleigh: 3,
        mieCoefficient: 0.005,
        mieDirectionalG: 0.7,
        inclination: 0.49, // elevation / inclination
        azimuth: 0.25, // Facing front,
        exposure: this.renderer.toneMappingExposure
      };

      const uniforms = this.sky.material.uniforms;
      uniforms[ "turbidity" ].value = effectController.turbidity;
      uniforms[ "rayleigh" ].value = effectController.rayleigh;
      uniforms[ "mieCoefficient" ].value = effectController.mieCoefficient;
      uniforms[ "mieDirectionalG" ].value = effectController.mieDirectionalG;

      const theta = Math.PI * (effectController.inclination - 0.5);
      const phi = 2 * Math.PI * (effectController.azimuth - 0.5);

      this.sun.x = Math.cos(phi);
      this.sun.y = Math.sin(phi) * Math.sin(theta);
      this.sun.z = Math.sin(phi) * Math.cos(theta);

      uniforms[ "sunPosition" ].value.copy(this.sun);

      this.renderer.toneMappingExposure = effectController.exposure;
      this.renderer.render(this.scene, this.camera);

      // Light

      this.light = new Three.HemisphereLight(0xeeeeff, 0x777788, 0.75);
      this.light.position.set(0.5, 1.0, 0.75).normalize();
      this.scene.add(this.light);

      this.scene.add(new Three.AmbientLight(0x222222));

      // Objects

      const loader = new TGALoader();
      const geometry = new Three.BoxBufferGeometry(50, 50, 50).toNonIndexed();

      for ( let i = 0; i < 10; i ++ ) {

        const texture = loader.load('./images/textures/box.tga');
        const material = new Three.MeshPhongMaterial({ color: 0xffffff, map: texture });

        const mesh = new Three.Mesh(geometry, material);

        mesh.position.x = Math.floor(Math.random() * 20 - 10) * 30;
        mesh.position.y = Math.floor(19);
        mesh.position.z = Math.floor(Math.random() * 20 - 10) * 30;

        this.scene.add(mesh);
        this.objects.push(mesh);
      }

      // Grass

      let gg = new Three.PlaneBufferGeometry( 4000, 4000, 100, 100);

      // Vertex displacement

      let position = gg.attributes.position;

      for ( let i = 0, l = position.count; i < l; i ++ ) {

        this.vertex.fromBufferAttribute( position, i );

        this.vertex.x += Math.random() * 20 - 10;
        this.vertex.y += Math.random() * 1.5 + 50;
        this.vertex.z += Math.random() * 20 - 10;

        position.setXYZ(i, this.vertex.x, this.vertex.y, this.vertex.z);

      }

      gg = gg.toNonIndexed(); // ensure each face has unique vertices

      const gt = new Three.TextureLoader().load("./images/textures/grass.jpg");
      const gm = new Three.MeshPhongMaterial({ color: 0xffaaaa, map: gt });

      this.ground = new Three.Mesh(gg, gm);
      this.ground.rotation.x = - Math.PI / 2;
      this.ground.material.map.repeat.set(16, 16);
      this.ground.material.map.wrapS = this.ground.material.map.wrapT = Three.RepeatWrapping;
      this.ground.material.map.encoding = Three.sRGBEncoding;
      this.ground.receiveShadow = true;

      this.scene.add(this.ground);

      // Controls
      this.controls = new PointerLockControls(this.camera, this.renderer.domElement);

      const blocker = document.getElementById('blocker');
      const instructions = document.getElementById('instructions');

      blocker.addEventListener('click',  () => {
        this.controls.lock();
      }, false);

      this.controls.addEventListener( 'lock', () => {
        instructions.style.display = 'none';
        blocker.style.display = 'none';
      });

      this.controls.addEventListener( 'unlock', () => {
        blocker.style.display = 'flex';
        instructions.style.display = '';
      });

      this.scene.add(this.controls.getObject());

      this.raycasterDown = new Three.Raycaster(new Three.Vector3(), new Three.Vector3(0, -1, 0), 0, 10);
      this.raycasterMouse = new Three.Raycaster(new Three.Vector3(), new Three.Vector3(0, -1, 0), 0, 10);

      window.addEventListener('keydown', this.onKeyDown, false);
      window.addEventListener('keyup', this.onKeyUp, false);
      window.addEventListener('mousemove', this.onMouseMove, false);

      // Resize
      window.addEventListener('resize', this.onWindowResize, false);
    },

    onMouseMove(event) {
      // calculate mouse position in normalized device coordinates
      // (-1 to +1) for both components
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    },

    onKeyDown(event) {
      switch ( event.keyCode ) {

        case 38: // up
        case 87: // w
          this.moveForward = true;
          break;

        case 37: // left
        case 65: // a
          this.moveLeft = true;
          break;

        case 40: // down
        case 83: // s
          this.moveBackward = true;
          break;

        case 39: // right
        case 68: // d
          this.moveRight = true;
          break;

        case 32: // space
          if ( this.canJump === true ) this.velocity.y += 350;
          this.canJump = false;
          break;
      }
    },

    onKeyUp(event) {
      switch ( event.keyCode ) {

        case 38: // up
        case 87: // w
          this.moveForward = false;
          break;

        case 37: // left
        case 65: // a
          this.moveLeft = false;
          break;

        case 40: // down
        case 83: // s
          this.moveBackward = false;
          break;

        case 39: // right
        case 68: // d
          this.moveRight = false;
          break;
      }
    },

    animate() {
      requestAnimationFrame(this.animate);

      const time = performance.now();

      if (this.controls.isLocked) {

        // Check objects
        let intersections;

        this.raycasterDown.ray.origin.copy(this.controls.getObject().position);
        this.raycasterDown.ray.origin.y -= 10;

        intersections = this.raycasterDown.intersectObjects(this.objects);
        const onObject = intersections.length > 0;

        this.raycasterMouse.setFromCamera(this.mouse, this.camera);

        intersections = this.raycasterMouse.intersectObjects(this.objects);
        const onMouse = intersections.length > 0;

        const delta = (time - this.prevTime) / 1000;

        if (onMouse) {
          if (this.moveForward) this.controls.moveForward(this.velocity.z * delta);
          if (this.moveBackward) this.controls.moveForward(+this.velocity.z * delta);
          if (this.moveLeft) this.controls.moveRight(this.velocity.x * delta);
          if (this.moveRight) this.controls.moveRight(-this.velocity.x * delta);
        } else {

          this.velocity.x -= this.velocity.x * 10 * delta;
          this.velocity.z -= this.velocity.z * 10 * delta;

          this.velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

          this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
          this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
          this.direction.normalize(); // this ensures consistent movements in all directions

          if (this.moveForward || this.moveBackward) this.velocity.z -= this.direction.z * 400.0 * delta;
          if (this.moveLeft || this.moveRight) this.velocity.x -= this.direction.x * 400.0 * delta;

          if (onObject) {
            this.velocity.y = Math.max(0, this.velocity.y);
            this.canJump = true;
          }

          this.controls.moveRight(-this.velocity.x * delta);
          this.controls.moveForward(-this.velocity.z * delta);
        }

        this.controls.getObject().position.y += (this.velocity.y * delta); // new behavior

        if (this.controls.getObject().position.y < UNDER_FLOOR) {
          this.velocity.y = 0;
          this.controls.getObject().position.y = UNDER_FLOOR;

          this.canJump = true;
        }
      }

      this.prevTime = time;

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

  .blocker {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .instructions {
    text-align: center;
    color: #ffffff;
    cursor: pointer;
    @include text($font-size--large, $font-weight__sans__bold);
  }

  h3, h4 {
    margin: 0;
  }
</style>
