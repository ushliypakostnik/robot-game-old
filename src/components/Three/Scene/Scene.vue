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

import { DESIGN, OBJECTS } from '@/utils/constants';
import { loaderDispatchHelper } from '@/utils/utilities';

import Atmosphere from './Atmosphere';
import Grass from './Grass';
import Waters from './Waters';
import Sands from './Sands';
import Stones from './Stones';
import Hero from './Hero';
// import Boxes from './Boxes';
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
      moveRun: false,
      moveHidden: false,
      canJump: false,

      raycasterDown: null,
      raycasterForward: null,
      raycasterBackward: null,
      raycasterRight: null,
      raycasterLeft: null,
      mouse: null,

      x: null,
      y: null,
      z: null,

      directionDown: null,
      directionForward: null,
      directionBackward: null,
      directionRight: null,
      directionLeft: null,

      audioLoader: null,
      listener: null,

      object: null,
      onObjectHeight: 0,
      onForward: null,
      onBackward: null,
      onRight: null,
      onLeft: null,
      inWater: null,
      inLargeWater: null,

      intersections: null,
      stopDistance: 5,
      collision: null,
      moveSpeed: null,
      time: null,
      delta: null,

      height: DESIGN.UNDER_FLOOR,
      layers: [],
      layersNew: [],

      objectsGround: [], // все объекты для горизонтального рейкастинга
      objectsVerical: [], // все объекты
      atmosphere: null,
      grass: null,
      waters: null,
      sands: null,
      stones: null,
      hero: null,
      // horses: null,
      // parrots: null,

      ammos: [],
      ammoIdx: 0,
      ammodirection: null,
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

    this.audioLoader = new Three.AudioLoader();
    this.listener = new Three.AudioListener();

    this.init();
    this.animate();
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.onWindowResize, false);
    document.removeEventListener('keydown', this.onKeyDown, false);
    document.removeEventListener('keyup', this.onKeyUp, false);
    document.removeEventListener('mousemove', this.onMouseMove, false);
    document.removeEventListener('click', this.shot, false);
  },

  computed: {
    ...mapGetters({
      pause: 'utilities/pause',
    }),
  },

  methods: {
    ...mapActions({
      isAllLoadedAndBuilt: 'preloader/isAllLoadedAndBuilt',
      preloadOrBuilt: 'preloader/preloadOrBuilt',
    }),

    init() {
      // Core

      const container = document.getElementById('scene');

      // eslint-disable-next-line max-len
      this.camera = new Three.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 1, DESIGN.GROUND_SIZE);

      this.scene = new Three.Scene();
      this.scene.background = new Three.Color(0x4542a0);
      // #4542a0
      this.scene.fog = new Three.Fog(0x615ebc, DESIGN.GROUND_SIZE / 10, DESIGN.GROUND_SIZE / 2);

      this.renderer = new Three.WebGLRenderer({ antialias: true });
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(container.clientWidth, container.clientHeight);

      container.appendChild(this.renderer.domElement);

      this.scene.add(this.camera);
      // console.log(this.camera.position.x, this.camera.position.y, this.camera.position.z)

      // Characters
      this.hero = new Hero();
      this.hero.init(this);

      // Atmosphere
      this.atmosphere = new Atmosphere();
      this.atmosphere.init(this);

      // Waters
      this.waters = new Waters(this);
      this.waters.init(this);

      // Sands
      this.sands = new Sands();
      this.sands.init(this);

      // Objects

      // Ground
      this.grass = new Grass();
      this.grass.init(this);

      // Stones
      this.stones = new Stones();
      this.stones.init(this);

      // Сharacters
      this.hero = new Hero();
      this.hero.init(this);

      /*
      // Horses
      this.horses = new Horses();
      this.horses.init(this);

      // Parrots
      this.parrots = new Parrots();
      this.parrots.init(this);
      */

      // Controls
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
      this.controls.getObject().position.y = this.height;

      this.scene.add(this.controls.getObject());

      // Ammo
      // eslint-disable-next-line max-len
      const ammoGeometry = new Three.SphereBufferGeometry(DESIGN.AMMO_RADIUS, 32, 32);
      // eslint-disable-next-line max-len
      const ammoMaterial = new Three.MeshStandardMaterial({ color: DESIGN.COLORS.primary0x, roughness: 0.8, metalness: 0.5 });
      const fakeAmmoMaterial = new Three.MeshStandardMaterial( { color: 0xff0000 } );

      this.audioLoader.load( './audio/drop.mp3', (buffer) => {
        let ammo;
        let fakeAmmo;
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < DESIGN.NUM_AMMO; i++) {
          ammo = new Three.Mesh(ammoGeometry, ammoMaterial);
          fakeAmmo = new Three.Mesh(ammoGeometry, fakeAmmoMaterial);
          ammo.scale.set(1, 1, 1);
          ammo.position.y = this.height - 0.2;

          const audio = new Three.PositionalAudio(this.listener);
          audio.setBuffer(buffer);
          audio.setVolume(DESIGN.VOLUME);
          audio.setLoop(false);

          fakeAmmo.add(audio);
          fakeAmmo.visible = false;
          fakeAmmo.matrixAutoUpdate = false;

          // ammo.castShadow = true;
          // ammo.receiveShadow = true;

          this.ammos.push({
            mesh: ammo,
            fakeMesh: fakeAmmo,
            collider: new Three.Sphere(new Three.Vector3(0, 0, 0), DESIGN.AMMO_RADIUS),
            velocity: new Three.Vector3(),
            onFly: false,
            onGround: false,
            scale: 1,
            off: false,
            isPlay: false,
          });
        }
        loaderDispatchHelper(this.$store, 'isDropComplete');
      });

      // Raycasters
      /* eslint-disable max-len */
      this.raycasterDown = new Three.Raycaster(new Three.Vector3(), new Three.Vector3(0, -1, 0), 0, 100);
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
        this.scene.add(ammo.fakeMesh);
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
        case 38: // Up
        case 87: // W
          if (!this.moveForward) this.moveForward = true;
          break;

        case 37: // Left
        case 65: // A
          if (!this.moveLeft) this.moveLeft = true;
          break;

        case 40: // Down
        case 83: // S
          if (!this.moveBackward) this.moveBackward = true;
          break;

        case 39: // Right
        case 68: // D
          if (!this.moveRight) this.moveRight = true;
          break;

        case 32: // Space
          if (!this.moveHidden && this.canJump) {
            this.velocity.y += DESIGN.HERO_JUMP_SPEED;
            this.canJump = false;
          }
          break;

        case 16: // Shift
          if (!this.moveHidden && this.moveForward) this.moveRun = true;
          break;
      }
    },

    onKeyUp(event) {
      // eslint-disable-next-line default-case
      switch (event.keyCode) {
        case 38: // Up
        case 87: // W
          if (this.moveForward) this.moveForward = false;
          break;

        case 37: // Left
        case 65: // A
          if (this.moveLeft) this.moveLeft = false;
          break;

        case 40: // Down
        case 83: // S
          if (this.moveBackward) this.moveBackward = false;
          break;

        case 39: // Right
        case 68: // D
          if (this.moveRight) this.moveRight = false;
          break;

        case 16: // Shift
          if (this.moveRun) this.moveRun = false;
          break;

        case 17: // Cntr
        case 18: // Alt
          this.moveHidden = !this.moveHidden;
          break;
      }
    },

    animate() {
      requestAnimationFrame(this.animate);

      // Зависнуть над сценой
      // this.controls.getObject().position.y = 1000;

      // console.log(this.renderer.info);
      // console.log(this.controls.getObject().position.x, this.controls.getObject().position.z);

      this.time = performance.now();
      this.delta = (this.time - this.prevTime) / 1000;

      this.waters.animate();

      this.hero.animate(this);

      /*
      this.horses.animate(delta, this.objects);
      this.parrots.animate(delta, this.objects);
      */

      if (this.controls.isLocked) {
        // Check objects

        // Forward
        this.directionForward = this.camera.getWorldDirection(this.direction);
        this.raycasterForward.set(this.camera.getWorldPosition(this.position), this.directionForward);
        this.intersections = this.raycasterForward.intersectObjects(this.objectsVerical);
        this.onForward = this.intersections.length > 0 ? this.intersections[0].distance < this.stopDistance : false;
        if (this.onForward) this.object = this.intersections[0].object;

        // Backward
        this.directionBackward = this.directionForward.negate();
        this.raycasterBackward.set(this.camera.getWorldPosition(this.position), this.directionBackward);
        this.intersections = this.raycasterBackward.intersectObjects(this.objectsVerical);
        this.onBackward = this.intersections.length > 0 ? this.intersections[0].distance < this.stopDistance : false;
        if (this.onBackward) this.object = this.intersections[0].object;

        // Right
        this.directionRight = new Three.Vector3(0, 0, 0).crossVectors(this.directionForward, this.y);
        this.raycasterRight.set(this.camera.getWorldPosition(this.position), this.directionRight);
        this.intersections = this.raycasterRight.intersectObjects(this.objectsVerical);
        this.onRight = this.intersections.length > 0 ? this.intersections[0].distance < this.stopDistance : false;
        if (this.onRight) this.object = this.intersections[0].object;

        // Left
        this.directionLeft = this.directionRight.negate();
        this.raycasterLeft.set(this.camera.getWorldPosition(this.position), this.directionLeft);
        this.intersections = this.raycasterLeft.intersectObjects(this.objectsVerical);
        this.onLeft = this.intersections.length > 0 ? this.intersections[0].distance < this.stopDistance : false;
        if (this.onLeft) this.object = this.intersections[0].object;

        this.collision = this.onForward || this.onBackward || this.onLeft || this.onRight;

        // Down Through
        this.directionDown = new Three.Vector3(0, 0, 0).crossVectors(this.x, this.z);
        this.raycasterDown.set(this.camera.getWorldPosition(this.position), this.directionDown);
        this.intersections = this.raycasterDown.intersectObjects(this.objectsGround);

        if (this.intersections.length > 0) {
          this.layersNew = [];
          this.intersections.forEach((intersection) => {
            if (!this.layersNew.includes(intersection.object.name)) this.layersNew.push(intersection.object.name);
          });
          if (this.layersNew.length !== this.layers.length) {
            // console.log(this.layers, this.layersNew);
            //  На любой воде
            if (((this.layersNew.includes(OBJECTS.OCEAN.name) &&
              !this.layersNew.includes(OBJECTS.BEACH.name)) ||
              this.layersNew.includes(OBJECTS.LAKES.name) ||
              this.layersNew.includes(OBJECTS.PUDDLES.name)) &&
              !this.layersNew.includes(OBJECTS.SANDS.name)) {
              this.inWater = true;
            } else this.inWater = false;

            // На большой воде
            if (
              ((this.layersNew.includes(OBJECTS.OCEAN.name) &&
                !this.layersNew.includes(OBJECTS.BEACH.name) &&
                !this.layersNew.includes(OBJECTS.SANDS.name)) ||
                (this.layersNew.includes(OBJECTS.LAKES.name) &&
                  !this.layersNew.includes(OBJECTS.SANDS.name)))
            ) {
              this.inLargeWater = true;
            } else this.inLargeWater = false;

            // На камне
            if (this.layersNew.includes(OBJECTS.STONES.name)) {
              this.object = this.intersections.filter(object => object.object.name === OBJECTS.STONES.name)[0].object;
              this.onObjectHeight = this.object.position.y + this.object.geometry.parameters.radius + this.height;
            } else this.onObjectHeight = 0;

            this.layers = this.layersNew;
          }
        }

        this.velocity.x -= this.velocity.x * 10 * this.delta;
        this.velocity.z -= this.velocity.z * 10 * this.delta;

        this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
        this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
        this.direction.normalize(); // this ensures consistent movements in all directions

        // eslint-disable-next-line max-len
        if (this.moveForward || this.moveBackward) this.velocity.z -= this.direction.z * DESIGN.HERO_SPEED * this.delta;
        // eslint-disable-next-line max-len
        if (this.moveLeft || this.moveRight) this.velocity.x -= this.direction.x * DESIGN.HERO_SPEED * this.delta;

        // Скорость движения в зависимости от режима
        if (this.moveHidden) {
          this.moveSpeed = 0.25;
        } else {
          if (this.moveRun) {
            if (this.inWater) {
              this.moveSpeed = 1.75;
            } else this.moveSpeed = 2.5;
          } else {
            if (this.inWater) {
              this.moveSpeed = 0.7;
            } else this.moveSpeed = 1;
          }
        }

        if (!this.collision) {
          this.controls.moveRight(-this.velocity.x * this.delta * this.moveSpeed);
          this.controls.moveForward(-this.velocity.z * this.delta * this.moveSpeed);
        } else {
          if ((this.onForward && this.moveForward) ||
              (this.onBackward && this.moveBackward) ||
              (this.onLeft && this.moveLeft) ||
              (this.onRight && this.moveRight)) {
            this.moveRun = false;
            this.velocity.z = 0;
            this.velocity.x = 0;
          } else {
            this.controls.moveRight(-this.velocity.x * this.delta * this.moveSpeed);
            this.controls.moveForward(-this.velocity.z * this.delta * this.moveSpeed);
          }
        }
      }

      this.velocity.y -= 9.8 * DESIGN.HERO_MASS * this.delta;

      this.controls.getObject().position.y += (this.velocity.y * this.delta);

      if (this.moveHidden || this.inLargeWater) {
        this.height = DESIGN.UNDER_FLOOR / 2;
      } else this.height = DESIGN.UNDER_FLOOR;

      if (this.controls.getObject().position.y < this.height + this.onObjectHeight) {
        this.velocity.y = 0;
        this.controls.getObject().position.y = this.height + this.onObjectHeight;
        this.canJump = true;
      }

      // Ammo
      this.ammos.forEach((ammo) => {
        if (ammo.onFly || ammo.onGround) {
          ammo.collider.center.addScaledVector(ammo.velocity, this.delta * 5);
          // eslint-disable-next-line no-param-reassign
          ammo.velocity.y -= DESIGN.AMMO_GRAVITY * this.delta;
          const damping = Math.exp(-1.5 * this.delta) - 1;
          ammo.velocity.addScaledVector(ammo.velocity, damping);
          ammo.mesh.position.copy(ammo.collider.center);

          if (ammo.mesh.position.y < 0) {
            ammo.mesh.position.y = 0;
            ammo.onFly = false;
            ammo.onGround = true;
          }
        }

        if (ammo.onGround) {
          if (!ammo.isPlay) {
            ammo.fakeMesh.position.set(ammo.mesh.position);
            ammo.fakeMesh.children[0].play();
            ammo.isPlay = true;
          }

          if (ammo.scale > 4) ammo.off = true;

          if (ammo.off) {
            ammo.scale -= this.delta * 2;
            ammo.mesh.scale.x = ammo.scale;
            ammo.mesh.scale.z = ammo.scale;

            if (ammo.scale < 0.5) {
              ammo.mesh.position.y = -1;
              ammo.onGround = false;
              ammo.false = true;
              ammo.off = false;
              ammo.scale = 1;
              ammo.mesh.scale.set(1, 1, 1);
              ammo.isPlay = false;
            }
          } else {
            ammo.scale += this.delta;
            ammo.mesh.scale.set(ammo.scale, 1 / ammo.scale, ammo.scale);
          }
        }
      });

      this.prevTime = this.time;

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
