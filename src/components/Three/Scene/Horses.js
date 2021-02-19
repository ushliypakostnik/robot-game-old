import * as Three from 'three';

import { GLTFLoader } from '@/components/Three/Modules/Utils/GLTFLoader';

import { DESIGN, OBJECTS } from '@/utils/constants';
import {
  fixEnemyPosition,
  randomInteger,
  loaderDispatchHelper,
  yesOrNo,
  distance2D,
  addImmediateAudioToObjects,
  addAudioToObjects,
  getMinIntoxication,
  degreesToRadians,
} from '@/utils/utilities';

function Horses() {
  const manager = new Three.LoadingManager();
  const managerAudio1 = new Three.LoadingManager();
  const managerAudio2 = new Three.LoadingManager();
  const managerAudio3 = new Three.LoadingManager();
  const loader = new GLTFLoader(manager);
  const audioLoader1 = new Three.AudioLoader(managerAudio1);
  const audioLoader2 = new Three.AudioLoader(managerAudio2);
  const audioLoader3 = new Three.AudioLoader(managerAudio3);
  const audioLoader4 = new Three.AudioLoader();

  const fakeMaterial = new Three.MeshPhongMaterial({ color: DESIGN.COLORS.horse0x });
  fakeMaterial.blending = Three.NoBlending;
  fakeMaterial.side = Three.DoubleSide;
  const fakeGeometry = new Three.SphereBufferGeometry(OBJECTS.HORSES.scale * 220, 32, 32);
  let pseudoMesh;

  const horses = [];
  let horse;
  let X;
  let Z;
  let x;
  let z;
  let mixer;

  const HORSES_RADIUS = DESIGN.GROUND_SIZE * 0.49;

  this.init = (scope) => {
    managerAudio3.onLoad = () => {
      audioLoader4.load('./audio/horsecry.mp3', (buffer) => {
        addAudioToObjects(scope, horses, buffer, DESIGN.VOLUME.horses.cry);

        loaderDispatchHelper(scope.$store, 'isHorseCryComplete');
      });
    };

    managerAudio2.onLoad = () => {
      audioLoader3.load('./audio/horsefr.mp3', (buffer) => {
        addAudioToObjects(scope, horses, buffer, DESIGN.VOLUME.horses.fr);

        loaderDispatchHelper(scope.$store, 'isHorseFrComplete');
      });
    };

    managerAudio1.onLoad = () => {
      audioLoader2.load('./audio/waterhorse.mp3', (buffer) => {
        addImmediateAudioToObjects(scope, horses, buffer, DESIGN.VOLUME.horses.volume, false);

        loaderDispatchHelper(scope.$store, 'isHorseWaterRunComplete');
      });
    };

    manager.onLoad = () => {
      audioLoader1.load('./audio/horse.mp3', (buffer) => {
        addImmediateAudioToObjects(scope, horses, buffer, DESIGN.VOLUME.horses.volume, false);

        loaderDispatchHelper(scope.$store, 'isHorseRunComplete');
      });
    };

    loader.load('./images/models/Horse.glb', (gltf) => {
      loaderDispatchHelper(scope.$store, 'isHorseLoaded');

      for (let i = 0; i < OBJECTS.HORSES.quantity; i++) {
        horse = gltf.scene.clone(true).children[0];
        horse.scale.set(OBJECTS.HORSES.scale, OBJECTS.HORSES.scale, OBJECTS.HORSES.scale);

        X = randomInteger(-1 * DESIGN.GROUND_SIZE / 2, DESIGN.GROUND_SIZE / 2);
        Z = randomInteger(-1 * DESIGN.GROUND_SIZE / 2, DESIGN.GROUND_SIZE / 2);

        [x, z] = fixEnemyPosition(
          HORSES_RADIUS * 0.9,
          scope.objectsStoneData,
          scope.objectsTreesData, X, Z);

        horse.position.set(x, 0, z);

        scope.rotate = randomInteger(-180, 180);
        horse.rotateY(degreesToRadians(scope.rotate));

        mixer = new Three.AnimationMixer(horse);
        mixer.clipAction(gltf.animations[0]).setDuration(1).play();

        pseudoMesh = new Three.Mesh(fakeGeometry, fakeMaterial);

        pseudoMesh.name = OBJECTS.HORSES.name;

        pseudoMesh.position.set(x, 0, z);
        pseudoMesh.visible = false;

        horses.push({
          health: 100,
          damage: OBJECTS.HORSES.damage,
          mode: DESIGN.ENEMIES.mode.idle,
          mesh: horse,
          pseudoMesh,
          mixer,
          bend: yesOrNo(),
          accelerationVelocity: Math.random(),
          accelerationBend: Math.random(),
          onForward: false,
          side: null,
          isOnWater: null,
          layers: [],
          layersNew: [],
          isStop: false,
          stopSide: yesOrNo(),
          stopAngle: 0,
        });
        scope.scene.add(horse);
        scope.scene.add(pseudoMesh);
        scope.objectsPseudoEnemies.push(pseudoMesh);
      }
      scope.objectsEnemies = scope.objectsEnemies.concat(horses);
      loaderDispatchHelper(scope.$store, 'isHorsesBuilt');
    });
  };

  // Idle or Active Mode Movement
  const sober = (horse, scope) => {
    // Бег
    if (!horse.isOnWater) {
      // По воде
      if (horse.mesh.children[1] && horse.mesh.children[1].isPlaying) horse.mesh.children[1].stop();
      if (horse.mesh.children[0] && !horse.mesh.children[0].isPlaying) horse.mesh.children[0].play();
    } else {
      // По суше
      if (horse.mesh.children[0] && horse.mesh.children[0].isPlaying) horse.mesh.children[0].stop();
      if (horse.mesh.children[1] && !horse.mesh.children[1].isPlaying) horse.mesh.children[1].play();
    }

    // Скорость
    scope.intoxication = getMinIntoxication(horse.health);
    scope.speed = horse.accelerationVelocity * OBJECTS.HORSES.velocityMove[horse.mode] * scope.intoxication;

    // Скорость аудио
    if (horse.mesh.children[0] && horse.mesh.children[0].isPlaying)
      horse.mesh.children[0].setPlaybackRate( scope.speed / 1.5);
    if (horse.mesh.children[1] && horse.mesh.children[1].isPlaying)
      horse.mesh.children[1].setPlaybackRate(scope.speed / 1.5);

    // Raycast
    // Спереди
    scope.directionForward = horse.mesh.getWorldDirection(scope.direction);
    scope.raycasterForward.set(horse.mesh.position, scope.directionForward);
    scope.intersections = scope.raycasterForward.intersectObjects(scope.objectsVertical);
    scope.onForward = scope.intersections.length > 0;

    // Снизу
    scope.directionDown = new Three.Vector3(0, 0, 0).crossVectors(scope.x, scope.z);
    scope.raycasterDown.set(horse.mesh.position, scope.directionDown);
    scope.intersections = scope.raycasterDown.intersectObjects(scope.objectsGround);

    if (scope.intersections.length > 0) {
      horse.layersNew = [];
      scope.intersections.forEach((intersection) => {
        if (!horse.layersNew.includes(intersection.object.name)) horse.layersNew.push(intersection.object.name);
      });
      if (horse.layersNew.length !== horse.layers.length) {
        //  На любой воде
        if (!horse.layersNew.includes(OBJECTS.BEACH.name) ||
          horse.layersNew.includes(OBJECTS.LAKES.name)
          || horse.layersNew.includes(OBJECTS.PUDDLES.name)) {
          horse.isOnWater = true;
        } else horse.isOnWater = false;

        horse.layers = horse.layersNew;
      }
    }

    // Объект спереди - поворачиваем
    if (scope.onForward) {
      horse.onForward = true;

      horse.side = yesOrNo();
      horse.mesh.rotateY(horse.side * Math.PI / 4);

      // Позиция
      horse.mesh.position.add(horse.mesh.getWorldDirection(scope.direction).negate().multiplyScalar(scope.speed * OBJECTS.HORSES.distance[horse.mode] * scope.delta));
    } else {
      // Вперед!!!
      horse.onForward = false;
      horse.side = null;

      scope.decision = randomInteger(1, 25) === 1;
      if (scope.decision) horse.bend = yesOrNo();

      scope.decision = randomInteger(1, 50) === 1;
      if (scope.decision) horse.accelerationBend = Math.random();

      horse.mesh.rotateY(degreesToRadians(horse.bend * horse.accelerationBend * OBJECTS.HORSES.velocityBend[horse.mode] * scope.intoxication * scope.delta));

      scope.decision = randomInteger(1, 50) === 1;
      if (scope.decision) {
        horse.accelerationVelocity = Math.random() + 0.5;
        if (horse.mode === DESIGN.ENEMIES.mode.idle && horse.accelerationVelocity < 0.75) horse.accelerationVelocity = 0.75;
        else if (horse.mode === DESIGN.ENEMIES.mode.active && horse.accelerationVelocity > 1.25) horse.accelerationVelocity = 1.25;
      }

      // Не слишком далеко
      if (distance2D(0, 0, horse.mesh.position.x, horse.mesh.position.z) > HORSES_RADIUS)
        horse.mesh.rotateY(horse.side * Math.PI / 4);

      // Позиция
      horse.mesh.position.add(horse.mesh.getWorldDirection(scope.direction).multiplyScalar(scope.speed * OBJECTS.HORSES.distance[horse.mode] * scope.delta));
    }

    // Позиция
    horse.pseudoMesh.position.set(horse.mesh.position.x, 0, horse.mesh.position.z);
    if (horse.mixer) horse.mixer.update(scope.speed * scope.delta);
  };

  this.animate = (scope) => {
    horses.filter(horse => horse.mode !== DESIGN.ENEMIES.mode.thing).forEach((horse, index) => {
      switch (horse.mode) {
        // Cпокойный режим
        case DESIGN.ENEMIES.mode.idle:
          // Фыркание
          scope.decision = randomInteger(1, OBJECTS.HORSES.frequency.fr) === 1;
          if (scope.decision) {
            if (horse.pseudoMesh.children[1] && horse.pseudoMesh.children[1].isPlaying) horse.pseudoMesh.children[1].stop();
            if (horse.pseudoMesh.children[0] && !horse.pseudoMesh.children[0].isPlaying) horse.pseudoMesh.children[0].play();
          }

          sober(horse, scope);
          break;

        // Aктивный режим
        case DESIGN.ENEMIES.mode.active:
          // Ржание
          scope.decision = randomInteger(1, OBJECTS.HORSES.frequency.cry) === 1;
          if (scope.decision) {
            if (horse.pseudoMesh.children[0] && horse.pseudoMesh.children[0].isPlaying) horse.pseudoMesh.children[0].stop();
            if (horse.pseudoMesh.children[1] && !horse.pseudoMesh.children[1].isPlaying) horse.pseudoMesh.children[1].play();
          }

          sober(horse, scope);
          break;

        // Опьянела
        case DESIGN.ENEMIES.mode.drunk:
          if (!horse.isStop) {
            stop(horse);
            horse.isStop = true;
          }

          scope.speed = OBJECTS.HORSES.velocityBend[DESIGN.ENEMIES.mode.idle] * horse.stopSide * scope.delta / 20;
          horse.stopAngle += Math.abs(scope.speed);
          if (horse.stopAngle < Math.PI / 2) horse.mesh.rotateZ(scope.speed);
          else {
            horse.mode = DESIGN.ENEMIES.mode.thing;
            horse.pseudoMesh.userData = { isThing: true };
            horse.pseudoMesh.position.y -= 0.5;
            horse.pseudoMesh.scale.set(0.5, 0.5, 0.5);
          }
          break;
      }
    });
  };

  const stop = (horse) => {
    if (horse.mesh.children[0] && horse.mesh.children[0].isPlaying) horse.mesh.children[0].stop();
    if (horse.mesh.children[1] && horse.mesh.children[1].isPlaying) horse.mesh.children[1].stop();

    // Фыркание и ржание
    if (horse.pseudoMesh.children[0] && horse.pseudoMesh.children[0].isPlaying) horse.pseudoMesh.children[0].stop();
    if (horse.pseudoMesh.children[1] && horse.pseudoMesh.children[1].isPlaying) horse.pseudoMesh.children[1].stop();
  };

  this.stop = () => {
    horses.forEach((horse) => {
      // Бег
      if (horse.mesh.children[0] && horse.mesh.children[0].isPlaying) horse.mesh.children[0].stop();
      if (horse.mesh.children[1] && horse.mesh.children[1].isPlaying) horse.mesh.children[1].stop();

      // Фыркание и ржание
      if (horse.pseudoMesh.children[0] && horse.pseudoMesh.children[0].isPlaying) horse.pseudoMesh.children[0].stop();
      if (horse.pseudoMesh.children[1] && horse.pseudoMesh.children[1].isPlaying) horse.pseudoMesh.children[1].stop();
    });
  };
}

export default Horses;
