import * as Three from 'three';

import { OBJLoader } from '@/components/Three/Modules/Utils/OBJLoader.js';
import { GLTFLoader } from '@/components/Three/Modules/Utils/GLTFLoader';

import { DESIGN, OBJECTS } from '@/utils/constants';
import {
  loaderDispatchHelper,
  getMinIntoxication,
  yesOrNo,
  addImmediateAudioToObjects,
  degreesToRadians,
  randomInteger,
} from '@/utils/utilities';

function Robots() {
  const manager = new Three.LoadingManager();
  const managerAudio = new Three.LoadingManager();
  const audioLoader1 = new Three.AudioLoader(managerAudio);
  const audioLoader2 = new Three.AudioLoader();
  const OBJLoader = new Three.OBJLoader();
  const loader = new GLTFLoader(manager);

  let robots = [];
  let robot;
  let animations;
  let skeleton;
  let mixer;

  let directionOnHero = new Three.Vector3();
  const y = new Three.Vector3( 0, 1, 0 );
  let angle;
  let rotate;
  let bend;
  let decision;
  let dictance;
  let rotateCooeficient = 1;


  let intoxication;
  let speed;

  const test = [
    [DESIGN.HERO.start[0] + 10, DESIGN.HERO.start[1] + 10],
    [DESIGN.HERO.start[0] + 20, DESIGN.HERO.start[1] + 25],
  ];

  const fakeMaterial = new Three.MeshPhongMaterial({ color: DESIGN.COLORS.robot0x });
  fakeMaterial.blending = Three.NoBlending;
  const fakeGeometry = new Three.SphereBufferGeometry(OBJECTS.ROBOTS.scale * 5, 32, 32);
  let pseudoMesh;

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
        robot.position.set(test[i][0], OBJECTS.ROBOTS.positionY, test[i][1]);

        mixer = new Three.AnimationMixer(robot);
        mixer.clipAction(animations[0]).setDuration(1).setEffectiveTimeScale(1).setEffectiveWeight(1);
        mixer.clipAction(animations[1]).setEffectiveTimeScale(1).setEffectiveWeight(1);
        mixer.clipAction(animations[5]).setDuration(1).setEffectiveTimeScale(1).setEffectiveWeight(1);
        mixer.clipAction(animations[6]).setDuration(1).setEffectiveTimeScale(1).setEffectiveWeight(1);

        robot.updateMatrix();
        robot.matrixAutoUpdate = true;

        rotate = randomInteger(-180, 180);
        bend = yesOrNo();
        robot.rotateY(degreesToRadians(rotate));

        pseudoMesh = new Three.Mesh(fakeGeometry, fakeMaterial);

        pseudoMesh.name = OBJECTS.ROBOTS.name;

        pseudoMesh.scale.set(0.5, 1, 0.5);
        pseudoMesh.position.set(test[i][0], OBJECTS.ROBOTS.positionY, test[i][1]);
        pseudoMesh.visible = false;

        robots.push({
          health: 100,
          damage: OBJECTS.ROBOTS.damage,
          mode: DESIGN.ENEMIES.mode.active,
          mesh: robot,
          pseudoMesh,
          mixer,
          bend,
          side: null,
          distanceToHero: null,
          isPunch: false,
        });
        scope.scene.add(robot);
        scope.scene.add(skeleton);
        scope.scene.add(pseudoMesh);
        scope.objectsPseudoEnemies.push(pseudoMesh);
      });
    }
    loaderDispatchHelper(scope.$store, 'isRobotsBuilt');

    manager.onLoad = () => {
      managerAudio.onLoad = () => {
        audioLoader2.load('./audio/robotsnoize.mp3', (buffer) => {
          addImmediateAudioToObjects(scope, robots, buffer, DESIGN.VOLUME.robots.noize, true);

          robots.forEach((robot) => {if (!scope.objectsEnemies.includes(robot)) scope.objectsEnemies.push(robot)});

          loaderDispatchHelper(scope.$store, 'isRobotsNoizeComplete');
        });
      };

      audioLoader1.load('./audio/robotsrun.mp3', (buffer) => {
        addImmediateAudioToObjects(scope, robots, buffer, DESIGN.VOLUME.robots.run, true);

        loaderDispatchHelper(scope.$store, 'isRobotsRunComplete');
      });
    };
  };

  this.animate = (scope) => {
    robots.filter(robot => robot.mode !== DESIGN.ENEMIES.mode.thing).forEach((robot) => {
      if (robot.mode === DESIGN.ENEMIES.mode.idle || robot.mode === DESIGN.ENEMIES.mode.active) {
        // Скорость
        intoxication = getMinIntoxication(robot.health);
        speed = OBJECTS.ROBOTS.velocityMove[robot.mode] * intoxication;

        // Скорость аудио
        if (robot.pseudoMesh.children[0] && robot.pseudoMesh.children[0].isPlaying)
          robot.pseudoMesh.children[0].setPlaybackRate(speed / 1.5);
        if (robot.pseudoMesh.children[1] && robot.pseudoMesh.children[1].isPlaying)
          robot.pseudoMesh.children[1].setPlaybackRate(speed / 1.5);
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

          // sober(robot, scope);
          break;

        // Aктивный режим
        case DESIGN.ENEMIES.mode.active:
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

          // Объект спереди - поворачиваем
          if (scope.intersections.length > 0) {
            // Позиция
            // console.log('Отбрасываем!!!');
            if (scope.intersections[0].distance < 1) {
              robot.mesh.position.add(robot.mesh.getWorldDirection(scope.direction).negate().multiplyScalar(speed * OBJECTS.ROBOTS.distance[robot.mode] * scope.delta * 10));
              robot.pseudoMesh.position.add(robot.pseudoMesh.getWorldDirection(scope.direction).negate().multiplyScalar(speed * OBJECTS.ROBOTS.distance[robot.mode] * scope.delta * 10));
            } else {
              robot.mesh.position.add(robot.mesh.getWorldDirection(scope.direction).negate().multiplyScalar(speed * OBJECTS.ROBOTS.distance[robot.mode] * scope.delta));
              robot.pseudoMesh.position.add(robot.pseudoMesh.getWorldDirection(scope.direction).negate().multiplyScalar(speed * OBJECTS.ROBOTS.distance[robot.mode] * scope.delta));
            }

            // Поворот
            robot.side = yesOrNo();
            robot.mesh.rotateY(robot.side * Math.PI / 4);
          } else {
            // Вперед!!!
            robot.side = null;

            dictance = scope.controls.getObject().position.distanceTo(robot.mesh.position);
            rotateCooeficient = dictance - robot.distanceToHero < 1 ? dictance * 2.5 / robot.distanceToHero : 1;

            if (dictance < OBJECTS.ROBOTS.distance[robot.mode] / 1.5) {
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
            directionOnHero.subVectors(scope.controls.getObject().position, robot.mesh.position).normalize();
            directionOnHero.y = 0;
            angle = directionOnHero.angleTo(scope.direction.applyAxisAngle(y, Math.PI / 2));
            rotate = angle - Math.PI / 2 <= 0 ? rotateCooeficient : -1 * rotateCooeficient;
            robot.mesh.rotateY(rotate * intoxication * scope.delta);

            if (!robot.isPunch) {
              // Позиция
              robot.mesh.position.add(robot.mesh.getWorldDirection(scope.direction).multiplyScalar(speed * OBJECTS.ROBOTS.distance[robot.mode] * scope.delta));
              robot.pseudoMesh.position.add(robot.mesh.getWorldDirection(scope.direction).multiplyScalar(speed * OBJECTS.ROBOTS.distance[robot.mode] * scope.delta));

              robot.distanceToHero = dictance;
            }
          }

          // Позиция
          robot.pseudoMesh.position.set(robot.mesh.position.x, robot.mesh.position.y, robot.mesh.position.z);
          break;

        // Опьянел
        case DESIGN.ENEMIES.mode.drunk:
          stop(robot);
          if (robot.mixer.clipAction(animations[0]).isRunning()) robot.mixer.clipAction(animations[0]).fadeOut(1).stop();
          if (robot.mixer.clipAction(animations[5]).isRunning()) robot.mixer.clipAction(animations[5]).fadeOut(1).stop();
          if (robot.mixer.clipAction(animations[6]).isRunning()) robot.mixer.clipAction(animations[6]).fadeOut(1).stop();
          if (!robot.mixer.clipAction(animations[1]).isRunning()) {
            robot.mixer.clipAction(animations[1]).loop = Three.LoopOnce;
            robot.mixer.clipAction(animations[1]).clampWhenFinished = true;
            robot.mixer.clipAction(animations[1]).setDuration(5).fadeIn(1).play();
            console.log(robot.mixer);
          }
          break;
      }

      if (robot.mixer) robot.mixer.update(speed * scope.delta);
    });
  };

  const stop = (robot) => {
    if (robot.pseudoMesh.children[0] && robot.pseudoMesh.children[0].isPlaying) robot.pseudoMesh.children[0].stop();
    if (robot.pseudoMesh.children[1] && robot.pseudoMesh.children[1].isPlaying) robot.pseudoMesh.children[1].stop();
  };

  this.stop = () => {
    robots.forEach((robot) => {
      if (robot.pseudoMesh.children[0] && robot.pseudoMesh.children[0].isPlaying) robot.pseudoMesh.children[0].stop();
      if (robot.pseudoMesh.children[1] && robot.pseudoMesh.children[1].isPlaying) robot.pseudoMesh.children[1].stop();
    });
  };
}

export default Robots;
