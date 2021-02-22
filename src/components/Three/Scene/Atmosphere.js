import * as Three from 'three';

import { Sky } from '@/components/Three/Modules/Elements/Sky';

import { DESIGN, OBJECTS } from '@/utils/constants';
import {
  loaderDispatchHelper,
  distance2D,
  messagesByViewDispatchHelper,
  messagesByIdDispatchHelper,
} from '@/utils/utilities';

function Atmosphere() {
  const audioLoader = new Three.AudioLoader();
  let audio;

  let ocean;
  let wind;

  let x;
  let z;
  let newX;
  let newZ;

  let moveHiddenStore;
  let liveEnemies;
  let isBeside = false;
  let isBesideNew;
  let px;
  let pz;

  let oceanVolume = 0;

  let onFloor = 0;
  let windVolume = 0;

  const geometry = new Three.SphereBufferGeometry(1, 1, 1);
  const material = new Three.MeshStandardMaterial({ color: 0xff0000 });

  let isStart = false;

  this.init = (scope) => {
    const sun = new Three.Vector3();
    const sky = new Sky();
    sky.scale.setScalar(450000);
    scope.scene.add(sky);

    const effectController = {
      turbidity: 2,
      rayleigh: 1,
      mieCoefficient: 0.07,
      mieDirectionalG: 0.9,
      inclination: 0.45, // elevation / inclination
      azimuth: 0.25, // Facing front,
      exposure: scope.renderer.toneMappingExposure,
    };

    const { uniforms } = sky.material;
    /* eslint-disable dot-notation */
    uniforms['turbidity'].value = effectController.turbidity;
    uniforms['rayleigh'].value = effectController.rayleigh;
    uniforms['mieCoefficient'].value = effectController.mieCoefficient;
    uniforms['mieDirectionalG'].value = effectController.mieDirectionalG;
    /* eslint-enable dot-notation */

    const theta = Math.PI * (effectController.inclination - 0.5);
    const phi = 2 * Math.PI * (effectController.azimuth - 0.5);

    sun.x = Math.cos(phi);
    sun.y = Math.sin(phi) * Math.sin(theta);
    sun.z = Math.sin(phi) * Math.cos(theta);

    uniforms['sunPosition'].value.copy(sun);

    scope.renderer.outputEncoding = Three.sRGBEncoding;
    scope.renderer.toneMapping = Three.ACESFilmicToneMapping;
    scope.renderer.toneMappingExposure = 0.5;
    scope.renderer.toneMappingExposure = effectController.exposure;

    // scope.renderer.shadowMap.enabled = true;

    // Light

    // Hemisphere

    const light = new Three.HemisphereLight(0x6699ff, 0x295826, 1);
    light.position.set(0, DESIGN.GROUND_SIZE * 2, 0).normalize();
    scope.scene.add(light);

    // Ambient
    scope.scene.add(new Three.AmbientLight(0x331111));

    // Directional

    // const dirLight = new Three.DirectionalLight(0xf9d71c, 1);
    // dirLight.position.set(0, DESIGN.GROUND_SIZE, 0);
    // scene.add(dirLight);

    // dirLight.castShadow = true;
    // dirLight.shadowDarkness = 1;

    // dirLight.shadow.mapSize.width = 2048;
    // dirLight.shadow.mapSize.height = 2048;

    // const d = 1000;

    // dirLight.shadow.camera.left = -d;
    // dirLight.shadow.camera.right = d;
    // dirLight.shadow.camera.top = d;
    // dirLight.shadow.camera.bottom = -d;

    // dirLight.shadow.camera.far = DESIGN.GROUND_SIZE;
    // dirLight.shadow.bias = -0.0001;

    // const dirLightHelper = new Three.DirectionalLightHelper( dirLight, 10 );
    // scope.scene.add( dirLightHelper );

    ocean = new Three.Mesh(geometry, material);

    audioLoader.load('./audio/ocean.mp3', (buffer) => {
      loaderDispatchHelper(scope.$store, 'isOceanComplete');

      audio = new Three.Audio(scope.listener);
      audio.setBuffer(buffer);
      audio.setVolume(oceanVolume);
      audio.setLoop(true);

      ocean.add(audio);
      ocean.visible = false;

      ocean.updateMatrix();
      ocean.matrixAutoUpdate = false;

      scope.scene.add(ocean);
    });

    x = scope.controls.getObject().position.x;
    z = scope.controls.getObject().position.z;

    wind = new Three.Mesh(geometry, material);

    audioLoader.load('./audio/wind.mp3', (buffer) => {
      loaderDispatchHelper(scope.$store, 'isWindComplete');

      audio = new Three.Audio(scope.listener);
      audio.setBuffer(buffer);
      audio.setVolume(DESIGN.VOLUME.wind);
      audio.setLoop(true);

      wind.add(audio);
      wind.visible = false;

      wind.updateMatrix();
      wind.matrixAutoUpdate = false;

      scope.scene.add(wind);
    });
  };

  // Обнаружение врагами
  const checkEnemies = (scope, x, z) => {
    liveEnemies = scope.objectsEnemies.filter(enemy => enemy.mode !== DESIGN.ENEMIES.mode.drunk || enemy.mode !== DESIGN.ENEMIES.mode.thing);

    isBesideNew = false;
    liveEnemies.forEach((enemy) => {
      px = enemy.pseudoMesh.position.x;
      pz = enemy.pseudoMesh.position.z;

      // 250 метров - предупреждении что рядом враги или никого!
      if (distance2D(px, pz, x, z) < DESIGN.checkDistance * 5 && !isBesideNew) isBesideNew = true;

      // 200 метров - напуганных врагов попускает
      if (distance2D(px, pz, x, z) > DESIGN.checkDistance * 4 && enemy.mode === DESIGN.ENEMIES.mode.active) enemy.mode = DESIGN.ENEMIES.mode.idle;

      // 150 метров - если скрытое передвижение не включено - пугает врага, 100 если включено!
      if ((distance2D(px, pz, x, z) < DESIGN.checkDistance * 3 && !scope.moveHidden && enemy.mode === DESIGN.ENEMIES.mode.idle) ||
        (distance2D(px, pz, x, z) < DESIGN.checkDistance * 2 && scope.moveHidden && enemy.mode === DESIGN.ENEMIES.mode.idle)) {
        enemy.mode = DESIGN.ENEMIES.mode.active;
        messagesByIdDispatchHelper(scope, 5, 'discovered', enemy.pseudoMesh.name);
      }
    });

    if (isBeside !== isBesideNew) {
      if (isBesideNew) messagesByIdDispatchHelper(scope, 5, 'enemiesBeside');
      else messagesByIdDispatchHelper(scope, 5, 'notEnemiesBeside');
      isBeside = isBesideNew;
    }
  };

  // Громкость шума океана
  const setOceanVolume = (x, y) => {
    let oceanVolume = distance2D(0, 0, x, y) / OBJECTS.BEACH.size;
    if (oceanVolume > 1) oceanVolume = 1;
    else if (oceanVolume < 0) oceanVolume = 0;

    if (ocean && ocean.children[0] && ocean.children[0]) ocean.children[0].setVolume(oceanVolume);
  };

  this.animate = (scope) => {
    if (!scope.isPause && !scope.isDrone) {
      newX = scope.controls.getObject().position.x;
      newZ = scope.controls.getObject().position.z;

      if (ocean && ocean.children[0] && !ocean.children[0].isPlaying) ocean.children[0].play();

      // Громкость ветра

      if (scope.onObjectHeight !== onFloor) {
        if (onFloor !== 0) wind.children[0].setVolume(DESIGN.VOLUME.wind);
        else {
          windVolume = (scope.onObjectHeight / OBJECTS.STONES.largeMax * DESIGN.VOLUME.wind * 2) + DESIGN.VOLUME.wind;
          if (windVolume > 1) windVolume = 1;
          else if (windVolume < DESIGN.VOLUME.wind) windVolume = DESIGN.VOLUME.wind;

          if (wind && wind.children[0] && wind.children[0]) wind.children[0].setVolume(DESIGN.VOLUME.wind * 3);
        }

        onFloor = scope.onObjectHeight;
      }

      if (wind && wind.children[0] && !wind.children[0].isPlaying) wind.children[0].play();

      // Проверки привязанные к позиции персонажа в мире

      if (!isStart) {
        setOceanVolume(newX, newZ);
        messagesByViewDispatchHelper(scope, 3, 'start');
        checkEnemies(scope, newX, newZ);
        isStart = true;
      }

      if (Math.abs(x - newX) > DESIGN.checkDistance || Math.abs(z - newZ) > DESIGN.checkDistance) {

        setOceanVolume(newX, newZ);

        // Утопление
        if (distance2D(0, 0, newX, newZ) > DESIGN.GROUND_SIZE * 0.75 && scope.heroOnWater) messagesByViewDispatchHelper(scope, 4, 'ocean');
        else scope.hideMessageByView(4);

        if (distance2D(0, 0, newX, newZ) > DESIGN.GROUND_SIZE * 0.85 && scope.heroOnWater)
          scope.setGameOver(true);

        // Стартовая позиция
        if (distance2D(DESIGN.HERO.start[0], DESIGN.HERO.start[1], newX, newZ) < OBJECTS.SANDS.position[0][2]) {
          scope.isOnStart = true;
          if (scope.details !== OBJECTS.ROBOTS.quantity) messagesByViewDispatchHelper(scope, 3, 'start');
          else {
            scope.hideMessageByView(6);

            setTimeout(() => {
              scope.setWin(true);
              scope.setGameOver(true);
            }, DESIGN.MESSAGES_TIMEOUT);
          }
        } else {
          scope.isOnStart = false;
          scope.hideMessageByView(3);
        }

        checkEnemies(scope, newX, newZ);

        x = newX;
        z = newZ;
      }

      if (moveHiddenStore !== scope.moveHidden) {
        checkEnemies(scope, newX, newZ);

        moveHiddenStore = scope.moveHidden;
        x = newX;
        z = newZ;
      }
    } else {
      this.stop();
    }
  };

  this.stop = () => {
    if (ocean && ocean.children[0] && ocean.children[0].isPlaying) ocean.children[0].stop();
    if (wind && wind.children[0] && wind.children[0].isPlaying) wind.children[0].stop();
  };
}

export default Atmosphere;
