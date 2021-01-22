<template>
  <div
    id="scene"
    class="scene"
  />
</template>

<script>
import * as Three from 'three';

import { DESIGN } from '@/utils/constants';

import { createNamespacedHelpers } from 'vuex';

import { PointerLockControls } from '@/components/Three/Modules/Controls/PointerLockControls';
// import { ImprovedNoise } from '@/components/Three/Modules/Utils/ImprovedNoise.js';

import Atmosphere from './Atmosphere';
import Grass from './Grass';
import Boxes from './Boxes';
import Horses from './Horses';

const { mapGetters } = createNamespacedHelpers('utilities');

export default {
  name: 'Scene',

  data() {
    return {
      camera: null,
      scene: null,
      renderer: null,

      controls: null,

      prevTime: null,
      velocity: null,
      direction: null,
      color: null,

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

      atmosphere: null,
      ground: null,

      objects: [], // все объекты
      boxes: null,
      horses: null,

      ammos: [],
      ammoIdx: 0,
    };
  },

  mounted() {
    this.prevTime = performance.now();
    this.velocity = new Three.Vector3();
    this.direction = new Three.Vector3();
    this.color = new Three.Color();
    this.mouse = new Three.Vector2();

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
      pause: 'pause',
    }),
  },

  methods: {
    init() {
      // Core

      const container = document.getElementById('scene');

      // eslint-disable-next-line max-len
      this.camera = new Three.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 1, 4000);
      this.camera.position.y = DESIGN.UNDER_FLOOR;

      this.scene = new Three.Scene();
      this.scene.background = new Three.Color(0x7844c1);
      this.scene.fog = new Three.Fog(0x4542a0, 50, 1000);

      this.renderer = new Three.WebGLRenderer({ antialias: true });
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(container.clientWidth, container.clientHeight);

      container.appendChild(this.renderer.domElement);

      this.scene.add(this.camera);

      // Atmosphere
      this.atmosphere = new Atmosphere();
      this.atmosphere.init(this.scene, this.renderer);

      // Objects

      // Boxes
      this.boxes = new Boxes();
      this.boxes.init(this, this.scene, this.objects);

      // Horse
      this.horses = new Horses();
      this.horses.init(this.scene, this.objects);

      // Grass
      this.ground = new Grass();
      this.ground.init(this, this.scene);

      // Ammo
      this.controls = new PointerLockControls(this.camera, this.renderer.domElement);

      this.controls.addEventListener('unlock', () => {
        this.$store.dispatch('utilities/changePause', true);
      });

      this.controls.addEventListener('lock', () => {
        this.$store.dispatch('utilities/changePause', false);
      });

      this.scene.add(this.controls.getObject());

      // Ammo
      // eslint-disable-next-line max-len
      const ammoGeometry = new Three.SphereBufferGeometry(DESIGN.AMMO_RADIUS, 32, 32);
      // eslint-disable-next-line max-len
      const ammoMaterial = new Three.MeshStandardMaterial({ color: DESIGN.COLORS.primary0x, roughness: 0.8, metalness: 0.5 });

      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < DESIGN.NUM_AMMO; i++) {
        const ammo = new Three.Mesh(ammoGeometry, ammoMaterial);
        ammo.castShadow = true;
        ammo.receiveShadow = true;

        this.ammos.push({
          mesh: ammo,
          collider: new Three.Sphere(new Three.Vector3(0, -100, 0), DESIGN.AMMO_RADIUS),
          velocity: new Three.Vector3(),
        });
      }

      // Raycasters
      /* eslint-disable max-len */
      this.raycasterDown = new Three.Raycaster(new Three.Vector3(), new Three.Vector3(0, -1, 0), 0, DESIGN.UNDER_FLOOR);
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

      // First render
      this.render();
    },

    shot() {
      if (this.controls.isLocked) {
        const ammo = this.ammos[this.ammoIdx];
        this.scene.add(ammo.mesh);
        this.camera.getWorldDirection(this.direction);
        ammo.collider.center.copy(this.controls.getObject().position);
        ammo.collider.center.y -= 10;
        ammo.velocity.copy(this.direction).multiplyScalar(25);
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

      this.horses.animate(delta);

      if (this.controls.isLocked) {
        // Check objects
        let intersections;

        // Down
        this.raycasterDown.ray.origin.copy(this.controls.getObject().position);
        this.raycasterDown.ray.origin.y -= 10;
        intersections = this.raycasterDown.intersectObjects(this.objects);
        const onObject = intersections.length > 0;

        // Forward
        const directionForward = this.camera.getWorldDirection();
        this.raycasterForward.set(this.camera.getWorldPosition(), directionForward);
        intersections = this.raycasterForward.intersectObjects(this.objects);
        const onForward = intersections.length > 0;

        // Backward
        const directionBackward = directionForward.negate();
        this.raycasterBackward.set(this.camera.getWorldPosition(), directionBackward);
        intersections = this.raycasterBackward.intersectObjects(this.objects);
        const onBackward = intersections.length > 0;

        const y = new Three.Vector3(0, -1, 0);

        // Left
        const directionLeft = new Three.Vector3(0, 0, 0).crossVectors(directionForward, y);
        this.raycasterLeft.set(this.camera.getWorldPosition(), directionLeft);
        intersections = this.raycasterLeft.intersectObjects(this.objects);
        const onLeft = intersections.length > 0;

        // Right
        const directionRight = directionLeft.negate();
        this.raycasterRight.set(this.camera.getWorldPosition(), directionRight);
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
        } else if (this.controls.getObject().position.y > DESIGN.UNDER_FLOOR) {
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

        if (this.controls.getObject().position.y < DESIGN.UNDER_FLOOR) {
          this.velocity.y = 0;
          this.controls.getObject().position.y = DESIGN.UNDER_FLOOR;

          this.canJump = true;
        }
      }

      // Ammo
      this.ammos.forEach((ammo) => {
        ammo.collider.center.addScaledVector(ammo.velocity, delta * 20);
        // eslint-disable-next-line no-param-reassign
        ammo.velocity.y -= DESIGN.AMMO_GRAVITY * delta;
        const damping = Math.exp(-1.5 * delta) - 1;
        ammo.velocity.addScaledVector(ammo.velocity, damping);
        ammo.mesh.position.copy(ammo.collider.center);
        // eslint-disable-next-line no-param-reassign
        if (ammo.mesh.position.y < 0) ammo.mesh.position.y = 0;
      });

      this.prevTime = time;

      if (this.controls.isLocked) this.render();
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
    pause(value) {
      if (!value) this.controls.lock();
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/styles/_main.scss";

.scene {
  width: 100vw;
  height: 100vh;
}
</style>
