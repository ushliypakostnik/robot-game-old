import * as Three from 'three';

import { FBXLoader } from '@/components/Three/Modules/Utils/FBXLoader.js';

import { DESIGN, OBJECTS } from '@/utils/constants';
import {
  yesOrNo,
  loaderDispatchHelper,
  distance2D,
} from '@/utils/utilities';

function Plants() {
  const loader = new FBXLoader();

  const isInLakes = (x, z) => {
    const result = OBJECTS.LAKES.position.filter(lake => distance2D(lake[0], lake[1], x, z) < lake[2] * 1.25);
    return result.length > 0 ? result[0] : false;
  };

  this.init = function(scope) {
    loader.load( './images/models/Tree1.fbx', function (object) {
      object.scale.set(OBJECTS.TREES.trees1.scale, OBJECTS.TREES.trees1.scale, OBJECTS.TREES.trees1.scale);
      object.position.set(-30, -2, -30);

      scope.scene.add(object);
      loaderDispatchHelper(scope.$store, 'isTree1Completed');
    });

    loader.load( './images/models/Tree2.fbx', function (object) {
      object.scale.set(OBJECTS.TREES.trees1.scale, OBJECTS.TREES.trees1.scale, OBJECTS.TREES.trees1.scale);
      object.position.set(-30, -2, -30);

      scope.scene.add(object);
      loaderDispatchHelper(scope.$store, 'isTree2Completed');
    });
  };
}

export default Plants;
