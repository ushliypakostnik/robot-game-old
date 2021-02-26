import * as Three from 'three';

import { OBJLoader } from '@/components/Three/Modules/Utils/OBJLoader.js';
import { GLTFLoader } from '@/components/Three/Modules/Utils/GLTFLoader';

import { DESIGN, OBJECTS } from '@/utils/constants';
import {
  loaderDispatchHelper,
  getMinIntoxication,
  yesOrNo,
  addImmediateAudioToObjects,
  addAudioToObjects,
  degreesToRadians,
  randomInteger,
} from '@/utils/utilities';

function Robots() {
  const manager = new Three.LoadingManager();
  const managerAudio1 = new Three.LoadingManager();
  const managerAudio2 = new Three.LoadingManager();
  const audioLoader1 = new Three.AudioLoader(managerAudio1);
  const audioLoader2 = new Three.AudioLoader(managerAudio2);
  const audioLoader3 = new Three.AudioLoader();
  const OBJLoader = new Three.OBJLoader();
  const loader = new GLTFLoader(manager);

  let robots = [];
  let robot;
  let animations;
  let skeleton;
  let mixer;

  // Острова без стартового
  const sands = OBJECTS.SANDS.position.slice(1);

  /* Для тестирования - выставить всех роботов на стартовый остров:
  const test = [
    [DESIGN.HERO.start[0] + 10, DESIGN.HERO.start[1] + 10],
    [DESIGN.HERO.start[0] + 20, DESIGN.HERO.start[1] + 25],
    [DESIGN.HERO.start[0] + 30, DESIGN.HERO.start[1] - 35],
    [DESIGN.HERO.start[0] - 20, DESIGN.HERO.start[1] - 25],
  ]; */

  const fakeMaterial = new Three.MeshPhongMaterial({ color: DESIGN.COLORS.robot0x });
  fakeMaterial.blending = Three.NoBlending;
  fakeMaterial.side = Three.DoubleSide;
  const fakeGeometry = new Three.SphereBufferGeometry(OBJECTS.ROBOTS.scale * 5, 32, 32);

  const airMaterial = new Three.MeshPhongMaterial({ color: DESIGN.COLORS.air0x });
  airMaterial.blending = Three.NoBlending;
  const airGeometry = new Three.SphereBufferGeometry(OBJECTS.ROBOTS.scale * 10, 32, 32, 0, 6.3, 3, 3);

  const airHoleMaterial = new Three.MeshBasicMaterial({ color: DESIGN.COLORS.airHole0x });
  airHoleMaterial.blending = Three.NoBlending;
  const airHoleGeometry = new Three.SphereBufferGeometry(OBJECTS.ROBOTS.scale * 9.9, 32, 32);

  let pseudoMesh;
  let airMesh;
  let airHoleMesh;
  let air;

  let isLandingStart = false;

  this.init = (scope) => {
    for (let i = 0; i < OBJECTS.ROBOTS.quantity; i++) {
      loader.load('./images/models/Robot.glb', (gltf) => {
        loaderDispatchHelper(scope.$store, 'isRobotsLoaded');
        robot = gltf.scene;
        animations = gltf.animations;

        skeleton = new Three.SkeletonHelper(robot);
        skeleton.visible = false;

        robot.scale.set(OBJECTS.ROBOTS.scale, OBJECTS.ROBOTS.scale, OBJECTS.ROBOTS.scale);
        robot.rotateY(Math.PI / 7);
        robot.position.set(sands[i][0], OBJECTS.ROBOTS.positionY, sands[i][1]);

        mixer = new Three.AnimationMixer(robot);
        mixer.clipAction(animations[0]).setDuration(1).setEffectiveTimeScale(1).setEffectiveWeight(1);
        mixer.clipAction(animations[1]).setDuration(3).setEffectiveTimeScale(1).setEffectiveWeight(1);
        mixer.clipAction(animations[5]).setDuration(1).setEffectiveTimeScale(1).setEffectiveWeight(1);
        mixer.clipAction(animations[6]).setDuration(1).setEffectiveTimeScale(1).setEffectiveWeight(1);

        robot.updateMatrix();
        robot.matrixAutoUpdate = true;

        scope.rotate = randomInteger(-180, 180);
        robot.rotateY(degreesToRadians(scope.rotate));

        pseudoMesh = new Three.Mesh(fakeGeometry, fakeMaterial);

        pseudoMesh.name = OBJECTS.ROBOTS.name;

        pseudoMesh.scale.set(0.5, 1, 0.5);
        pseudoMesh.position.set(sands[i][0], OBJECTS.ROBOTS.positionY, sands[i][1]);
        pseudoMesh.visible = false;

        airMesh = new Three.Mesh(airGeometry, airMaterial);
        airMesh.scale.set(2, 0.5, 2);

        airHoleMesh = new Three.Mesh(airHoleGeometry, airHoleMaterial);
        airHoleMesh.scale.set(2, 0.5, 2);

        air = new Three.Object3D();

        air.add(airMesh);
        air.add(airHoleMesh);

        air.position.set(sands[i][0], DESIGN.GROUND_SIZE / 2, sands[i][1]);
        air.rotateY(Math.PI);
        air.rotateX(Math.PI);
        air.visible = false;

        airMesh.updateMatrix();
        airMesh.matrixAutoUpdate = true;
        airHoleMesh.updateMatrix();
        airHoleMesh.matrixAutoUpdate = true;

        robots.push({
          health: 100,
          damage: OBJECTS.ROBOTS.damage,
          mode: DESIGN.ENEMIES.mode.idle,
          mesh: robot,
          pseudoMesh,
          mixer,
          side: null,
          distanceToHero: null,
          isPunch: false,
          isDrunk: false,
          air,
          landingMode: null,
        });
        scope.scene.add(robot);
        scope.scene.add(skeleton);
        scope.scene.add(pseudoMesh);
        scope.objectsPseudoEnemies.push(pseudoMesh);
        scope.scene.add(air);
      });
    }
    loaderDispatchHelper(scope.$store, 'isRobotsBuilt');

    manager.onLoad = () => {
      managerAudio2.onLoad = () => {
        audioLoader3.load('./audio/danceroff.mp3', (buffer) => {
          addAudioToObjects(scope, robots, buffer, DESIGN.VOLUME.robots.off);
          loaderDispatchHelper(scope.$store, 'isDancerOffComplete');

          robots.forEach((robot) => {if (!scope.objectsEnemies.includes(robot)) scope.objectsEnemies.push(robot)});
        });
      };

      managerAudio1.onLoad = () => {
        audioLoader2.load('./audio/robotsnoize.mp3', (buffer) => {
          addImmediateAudioToObjects(scope, robots, buffer, DESIGN.VOLUME.robots.noize, true);
          loaderDispatchHelper(scope.$store, 'isRobotsNoizeComplete');
        });
      };

      audioLoader1.load('./audio/robotsrun.mp3', (buffer) => {
        addImmediateAudioToObjects(scope, robots, buffer, DESIGN.VOLUME.robots.run, true);
        loaderDispatchHelper(scope.$store, 'isRobotsRunComplete');
      });
    };
  };

  const active = (scope, robot) => {
    // Бег
    if (robot.pseudoMesh.children[1] && robot.pseudoMesh.children[1].isPlaying) robot.pseudoMesh.children[1].stop();
    if (robot.pseudoMesh.children[0] && !robot.pseudoMesh.children[0].isPlaying) robot.pseudoMesh.children[0].play();

    if (!robot.mixer.clipAction(animations[0]).isRunning()) robot.mixer.clipAction(animations[0]).fadeOut(1).stop();
    if (robot.isPunch) {
      if (robot.mixer.clipAction(animations[6]).isRunning()) robot.mixer.clipAction(animations[6]).fadeIn(1).stop();
      if (!robot.mixer.clipAction(animations[5]).isRunning()) robot.mixer.clipAction(animations[5]).fadeIn(1).play();
    } else {
      if (robot.mixer.clipAction(animations[5]).isRunning()) robot.mixer.clipAction(animations[5]).fadeIn(1).stop();
      if (!robot.mixer.clipAction(animations[6]).isRunning()) robot.mixer.clipAction(animations[6]).fadeIn(1).play();
    }

    // Raycast
    // Спереди
    scope.directionForward = robot.mesh.getWorldDirection(scope.direction);
    scope.raycasterForward.set(robot.mesh.position, scope.directionForward);
    scope.intersections = scope.raycasterForward.intersectObjects(scope.objectsVertical);

    // Позиция
    if (scope.intersections.length > 0) {
      // Объект спереди
      // Слишком близко - отбрасываем сильнее
      if (scope.intersections[0].distance < 5) {
        robot.mesh.position.add(robot.mesh.getWorldDirection(scope.direction).negate().multiplyScalar(scope.speed * OBJECTS.ROBOTS.distance[robot.mode] * 5 * scope.delta));
        robot.pseudoMesh.position.add(robot.pseudoMesh.getWorldDirection(scope.direction).negate().multiplyScalar(scope.speed * OBJECTS.ROBOTS.distance[robot.mode] * 5 * scope.delta));
      } else {
        robot.mesh.position.add(robot.mesh.getWorldDirection(scope.direction).negate().multiplyScalar(scope.speed * OBJECTS.ROBOTS.distance[robot.mode] * 2.5 * scope.delta));
        robot.pseudoMesh.position.add(robot.pseudoMesh.getWorldDirection(scope.direction).negate().multiplyScalar(scope.speed * OBJECTS.ROBOTS.distance[robot.mode] * 2.5 * scope.delta));
      }

      // Поворот
      robot.side = yesOrNo();
      robot.mesh.rotateY(robot.side * Math.PI / 4);
    } else {
      // Вперед!!!
      robot.side = null;

      scope.dictance = scope.controls.getObject().position.distanceTo(robot.mesh.position);
      scope.rotateCooeficient = scope.dictance - robot.distanceToHero < 1 ? scope.dictance * 2.5 / robot.distanceToHero : 1;

      // Удар?
      if (scope.dictance < OBJECTS.ROBOTS.distance[robot.mode] / 1.75) {
        robot.isPunch = true;
        if (!scope.isNotDamaged) {
          scope.setHeroOnDamage(true);

          scope.setScale({
            field: DESIGN.HERO.scales.health.name,
            value: DESIGN.HERO.damage.robot,
          });
        }
      } else {
        robot.isPunch = false;
        scope.setHeroOnDamage(false);
      }

      scope.direction.copy(robot.mesh.getWorldDirection(scope.direction).normalize());
      scope.direction.y = 0;
      scope.directionOnHero.subVectors(scope.controls.getObject().position, robot.mesh.position).normalize();
      scope.directionOnHero.y = 0;
      scope.angle = scope.directionOnHero.angleTo(scope.direction.applyAxisAngle(scope.y, Math.PI / 2));
      scope.rotate = scope.angle - Math.PI / 2 <= 0 ? scope.rotateCooeficient : -1 * scope.rotateCooeficient;
      robot.mesh.rotateY(scope.rotate * scope.intoxication * scope.delta);

      if (!robot.isPunch) {
        // Позиция
        robot.mesh.position.add(robot.mesh.getWorldDirection(scope.direction).multiplyScalar(scope.speed * OBJECTS.ROBOTS.distance[robot.mode] * scope.delta));
        robot.pseudoMesh.position.add(robot.mesh.getWorldDirection(scope.direction).multiplyScalar(scope.speed * OBJECTS.ROBOTS.distance[robot.mode] * scope.delta));

        robot.distanceToHero = scope.dictance;
      }
    }

    // Позиция
    robot.pseudoMesh.position.set(robot.mesh.position.x, robot.mesh.position.y, robot.mesh.position.z);
  };

  this.animate = (scope) => {
    robots.filter(robot => robot.mode !== DESIGN.ENEMIES.mode.thing).forEach((robot) => {
      if (robot.mode === DESIGN.ENEMIES.mode.idle
          || robot.mode === DESIGN.ENEMIES.mode.active) {
        // Скорость
        scope.intoxication = getMinIntoxication(robot.health);
        scope.speed = OBJECTS.ROBOTS.velocityMove[robot.mode] * scope.intoxication;

        // Скорость аудио
        if (robot.pseudoMesh.children[0] && robot.pseudoMesh.children[0].isPlaying)
          robot.pseudoMesh.children[0].setPlaybackRate(scope.speed / 1.5);
        if (robot.pseudoMesh.children[1] && robot.pseudoMesh.children[1].isPlaying)
          robot.pseudoMesh.children[1].setPlaybackRate(scope.speed / 1.5);
      }

      switch (robot.mode) {
        // Cпокойный режим
        case DESIGN.ENEMIES.mode.idle:
          // Noize
          if (robot.pseudoMesh.children[0] && robot.pseudoMesh.children[0].isPlaying) robot.pseudoMesh.children[0].stop();
          if (robot.pseudoMesh.children[1] && !robot.pseudoMesh.children[1].isPlaying) robot.pseudoMesh.children[1].play();

          if (robot.mixer.clipAction(animations[5]).isRunning()) robot.mixer.clipAction(animations[5]).fadeOut(1).stop();
          if (robot.mixer.clipAction(animations[6]).isRunning()) robot.mixer.clipAction(animations[6]).fadeOut(1).stop();
          if (!robot.mixer.clipAction(animations[0]).isRunning()) robot.mixer.clipAction(animations[0]).fadeIn(1).play();
          break;

        // Aктивный режим
        case DESIGN.ENEMIES.mode.active:
          active(scope, robot);
          break;

        // Опьянел
        case DESIGN.ENEMIES.mode.drunk:
          stop(robot);
          if (robot.isPunch) robot.isPunch = false;
          scope.setHeroOnDamage(false);
          if (robot.mixer.clipAction(animations[0]).isRunning()) robot.mixer.clipAction(animations[0]).fadeOut(1).stop();
          if (robot.mixer.clipAction(animations[5]).isRunning()) robot.mixer.clipAction(animations[5]).fadeOut(1).stop();
          if (robot.mixer.clipAction(animations[6]).isRunning()) robot.mixer.clipAction(animations[6]).fadeOut(1).stop();
          if (!robot.isDrunk) {
            robot.isDrunk = true;
            robot.mixer.clipAction(animations[1]).loop = Three.LoopOnce;
            robot.mixer.clipAction(animations[1]).clampWhenFinished = true;
            robot.mixer.clipAction(animations[1]).play();
            if (robot.pseudoMesh.children[2] && !robot.pseudoMesh.children[2].isPlaying) robot.pseudoMesh.children[2].play();

            robot.mixer.addEventListener( 'finished', (e) => {
              robot.mode = DESIGN.ENEMIES.mode.thing;
              robot.pseudoMesh.userData = { isThing: true };
              robot.pseudoMesh.position.y -= 1;
              robot.pseudoMesh.scale.set(0.5, 0.5, 0.5);
              if (robot.pseudoMesh.children[2] && robot.pseudoMesh.children[2].isPlaying) robot.pseudoMesh.children[2].stop();
            });
          }
          break;

        // Посадка спецназа
        case DESIGN.ENEMIES.mode.landing:
          switch (robot.landingMode) {
            case 1:
              if (robot.air.position.y > DESIGN.HERO.jumpheight * 1.25) {
                robot.air.position.set(robot.air.position.x, robot.air.position.y - scope.delta * 100, robot.air.position.z);
              } else robot.landingMode = 2;
              break;

            case 2:
              robot.health = 100;
              robot.side = null;
              robot.distanceToHero = null;
              robot.isPunch = false;
              robot.isDrunk = false;
              robot.mesh.position.copy(robot.air.position);
              if (robot.mixer.clipAction(animations[0]).isRunning()) robot.mixer.clipAction(animations[0]).stop();
              if (robot.mixer.clipAction(animations[5]).isRunning()) robot.mixer.clipAction(animations[5]).stop();
              if (robot.mixer.clipAction(animations[6]).isRunning()) robot.mixer.clipAction(animations[6]).stop();

              scope.scene.add(robot.mesh);
              scope.objectsEnemies.push(robot);

              robot.landingMode = 3;
              break;

            case 3:
              if (robot.mesh.position.y > OBJECTS.ROBOTS.positionY) {
                robot.mesh.position.set(robot.mesh.position.x, robot.mesh.position.y - scope.delta * 10, robot.mesh.position.z);
                robot.pseudoMesh.position.set(robot.pseudoMesh.position.x, robot.pseudoMesh.position.y - scope.delta * 10, robot.pseudoMesh.position.z);
              } else {
                robot.pseudoMesh.position.copy(robot.mesh.position);

                scope.scene.add(robot.pseudoMesh);
                scope.objectsPseudoEnemies.push(robot.pseudoMesh);

                if (!robot.mixer.clipAction(animations[6]).isRunning()) robot.mixer.clipAction(animations[6]).fadeIn(1).play();

                robot.landingMode = 4;
              }
              break;

            case 4:
              if (robot.air.position.y < DESIGN.GROUND_SIZE / 2) {
                robot.air.position.set(robot.air.position.x, robot.air.position.y + scope.delta * 100, robot.air.position.z);
              } else scope.scene.remove(robot.air);

              active(scope, robot);
              break;
          }
          break;
      }

      if (robot.mixer) robot.mixer.update(scope.speed * scope.delta);
    });

    // Если все Танцоры разобраны - высаживаем спецназ на НЛО
    if (!isLandingStart) {
      isLandingStart = true;

      for (let i = 0; i < OBJECTS.ROBOTS.quantity; i++) {
        robots.forEach((robot) => {
          // Noize
          if (robot.pseudoMesh.children[1] && !robot.pseudoMesh.children[1].isPlaying) robot.pseudoMesh.children[1].play();

          robot.mode = DESIGN.ENEMIES.mode.landing;
          robot.landingMode = 1;
          robot.air.visible = true;
        });
      }
    }
  };

  const stop = (robot) => {
    if (robot.pseudoMesh.children[0] && robot.pseudoMesh.children[0].isPlaying) robot.pseudoMesh.children[0].stop();
    if (robot.pseudoMesh.children[1] && robot.pseudoMesh.children[1].isPlaying) robot.pseudoMesh.children[1].stop();
  };

  this.stop = () => {
    robots.forEach((robot) => {
      if (robot.pseudoMesh.children[0] && robot.pseudoMesh.children[0].isPlaying) robot.pseudoMesh.children[0].stop();
      if (robot.pseudoMesh.children[1] && robot.pseudoMesh.children[1].isPlaying) robot.pseudoMesh.children[1].stop();
      if (robot.pseudoMesh.children[2] && robot.pseudoMesh.children[2].isPlaying) robot.pseudoMesh.children[2].stop();
    });
  };
}

export default Robots;
