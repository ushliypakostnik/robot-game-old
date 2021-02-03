import * as Three from 'three';

import { FBXLoader } from '@/components/Three/Modules/Utils/FBXLoader.js';

import { DESIGN, OBJECTS } from '@/utils/constants';
import { loaderDispatchHelper } from '@/utils/utilities';

function Hero() {
  let mixer;

  const loader = new FBXLoader();
  const audioLoader = new Three.AudioLoader();
  const listener = new Three.AudioListener();
  let audio;

  let steps;
  let run;
  let watersteps;
  let waterrun;
  let waterjump;
  let jump;
  let spit;

  const STOP_DISTANCE = 5;
  const WATER_DAMAGE = 1;
  let onFly = true;
  let onFloor = 0;
  let shot = 0;

  let damageClock;
  let damageTime = 0;

  const geometry = new Three.SphereBufferGeometry(1, 1, 1);
  const material = new Three.MeshStandardMaterial({ color: 0xff0000 });

  this.init = function (scope) {
    loader.load('./images/models/Hero.fbx', (hero) => {
      loaderDispatchHelper(scope.$store, 'isHeroLoaded');

      hero.scale.set(OBJECTS.HERO.scale, OBJECTS.HERO.scale, OBJECTS.HERO.scale);
      hero.visible = false;

      mixer = new Three.AnimationMixer(hero);
      mixer.clipAction(hero.animations[0]).setDuration(1).play();

      audioLoader.load('./audio/masha.mp3', (buffer) => {
        audio = new Three.Audio(listener);
        audio.setBuffer(buffer);
        audio.setVolume(DESIGN.VOLUME.masha);

        // For positioned audio
        // audio.setRefDistance(15);
        // audio.setMaxDistance(500);
        // audio.setRolloffFactor(1) ;
        // audio.setDistanceModel('exponential');

        audio.setLoop(true);

        hero.add(audio);

        scope.robot = hero;
        scope.scene.add(hero);
        loaderDispatchHelper(scope.$store, 'isMashaComplete');
      });
    });

    steps = new Three.Mesh(geometry, material);

    audioLoader.load('./audio/steps.mp3', (buffer) => {
      audio = new Three.Audio(listener);
      audio.setBuffer(buffer);
      audio.setVolume(DESIGN.VOLUME.normal);
      audio.setLoop(true);

      steps.add(audio);
      steps.visible = false;

      scope.scene.add(steps);
      loaderDispatchHelper(scope.$store, 'isStepComplete');
    });

    run = new Three.Mesh(geometry, material);

    audioLoader.load('./audio/run.mp3', (buffer) => {
      audio = new Three.Audio(listener);
      audio.setBuffer(buffer);
      audio.setVolume(DESIGN.VOLUME.normal);
      audio.setLoop(true);

      run.add(audio);
      run.visible = false;

      scope.scene.add(run);
      loaderDispatchHelper(scope.$store, 'isRunComplete');
    });

    watersteps = new Three.Mesh(geometry, material);

    audioLoader.load('./audio/waterstep.mp3', (buffer) => {
      audio = new Three.Audio(listener);
      audio.setBuffer(buffer);
      audio.setVolume(DESIGN.VOLUME.normal);
      audio.setLoop(true);

      watersteps.add(audio);
      watersteps.visible = false;

      scope.scene.add(watersteps);
      loaderDispatchHelper(scope.$store, 'isWaterStepComplete');
    });

    waterrun = new Three.Mesh(geometry, material);

    audioLoader.load('./audio/waterrun.mp3', (buffer) => {
      audio = new Three.Audio(listener);
      audio.setBuffer(buffer);
      audio.setVolume(DESIGN.VOLUME.normal);
      audio.setLoop(true);

      waterrun.add(audio);
      waterrun.visible = false;

      scope.scene.add(waterrun);
      loaderDispatchHelper(scope.$store, 'isWaterRunComplete');
    });

    jump = new Three.Mesh(geometry, material);

    audioLoader.load('./audio/jump.mp3', (buffer) => {
      audio = new Three.Audio(listener);
      audio.setBuffer(buffer);
      audio.setVolume(DESIGN.VOLUME.normal);

      jump.add(audio);
      jump.visible = false;

      scope.scene.add(jump);
      loaderDispatchHelper(scope.$store, 'isJumpComplete');
    });

    waterjump = new Three.Mesh(geometry, material);

    audioLoader.load('./audio/waterjump.mp3', (buffer) => {
      audio = new Three.Audio(listener);
      audio.setBuffer(buffer);
      audio.setVolume(DESIGN.VOLUME.normal);

      waterjump.add(audio);
      waterjump.visible = false;

      scope.scene.add(waterjump);
      loaderDispatchHelper(scope.$store, 'isWaterJumpComplete');
    });

    spit = new Three.Mesh(geometry, material);

    audioLoader.load('./audio/spit.mp3', (buffer) => {
      audio = new Three.Audio(listener);
      audio.setBuffer(buffer);
      audio.setVolume(DESIGN.VOLUME.normal);

      spit.add(audio);
      spit.visible = false;

      scope.scene.add(spit);
      loaderDispatchHelper(scope.$store, 'isSpitComplete');
    });

    damageClock = new Three.Clock(false);
  };

  const jumps = (scope) => {
    if (scope.onWater) {
      if (waterjump && waterjump.children[0]) {
        this.stop();
        waterjump.children[0].play();
      }
    } else if (jump && jump.children[0]) {
      this.stop();
      jump.children[0].play();
    }
  };

  this.animate = function (scope) {
    if (!scope.isPause && !scope.isDrone) {
      // Check objects

      // Forward
      scope.directionForward = scope.camera.getWorldDirection(scope.direction);
      scope.raycasterForward.set(scope.camera.getWorldPosition(scope.position), scope.directionForward);
      scope.intersections = scope.raycasterForward.intersectObjects(scope.objectsVertical);
      scope.onForward = scope.intersections.length > 0 ? scope.intersections[0].distance < STOP_DISTANCE : false;
      if (scope.onForward) scope.object = scope.intersections[0].object;

      // Backward
      scope.directionBackward = scope.directionForward.negate();
      scope.raycasterBackward.set(scope.camera.getWorldPosition(scope.position), scope.directionBackward);
      scope.intersections = scope.raycasterBackward.intersectObjects(scope.objectsVertical);
      scope.onBackward = scope.intersections.length > 0 ? scope.intersections[0].distance < STOP_DISTANCE : false;
      if (scope.onBackward) scope.object = scope.intersections[0].object;

      // Right
      scope.directionRight = new Three.Vector3(0, 0, 0).crossVectors(scope.directionForward, scope.y);
      scope.raycasterRight.set(scope.camera.getWorldPosition(scope.position), scope.directionRight);
      scope.intersections = scope.raycasterRight.intersectObjects(scope.objectsVertical);
      scope.onRight = scope.intersections.length > 0 ? scope.intersections[0].distance < STOP_DISTANCE : false;
      if (scope.onRight) scope.object = scope.intersections[0].object;

      // Left
      scope.directionLeft = scope.directionRight.negate();
      scope.raycasterLeft.set(scope.camera.getWorldPosition(scope.position), scope.directionLeft);
      scope.intersections = scope.raycasterLeft.intersectObjects(scope.objectsVertical);
      scope.onLeft = scope.intersections.length > 0 ? scope.intersections[0].distance < STOP_DISTANCE : false;
      if (scope.onLeft) scope.object = scope.intersections[0].object;

      scope.collision = scope.onForward || scope.onBackward || scope.onLeft || scope.onRight;

      // Down Through
      scope.directionDown = new Three.Vector3(0, 0, 0).crossVectors(scope.x, scope.z);
      scope.raycasterDown.set(scope.camera.getWorldPosition(scope.position), scope.directionDown);
      scope.intersections = scope.raycasterDown.intersectObjects(scope.objectsGround);

      if (scope.intersections.length > 0) {
        scope.layersNew = [];
        scope.intersections.forEach((intersection) => {
          if (!scope.layersNew.includes(intersection.object.name)) scope.layersNew.push(intersection.object.name);
        });
        if (scope.layersNew.length !== scope.layers.length) {
          // console.log(scope.layers, scope.layersNew);
          //  На любой воде
          if (((scope.layersNew.includes(OBJECTS.OCEAN.name)
            && !scope.layersNew.includes(OBJECTS.BEACH.name))
            || scope.layersNew.includes(OBJECTS.LAKES.name)
            || scope.layersNew.includes(OBJECTS.PUDDLES.name))
            && !scope.layersNew.includes(OBJECTS.SANDS.name)) {
            scope.onWater = true;
          } else scope.onWater = false;

          // На большой воде
          if (
            ((scope.layersNew.includes(OBJECTS.OCEAN.name)
              && !scope.layersNew.includes(OBJECTS.BEACH.name)
              && !scope.layersNew.includes(OBJECTS.SANDS.name))
              || (scope.layersNew.includes(OBJECTS.LAKES.name)
                && !scope.layersNew.includes(OBJECTS.SANDS.name)))
          ) {
            scope.onLargeWater = true;
          } else scope.onLargeWater = false;

          // На камне
          if (scope.layersNew.includes(OBJECTS.STONES.name)) {
            scope.object = scope.intersections.filter(object => object.object.name === OBJECTS.STONES.name)[0].object;
            scope.onObjectHeight = scope.object.position.y + scope.object.geometry.parameters.radius + scope.height;
          } else scope.onObjectHeight = 0;

          scope.layers = scope.layersNew;
        }
      }

      // Урон от воды
      if (scope.onWater && scope.canJump) {
        if (!damageClock.running) damageClock.start();

        damageTime += damageClock.getDelta();
        if (damageTime > 0.5) scope.setDamage(WATER_DAMAGE);
      } else {
        if (damageClock.running) damageClock.stop();
        damageTime = 0;
      }

      // Up
      scope.directionUp = scope.directionDown.negate();
      scope.raycasterUp.set(scope.camera.getWorldPosition(scope.position), scope.directionUp);
      scope.intersections = scope.raycasterUp.intersectObjects(scope.objectsVertical);
      scope.onUp = scope.intersections.length > 0;
      if (scope.onUp) scope.object = scope.intersections[0].object;

      // В камне!! ((((
      if (scope.object
        && scope.object.name !== OBJECTS.MOUNTAINS.name
        && (scope.onUp || (scope.onForward && scope.onBackward && scope.onLeft && scope.onRight))) {
        scope.onObjectHeight = scope.object.position.y + scope.object.geometry.parameters.radius + scope.height;
      } else if (scope.object
        && scope.object.name === OBJECTS.MOUNTAINS.name
        && (scope.onUp || (scope.onForward && scope.onBackward && scope.onLeft && scope.onRight))) {
        scope.controls.moveRight(scope.velocity.x * scope.delta * 5);
        scope.controls.moveForward(scope.velocity.z * scope.delta * 5);
      }

      scope.velocity.x -= scope.velocity.x * 10 * scope.delta;
      scope.velocity.z -= scope.velocity.z * 10 * scope.delta;

      scope.direction.z = Number(scope.moveForward) - Number(scope.moveBackward);
      scope.direction.x = Number(scope.moveRight) - Number(scope.moveLeft);
      scope.direction.normalize(); // this ensures consistent movements in all directions

      // eslint-disable-next-line max-len
      if (scope.moveForward || scope.moveBackward) scope.velocity.z -= scope.direction.z * DESIGN.HERO_SPEED * scope.delta;
      // eslint-disable-next-line max-len
      if (scope.moveLeft || scope.moveRight) scope.velocity.x -= scope.direction.x * DESIGN.HERO_SPEED * scope.delta;

      // Скорость движения в зависимости от режима
      if (scope.moveHidden) {
        scope.moveSpeed = 0.25;
      } else if (scope.moveRun) {
        if (scope.onWater) {
          scope.moveSpeed = 1.75;
        } else scope.moveSpeed = 2.5;
      } else if (scope.onWater) {
        scope.moveSpeed = 0.7;
      } else scope.moveSpeed = 1;

      // Прыжок в гору!!
      if (scope.collision && !scope.canJump && scope.object && scope.object.name === OBJECTS.MOUNTAINS.name) {
        if ((scope.onForward && scope.moveForward)
          || (scope.onBackward && scope.moveBackward)
          || (scope.onLeft && scope.moveLeft)
          || (scope.onRight && scope.moveRight)) {
          scope.controls.moveRight(scope.velocity.x * scope.delta * 5);
          scope.controls.moveForward(scope.velocity.z * scope.delta * 5);
          scope.velocity.z = 0;
          scope.velocity.x = 0;
        }
      } else if (!scope.collision) {
        scope.controls.moveRight(-scope.velocity.x * scope.delta * scope.moveSpeed);
        scope.controls.moveForward(-scope.velocity.z * scope.delta * scope.moveSpeed);
      } else if ((scope.onForward && scope.moveForward)
          || (scope.onBackward && scope.moveBackward)
          || (scope.onLeft && scope.moveLeft)
          || (scope.onRight && scope.moveRight)) {
        scope.moveRun = false;
        scope.velocity.z = 0;
        scope.velocity.x = 0;
      } else {
        scope.controls.moveRight(-scope.velocity.x * scope.delta * scope.moveSpeed);
        scope.controls.moveForward(-scope.velocity.z * scope.delta * scope.moveSpeed);
      }

      scope.velocity.y -= 9.8 * DESIGN.HERO_MASS * scope.delta;

      scope.controls.getObject().position.y += (scope.velocity.y * scope.delta);

      if (scope.moveHidden || scope.onLargeWater) {
        scope.height = DESIGN.UNDER_FLOOR / 2;
      } else scope.height = DESIGN.UNDER_FLOOR;

      if (scope.controls.getObject().position.y < scope.height + scope.onObjectHeight) {
        scope.velocity.y = 0;
        scope.controls.getObject().position.y = scope.height + scope.onObjectHeight;
        scope.canJump = true;
      }

      if (scope.ammoIdx !== shot) {
        if (spit && spit.children[0]) {
          spit.children[0].play();
        }
        shot = scope.ammoIdx;
      } else if (scope.canJump !== onFly) {
        if (!onFly) jumps(scope);
        onFly = scope.canJump;
      } else if (scope.onObjectHeight !== onFloor) {
        jumps(scope);
        onFloor = scope.onObjectHeight;
      } else if (scope.moveForward || scope.moveBackward || scope.moveLeft || scope.moveRight) {
        if (scope.moveRun) {
          if (scope.onWater) {
            if (waterrun && waterrun.children[0]) {
              this.stop('waterrun');
              waterrun.children[0].play();
            }
          } else if (run && run.children[0]) {
            this.stop('run');
            run.children[0].play();
          }
        }

        if (!scope.moveRun) {
          if (scope.onWater) {
            if (watersteps && watersteps.children[0]) {
              this.stop('watersteps');
              if (scope.moveHidden) {
                watersteps.children[0].setPlaybackRate(0.75);
              } else watersteps.children[0].setPlaybackRate(1);
              watersteps.children[0].play();
            }
          } else if (steps && steps.children[0]) {
            if (scope.moveHidden) {
              steps.children[0].setPlaybackRate(0.75);
            } else steps.children[0].setPlaybackRate(1);
            this.stop('steps');
            steps.children[0].play();
          }
        }
      } else {
        this.stop();
      }
    } else {
      this.stop();
    }
  };

  this.stop = (play) => {
    if (play !== 'steps' && steps && steps.children[0] && steps.children[0].isPlaying) steps.children[0].stop();
    if (play !== 'run' && run && run.children[0] && run.children[0].isPlaying) run.children[0].stop();
    if (play !== 'watersteps' && watersteps && watersteps.children[0] && watersteps.children[0].isPlaying) watersteps.children[0].stop();
    if (play !== 'waterrun' && waterrun && waterrun.children[0] && waterrun.children[0].isPlaying) waterrun.children[0].stop();
  };

  this.animateDrone = function (scope) {
    if (!scope.isPause) {
      if (mixer) mixer.update(scope.delta / 20);

      if (scope.robot && scope.robot.children[3] && !scope.robot.children[3].isPlaying) scope.robot.children[3].play();
    } else {
      this.stopDrone(scope);
    }
  };

  this.stopDrone = function (scope) {
    if (scope.robot && scope.robot.children[3] && scope.robot.children[3].isPlaying) scope.robot.children[3].pause();
  };
}

export default Hero;
