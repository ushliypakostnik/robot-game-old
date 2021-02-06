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
} from '@/utils/utilities';

function Parrots() {
  const manager = new Three.LoadingManager();
  const managerAudio1 = new Three.LoadingManager();
  const loader = new GLTFLoader(manager);
  const audioLoader1 = new Three.AudioLoader(managerAudio1);
  const audioLoader2 = new Three.AudioLoader();

  const fakeMaterial = new Three.MeshLambertMaterial({ color: 0xff0000 });
  const fakeGeometry = new Three.SphereBufferGeometry(OBJECTS.PARROTS.scale * 60, 32, 32);
  let pseudoParrot;

  let audioClock;
  let audioTime = 0;
  let volume;

  const parrots = [];
  let parrot;
  let X;
  let Z;
  let y;
  let rotate;
  let bend;
  let accelerationVelocity;
  let accelerationBend;
  let velocityVertical;
  let onDown;

  let mixer;
  let decision;

  const PARROTS_RADIUS = DESIGN.GROUND_SIZE * 0.6;

  this.init = function(scope) {
    managerAudio1.onLoad = () => {
      audioLoader2.load('./audio/parrotcry.mp3', (buffer) => {
        addAudioToPseudoObjects(scope, parrots, 'pseudoParrot', buffer, DESIGN.VOLUME.parrots.cry);

        loaderDispatchHelper(scope.$store, 'isParrotCryComplete');
      });
    };

    manager.onLoad = () => {
      audioLoader1.load('./audio/parrotfly.mp3', (buffer) => {
        addImmediateAudioToObjects(scope, parrots, buffer);

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

        const [x, z] = fixEnemyPosition(
          PARROTS_RADIUS,
          scope.objectsStoneData,
          scope.objectsTreesData, X, Z);

        parrot.position.set(x, y, z);

        rotate = randomInteger(-180, 180);
        bend = yesOrNo();
        parrot.rotateY(rotate);

        accelerationBend = Math.random();
        accelerationVelocity = Math.random() + 0.5;
        velocityVertical = Math.random() + 2.5;

        mixer = new Three.AnimationMixer(parrot);
        mixer.clipAction(gltf.animations[0]).setDuration(1).play();

        pseudoParrot = new Three.Mesh(fakeGeometry, fakeMaterial);

        pseudoParrot.position.set(x, y, z);
        pseudoParrot.visible = false;

        parrots.push({
          mesh: parrot,
          pseudoParrot,
          mixer,
          bend,
          accelerationVelocity,
          accelerationBend,
          velocityVertical,
          beforeObject: false,
          side: null,
        });
        scope.scene.add(parrot);
        scope.scene.add(pseudoParrot);
      }
    });

    audioClock = new Three.Clock(false);
  };

  this.animate = function(scope) {
    parrots.forEach((parrot) => {
      // Raycast
      scope.directionForward = parrot.mesh.getWorldDirection(scope.direction);
      scope.raycasterForward.set(parrot.mesh.position, scope.directionForward);
      scope.intersections = scope.raycasterForward.intersectObjects(scope.objectsVertical);
      scope.onForward = scope.intersections.length > 0;

      scope.directionDown = new Three.Vector3(0, 0, 0).crossVectors(scope.x, scope.z);
      scope.raycasterDown.set(parrot.mesh.position, scope.directionDown);
      scope.intersections = scope.raycasterDown.intersectObjects(scope.objectsVertical);
      onDown = scope.intersections.length > 0;

      if (scope.onForward) {
        parrot.beforeObject = true;
        parrot.side = yesOrNo();

        parrot.mesh.position.add(parrot.mesh.getWorldDirection(scope.direction).negate().multiplyScalar((OBJECTS.PARROTS.velocity * parrot.accelerationVelocity) * scope.delta));
        parrot.mesh.rotateY(parrot.side * 45);
      } else {
        parrot.beforeObject = false;
        parrot.side = null;

        decision = randomInteger(1, 25) === 1;
        if (decision) parrot.bend = yesOrNo();

        decision = randomInteger(1, 50) === 1;
        if (decision) parrot.accelerationBend = Math.random();

        parrot.mesh.rotateY((parrot.bend + parrot.accelerationBend) * scope.delta);

        decision = randomInteger(1, 50) === 1;
        if (decision) parrot.accelerationVelocity = Math.random() + 0.5;

        decision = randomInteger(1, 50) === 1;
        if (decision) parrot.velocityVertical = (Math.random() + 2.5) * yesOrNo();

        if (onDown) {
          parrot.velocityVertical = Math.abs(parrot.velocityVertical);
        } else {
          if (parrot.mesh.position.y < OBJECTS.PARROTS.minHeight ||
            parrot.mesh.position.y > OBJECTS.PARROTS.maxHeight) parrot.velocityVertical *= -1;
        }

        if (distance2D(0, 0, parrot.mesh.position.x, parrot.mesh.position.z) > PARROTS_RADIUS)
          parrot.mesh.rotateY(parrot.side * 45);

        parrot.mesh.position.add(parrot.mesh.getWorldDirection(scope.direction).multiplyScalar((OBJECTS.PARROTS.velocity * parrot.accelerationVelocity) * scope.delta));
        parrot.mesh.position.y += parrot.velocityVertical * scope.delta;
      }

      // Audio
      if (parrot.mesh) {
        if (!audioClock.running && audioTime === 0) audioClock.start();

        if (audioTime > 2) audioClock.stop();
        else {
          audioTime += audioClock.getDelta();
          volume = DESIGN.VOLUME.parrots.volume * audioTime / 2;
          if (volume > 1) volume = 1;
          if (parrot.mesh.children[0] && parrot.mesh.children[0].isPlaying) parrot.mesh.children[0].setVolume(volume);
        }

        if (parrot.mesh.children[0] && !parrot.mesh.children[0].isPlaying) parrot.mesh.children[0].play();

        if (parrot.mesh.children[0] && parrot.mesh.children[0].isPlaying)
          parrot.mesh.children[0].setPlaybackRate(parrot.accelerationVelocity / 1.2);

        decision = randomInteger(1, 175) === 1;
        if (decision) if (parrot.pseudoParrot.children[0] && !parrot.pseudoParrot.children[0].isPlaying) parrot.pseudoParrot.children[0].play();
      }

      parrot.pseudoParrot.position.set(parrot.mesh.position.x, parrot.mesh.position.y, parrot.mesh.position.z);
      if (parrot.mixer) parrot.mixer.update(scope.delta * parrot.accelerationVelocity);
    });
  };

  this.stop = () => {
    parrots.forEach((parrot) => {
      if (parrot.mesh && parrot.mesh.children[0] && parrot.mesh.children[0].isPlaying) parrot.mesh.children[0].stop();
      if (parrot.mesh && parrot.mesh.children[1] && parrot.mesh.children[1].isPlaying) parrot.mesh.children[1].stop();

      if (parrot.pseudoParrot && parrot.pseudoParrot.children[0] && parrot.pseudoParrot.children[0].isPlaying) parrot.pseudoParrot.children[0].stop();
    });
  };
}

export default Parrots;
