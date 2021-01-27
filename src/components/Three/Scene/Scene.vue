<template>
  <div
    id="scene"
    class="scene"
  />
</template>

<script>
/* eslint-disable no-use-before-define, import/first, import/order */
import * as Three from 'three';

import { mapGetters, mapActions } from 'vuex';

import { PointerLockControls } from '@/components/Three/Modules/Controls/PointerLockControls';

import { DESIGN } from '@/utils/constants';
import { loaderDispatchHelper } from '@/utils/utilities';

import Atmosphere from './Atmosphere';
import Ground from './Ground';
import Waters from './Waters';
import Sands from './Sands';
import Stones from './Stones';
import Boxes from './Boxes';
// import Horses from './Horses';
// import Parrots from './Parrots';

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
      position: null,
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

      x: null,
      y: null,
      z: null,

      atmosphere: null,
      ground: null,
      ocean: null,
      beach: null,
      sands: null,
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

      audioLoader: null,
      listener: null,
      steps: null,
      run: null,
      watersteps: null,
      waterrun: null,
      spit: null,
      drop: null,
    };
  },

  mounted() {
    this.prevTime = performance.now();
    this.velocity = new Three.Vector3();
    this.direction = new Three.Vector3();
    this.position = new Three.Vector3();
    this.color = new Three.Color();
    this.mouse = new Three.Vector2();
    this.x = new Three.Vector3(1, 0, 0);
    this.y = new Three.Vector3(0, -1, 0);
    this.z = new Three.Vector3(0, 0, 1);

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
      pause: 'utilities/pause',
    }),
  },

  methods: {
    ...mapActions({
      isAllLoadedAndBuilt: 'preloader/isAllLoadedAndBuilt',
      groundLoaded: 'preloader/grassLoaded',
      groundBuilt: 'preloader/groundBuilt',
      stoneLoaded: 'preloader/stoneLoaded',
      mountainsBuilt: 'preloader/mountainsBuilt',
      stonesBuilt: 'preloader/stonesBuilt',
      sandLoaded: 'preloader/sandLoaded',
      beachBuilt: 'preloader/beachBuilt',
      sandsBuilt: 'preloader/sandsBuilt',
      waterLoaded: 'preloader/waterLoaded',
      oceanBuilt: 'preloader/oceanBuilt',
      lakesBuilt: 'preloader/lakesBuilt',
      puddlesBuilt: 'preloader/puddlesBuilt',
      boxLoaded: 'preloader/boxLoaded',
      boxesBuilt: 'preloader/boxesBuilt',
      stepComplete: 'preloader/stepComplete',
      runComplete: 'preloader/runComplete',
    }),

    init() {
      // Core

      const container = document.getElementById('scene');

      // eslint-disable-next-line max-len
      this.camera = new Three.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 1, DESIGN.GROUND_SIZE);
      this.camera.position.y = DESIGN.UNDER_FLOOR;

      this.scene = new Three.Scene();
      this.scene.background = new Three.Color(0x7844c1);
      this.scene.fog = new Three.Fog(0x4542a0, DESIGN.GROUND_SIZE / 10, DESIGN.GROUND_SIZE);

      this.renderer = new Three.WebGLRenderer({ antialias: true });
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(container.clientWidth, container.clientHeight);

      container.appendChild(this.renderer.domElement);

      this.scene.add(this.camera);
      // console.log(this.camera.position.x, this.camera.position.y, this.camera.position.z)

      // Atmosphere
      this.atmosphere = new Atmosphere();
      this.atmosphere.init(this.scene, this.renderer);

      this.audioLoader = new Three.AudioLoader();
      this.listener = new Three.AudioListener();
      this.camera.add(this.listener);

      const stepsGeometry = new Three.SphereBufferGeometry( 2, 32, 32 );
      const stepsMaterial = new Three.MeshStandardMaterial( { color: 0xff0000 } );

      this.steps = new Three.Mesh(stepsGeometry, stepsMaterial);
      this.steps.position.set(this.camera.position);
      this.steps.visible = false;

      this.audioLoader.load( './audio/steps.mp3', (buffer) => {
        const audio = new Three.PositionalAudio(this.listener);
        audio.setBuffer(buffer);
        audio.setLoop(true);

        this.steps.add(audio);
        this.scene.add(this.steps);
        loaderDispatchHelper(this.$store, 'stepComplete');
      });

      this.run = new Three.Mesh(stepsGeometry, stepsMaterial);
      this.run.position.set(this.camera.position);
      this.run.visible = false;

      this.audioLoader.load( './audio/run.mp3', (buffer) => {
        const audio = new Three.PositionalAudio(this.listener);
        audio.setBuffer(buffer);
        audio.setLoop(true);

        this.run.add(audio);
        this.scene.add(this.run);
        loaderDispatchHelper(this.$store, 'runComplete');
      });

      // Ocean
      this.ocean = new Waters();
      this.ocean.init(this, this.scene, 'ocean');

      // Lakes
      this.lakes = new Waters();
      this.lakes.init(this, this.scene, 'lakes');

      // Puddles
      this.puddles = new Waters();
      this.puddles.init(this, this.scene, 'puddles');

      // Beach
      this.beach = new Sands();
      this.beach.init(this, this.scene, 'beach');

      // Sands
      this.sands = new Sands();
      this.sands.init(this, this.scene, 'sands');

      // Objects

      // Ground
      this.ground = new Ground();
      this.ground.init(this, this.scene);

      /*
      // Boxes
      this.boxes = new Boxes();
      this.boxes.init(this, this.scene, this.objects);
      */

      // Stones
      this.stones = new Stones();
      this.stones.init(this, this.scene, this.objects, 'stones');

      // Mountains
      this.mountains = new Stones();
      this.mountains.init(this, this.scene, this.objects, 'mountains');

      /*
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

      // Переместиться в точку
      // this.controls.getObject().position.x = -1200;
      // this.controls.getObject().position.z = -300;

      this.scene.add(this.controls.getObject());

      // Ammo
      // eslint-disable-next-line max-len
      const ammoGeometry = new Three.SphereBufferGeometry(DESIGN.AMMO_RADIUS, 32, 32);
      // eslint-disable-next-line max-len
      const ammoMaterial = new Three.MeshStandardMaterial({ color: DESIGN.COLORS.primary0x, roughness: 0.8, metalness: 0.5 });

      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < DESIGN.NUM_AMMO; i++) {
        const ammo = new Three.Mesh(ammoGeometry, ammoMaterial);
        ammo.scale.set(1, 1, 1);
        ammo.position.y = DESIGN.UNDER_FLOOR - 0.2;
        // ammo.castShadow = true;
        // ammo.receiveShadow = true;

        this.ammos.push({
          mesh: ammo,
          collider: new Three.Sphere(new Three.Vector3(0, 0, 0), DESIGN.AMMO_RADIUS),
          velocity: new Three.Vector3(),
          onFly: false,
          onGround: false,
          scale: 1,
          off: false,
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
        ammo.onFly = true;
        this.scene.add(ammo.mesh);
        this.camera.getWorldDirection(this.direction);
        ammo.collider.center.copy(this.controls.getObject().position);
        ammo.collider.center.y -= 0.5;
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

      // Зависнуть над сценой
      // this.controls.getObject().position.y = 1000;

      // console.log(this.renderer.info);
      // console.log(this.controls.getObject().position.x, this.controls.getObject().position.z);

      const time = performance.now();
      const delta = (time - this.prevTime) / 1000;

      this.puddles.animate();
      this.lakes.animate();
      this.ocean.animate();

      /*
      this.horses.animate(delta, this.objects);
      this.parrots.animate(delta, this.objects);
      */

      if (this.controls.isLocked) {
        // Check objects
        let intersections;

        const distance = this.moveRun ? 20 : 5;

        // Forward
        const directionForward = this.camera.getWorldDirection(this.direction);
        this.raycasterForward.set(this.camera.getWorldPosition(this.position), directionForward);
        intersections = this.raycasterForward.intersectObjects(this.objects);
        const onForward = intersections.length > 0 ? intersections[0].distance < distance : false;

        // Backward
        const directionBackward = directionForward.negate();
        this.raycasterBackward.set(this.camera.getWorldPosition(this.position), directionBackward);
        intersections = this.raycasterBackward.intersectObjects(this.objects);
        const onBackward = intersections.length > 0 ? intersections[0].distance < distance : false;

        // Right
        const directionRight = new Three.Vector3(0, 0, 0).crossVectors(directionForward, this.y);
        this.raycasterRight.set(this.camera.getWorldPosition(this.position), directionRight);
        intersections = this.raycasterRight.intersectObjects(this.objects);
        const onRight = intersections.length > 0 ? intersections[0].distance < distance : false;

        // Left
        const directionLeft = directionRight.negate();
        this.raycasterLeft.set(this.camera.getWorldPosition(this.position), directionLeft);
        intersections = this.raycasterLeft.intersectObjects(this.objects);
        const onLeft = intersections.length > 0 ? intersections[0].distance < distance : false;

        const collision = onForward || onBackward || onLeft || onRight;

        // Down
        const directionDown = new Three.Vector3(0, 0, 0).crossVectors(this.x, this.z);
        this.raycasterDown.set(this.camera.getWorldPosition(this.position), directionDown);
        this.raycasterDown.ray.origin.y -= DESIGN.UNDER_FLOOR;
        intersections = this.raycasterDown.intersectObjects(this.objects);
        const onObject = intersections.length > 0 ? intersections[0].distance < DESIGN.UNDER_FLOOR : false;

        this.velocity.x -= this.velocity.x * 10 * delta;
        this.velocity.z -= this.velocity.z * 10 * delta;

        if (this.velocity.y < 0) {
          this.velocity.y -= 9.8 * DESIGN.HERO_MASS * delta / (-2.5 * this.velocity.y);
        } else this.velocity.y -= 9.8 * DESIGN.HERO_MASS * delta;

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
        if (ammo.onFly || ammo.onGround) {
          ammo.collider.center.addScaledVector(ammo.velocity, delta * 5);
          // eslint-disable-next-line no-param-reassign
          ammo.velocity.y -= DESIGN.AMMO_GRAVITY * delta;
          const damping = Math.exp(-1.5 * delta) - 1;
          ammo.velocity.addScaledVector(ammo.velocity, damping);
          ammo.mesh.position.copy(ammo.collider.center);

          if (ammo.mesh.position.y < 0) {
            ammo.mesh.position.y = 0;
            ammo.onFly = false;
            ammo.onGround = true;
          }
        }

        if (ammo.onGround) {
          if (ammo.scale > 4) ammo.off = true;

          if (ammo.off) {
            ammo.scale -= delta * 2;
            ammo.mesh.scale.x = ammo.scale;
            ammo.mesh.scale.z = ammo.scale;

            if (ammo.scale < 0.5) {
              ammo.mesh.position.y = -1;
              ammo.onGround = false;
              ammo.false = true;
              ammo.off = false;
              ammo.scale = 1;
              ammo.mesh.scale.set(1, 1, 1);
            }
          } else {
            ammo.scale += delta;
            ammo.mesh.scale.set(ammo.scale, 1 / ammo.scale, ammo.scale);
          }
        }
      });

      if (this.steps) {
        this.steps.position.set(
          this.controls.getObject().position.x,
          this.controls.getObject().position.y,
          this.controls.getObject().position.z,
        );
        this.run.position.set(
          this.controls.getObject().position.x,
          this.controls.getObject().position.y,
          this.controls.getObject().position.z,
        );
        if (this.moveForward || this.moveBackward || this.moveLeft || this.moveRight) {
          if (this.run.children[0] && this.moveRun) this.run.children[0].play();
          else if (this.steps.children[0]) this.steps.children[0].play();
        } else {
          if (this.run.children[0] && this.run.children[0].isPlaying) this.run.children[0].pause();
          if (this.steps.children[0] && this.steps.children[0].isPlaying) this.steps.children[0].pause();
        }
      }

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
