import * as Three from 'three';

import { OBJLoader } from '@/components/Three/Modules/Utils/OBJLoader.js';
import { GLTFLoader } from '@/components/Three/Modules/Utils/GLTFLoader';

import { DESIGN } from '@/utils/constants';
import { loaderDispatchHelper } from '@/utils/utilities';

function Plot() {
  const OBJLoader = new Three.OBJLoader();
  const loader = new GLTFLoader();

  let woman;
  let animations;
  let mixer;

  let toWin = false;

  this.init = (scope) => {
    // Boat
    OBJLoader.load('./images/models/tekne.obj', (boat) => {
      loaderDispatchHelper(scope.$store, 'isBoatLoaded');

      boat.scale.set(7, 7, 7);
      boat.rotateX(-Math.PI / 50);
      boat.rotateZ(-Math.PI / 50);
      boat.rotateY(Math.PI / 50);

      boat.position.set(DESIGN.HERO.start[0] - 125, -7.5, DESIGN.HERO.start[1] + 50);

      boat.updateMatrix();
      boat.matrixAutoUpdate = false;

      scope.scene.add(boat);

      loaderDispatchHelper(scope.$store, 'isBoatBuilt');
    });

    // Woman-robot
    loader.load('./images/models/Xbot.glb', (gltf) => {
      loaderDispatchHelper(scope.$store, 'isWomanLoaded');
      woman = gltf.scene;
      animations = gltf.animations;

      woman.scale.set(1.9, 1.9, 1.9);
      woman.rotateY(Math.PI / 7);
      woman.position.set(DESIGN.HERO.start[0] - 7, 0.3, DESIGN.HERO.start[1] - 20);

      mixer = new Three.AnimationMixer(woman);
      mixer.clipAction(animations[1]).setEffectiveTimeScale(1).setDuration(1).play();
      mixer.clipAction(animations[2]).setEffectiveTimeScale(2).setDuration(1).play();
      if (mixer) mixer.update(scope.delta);

      woman.updateMatrix();
      woman.matrixAutoUpdate = true;

      scope.scene.add(woman);
      scope.render();
      loaderDispatchHelper(scope.$store, 'isWomanBuilt');
    });
  };

  this.animate = (scope) => {
    if (mixer) {
      mixer.update(scope.delta / 2);

      if (scope.isWin && !toWin) {
        toWin = true;
        if (mixer.clipAction(animations[1]).isRunning()) mixer.clipAction(animations[1]).stop();
      }
    }
  };
}

export default Plot;
