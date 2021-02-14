import * as Three from 'three';

import { GLTFLoader } from '@/components/Three/Modules/Utils/GLTFLoader';

import { DESIGN, OBJECTS } from '@/utils/constants';
import {
  fixEnemyPosition,
  randomInteger,
  yesOrNo,
  distance2D,
  loaderDispatchHelper,
  addImmediateAudioToObjects,
  addAudioToPseudoObjects,
  getMinIntoxication,
  degreesToRadians,
} from '@/utils/utilities';

function Parrots() {
  const manager = new Three.LoadingManager();
  const managerAudio1 = new Three.LoadingManager();
  const managerAudio2 = new Three.LoadingManager();
  const loader = new GLTFLoader(manager);
  const audioLoader1 = new Three.AudioLoader(managerAudio1);
  const audioLoader2 = new Three.AudioLoader(managerAudio2);
  const audioLoader3 = new Three.AudioLoader();

  const fakeMaterial = new Three.MeshPhongMaterial({ color: DESIGN.COLORS.parrot0x });
  fakeMaterial.blending = Three.NoBlending;
  const fakeGeometry = new Three.SphereBufferGeometry(OBJECTS.PARROTS.scale * 60, 32, 32);
  let pseudoMesh;

  const parrots = [];
  let parrot;
  let X;
  let Z;
  let x;
  let z;
  let y;
  let rotate;
  let bend;
  let accelerationVelocity;
  let accelerationBend;
  let velocityVertical;
  let onDown;

  let mixer;
  let decision;

  let intoxication;
  let speed;

  const PARROTS_RADIUS = DESIGN.GROUND_SIZE * 0.525;

  this.init = (scope) => {
    managerAudio2.onLoad = () => {
      audioLoader3.load('./audio/parrotcry.mp3', (buffer) => {
        addAudioToPseudoObjects(scope, parrots, buffer, DESIGN.VOLUME.parrots.cry);

        loaderDispatchHelper(scope.$store, 'isParrotCryComplete');
      });
    };

    managerAudio1.onLoad = () => {
      audioLoader2.load('./audio/parrotcry2.mp3', (buffer) => {
        addAudioToPseudoObjects(scope, parrots, buffer, DESIGN.VOLUME.parrots.cry2);

        loaderDispatchHelper(scope.$store, 'isParrotCry2Complete');
      });
    };

    manager.onLoad = () => {
      audioLoader1.load('./audio/parrotfly.mp3', (buffer) => {
        addImmediateAudioToObjects(scope, parrots, buffer, DESIGN.VOLUME.parrots.volume, false);

        loaderDispatchHelper(scope.$store, 'isParrotFlyComplete');
      });
    };

    loader.load('./images/models/Parrot.glb', (gltf) => {
      loaderDispatchHelper(scope.$store, 'isParrotLoaded');

      for (let i = 0; i < OBJECTS.PARROTS.quantity; i++) {
        parrot = gltf.scene.clone(true).children[0];
        parrot.scale.set(OBJECTS.PARROTS.scale, OBJECTS.PARROTS.scale, OBJECTS.PARROTS.scale);

        X = randomInteger(-1 * DESIGN.GROUND_SIZE / 2, DESIGN.GROUND_SIZE / 2);
        y = randomInteger(OBJECTS.PARROTS.minHeight, OBJECTS.PARROTS.maxHeight);
        Z = randomInteger(-1 * DESIGN.GROUND_SIZE / 2, DESIGN.GROUND_SIZE / 2);

        [x, z] = fixEnemyPosition(
          PARROTS_RADIUS,
          scope.objectsStoneData,
          scope.objectsTreesData, X, Z);

        parrot.position.set(x, y, z);

        rotate = randomInteger(-180, 180);
        bend = yesOrNo();
        parrot.rotateY(degreesToRadians(rotate));

        accelerationVelocity = Math.random() + 0.5;
        accelerationBend = Math.random();
        velocityVertical = Math.random() + 2.5;

        mixer = new Three.AnimationMixer(parrot);
        mixer.clipAction(gltf.animations[0]).setDuration(1).play();

        pseudoMesh = new Three.Mesh(fakeGeometry, fakeMaterial);

        pseudoMesh.name = OBJECTS.PARROTS.name;

        pseudoMesh.position.set(x, y, z);
        pseudoMesh.visible = false;

        parrots.push({
          health: 100,
          damage: OBJECTS.PARROTS.damage,
          mode: DESIGN.ENEMIES.mode.idle,
          mesh: parrot,
          pseudoMesh,
          mixer,
          bend,
          accelerationVelocity,
          accelerationBend,
          velocityVertical,
          beforeObject: false,
          side: null,
          isStop: false,
          stopSide: yesOrNo(),
          stopAngle: 0,
          isFall: false,
        });
        scope.scene.add(parrot);
        scope.scene.add(pseudoMesh);
        scope.objectsPseudoEnemies.push(pseudoMesh);
      }
      scope.objectsEnemies = scope.objectsEnemies.concat(parrots);
      loaderDispatchHelper(scope.$store, 'isParrotsBuilt');
    });
  };

  // Idle or Active Mode Movement
  const sober = (parrot, scope) => {
    // Полет
    if (parrot.mesh.children[0] && !parrot.mesh.children[0].isPlaying) parrot.mesh.children[0].play();

    // Скорость
    intoxication = getMinIntoxication(parrot.health);
    speed = parrot.accelerationVelocity * OBJECTS.PARROTS.velocityMove[parrot.mode] * intoxication;

    // Скорость аудио
    if (parrot.mesh.children[0] && parrot.mesh.children[0].isPlaying)
      parrot.mesh.children[0].setPlaybackRate(speed / 1.25);

    // Raycast
    // Спереди
    scope.directionForward = parrot.mesh.getWorldDirection(scope.direction);
    scope.raycasterForward.set(parrot.mesh.position, scope.directionForward);
    scope.intersections = scope.raycasterForward.intersectObjects(scope.objectsVertical);
    scope.onForward = scope.intersections.length > 0;

    // Снизу
    scope.directionDown = new Three.Vector3(0, 0, 0).crossVectors(scope.x, scope.z);
    scope.raycasterDown.set(parrot.mesh.position, scope.directionDown);
    scope.intersections = scope.raycasterDown.intersectObjects(scope.objectsVertical);
    onDown = scope.intersections.length > 0;

    // Объект спереди - поворачиваем
    if (scope.onForward) {
      parrot.beforeObject = true;

      parrot.side = yesOrNo();
      parrot.mesh.rotateY(parrot.side * Math.PI / 4);

      // Позиция
      parrot.mesh.position.add(parrot.mesh.getWorldDirection(scope.direction).negate().multiplyScalar(speed * OBJECTS.PARROTS.distance[parrot.mode] * scope.delta));
    } else {
      // Вперед!!!
      parrot.beforeObject = false;
      parrot.side = null;

      decision = randomInteger(1, 25) === 1;
      if (decision) parrot.bend = yesOrNo();

      decision = randomInteger(1, 50) === 1;
      if (decision) parrot.accelerationBend = Math.random();

      parrot.mesh.rotateY(degreesToRadians((parrot.bend + parrot.accelerationBend) * OBJECTS.PARROTS.velocityBend[parrot.mode] * intoxication * scope.delta));

      decision = randomInteger(1, 50) === 1;
      if (decision) parrot.accelerationVelocity = Math.random() + 0.5;

      // Высота
      decision = randomInteger(1, 50) === 1;
      if (decision) parrot.velocityVertical = (Math.random() + 2.5) * yesOrNo();

      if (onDown && parrot.mesh.position.y > OBJECTS.PARROTS.maxHeight) {
        parrot.velocityVertical = 0;
        parrot.accelerationVelocity = 1.5;
      } else if (onDown || parrot.mesh.position.y < OBJECTS.PARROTS.minHeight) parrot.velocityVertical = Math.abs(parrot.velocityVertical);
      else if (parrot.mesh.position.y > OBJECTS.PARROTS.maxHeight) parrot.velocityVertical = -1 * Math.abs(parrot.velocityVertical);

      parrot.mesh.position.y += parrot.velocityVertical * scope.delta;

      // Не слишком далеко
      if (distance2D(0, 0, parrot.mesh.position.x, parrot.mesh.position.z) > PARROTS_RADIUS)
        parrot.mesh.rotateY(parrot.side * Math.PI / 4);

      // Позиция
      parrot.mesh.position.add(parrot.mesh.getWorldDirection(scope.direction).multiplyScalar(speed * OBJECTS.PARROTS.distance[parrot.mode] * scope.delta));
    }

    // Позиция
    parrot.pseudoMesh.position.set(parrot.mesh.position.x, parrot.mesh.position.y, parrot.mesh.position.z);
    if (parrot.mixer) parrot.mixer.update(speed * scope.delta);
  };

  this.animate = (scope) => {
    parrots.filter(parrot => parrot.mode !== DESIGN.ENEMIES.mode.thing).forEach((parrot) => {
      switch (parrot.mode) {
        // Cпокойный режим
        case DESIGN.ENEMIES.mode.idle:
          // Крики 2
          decision = randomInteger(1, OBJECTS.PARROTS.frequency.cry) === 1;
          if (decision) {
            if (parrot.pseudoMesh.children[1] && parrot.pseudoMesh.children[1].isPlaying) parrot.pseudoMesh.children[1].stop();
            if (parrot.pseudoMesh.children[0] && !parrot.pseudoMesh.children[0].isPlaying) parrot.pseudoMesh.children[0].play();
          }

          sober(parrot, scope);
          break;

        // Aктивный режим
        case DESIGN.ENEMIES.mode.active:
          // Крики
          decision = randomInteger(1, OBJECTS.PARROTS.frequency.cry2) === 1;
          if (decision) {
            if (parrot.pseudoMesh.children[0] && parrot.pseudoMesh.children[0].isPlaying) parrot.pseudoMesh.children[0].stop();
            if (parrot.pseudoMesh.children[1] && !parrot.pseudoMesh.children[1].isPlaying) parrot.pseudoMesh.children[1].play();
          }

          sober(parrot, scope);
          break;

        // Опьянел
        case DESIGN.ENEMIES.mode.drunk:
          if (!parrot.isStop) {
            stop(parrot);
            parrot.isStop = true;
          }

          if (!parrot.isFall) {
            speed = OBJECTS.PARROTS.velocityBend[DESIGN.ENEMIES.mode.idle] * parrot.stopSide * scope.delta / 30;
            parrot.mesh.rotateZ(speed);
            parrot.stopAngle += Math.abs(speed);
            if (parrot.stopAngle > Math.PI) parrot.isFall = true;
          } else {
            // Снизу distance
            scope.directionDown = new Three.Vector3(0, 0, 0).crossVectors(scope.x, scope.z);
            scope.raycasterDown.set(parrot.mesh.position, scope.directionDown);
            scope.intersections = scope.raycasterDown.intersectObjects(scope.objectsGround.concat(scope.objectsVertical));
            onDown = scope.intersections[0].distance ? scope.intersections[0].distance : 0.5;

            console.log(onDown);

            parrot.mesh.position.y -= scope.delta * 10;
            parrot.pseudoMesh.position.y = parrot.mesh.position.y;
            if (onDown < 0.5) {
              parrot.mode = DESIGN.ENEMIES.mode.thing;
              parrot.pseudoMesh.userData = { isThing: true };
              parrot.pseudoMesh.position.y -= 0.5;
              parrot.pseudoMesh.scale.set(0.5, 0.5, 0.5);
            }
          }
          break;
      }
    });
  };

  const stop = (parrot) => {
    if (parrot.mesh.children[0] && parrot.mesh.children[0].isPlaying) parrot.mesh.children[0].stop();

    // Крики
    if (parrot.pseudoMesh.children[0] && parrot.pseudoMesh.children[0].isPlaying) parrot.pseudoMesh.children[0].stop();
    if (parrot.pseudoMesh.children[1] && parrot.pseudoMesh.children[1].isPlaying) parrot.pseudoMesh.children[1].stop();
  };

  this.stop = () => {
    parrots.forEach((parrot) => {
      // Полет
      if (parrot.mesh.children[0] && parrot.mesh.children[0].isPlaying) parrot.mesh.children[0].stop();

      // Крики
      if (parrot.pseudoMesh.children[0] && parrot.pseudoMesh.children[0].isPlaying) parrot.pseudoMesh.children[0].stop();
      if (parrot.pseudoMesh.children[1] && parrot.pseudoMesh.children[1].isPlaying) parrot.pseudoMesh.children[1].stop();
    });
  };
}

export default Parrots;
