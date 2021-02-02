<template>
  <div
    id="scene"
    class="scene"
  />
</template>

<script>
/* eslint-disable no-use-before-define, import/first, import/order */
import * as Three from 'three';

import { mapActions, mapGetters } from 'vuex';

// Controls
import { PointerLockControls } from '@/components/Three/Modules/Controls/PointerLockControls';
import { OrbitControls } from '@/components/Three/Modules/Controls/OrbitControls';

// Postprocessing
import { EffectComposer } from '@/components/Three/Modules/Postprocessing/EffectComposer';
import { RenderPass } from '@/components/Three/Modules/Postprocessing/RenderPass';
import { FilmPass } from '@/components/Three/Modules/Postprocessing/FilmPass';

// Stats
import Stats from '@/components/Three/Modules/Utils/Stats';

import { DESIGN, OBJECTS } from '@/utils/constants';

import Atmosphere from './Atmosphere';
import Grass from './Grass';
import Waters from './Waters';
import Sands from './Sands';
import Stones from './Stones';
import Plants from './Plants';
import Hero from './Hero';
import Ammo from './Ammo';
// import Boxes from './Boxes';
// import Horses from './Horses';
// import Parrots from './Parrots';

export default {
  name: 'Scene',

  data() {
    return {
      renderer: null,
      composer: null,

      scene: null,

      camera: null,
      cameraDrone: null,

      controls: null,
      mainControls: null,
      droneControls: null,
      jsonLoader: null,
      robot: null,

      stats: null,

      prevTime: null,
      velocity: null,
      direction: null,
      directionStore: null,
      position: null,

      moveForward: false,
      moveBackward: false,
      moveLeft: false,
      moveRight: false,
      moveRun: false,
      moveHidden: false,
      canJump: true,

      raycasterDown: null,
      raycasterForward: null,
      raycasterBackward: null,
      raycasterRight: null,
      raycasterLeft: null,
      mouse: null,

      x: null,
      y: null,
      z: null,

      directionUp: null,
      directionDown: null,
      directionForward: null,
      directionBackward: null,
      directionRight: null,
      directionLeft: null,

      object: null,
      onObjectHeight: 0,
      onUp: null,
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

      objectsGround: [], // все объекты для вертикального рейкастинга
      objectsVertical: [], // все объекты с которыми сталкивается горизонтально
      objectsPuddles: [], // все лужи
      objectsStoneData: [], // все камни и горы
      atmosphere: null,
      grass: null,
      plants: null,
      waters: null,
      sands: null,
      stones: null,
      hero: null,
      // horses: null,
      // parrots: null,

      ammos: [],
      ammoIdx: 0,
    };
  },

  mounted() {
    this.prevTime = performance.now();
    this.velocity = new Three.Vector3();
    this.direction = new Three.Vector3();
    this.directionStore = new Three.Vector3(-0.7071067758832469, 0, -0.7071067864898483);
    this.position = new Three.Vector3();
    this.mouse = new Three.Vector2();
    this.x = new Three.Vector3(1, 0, 0);
    this.y = new Three.Vector3(0, -1, 0);
    this.z = new Three.Vector3(0, 0, 1);

    this.init();
    this.animate();
  },

  created() {
    this.$eventHub.$on('lock', this.lock);
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.onWindowResize, false);
    document.removeEventListener('keydown', this.onKeyDown, false);
    document.removeEventListener('keyup', this.onKeyUp, false);
    document.removeEventListener('mousemove', this.onMouseMove, false);

    if (this.$eventHub._events['lock']) this.$eventHub.$off('lock');
  },

  computed: {
    ...mapGetters({
      isPause: 'layout/isPause',
      isDrone: 'layout/isDrone',
    }),
  },

  methods: {
    ...mapActions({
      togglePause: 'layout/togglePause',
      toggleDrone: 'layout/toggleDrone',
    }),

    init() {
      // Container
      const container = document.getElementById('scene');

      // Renderer

      this.renderer = new Three.WebGLRenderer({ antialias: true });
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(container.clientWidth, container.clientHeight);

      container.appendChild(this.renderer.domElement);

      // Scene

      this.scene = new Three.Scene();
      this.scene.background = new Three.Color(0x4542a0);
      this.scene.fog = new Three.Fog(0x615ebc, DESIGN.GROUND_SIZE / 10, DESIGN.GROUND_SIZE / 2);

      // Cameras

      // eslint-disable-next-line max-len
      this.camera = new Three.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 1, DESIGN.GROUND_SIZE);
      this.cameraDrone = this.camera.clone();

      // Controls

      // With Drone

      this.droneControls = new OrbitControls(this.cameraDrone, this.renderer.domElement);
      this.droneControls.addEventListener('change', this.render);

      // In First Person

      this.mainControls = new PointerLockControls(this.camera, this.renderer.domElement);

      this.mainControls.addEventListener('unlock', () => {
        if (!this.isDrone) {
          this.directionStore = this.camera.getWorldDirection(this.direction);
          this.togglePause(true);
        }
      });

      this.mainControls.addEventListener('lock', () => {
        if (!this.isDrone) this.togglePause(false);
      });

      this.setInFirstPersonControls();

      this.scene.add(this.camera);
      // console.log(this.camera.position.x, this.camera.position.y, this.camera.position.z);

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

      // Ground
      this.grass = new Grass();
      this.grass.init(this);

      // Stones
      this.stones = new Stones();
      this.stones.init(this);

      // Plants
      this.plants = new Plants();
      this.plants.init(this);

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

      // Ammo
      this.ammo = new Ammo();
      this.ammo.init(this);

      // Raycasters
      /* eslint-disable max-len */
      this.raycasterUp = new Three.Raycaster(new Three.Vector3(), new Three.Vector3(0, 1, 0), 0, 40);
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

      // Postprocessing
      const renderModel = new RenderPass(this.scene, this.cameraDrone);
      const effectFilm = new FilmPass(0.35, 0.75, 2048, false);

      this.composer = new EffectComposer(this.renderer);

      this.composer.addPass(renderModel);
      this.composer.addPass(effectFilm);

      // Stats
      this.stats = new Stats();
      container.appendChild(this.stats.dom);

      // First render
      this.render();
    },

    setInFirstPersonControls() {
      // Controls
      this.controls = this.mainControls;

      // Переместиться в точку
      // this.controls.getObject().position.x = -1200;
      // this.controls.getObject().position.z = -300;
      this.controls.getObject().position.y = this.height;

      this.camera.lookAt(this.directionStore.multiplyScalar(1000));

      this.scene.add(this.controls.getObject());
    },

    setWithDroneControl() {
      this.directionStore = this.camera.getWorldDirection(this.direction);

      this.controls = this.droneControls;
      this.controls.target.set(this.robot.position.x, this.robot.position.y, this.robot.position.z);
      this.cameraDrone.position.y = OBJECTS.DRONE.startY;
      this.controls.update();
    },

    lock() {
      if (!this.isDrone) this.controls.lock();
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

        case 16: // Shift
          if (!this.moveHidden && this.moveForward) this.moveRun = true;
          break;

        case 67: // C
        case 18: // Alt
          this.moveHidden = !this.moveHidden;
          break;

        case 9: // TAB
          event.preventDefault();
          event.stopPropagation();
          if (!this.isPause) this.toggleDrone(!this.isDrone);
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

        case 32: // Space
          if (!this.moveHidden && this.canJump) {
            this.velocity.y += DESIGN.HERO_JUMP_SPEED;
            this.canJump = false;
          }
          break;

        // case 27: // Esc
        case 80: // P
          if (!this.isDrone) {
            if (this.isPause) {
              this.controls.lock();
            } else this.controls.unlock();
          } else {
            this.togglePause(!this.isPause);
          }
          break;
      }
    },

    animate() {
      requestAnimationFrame(this.animate);

      this.time = performance.now();
      this.delta = (this.time - this.prevTime) / 1000;

      if (!this.isPause && !this.isDrone) {
        // Зависнуть над сценой
        // this.controls.getObject().position.y = 1000;

        // console.log(this.renderer.info);
        // console.log(this.controls.getObject().position.x, this.controls.getObject().position.z);

        // Waters
        this.waters.animate();

        // Hero
        this.hero.animate(this);

        // Atmosphere
        this.atmosphere.animate(this);

        // Ammo
        this.ammo.animate(this);

        /*
        this.horses.animate(delta, this.objects);
        this.parrots.animate(delta, this.objects);
        */

        // Check objects

        // Forward
        this.directionForward = this.camera.getWorldDirection(this.direction);
        this.raycasterForward.set(this.camera.getWorldPosition(this.position), this.directionForward);
        this.intersections = this.raycasterForward.intersectObjects(this.objectsVertical);
        this.onForward = this.intersections.length > 0 ? this.intersections[0].distance < this.stopDistance : false;
        if (this.onForward) this.object = this.intersections[0].object;

        // Backward
        this.directionBackward = this.directionForward.negate();
        this.raycasterBackward.set(this.camera.getWorldPosition(this.position), this.directionBackward);
        this.intersections = this.raycasterBackward.intersectObjects(this.objectsVertical);
        this.onBackward = this.intersections.length > 0 ? this.intersections[0].distance < this.stopDistance : false;
        if (this.onBackward) this.object = this.intersections[0].object;

        // Right
        this.directionRight = new Three.Vector3(0, 0, 0).crossVectors(this.directionForward, this.y);
        this.raycasterRight.set(this.camera.getWorldPosition(this.position), this.directionRight);
        this.intersections = this.raycasterRight.intersectObjects(this.objectsVertical);
        this.onRight = this.intersections.length > 0 ? this.intersections[0].distance < this.stopDistance : false;
        if (this.onRight) this.object = this.intersections[0].object;

        // Left
        this.directionLeft = this.directionRight.negate();
        this.raycasterLeft.set(this.camera.getWorldPosition(this.position), this.directionLeft);
        this.intersections = this.raycasterLeft.intersectObjects(this.objectsVertical);
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

        // Up
        this.directionUp = this.directionDown.negate();
        this.raycasterUp.set(this.camera.getWorldPosition(this.position), this.directionUp);
        this.intersections = this.raycasterUp.intersectObjects(this.objectsVertical);
        this.onUp = this.intersections.length > 0;
        if (this.onUp) this.object = this.intersections[0].object;

        // В камне!! ((((
        if (this.object
            && this.object.name !== OBJECTS.MOUNTAINS.name
            && (this.onUp || (this.onForward && this.onBackward && this.onLeft && this.onRight))) {
          this.onObjectHeight = this.object.position.y + this.object.geometry.parameters.radius + this.height;
        } else if (this.object
          && this.object.name === OBJECTS.MOUNTAINS.name
          && (this.onUp || (this.onForward && this.onBackward && this.onLeft && this.onRight))) {
          this.controls.moveRight(this.velocity.x * this.delta * 5);
          this.controls.moveForward(this.velocity.z * this.delta * 5);
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

        // Прыжок в гору!!
        if (this.collision && !this.canJump && this.object && this.object.name === OBJECTS.MOUNTAINS.name) {
          if ((this.onForward && this.moveForward) ||
            (this.onBackward && this.moveBackward) ||
            (this.onLeft && this.moveLeft) ||
            (this.onRight && this.moveRight)) {
            this.controls.moveRight(this.velocity.x * this.delta * 5);
            this.controls.moveForward(this.velocity.z * this.delta * 5);
            this.velocity.z = 0;
            this.velocity.x = 0;
          }
        } else if (!this.collision) {
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
      } else {
        this.atmosphere.stop();
        this.hero.stop();
      }

      if (!this.isPause && this.isDrone) {
        this.hero.animateDrone(this);
      } else {
        this.hero.stopDrone(this);
      }

      this.prevTime = this.time;

      if (!this.isPause) this.render();

      this.stats.update();
    },

    onWindowResize() {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      if (!this.isDrone) this.renderer.setSize(window.innerWidth, window.innerHeight);
      else this.composer.setSize(window.innerWidth, window.innerHeight);
    },

    render() {
      if (!this.isDrone) this.renderer.render(this.scene, this.camera);
      else this.composer.render();
    },
  },

  watch: {
    isDrone(value) {
      if (value) {
        // Переключаем на дрон

        this.robot.position.copy(this.controls.getObject().position);

        // Down Through
        this.directionDown = new Three.Vector3(0, 0, 0).crossVectors(this.x, this.z);
        this.raycasterDown.set(this.camera.getWorldPosition(this.position), this.directionDown);
        this.intersections = this.raycasterDown.intersectObjects(this.objectsGround);
        if (this.intersections.length > 0) this.robot.position.y = this.intersections[0].point.y;

        this.controls.unlock();

        this.robot.visible = true;

        // Controls
        this.setWithDroneControl();

        this.render();
      } else {
        // Переключаем на вид от первого лица

        this.robot.visible = false;

        // Controls
        this.setInFirstPersonControls();
        this.controls.getObject().position.y = this.height + this.onObjectHeight;
        this.controls.lock();
      }
    },
  },
};
</script>

<style scoped>
.scene {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
}
</style>
