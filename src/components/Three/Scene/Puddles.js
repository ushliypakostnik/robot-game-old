import * as Three from 'three';

import { Water } from '@/components/Three/Modules/Elements/Water';

import { OBJECTS } from '@/utils/constants';

function Puddles() {
  let puddles = [];

  this.init = function(scope, scene) {
    for (let i = 0; i < OBJECTS.PUDDLES.length; i++) {
      const puddleGeometry = new Three.CircleBufferGeometry(OBJECTS.PUDDLES[i][2], 32);

      const puddle = new Water(
        puddleGeometry,
        {
          textureWidth: 512,
          textureHeight: 512,
          waterNormals: new Three.TextureLoader().load('./images/textures/water.jpg', function (texture) {
            texture.wrapS = texture.wrapT = Three.RepeatWrapping;
            scope.render();
          }),
          alpha: 1.0,
          sunDirection: new Three.Vector3(),
          sunColor: 0xffffff,
          waterColor: 0x001e0f,
          distortionScale: 3.7,
          fog: scene.fog !== undefined
        }
      );
      puddle.rotation.x = -Math.PI / 2;
      puddle.position.set(OBJECTS.PUDDLES[i][0], OBJECTS.PUDDLES[i][3], OBJECTS.PUDDLES[i][1]);

      scene.add(puddle);
      puddles.push(puddle);
    }
  };

  this.animate = function () {
    puddles.forEach((puddle) => {
      puddle.material.uniforms[ 'time' ].value += 1.0 / 60.0;
    });
  }
}

export default Puddles;
