import * as Three from 'three';

import { OBJECTS } from '@/utils/constants';
import { loaderDispatchHelper } from '@/utils/utilities';

function Sands() {
  this.init = function(scope) {
    const mapBeach = new Three.TextureLoader().load('./images/textures/sand.jpg', (texture) => {
      scope.render();
      loaderDispatchHelper(scope.$store, 'isSandLoaded1');
    });
    const mapSand = new Three.TextureLoader().load('./images/textures/sand.jpg', (texture) => {
      scope.render();
      loaderDispatchHelper(scope.$store, 'isSandLoaded2');
    });
    const materialBeach = new Three.MeshLambertMaterial({ color: 0xf0db7d, map: mapBeach });
    const materialSand = new Three.MeshLambertMaterial({ color: 0xf0db7d, map: mapSand });
    let geometry;

    // Beach
    geometry = new Three.CircleBufferGeometry(OBJECTS.BEACH.size, 128);

    const beach = new Three.Mesh(geometry, materialBeach);
    beach.rotation.x = -Math.PI / 2;
    beach.position.set(0, OBJECTS.BEACH.positionY, 0);
    beach.material.map.repeat.set(512, 512);
    // eslint-disable-next-line no-multi-assign
    beach.material.map.wrapS = beach.material.map.wrapT = Three.RepeatWrapping;
    beach.material.map.encoding = Three.sRGBEncoding;

    beach.name = OBJECTS.BEACH.name;

    // ground.receiveShadow = true;

    beach.updateMatrix();
    beach.matrixAutoUpdate = true;

    scope.scene.add(beach);
    scope.objectsGround.push(beach);

    // Sands
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < OBJECTS.SANDS.position.length; i++) {
      geometry = new Three.CircleBufferGeometry(OBJECTS.SANDS.position[i][2], 32);

      const sand = new Three.Mesh(geometry, materialSand);
      sand.rotation.x = -Math.PI / 2;
      sand.material.map.repeat.set(24, 24);
      // eslint-disable-next-line no-multi-assign
      sand.material.map.wrapS = sand.material.map.wrapT = Three.RepeatWrapping;
      sand.material.map.encoding = Three.sRGBEncoding;

      sand.position.set(OBJECTS.SANDS.position[i][0], OBJECTS.SANDS.positionY, OBJECTS.SANDS.position[i][1]);

      sand.name = OBJECTS.SANDS.name;

      sand.updateMatrix();
      sand.matrixAutoUpdate = false;

      scope.scene.add(sand);
      scope.objectsGround.push(sand);
    }
    loaderDispatchHelper(scope.$store, 'isSandsBuilt');
  };
}

export default Sands;
