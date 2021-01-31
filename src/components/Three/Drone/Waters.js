import * as Three from 'three';

import { Water } from '@/components/Three/Modules/Elements/Water';

import { OBJECTS } from '@/utils/constants';

function Waters(scope) {
  let waters = [];

  const waterNormals = scope.waterTexture.texture;

  const initWater = (scene, geometry) => {
    const water = new Water(
      geometry,
      {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: waterNormals,
        alpha: 0,
        sunDirection: new Three.Vector3(),
        sunColor: 0xf9d71c,
        waterColor: 0x00ffff,
        distortionScale: 3.7,
        fog: scene.fog !== undefined
      }
    );
    water.rotation.x = -Math.PI / 2;

    return water;
  };

  this.init =   function() {
    let water;
    let geometry;

    // Ocean
    geometry = new Three.CircleBufferGeometry(OBJECTS.OCEAN.position[2], 32);
    water = initWater(scope.scene, geometry);
    water.position.set(OBJECTS.OCEAN.position[0], OBJECTS.OCEAN.position[3], OBJECTS.OCEAN.position[1]);

    scope.scene.add(water);
    waters.push(water);
  };
}

export default Waters;
