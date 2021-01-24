import * as Three from 'three';

import { OBJECTS } from '@/utils/constants';
import { randomInteger } from '@/utils/utilities';

import { GLTFLoader } from '@/components/Three/Modules/Utils/GLTFLoader';

/* eslint-disable no-param-reassign, func-names */
function Horses() {
  const horses = [];
  let raycaster;

  this.init = function (scene, objects) {
    const loader = new GLTFLoader();
    loader.load('./images/models/Horse.glb', (gltf) => {
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < OBJECTS.HORSES.start.length; i++) {
        const horse = gltf.scene.clone(true).children[0];
        horse.scale.set(0.25, 0.25, 0.25);
        horse.position.set(OBJECTS.HORSES.start[i][0], 0, OBJECTS.HORSES.start[i][1]);

        horse.castShadow = true;
        horse.receiveShadow = true;

        const rotate = randomInteger(-180, 180);
        const bend = randomInteger(-1, 1);
        horse.rotateY(rotate);

        const accelerationVelocity = Math.random();
        const accelerationBend = Math.random();

        const mixer = new Three.AnimationMixer(horse);
        mixer.clipAction(gltf.animations[0]).setDuration(1).play();

        raycaster = new Three.Raycaster(new Three.Vector3(), new Three.Vector3(0, 0, 0), 0, 10);

        horses.push({
          mesh: horse,
          mixer,
          bend,
          accelerationVelocity,
          accelerationBend,
          beforeObject: false,
          side: null,
        });
        scene.add(horse);
        objects.push(horse);
      }
    });
  };

  this.animate = function (delta, objects) {
    horses.forEach((horse) => {
      // Raycast
      const directionForward = horse.mesh.getWorldDirection();
      raycaster.set(horse.mesh.position, directionForward);
      const intersections = raycaster.intersectObjects(objects);
      const beforeObject = intersections.length > 0;

      if (beforeObject) {
        horse.beforeObject = true;
        while (horse.side === 0 || horse.side === null) {
          horse.side = randomInteger(-1, 1);
        }
        // eslint-disable-next-line max-len
        horse.mesh.position.add(horse.mesh.getWorldDirection().negate().multiplyScalar((OBJECTS.HORSES.velocity * horse.accelerationVelocity) * delta));
        horse.mesh.rotateY(horse.side * 45);
      } else {
        horse.beforeObject = false;
        horse.side = null;

        const decisionBend = randomInteger(1, 50) === 1;
        if (decisionBend) horse.bend = randomInteger(-1, 1);

        const decisionAccelerationBend = randomInteger(1, 100) === 1;
        if (decisionAccelerationBend) horse.accelerationBend = Math.random();

        horse.mesh.rotateY((horse.bend + horse.accelerationBend) * delta);

        const decisionAccelerationVelocity = randomInteger(1, 150) === 1;
        if (decisionAccelerationVelocity) horse.accelerationVelocity = Math.random() + 0.5;

        // eslint-disable-next-line max-len
        horse.mesh.position.add(horse.mesh.getWorldDirection().multiplyScalar((OBJECTS.HORSES.velocity * horse.accelerationVelocity) * delta));
      }

      if (horse.mixer) {
        horse.mixer.update(delta);
      }
    });
  };
}

export default Horses;
