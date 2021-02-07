<template>
  <div
    id="scene"
    class="scene"
  />
</template>

<script>
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
import { messagesDispatchHelper } from '@/utils/utilities';

import Atmosphere from './Atmosphere';
import Grass from './Grass';
import Waters from './Waters';
import Sands from './Sands';
import Stones from './Stones';
import Trees from './Trees';
import Things from './Things';
import Hero from './Hero';
import Ammo from './Ammo';
import Horses from './Horses';
import Parrots from './Parrots';
// import Boxes from './Boxes';

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
      // mouse: null,

      clock: null,
      delta: null,

      listener: null,

      stats: null,

      velocity: null,
      direction: null,
      startDirection: null,
      directionStore: null,
      isDroneStart: false,
      position: null,

      x: null,
      y: null,
      z: null,

      moveSpeed: null,
      moveForward: false,
      moveBackward: false,
      moveLeft: false,
      moveRight: false,
      moveRun: false,
      moveHidden: false,
      canJump: true,

      raycasterUp: null,
      raycasterDown: null,
      raycasterForward: null,
      raycasterBackward: null,
      raycasterRight: null,
      raycasterLeft: null,

      directionUp: null,
      directionDown: null,
      directionForward: null,
      directionBackward: null,
      directionLeft: null,
      directionRight: null,

      intersections: null,
      layers: [],
      layersNew: [],
      object: null,
      thing: null,
      collision: null,
      height: DESIGN.HERO.height,
      onObjectHeight: 0,

      onUp: null,
      onForward: null,
      onBackward: null,
      onLeft: null,
      onRight: null,
      onLargeWater: null,

      objectsGround: [], // все объекты для вертикального рейкастинга
      objectsVertical: [], // все объекты с которыми сталкивается горизонтально
      objectsThings: [], // все псевдовещи
      objectsPuddles: [], // все лужи
      objectsStoneData: [], // все камни и горы - данные - [x, z, r]
      objectsWaterData: [], // все озера и лужи - данные - [x, z, r]
      objectsTreesData: [], // все деревья - данные - [x, z]

      atmosphere: null,
      grass: null,
      trees: null,
      things: null,
      waters: null,
      sands: null,
      stones: null,
      hero: null,
      robot: null,
      weapon: null,
      horses: null,
      parrots: null,
    };
  },

  mounted() {
    this.velocity = new Three.Vector3();
    this.direction = new Three.Vector3();
    this.startDirection = new Three.Vector3(-0.7071067758832469, 0, -0.7071067864898483);
    this.directionStore = this.startDirection;
    this.position = new Three.Vector3();
    this.x = new Three.Vector3(1, 0, 0);
    this.y = new Three.Vector3(0, -1, 0);
    this.z = new Three.Vector3(0, 0, 1);
    // this.mouse = new Three.Vector2();

    this.listener = new Three.AudioListener();

    this.clock = new Three.Clock();

    this.init();
    this.animate();
  },

  created() {
    this.$eventHub.$on('lock', this.lock);
    this.$eventHub.$on('reload', this.reload);
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.onWindowResize, false);
    document.removeEventListener('keydown', this.onKeyDown, false);
    document.removeEventListener('keyup', this.onKeyUp, false);
    // document.removeEventListener('mousemove', this.onMouseMove, false);

    if (this.$eventHub._events.lock) this.$eventHub.$off('lock');
    if (this.$eventHub._events.lock) this.$eventHub.$off('reload');
  },

  computed: {
    ...mapGetters({
      isPause: 'layout/isPause',
      isDrone: 'layout/isDrone',
      messages: 'layout/messages',
      message: 'layout/message',
      isGameOver: 'layout/isGameOver',

      endurance: 'hero/endurance',
      ammo: 'hero/ammo',

      anemone: 'hero/anemone',
      crocus: 'hero/crocus',
      daffodil: 'hero/daffodil',
      tulip: 'hero/tulip',

      isHeroOnWater: 'hero/isHeroOnWater',
      isHeroTired: 'hero/isHeroTired',
      isNotDamaged: 'hero/isNotDamaged',
      isNotTired: 'hero/isNotTired',
    }),

    heroOnWater: {
      get() {
        return this.isHeroOnWater;
      },
      set(value) {
        this.setHeroOnWater(value);
      }
    },

    isKeysLock() {
      return this.isPause || this.isDrone;
    },
  },

  methods: {
    ...mapActions({
      togglePause: 'layout/togglePause',
      toggleDrone: 'layout/toggleDrone',
      showMessage: 'layout/showMessage',
      hideMessageByView: 'layout/hideMessageByView',

      setHeroOnWater: 'hero/setHeroOnWater',
      setScale: 'hero/setScale',
      setNotDamaged: 'hero/setNotDamaged',
      setNotTired: 'hero/setNotTired',

      preloaderReload: 'preloader/preloaderReload',
      layoutReload: 'layout/layoutReload',
      heroReload: 'hero/heroReload',
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

      this.camera = new Three.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 1, DESIGN.GROUND_SIZE);
      this.cameraDrone = this.camera.clone();

      // Audio listener
      this.camera.add(this.listener);

      // Controls

      // With Drone

      this.droneControls = new OrbitControls(this.cameraDrone, this.renderer.domElement);
      this.droneControls.addEventListener('change', this.render);

      // In First Person

      this.mainControls = new PointerLockControls(this.camera, this.renderer.domElement);

      this.mainControls.addEventListener('unlock', () => {
        if (!this.isDrone && !this.isGameOver) {
          this.directionStore = this.camera.getWorldDirection(this.direction);
          this.togglePause(true);
        }
      });

      this.mainControls.addEventListener('lock', () => {
        if (!this.isDrone) this.togglePause(false);
      });

      this.setInFirstPersonControls();

      this.scene.add(this.controls.getObject());

      this.scene.add(this.camera);

      // Atmosphere
      this.atmosphere = new Atmosphere();
      this.atmosphere.init(this);

      // Hero
      this.hero = new Hero();
      this.hero.init(this);

      // Weapon
      this.weapon = new Ammo();
      this.weapon.init(this);

      // Built random world
      this.build();

      // Raycasters
      this.raycasterUp = new Three.Raycaster(new Three.Vector3(), new Three.Vector3(0, 1, 0), 0, 100);
      this.raycasterDown = new Three.Raycaster(new Three.Vector3(), new Three.Vector3(0, -1, 0), 0, 100);
      this.raycasterForward = new Three.Raycaster(new Three.Vector3(), new Three.Vector3(0, 0, -1), 0, 10);
      this.raycasterBackward = new Three.Raycaster(new Three.Vector3(), new Three.Vector3(0, 0, 1), 0, 10);
      this.raycasterLeft = new Three.Raycaster(new Three.Vector3(), new Three.Vector3(-1, 0, 0), 0, 10);
      this.raycasterRight = new Three.Raycaster(new Three.Vector3(), new Three.Vector3(-1, 0, 0), 0, 10);

      // Listeners
      window.addEventListener('resize', this.onWindowResize, false);
      document.addEventListener('keydown', this.onKeyDown, false);
      document.addEventListener('keyup', this.onKeyUp, false);
      // document.addEventListener('mousemove', this.onMouseMove, false);

      // Postprocessing
      const renderModel = new RenderPass(this.scene, this.cameraDrone);
      const effectFilm = new FilmPass(1, 2, 1024, false);

      this.composer = new EffectComposer(this.renderer);

      this.composer.addPass(renderModel);
      this.composer.addPass(effectFilm);

      // Stats
      this.stats = new Stats();
      container.appendChild(this.stats.dom);

      // First render
      this.render();
    },

    build() {
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

      // Trees
      this.trees = new Trees();
      this.trees.init(this);

      // Things
      this.things = new Things();
      this.things.init(this);

      // Enemies
      this.horses = new Horses();
      this.horses.init(this);

      this.parrots = new Parrots();
      this.parrots.init(this);
    },

    reload() {
      this.preloaderReload();
      this.layoutReload();
      this.heroReload();

      this.build();

      this.directionStore.copy(this.startDirection);
      this.controls.getObject().position.x = 0;
      this.controls.getObject().position.z = 0;

      this.setInFirstPersonControls();
    },

    setInFirstPersonControls() {
      // Controls
      this.controls = this.mainControls;

      // Переместиться в точку
      // this.controls.getObject().position.x = -1200;
      // this.controls.getObject().position.z = -300;
      this.controls.getObject().position.y = this.height + this.onObjectHeight;

      // this.camera.lookAt(this.directionStore.multiplyScalar(1000));
    },

    setWithDroneControl() {
      this.directionStore = this.camera.getWorldDirection(this.direction);

      this.controls = this.droneControls;
      this.controls.target.set(this.robot.position.x, this.robot.position.y, this.robot.position.z);
      if (!this.isDroneStart) {
        this.cameraDrone.position.y = OBJECTS.DRONE.startY;
        this.isDroneStart = true;
      }

      this.controls.update();
    },

    lock() {
      if (!this.isDrone) this.controls.lock();
    },

    onMouseMove(event) {
      // calculate mouse position in normalized device coordinates
      // (-1 to +1) for both components
      // this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      // this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    },

    onKeyDown(event) {
      switch (event.keyCode) {
        case 38: // Up
        case 87: // W
          if (!this.isKeysLock && !this.moveForward) this.moveForward = true;
          break;

        case 37: // Left
        case 65: // A
          if (!this.isKeysLock && !this.moveLeft) this.moveLeft = true;
          break;

        case 40: // Down
        case 83: // S
          if (!this.isKeysLock && !this.moveBackward) this.moveBackward = true;
          break;

        case 39: // Right
        case 68: // D
          if (!this.isKeysLock && !this.moveRight) this.moveRight = true;
          break;

        case 16: // Shift
          if (!this.isKeysLock && !this.moveHidden && this.moveForward && !this.isHeroTired) this.moveRun = true;
          break;

        case 69: // E
          if (!this.isKeysLock && this.thing) this.things.pick(this, this.thing);
          break;

        case 49: // 1
          if (!this.isKeysLock && this.anemone > 0) {
            this.setScale({
              field: DESIGN.HERO.scales.health.name,
              value: DESIGN.EFFECTS.anemone.health
            });
            this.setNotTired(true);
            messagesDispatchHelper(this, 'startNoTired');
          }
          break;

        case 50: // 2
          if (!this.isKeysLock && this.crocus > 0) {
            this.setScale({ field: DESIGN.HERO.scales.health.name, value: DESIGN.EFFECTS.crocus.health });
            this.setScale({ field: DESIGN.HERO.scales.power.name, value: DESIGN.EFFECTS.crocus.power });
          }
          break;

        case 51: // 3
          if (!this.isKeysLock && this.daffodil > 0) {
            this.setScale({ field: DESIGN.HERO.scales.health.name, value: DESIGN.EFFECTS.daffodil.health });
            this.setNotDamaged(true);
            messagesDispatchHelper(this, 'startNoDamaged');
          }
          break;

        case 52: // 4
          if (!this.isKeysLock && this.tulip > 0) {
            this.setScale({ field: DESIGN.HERO.scales.health.name, value: DESIGN.EFFECTS.tulip.health });
          }
          break;

        case 9: // TAB
          event.preventDefault();
          event.stopPropagation();
          if (!this.isPause) this.toggleDrone(!this.isDrone);
          break;
      }
    },

    onKeyUp(event) {
      switch (event.keyCode) {
        case 38: // Up
        case 87: // W
          if (!this.isKeysLock && this.moveForward) this.moveForward = false;
          break;

        case 37: // Left
        case 65: // A
          if (!this.isKeysLock && this.moveLeft) this.moveLeft = false;
          break;

        case 40: // Down
        case 83: // S
          if (!this.isKeysLock && this.moveBackward) this.moveBackward = false;
          break;

        case 39: // Right
        case 68: // D
          if (!this.isKeysLock && this.moveRight) this.moveRight = false;
          break;

        case 16: // Shift
          if (!this.isKeysLock && this.moveRun && this.moveRun) this.moveRun = false;
          break;

        case 67: // C
        case 18: // Alt
          if (!this.isKeysLock) {
            this.moveHidden = !this.moveHidden;
            if (this.moveRun) this.moveRun = false;
          }
          break;

        case 32: // Space
          if (!this.isKeysLock && !this.moveHidden && this.canJump) {
            this.velocity.y += DESIGN.HERO.jumpspeed;
            this.canJump = false;
          }
          break;

        case 80: // P
          if (!this.isDrone) {
            if (this.isPause) {
              this.controls.lock();
            } else this.controls.unlock();
          } else {
            this.togglePause(!this.isPause);
          }
          break;

        case 27: // Ecs
          if (this.isDrone) this.togglePause(!this.isPause);
          break;
      }
    },

    animate() {
      requestAnimationFrame(this.animate);

      this.delta = this.clock.getDelta();

      if (!this.isKeysLock && !this.isGameOver) {
        // Зависнуть над сценой (+ отключи Притяжение в Hero.js)
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
        this.weapon.animate(this);

        // Enemies
        this.horses.animate(this);

        this.parrots.animate(this);
      } else {
        this.atmosphere.stop();
        this.hero.stop();
        this.horses.stop();
        this.parrots.stop();
      }

      if (!this.isPause && this.isDrone) {
        this.hero.animateDrone(this);
      } else {
        this.hero.stopDrone(this);
      }

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
    isHeroTired(value) {
      if (value && this.moveRun) this.moveRun = false;
    },

    isDrone(value) {
      if (value) {
        // Переключаем на дрон

        this.robot.position.copy(this.controls.getObject().position);

        // Ставим робота точно на камни по высоте
        this.directionDown = new Three.Vector3(0, 0, 0).crossVectors(this.x, this.z);
        this.raycasterDown.set(this.camera.getWorldPosition(this.position), this.directionDown);
        this.intersections = this.raycasterDown.intersectObjects(this.objectsGround);
        if (this.intersections.length > 0) this.robot.position.y = this.intersections[0].point.y;

        this.controls.unlock();

        this.robot.visible = true;

        this.things.toggle(this);

        // Controls
        this.setWithDroneControl();

        this.render();
      } else {
        // Переключаем на вид от первого лица

        this.robot.visible = false;

        this.things.toggle(this);

        // Controls
        this.setInFirstPersonControls();

        this.controls.lock();
      }
    },

    isGameOver(value) {
      if (value) this.controls.unlock();
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
