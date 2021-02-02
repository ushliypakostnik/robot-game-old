import * as Three from 'three';

import { DESIGN, OBJECTS } from '@/utils/constants';
import {
  yesOrNo,
  loaderDispatchHelper,
  distance2D,
} from '@/utils/utilities';

function Grass() {
  let inLake;
  let onPuddleEdge;

  const isInLakes = (x, z) => {
    const result = OBJECTS.LAKES.position.filter(lake => distance2D(lake[0], lake[1], x, z) < lake[2] * 1.25);
    return result.length > 0 ? result[0] : false;
  };

  const isOnEdgePuddles = (puddles, x, z) => {
    const result = puddles.filter((puddle) => {
      const px = puddle.position.x;
      const pz = puddle.position.z;
      const pr = puddle.geometry.parameters.radius;

      return ((distance2D(px, pz, x, z) < pr + 1.5) && (distance2D(px, pz, x, z) > pr - 0.5));
    });
    return result.length > 0;
  };

  this.init = function(scope) {
    // Vertex displacement
    const vertex = new Three.Vector3();

    // let geometry = new Three.CircleBufferGeometry(DESIGN.GROUND_SIZE / 2, 128);
    let geometry = new Three.PlaneBufferGeometry(DESIGN.GROUND_SIZE * 0.9875, DESIGN.GROUND_SIZE * 0.9875, DESIGN.GROUND_SIZE / 10, DESIGN.GROUND_SIZE / 10);

    const { position } = geometry.attributes;
    // eslint-disable-next-line no-plusplus
    for (let i = 0, l = position.count; i < l; i++) {
      vertex.fromBufferAttribute(position, i);

      vertex.x += Math.random() * yesOrNo() * 2;

      vertex.y += Math.random() * yesOrNo() * 2;

      vertex.z += Math.random() * yesOrNo();
      if (distance2D(0, 0, vertex.x, vertex.y) > (DESIGN.GROUND_SIZE * 0.975) / 2) vertex.z = -2;
      if ((distance2D(0, 0, vertex.x, vertex.y) < (DESIGN.GROUND_SIZE * 0.975) / (4 + Math.random() * yesOrNo())) && vertex.z < -0.1) vertex.z = -0.01;

      // Меньше травы внутри озер
      inLake = isInLakes(vertex.y, vertex.x);
      if (inLake) vertex.z -= (Math.random() * 1.5) * inLake[2] / distance2D(inLake[0], inLake[1], vertex.y, vertex.x);

      // Подъем на краю луж
      onPuddleEdge = isOnEdgePuddles(scope.objectsPuddles, vertex.y, vertex.x);
      if (onPuddleEdge) vertex.z = (Math.random() + 0.1) / 1.75 + OBJECTS.PUDDLES.positionY;

      position.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }

    geometry = geometry.toNonIndexed(); // ensure each face has unique vertices

    const map = new Three.TextureLoader().load('./images/textures/grass.jpg', () => {
      scope.render();
      loaderDispatchHelper(scope.$store, 'isGrassLoaded');
    });
    const material = new Three.MeshLambertMaterial({ color: 0xfa9a9a, map });

    const ground = new Three.Mesh(geometry, material);
    ground.rotation.x = -Math.PI / 2;
    ground.rotation.z = -Math.PI / 2;
    ground.position.set(0, 0, 0);
    ground.material.map.repeat.set(256, 256);
    // eslint-disable-next-line no-multi-assign
    ground.material.map.wrapS = ground.material.map.wrapT = Three.RepeatWrapping;
    ground.material.map.encoding = Three.sRGBEncoding;

    ground.name = OBJECTS.GROUND.name;

    ground.updateMatrix();
    ground.matrixAutoUpdate = true;

    scope.scene.add(ground);
    loaderDispatchHelper(scope.$store, 'isGrassBuilt');
  };
}

export default Grass;
