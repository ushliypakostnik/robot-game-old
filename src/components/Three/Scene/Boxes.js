import * as Three from 'three';

import { OBJECTS } from '@/utils/constants';

import { TGALoader } from '@/components/Three/Modules/Utils/TGALoader';

function Boxes() {
  this.init = function(scope, scene, objects) {
    const loader = new TGALoader();
    const geometry = new Three.BoxBufferGeometry(OBJECTS.BOXES.size, OBJECTS.BOXES.size, OBJECTS.BOXES.size).toNonIndexed();
    const texture = loader.load('./images/textures/box.tga', () => {
      scope.render();
    });
    const material = new Three.MeshPhongMaterial({ color: 0xffffff, map: texture });

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < OBJECTS.BOXES.position.length; i++) {
      const box = new Three.Mesh(geometry, material);
      box.position.set(OBJECTS.BOXES.position[i][0], OBJECTS.BOXES.position[i][1], OBJECTS.BOXES.position[i][2]);

      box.castShadow = true;
      box.receiveShadow = true;
      box.updateMatrix();
      box.matrixAutoUpdate = false;

      scene.add(box);
      objects.push(box);
    }
  };
}

export default Boxes;
