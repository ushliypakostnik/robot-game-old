<template>
  <div
    id="scene"
    class="scene"
  />
</template>

<script>
import * as Three from 'three';

import { createNamespacedHelpers } from 'vuex';

import { PointerLockControls } from './Modules/Controls/PointerLockControls';
import { TGALoader } from './Modules/Utils/TGALoader';
import { Capsule } from './Modules/Utils/Capsule';
import { Sky } from './Modules/Elements/Sky';

const { mapGetters } = createNamespacedHelpers('utilities');

const UNDER_FLOOR = 20;
const AMMO_GRAVITY = 5;
const NUM_AMMO = 20;
const AMMO_RADIUS = 5;

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
      moveRun: false,

      raycasterDown: null,
      raycasterForward: null,
      raycasterBackward: null,
      raycasterRight: null,
      raycasterLeft: null,
      mouse: null,

      objects: [],
      ammos: [],
      ammoIdx: 0,
      isFirstClick: false,

      sky: null,
      sun: null,
      light: null,
      ground: null,

      playerCollider: null,
      playerDirection: null,
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
    this.playerDirection = new Three.Vector3();
    // eslint-disable-next-line max-len
    this.playerCollider = new Capsule(new Three.Vector3(0, 0.35, 0), new Three.Vector3(0, 1, 0), 0.35);

    this.init();
    this.animate();
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.onWindowResize, false);
    document.removeEventListener('keydown', this.onKeyDown, false);
    document.removeEventListener('keyup', this.onKeyUp, false);
    document.removeEventListener('mousemove', this.onMouseMove, false);
  },

  computed: {
    ...mapGetters({
      start: 'start',
    }),
  },

  methods: {
    init() {
      // Core

      const container = document.getElementById('scene');

      // eslint-disable-next-line max-len
      this.camera = new Three.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 1, 1000);
      this.camera.position.y = UNDER_FLOOR;

      this.scene = new Three.Scene();
      this.scene.background = new Three.Color(0x7844c1);
      this.scene.fog = new Three.Fog(0x050505, 50, 1000);

      this.renderer = new Three.WebGLRenderer({ antialias: true });
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(container.clientWidth, container.clientHeight);

      // For Sky
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
        exposure: this.renderer.toneMappingExposure,
      };

      const { uniforms } = this.sky.material;
      /* eslint-disable dot-notation */
      uniforms['turbidity'].value = effectController.turbidity;
      uniforms['rayleigh'].value = effectController.rayleigh;
      uniforms['mieCoefficient'].value = effectController.mieCoefficient;
      uniforms['mieDirectionalG'].value = effectController.mieDirectionalG;
      /* eslint-enable dot-notation */

      const theta = Math.PI * (effectController.inclination - 0.5);
      const phi = 2 * Math.PI * (effectController.azimuth - 0.5);

      this.sun.x = Math.cos(phi);
      this.sun.y = Math.sin(phi) * Math.sin(theta);
      this.sun.z = Math.sin(phi) * Math.cos(theta);

      // eslint-disable-next-line dot-notation
      uniforms['sunPosition'].value.copy(this.sun);

      this.renderer.toneMappingExposure = effectController.exposure;

      // Light

      this.light = new Three.HemisphereLight(0xeeeeff, 0x777788, 0.75);
      this.light.position.set(0.5, 1.0, 0.75).normalize();
      this.scene.add(this.light);

      this.scene.add(new Three.AmbientLight(0x222222));

      // Objects

      const loader = new TGALoader();
      const geometry = new Three.BoxBufferGeometry(50, 50, 50).toNonIndexed();

      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < 10; i++) {
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

      let gg = new Three.PlaneBufferGeometry(4000, 4000, 100, 100);

      // Vertex displacement

      const { position } = gg.attributes;

      // eslint-disable-next-line no-plusplus
      for (let i = 0, l = position.count; i < l; i++) {
        this.vertex.fromBufferAttribute(position, i);

        this.vertex.x += Math.random() * 20 - 10;
        this.vertex.y += Math.random() * 1.5 + 1000;
        this.vertex.z += Math.random() * 20 - 10;

        position.setXYZ(i, this.vertex.x, this.vertex.y, this.vertex.z);
      }

      gg = gg.toNonIndexed(); // ensure each face has unique vertices

      const gt = new Three.TextureLoader().load('./images/textures/grass.jpg');
      const gm = new Three.MeshPhongMaterial({ color: 0xffaaaa, map: gt });

      this.ground = new Three.Mesh(gg, gm);
      this.ground.rotation.x = -Math.PI / 2;
      this.ground.material.map.repeat.set(16, 16);
      // eslint-disable-next-line no-multi-assign
      this.ground.material.map.wrapS = this.ground.material.map.wrapT = Three.RepeatWrapping;
      this.ground.material.map.encoding = Three.sRGBEncoding;
      this.ground.receiveShadow = true;

      this.scene.add(this.ground);

      // Controls
      this.controls = new PointerLockControls(this.camera, this.renderer.domElement);

      this.controls.addEventListener('unlock', () => {
        this.$store.dispatch('utilities/changeStart', false);
      });

      this.controls.addEventListener('lock', () => {
        this.$store.dispatch('utilities/changeStart', true);
      });

      this.scene.add(this.controls.getObject());

      // Ammo
      // eslint-disable-next-line max-len
      const ammoGeometry = new Three.SphereBufferGeometry(AMMO_RADIUS, 32, 32);
      // eslint-disable-next-line max-len
      const ammoMaterial = new Three.MeshStandardMaterial({ color: 0xa82333, roughness: 0.8, metalness: 0.5 });

      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < NUM_AMMO; i++) {
        const ammo = new Three.Mesh(ammoGeometry, ammoMaterial);
        ammo.castShadow = true;
        ammo.receiveShadow = true;

        this.scene.add(ammo);

        this.ammos.push({
          mesh: ammo,
          collider: new Three.Sphere(new Three.Vector3(0, -100, 0), AMMO_RADIUS),
          velocity: new Three.Vector3(),
        });
      }

      // Raycasters
      /* eslint-disable max-len */
      this.raycasterDown = new Three.Raycaster(new Three.Vector3(), new Three.Vector3(0, -1, 0), 0, UNDER_FLOOR);
      this.raycasterForward = new Three.Raycaster(new Three.Vector3(), new Three.Vector3(0, 0, -1), 0, 10);
      this.raycasterBackward = new Three.Raycaster(new Three.Vector3(), new Three.Vector3(0, 0, 1), 0, 10);
      this.raycasterLeft = new Three.Raycaster(new Three.Vector3(), new Three.Vector3(-1, 0, 0), 0, 10);
      this.raycasterRight = new Three.Raycaster(new Three.Vector3(), new Three.Vector3(-1, 0, 0), 0, 10);
      /* eslint-enable max-len */

      // Listeners
      window.addEventListener('resize', this.onWindowResize, false);
      document.addEventListener('keydown', this.onKeyDown, false);
      document.addEventListener('keyup', this.onKeyUp, false);
      document.addEventListener('mousemove', this.onMouseMove, false);
      document.addEventListener('click', this.shot, false);
    },

    shot() {
      if (this.controls.isLocked) {
        const ammo = this.ammos[this.ammoIdx];
        this.camera.getWorldDirection(this.playerDirection);
        ammo.collider.center.copy(this.controls.getObject().position);
        ammo.collider.center.y -= 10;
        ammo.velocity.copy(this.playerDirection).multiplyScalar(25);
        this.ammoIdx = (this.ammoIdx + 1) % this.ammos.length;
      }
    },

    onMouseMove(event) {
      // calculate mouse position in normalized device coordinates
      // (-1 to +1) for both components
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    },

    onKeyDown(event) {
      // eslint-disable-next-line default-case
      switch (event.keyCode) {
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
          if (this.canJump === true) this.velocity.y += 350;
          this.canJump = false;
          break;

        case 16: // shift
          this.moveRun = true;
          break;
      }
    },

    onKeyUp(event) {
      // eslint-disable-next-line default-case
      switch (event.keyCode) {
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

        case 16: // shift
          this.moveRun = false;
          break;
      }
    },

    animate() {
      requestAnimationFrame(this.animate);

      const time = performance.now();
      const delta = (time - this.prevTime) / 1000;

      if (this.controls.isLocked) {
        // Check objects
        let intersections;

        // Down
        this.raycasterDown.ray.origin.copy(this.controls.getObject().position);
        this.raycasterDown.ray.origin.y -= 10;
        intersections = this.raycasterDown.intersectObjects(this.objects);
        const onObject = intersections.length > 0;

        // Forward
        this.raycasterForward.ray.origin.copy(this.controls.getObject().position);
        this.raycasterBackward.ray.direction = new Three.Vector3(0, 0, -1);
        intersections = this.raycasterForward.intersectObjects(this.objects);
        const onForward = intersections.length > 0;

        // Backward
        this.raycasterBackward.ray.origin.copy(this.controls.getObject().position);
        this.raycasterBackward.ray.direction = new Three.Vector3(0, 0, 1);
        intersections = this.raycasterBackward.intersectObjects(this.objects);
        const onBackward = intersections.length > 0;

        // Left
        this.raycasterLeft.ray.origin.copy(this.controls.getObject().position);
        this.raycasterLeft.ray.direction = new Three.Vector3(-1, 0, 0);
        intersections = this.raycasterLeft.intersectObjects(this.objects);
        const onLeft = intersections.length > 0;

        // Right
        this.raycasterRight.ray.origin.copy(this.controls.getObject().position);
        this.raycasterRight.ray.direction = new Three.Vector3(1, 0, 0);
        intersections = this.raycasterRight.intersectObjects(this.objects);
        const onRight = intersections.length > 0;

        const collision = onForward || onBackward || onLeft || onRight;

        this.velocity.x -= this.velocity.x * 10 * delta;
        this.velocity.z -= this.velocity.z * 10 * delta;

        this.velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

        this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
        this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
        this.direction.normalize(); // this ensures consistent movements in all directions

        // eslint-disable-next-line max-len
        if (this.moveForward || this.moveBackward) this.velocity.z -= this.direction.z * 400.0 * delta;
        // eslint-disable-next-line max-len
        if (this.moveLeft || this.moveRight) this.velocity.x -= this.direction.x * 400.0 * delta;

        if (onObject) {
          this.velocity.y = Math.max(0, this.velocity.y);
          this.canJump = true;
        } else if (this.controls.getObject().position.y > UNDER_FLOOR) {
          this.controls.moveRight(-this.velocity.x * delta * 2.5);
          this.controls.moveForward(-this.velocity.z * delta * 2.5);
        }

        if (!collision) {
          const run = this.moveRun ? 2.5 : 1;
          this.controls.moveRight(-this.velocity.x * delta * run);
          this.controls.moveForward(-this.velocity.z * delta * run);
        } else {
          const run = this.moveRun ? 2 : 1;
          this.controls.moveRight(this.velocity.x * delta * 5 * run);
          this.controls.moveForward(this.velocity.z * delta * 5 * run);
        }

        this.controls.getObject().position.y += (this.velocity.y * delta);

        if (this.controls.getObject().position.y < UNDER_FLOOR) {
          this.velocity.y = 0;
          this.controls.getObject().position.y = UNDER_FLOOR;

          this.canJump = true;
        }
      }

      // Ammo
      this.ammos.forEach((ammo) => {
        ammo.collider.center.addScaledVector(ammo.velocity, delta * 20);
        // eslint-disable-next-line no-param-reassign
        ammo.velocity.y -= AMMO_GRAVITY * delta;
        const damping = Math.exp(-1.5 * delta) - 1;
        ammo.velocity.addScaledVector(ammo.velocity, damping);
        ammo.mesh.position.copy(ammo.collider.center);
        // eslint-disable-next-line no-param-reassign
        if (ammo.mesh.position.y < 0) ammo.mesh.position.y = 0;
      });

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

  watch: {
    start(value) {
      if (value) this.controls.lock();
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
