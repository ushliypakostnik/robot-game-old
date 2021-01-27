import * as Three from 'three';

import { TGALoader } from '@/components/Three/Modules/Utils/TGALoader';

import { OBJECTS } from '@/utils/constants';
import { loaderDispatchHelper } from '@/utils/utilities';

function Boxes() {
  this.init = function(scope, scene, objects) {
    const loader = new TGALoader();
    const geometry = new Three.BoxBufferGeometry(OBJECTS.BOXES.size, OBJECTS.BOXES.size, OBJECTS.BOXES.size).toNonIndexed();
    const texture = loader.load('./images/textures/box.tga', () => {
      scope.render();
      loaderDispatchHelper(scope.$store, 'boxLoaded');
    });
    const material = new Three.MeshPhongMaterial({ color: 0xffffff, map: texture });
    const box = new Three.Mesh(geometry, material);

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < OBJECTS.BOXES.position.length; i++) {
      const b = box.clone();
      b.position.set(OBJECTS.BOXES.position[i][0], OBJECTS.BOXES.position[i][2], OBJECTS.BOXES.position[i][1]);

      // b.castShadow = true;
      // b.receiveShadow = true;
      b.updateMatrix();
      b.matrixAutoUpdate = false;

      scene.add(b);
      objects.push(b);
    }
    loaderDispatchHelper(scope.$store, 'boxesBuilt');
  };
}

export default Boxes;
