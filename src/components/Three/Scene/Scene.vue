<template>
  <div
    id="scene"
    class="scene"
  />
</template>

<script>
/* eslint-disable no-use-before-define, import/first, import/order */
import * as Three from 'three';

const { mapGetters } = createNamespacedHelpers('utilities');

import { DESIGN } from '@/utils/constants';

import { createNamespacedHelpers } from 'vuex';

import { PointerLockControls } from '@/components/Three/Modules/Controls/PointerLockControls';

import Atmosphere from './Atmosphere';
import Ground from './Ground';
import Puddles from './Puddles';
import Boxes from './Boxes';
import Stones from './Stones';
import Mountains from './Mountains';
import Horses from './Horses';
import Parrots from './Parrots';

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
      puddles: null,
      boxes: null,
      stones: null,
      mountains: null,
      horses: null,
      parrots: null,

      ammos: [],
      ammoIdx: 0,
      ammodirection: null,
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
      this.camera = new Three.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 1, DESIGN.GROUND_SIZE / 2);
      this.camera.position.y = DESIGN.UNDER_FLOOR;

      this.scene = new Three.Scene();
      this.scene.background = new Three.Color(0x7844c1);
      this.scene.fog = new Three.Fog(0x4542a0, 50, DESIGN.GROUND_SIZE / 15);

      this.renderer = new Three.WebGLRenderer({ antialias: true });
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(container.clientWidth, container.clientHeight);

      container.appendChild(this.renderer.domElement);

      this.scene.add(this.camera);
      // console.log(this.camera.position.x, this.camera.position.y, this.camera.position.z)

      // Atmosphere
      this.atmosphere = new Atmosphere();
      this.atmosphere.init(this.scene, this.renderer);

      // Ground
      this.ground = new Ground();
      this.ground.init(this, this.scene);

      // Puddles
      this.puddles = new Puddles();
      this.puddles.init(this, this.scene, this.objects);

      // Objects

      // Boxes
      this.boxes = new Boxes();
      this.boxes.init(this, this.scene, this.objects);

      /*
      // Stones and mountains
      this.stones = new Stones();
      this.stones.init(this, this.scene, this.objects);
      this.mountains = new Mountains();
      this.mountains.init(this, this.scene, this.objects);

      // Horses
      this.horses = new Horses();
      this.horses.init(this.scene, this.objects);

      // Parrots
      this.parrots = new Parrots();
      this.parrots.init(this.scene, this.objects);
      */

      // Ammo
      this.controls = new PointerLockControls(this.camera, this.renderer.domElement);

      this.controls.addEventListener('unlock', () => {
        this.$store.dispatch('utilities/changePause', true);
      });

      this.controls.addEventListener('lock', () => {
        this.$store.dispatch('utilities/changePause', false);
      });

      this.scene.add(this.controls.getObject());

      // Start on sun edge
      /*
      this.camera.position.x = -71.39220993244662;
      this.camera.position.y = 20;
      this.camera.position.z = -4954.530933873361;
      */

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
          if (this.canJump === true) this.velocity.y += DESIGN.HERO_JUMP;
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

      // console.log(this.controls.getObject().position.x, this.controls.getObject().position.z);

      const time = performance.now();
      const delta = (time - this.prevTime) / 1000;

      this.puddles.animate();

      /*
      this.horses.animate(delta, this.objects);
      this.parrots.animate(delta, this.objects);
       */

      if (this.controls.isLocked) {
        // Check objects
        let intersections;

        // Down
        this.raycasterDown.ray.origin.copy(this.controls.getObject().position);
        this.raycasterDown.ray.origin.y -= DESIGN.UNDER_FLOOR;
        intersections = this.raycasterDown.intersectObjects(this.objects);
        const onObject = intersections.length > 0;

        const distance = this.moveRun ? 5 : 2.5;

        // Forward
        const directionForward = this.camera.getWorldDirection();
        this.raycasterForward.set(this.camera.getWorldPosition(), directionForward);
        intersections = this.raycasterForward.intersectObjects(this.objects);
        const onForward = intersections.length > 0 ? intersections[0].distance < distance : false;

        // Backward
        const directionBackward = directionForward.negate();
        this.raycasterBackward.set(this.camera.getWorldPosition(), directionBackward);
        intersections = this.raycasterBackward.intersectObjects(this.objects);
        const onBackward = intersections.length > 0 ? intersections[0].distance < distance : false;

        const y = new Three.Vector3(0, -1, 0);

        // Right
        const directionRight = new Three.Vector3(0, 0, 0).crossVectors(directionForward, y);
        this.raycasterRight.set(this.camera.getWorldPosition(), directionRight);
        intersections = this.raycasterRight.intersectObjects(this.objects);
        const onRight = intersections.length > 0 ? intersections[0].distance < distance : false;

        // Left
        const directionLeft = directionRight.negate();
        this.raycasterLeft.set(this.camera.getWorldPosition(), directionLeft);
        intersections = this.raycasterLeft.intersectObjects(this.objects);
        const onLeft = intersections.length > 0 ? intersections[0].distance < distance : false;

        const collision = onForward || onBackward || onLeft || onRight;

        this.velocity.x -= this.velocity.x * 10 * delta;
        this.velocity.z -= this.velocity.z * 10 * delta;

        this.velocity.y -= 9.8 * DESIGN.HERO_MASS * delta;

        this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
        this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
        this.direction.normalize(); // this ensures consistent movements in all directions

        // eslint-disable-next-line max-len
        if (this.moveForward || this.moveBackward) this.velocity.z -= this.direction.z * DESIGN.HERO_SPEED * delta;
        // eslint-disable-next-line max-len
        if (this.moveLeft || this.moveRight) this.velocity.x -= this.direction.x * DESIGN.HERO_SPEED * delta;

        if (onObject) {
          this.velocity.y = Math.max(0, this.velocity.y);
          this.canJump = true;
        }

        const run = this.moveRun ? 2.5 : 1;
        if (!collision) {
          this.controls.moveRight(-this.velocity.x * delta * run);
          this.controls.moveForward(-this.velocity.z * delta * run);
        } else {
          console.log('BBBBBBBBBBBBB', this.moveLeft, this.moveRight);
          if ((onForward && this.moveForward) ||
              (onBackward && this.moveBackward) ||
              (onLeft && this.moveLeft) ||
              (onRight && this.moveRight)) {
            this.moveRun = false;
            this.velocity.z = 0;
            this.velocity.x = 0;
          } else {
            this.controls.moveRight(-this.velocity.x * delta * run);
            this.controls.moveForward(-this.velocity.z * delta * run);
          }
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
