import * as Three from 'three';

import { OBJECTS } from '@/utils/constants';
import { randomInteger } from '@/utils/utilities';

import { GLTFLoader } from '@/components/Three/Modules/Utils/GLTFLoader';

function Horses() {
  const horses = [];

  this.init = function(scene, objects) {
    const loader2 = new GLTFLoader();
    loader2.load('./images/models/Horse.glb', (gltf) => {
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < OBJECTS.HORSES.start.length; i++) {
        const horse = gltf.scene.clone(true).children[0];
        horse.scale.set(0.25, 0.25, 0.25);
        horse.position.set(OBJECTS.HORSES.start[i][0], 0, OBJECTS.HORSES.start[i][1]);

        const rotate = randomInteger(-180, 180);
        const bend = randomInteger(-1, 1);
        horse.rotateY(rotate);

        const accelerationVelocity = Math.random();
        const accelerationBend = Math.random();

        const mixer = new Three.AnimationMixer(horse);
        mixer.clipAction(gltf.animations[0]).setDuration(1).play();

        horses.push({
          mesh: horse,
          mixer,
          bend,
          accelerationVelocity,
          accelerationBend,
        });
        scene.add(horse);
        objects.push(horse);
      }
    });
  };

  this.animate = function(delta) {
    horses.forEach((horse) => {
      const decisionBend = randomInteger(1, 50) === 1;
      if (decisionBend) horse.bend = randomInteger(-1, 1);

      const decisionAccelerationBend = randomInteger(1, 100) === 1;
      if (decisionAccelerationBend) horse.accelerationBend = Math.random();

      horse.mesh.rotateY((horse.bend + horse.accelerationBend) * delta );

      const decisionAccelerationVelocity = randomInteger(1, 200) === 1;
      if (decisionAccelerationBend) horse.accelerationVelocity = Math.random() + 0.5;

      horse.mesh.position.add(horse.mesh.getWorldDirection().multiplyScalar((OBJECTS.HORSES.velocity * horse.accelerationVelocity) * delta));

      if (horse.mixer) {
        horse.mixer.update(delta);
      }
    });
  };
}

export default Horses;
