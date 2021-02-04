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
  addAudioToPseudoObjects,
} from '@/utils/utilities';

function Horses() {
  const manager = new Three.LoadingManager();
  const managerAudio1 = new Three.LoadingManager();
  const managerAudio2 = new Three.LoadingManager();
  const loader = new GLTFLoader(manager);
  const audioLoader1 = new Three.AudioLoader(managerAudio1);
  const audioLoader2 = new Three.AudioLoader(managerAudio2);
  const audioLoader3 = new Three.AudioLoader();

  const fakeMaterial = new Three.MeshLambertMaterial({ color: 0xff0000 });
  const fakeGeometry = new Three.SphereBufferGeometry(OBJECTS.HORSES.scale * 220, 32, 32);
  let pseudoHorse;

  let audioClock;
  let audioTime = 0;
  let volume;

  const horses = [];
  let horse;
  let X;
  let Z;
  let rotate;
  let bend;
  let accelerationVelocity;
  let accelerationBend;

  let mixer;
  let decision;

  const HORSES_RADIUS = DESIGN.GROUND_SIZE * 0.55;

  this.init = function (scope) {
    managerAudio2.onLoad = () => {
      audioLoader3.load('./audio/horsefr.mp3', (buffer) => {
        addAudioToPseudoObjects(scope, horses, 'pseudoHorse', buffer, DESIGN.VOLUME.horses.fr);

        loaderDispatchHelper(scope.$store, 'isHorseFrComplete');
      });
    };

    managerAudio1.onLoad = () => {
      audioLoader2.load('./audio/waterhorse.mp3', (buffer) => {
        addImmediateAudioToObjects(scope, horses, buffer);

        loaderDispatchHelper(scope.$store, 'isHorseWaterRunComplete');
      });
    };

    manager.onLoad = () => {
      audioLoader1.load('./audio/horse.mp3', (buffer) => {
        addImmediateAudioToObjects(scope, horses, buffer);

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

        const [x, z] = fixEnemyPosition(
          HORSES_RADIUS,
          scope.objectsStoneData,
          scope.objectsTreesData, X, Z);

        horse.position.set(x, 0, z);

        rotate = randomInteger(-180, 180);
        bend = yesOrNo();
        horse.rotateY(rotate);

        accelerationVelocity = Math.random();
        accelerationBend = Math.random();

        mixer = new Three.AnimationMixer(horse);
        mixer.clipAction(gltf.animations[0]).setDuration(1).play();

        pseudoHorse = new Three.Mesh(fakeGeometry, fakeMaterial);

        pseudoHorse.position.set(x, 0, z);
        pseudoHorse.visible = false;

        horses.push({
          mesh: horse,
          pseudoHorse,
          mixer,
          bend,
          accelerationVelocity,
          accelerationBend,
          onForward: false,
          side: null,
          isOnWater: null,
          layers: [],
          layersNew: [],
        });
        scope.scene.add(horse);
        scope.scene.add(pseudoHorse);
      }
    });

    audioClock = new Three.Clock(false);
  };

  this.animate = function (scope) {
    horses.forEach((horse, index) => {
      // Raycast
      scope.directionForward = horse.mesh.getWorldDirection(scope.direction);
      scope.raycasterForward.set(horse.mesh.position, scope.directionForward);
      scope.intersections = scope.raycasterForward.intersectObjects(scope.objectsVertical);
      scope.onForward = scope.intersections.length > 0;

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

      if (scope.onForward) {
        horse.onForward = true;
        horse.side = yesOrNo();
        horse.mesh.position.add(horse.mesh.getWorldDirection(scope.direction).negate().multiplyScalar((OBJECTS.HORSES.velocity * horse.accelerationVelocity) * scope.delta));
        horse.mesh.rotateY(horse.side * 45);
      } else {
        horse.onForward = false;
        horse.side = null;

        decision = randomInteger(1, 25) === 1;
        if (decision) horse.bend = yesOrNo();

        decision = randomInteger(1, 50) === 1;
        if (decision) horse.accelerationBend = Math.random();

        horse.mesh.rotateY((horse.bend + horse.accelerationBend) * scope.delta);

        decision = randomInteger(1, 50) === 1;
        if (decision) horse.accelerationVelocity = Math.random() + 0.5;
        if (horse.accelerationVelocity < 0.5) horse.accelerationVelocity = 0.5;

        if (distance2D(0, 0, horse.mesh.position.x, horse.mesh.position.z) > HORSES_RADIUS)
          horse.mesh.rotateY(horse.side * 45);

        horse.mesh.position.add(horse.mesh.getWorldDirection(scope.direction).multiplyScalar((OBJECTS.HORSES.velocity * horse.accelerationVelocity) * scope.delta));
      }

      // Audio
      if (horse.mesh) {
        if (!audioClock.running && audioTime === 0) audioClock.start();

        if (audioTime > 1) audioClock.stop();
        else {
          audioTime += audioClock.getDelta();
          volume = DESIGN.VOLUME.horses.volume * audioTime;
          if (volume > 1) volume = 1;
          if (horse.mesh.children[0] && horse.mesh.children[0].isPlaying) horse.mesh.children[0].setVolume(volume);
          if (horse.mesh.children[1] && horse.mesh.children[1].isPlaying) horse.mesh.children[1].setVolume(volume);
        }

        if (!horse.isOnWater) {
          // if (horse.mesh.children[1] && horse.mesh.children[1].isPlaying) horse.mesh.children[1].stop();
          if (horse.mesh.children[0] && !horse.mesh.children[0].isPlaying) horse.mesh.children[0].play();
        } else {
          if (horse.mesh.children[0] && horse.mesh.children[0].isPlaying) horse.mesh.children[0].stop();
          if (horse.mesh.children[1] && !horse.mesh.children[1].isPlaying) horse.mesh.children[1].play();
        }

        if (horse.mesh.children[0] && horse.mesh.children[0].isPlaying)
          horse.mesh.children[0].setPlaybackRate(horse.accelerationVelocity / 1.2);
        if (horse.mesh.children[1] && horse.mesh.children[1].isPlaying)
          horse.mesh.children[1].setPlaybackRate(horse.accelerationVelocity / 1.2);

        decision = randomInteger(1, 150) === 1;
        if (decision) if (horse.pseudoHorse.children[0] && !horse.pseudoHorse.children[0].isPlaying) horse.pseudoHorse.children[0].play();
      }

      horse.pseudoHorse.position.set(horse.mesh.position.x, 0, horse.mesh.position.z);
      if (horse.mixer) horse.mixer.update(scope.delta * horse.accelerationVelocity);
    });
  };

  this.stop = () => {
    horses.forEach((horse) => {
      if (horse.mesh && horse.mesh.children[0] && horse.mesh.children[0].isPlaying) horse.mesh.children[0].stop();
      if (horse.mesh && horse.mesh.children[1] && horse.mesh.children[1].isPlaying) horse.mesh.children[1].stop();
      if (horse.mesh && horse.mesh.children[2] && horse.mesh.children[2].isPlaying) horse.mesh.children[2].stop();

      if (horse.pseudoHorse && horse.pseudoHorse.children[0] && horse.pseudoHorse.children[0].isPlaying) horse.pseudoHorse.children[0].stop();
    });
  };
}

export default Horses;
