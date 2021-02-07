import * as Three from 'three';

import { MTLLoader } from '@/components/Three/Modules/Utils/MTLLoader.js';
import { OBJLoader } from '@/components/Three/Modules/Utils/OBJLoader.js';

import { DESIGN, OBJECTS } from '@/utils/constants';
import {
  randomInteger,
  loaderDispatchHelper,
  distance2D,
  degreesToRadians,
  randomPointInCircle,
  isInPointObjectsWithDistance,
  isInRoundObjectsWithCoefficient,
} from '@/utils/utilities';

function Things() {
  const audioLoader = new Three.AudioLoader();
  const MTLLoader1 = new Three.MTLLoader();
  const OBJLoader1 = new Three.OBJLoader();
  const MTLLoader2 = new Three.MTLLoader();
  const OBJLoader2 = new Three.OBJLoader();
  const MTLLoader3 = new Three.MTLLoader();
  const OBJLoader3 = new Three.OBJLoader();
  const MTLLoader4 = new Three.MTLLoader();
  const OBJLoader4 = new Three.OBJLoader();
  const MTLLoader5 = new Three.MTLLoader();
  const OBJLoader5 = new Three.OBJLoader();

  let audio;
  let things;
  let T;
  let thing;
  let y;
  let pick;

  const pseudoGeometry = new Three.SphereBufferGeometry(DESIGN.HERO.height / 2, 32, 32);
  let material;
  let pseudoThing;
  let isBottles;

  const FLOWER_RADIUS = DESIGN.GROUND_SIZE * 0.53;
  const BOTTLES_RADIUS = DESIGN.GROUND_SIZE * 0.57;

  const fixThingPosition = (raduis, stones, waters, trees, x, z) => {
    let counter = 0;
    let newX = x;
    let newZ = z;
    while (isInPointObjectsWithDistance(trees, newX, newZ, 2) ||
          isInRoundObjectsWithCoefficient(stones, newX, newZ, 1.1) ||
          isInRoundObjectsWithCoefficient(waters, newX, newZ, 1.25) ||
          (distance2D(0, 0, newX, newZ) > raduis)) {
      counter++;
      newX = randomInteger(raduis * -1, raduis);
      newZ = randomInteger(raduis * -1, raduis);
      if (counter > 50) break;
    }
    return [newX, newZ];
  };

  const buitRandomThings = (scope, object, quantity, scale, name) => {
    T = [];

    for (let i = 0; i < quantity; i++) {
      thing = object.clone();

      thing.scale.set(scale, scale, scale);
      thing.rotateX(-Math.PI / 2);
      thing.rotateZ(degreesToRadians(randomInteger(-1, 360)));

      isBottles = name === OBJECTS.BOTTLES.name;
      if (isBottles) thing.rotateY(degreesToRadians(randomInteger(-33, 33)));

      const [X, Z] = randomPointInCircle(isBottles ? BOTTLES_RADIUS : FLOWER_RADIUS, 0, 0);
      const [x, z] = fixThingPosition(
        isBottles ? BOTTLES_RADIUS : FLOWER_RADIUS,
        scope.objectsStoneData,
        scope.objectsWaterData,
        scope.objectsTreesData, X, Z);

      y = isBottles ? (OBJECTS.BOTTLES.positionY - Math.random() * 0.1) : OBJECTS.FLOWERS.positionY;
      thing.position.set(x, y, z);

      thing.updateMatrix();
      thing.matrixAutoUpdate = false;

      switch (name) {
        case OBJECTS.FLOWERS.anemone.name:
          material = new Three.MeshPhongMaterial({ color: DESIGN.COLORS.anemone0x });
          break;
        case OBJECTS.FLOWERS.crocus.name:
          material = new Three.MeshPhongMaterial({ color: DESIGN.COLORS.crocus0x });
          break;
        case OBJECTS.FLOWERS.daffodil.name:
          material = new Three.MeshPhongMaterial({ color: DESIGN.COLORS.daffodil0x });
          break;
        case OBJECTS.FLOWERS.tulip.name:
          material = new Three.MeshPhongMaterial({ color: DESIGN.COLORS.tulip0x });
          break;
        case OBJECTS.BOTTLES.name:
        default:
          material = new Three.MeshPhongMaterial({ color: DESIGN.COLORS.primary0x });
          break;
      }
      material.blending = Three.NoBlending;

      pseudoThing = new Three.Mesh(pseudoGeometry, material);

      pseudoThing.position.set(x, y + 1.5, z);
      pseudoThing.name = name;
      pseudoThing.visible = false;

      pseudoThing.updateMatrix();
      pseudoThing.matrixAutoUpdate = false;

      scope.scene.add(thing);
      scope.scene.add(pseudoThing);
      scope.objectsThings.push(pseudoThing);
      T.push({
        mesh: thing,
        pseudoThing,
      });
    }

    return T;
  };

  this.init = function(scope) {
    things = [];

    const geometry = new Three.SphereBufferGeometry(1, 1, 1);
    const material = new Three.MeshStandardMaterial({ color: 0xff0000 });
    pick = new Three.Mesh(geometry, material);

    audioLoader.load('./audio/pick.mp3', (buffer) => {
      audio = new Three.Audio(scope.listener);
      audio.setBuffer(buffer);
      audio.setVolume(DESIGN.VOLUME.normal);
      audio.setLoop(false);

      pick.add(audio);
      pick.visible = false;

      pick.updateMatrix();
      pick.matrixAutoUpdate = false;

      scope.scene.add(pick);
      loaderDispatchHelper(scope.$store, 'isPickComplete');
    });

    // Anemone
    MTLLoader1.load("./images/models/Anemone/12973_anemone_flower_v1_l2.mtl", (materials) => {
      materials.preload();

      OBJLoader1.setMaterials(materials);
      OBJLoader1.load('./images/models/Anemone/12973_anemone_flower_v1_l2.obj', (plant) => {
        loaderDispatchHelper(scope.$store, 'isAnemoneLoaded');

        things.push(...buitRandomThings(
          scope,
          plant,
          OBJECTS.FLOWERS.anemone.quantity,
          OBJECTS.FLOWERS.anemone.scale,
          OBJECTS.FLOWERS.anemone.name,
        ));

        loaderDispatchHelper(scope.$store, 'isAnemonesBuilt');
      });
    });

    // Crocus
    MTLLoader2.load("./images/models/Crocus/12974_crocus_flower_v1_l3.mtl", (materials) => {
      materials.preload();

      OBJLoader2.setMaterials(materials);
      OBJLoader2.load('./images/models/Crocus/12974_crocus_flower_v1_l3.obj', (plant) => {
        loaderDispatchHelper(scope.$store, 'isCrocusLoaded');

        things.push(...buitRandomThings(
          scope,
          plant,
          OBJECTS.FLOWERS.crocus.quantity,
          OBJECTS.FLOWERS.crocus.scale,
          OBJECTS.FLOWERS.crocus.name,
        ));

        loaderDispatchHelper(scope.$store, 'isCrocusesBuilt');
      });
    });

    // Daffodil
    MTLLoader3.load("./images/models/Daffodil/12977_Daffodil_flower_v1_l2.mtl", (materials) => {
      materials.preload();

      OBJLoader3.setMaterials(materials);
      OBJLoader3.load('./images/models/Daffodil/12977_Daffodil_flower_v1_l2.obj', (plant) => {
        loaderDispatchHelper(scope.$store, 'isDaffodilLoaded');

        things.push(...buitRandomThings(
          scope,
          plant,
          OBJECTS.FLOWERS.daffodil.quantity,
          OBJECTS.FLOWERS.daffodil.scale,
          OBJECTS.FLOWERS.daffodil.name,
        ));

        loaderDispatchHelper(scope.$store, 'isDaffodilsBuilt');
      });
    });

    // Tulip
    MTLLoader4.load("./images/models/Tulip/12978_tulip_flower_l3.mtl", (materials) => {
      materials.preload();

      OBJLoader4.setMaterials(materials);
      OBJLoader4.load('./images/models/Tulip/12978_tulip_flower_l3.obj', (plant) => {
        loaderDispatchHelper(scope.$store, 'isTulipLoaded');

        things.push(...buitRandomThings(
          scope,
          plant,
          OBJECTS.FLOWERS.tulip.quantity,
          OBJECTS.FLOWERS.tulip.scale,
          OBJECTS.FLOWERS.tulip.name,
        ));

        loaderDispatchHelper(scope.$store, 'isTulipsBuilt');
      });
    });

    // Bottle
    MTLLoader5.load("./images/models/Bottle/14042_750_mL_Wine_Bottle_r_v2_L3.mtl", (materials) => {
      materials.preload();

      OBJLoader5.setMaterials(materials);
      OBJLoader5.load('./images/models/Bottle/14042_750_mL_Wine_Bottle_r_v2_L3.obj', (bottle) => {
        loaderDispatchHelper(scope.$store, 'isBottleLoaded');

        things.push(...buitRandomThings(
          scope,
          bottle,
          OBJECTS.BOTTLES.quantity,
          OBJECTS.BOTTLES.scale,
          OBJECTS.BOTTLES.name,
        ));

        loaderDispatchHelper(scope.$store, 'isBottlesBuilt');
      });
    });
  };

  this.pick = function(scope) {
    thing = things.find(item => item.pseudoThing.id === scope.thing.id);
    const { mesh, pseudoThing } = thing;
    scope.scene.remove(mesh);
    scope.scene.remove(pseudoThing);
    scope.objectsThings.splice(scope.objectsThings.indexOf(pseudoThing), 1);

    switch (pseudoThing.name) {
      case OBJECTS.FLOWERS.anemone.name:
        scope.setScale({ field: OBJECTS.FLOWERS.anemone.name, value: 1 });
        break;
      case OBJECTS.FLOWERS.crocus.name:
        scope.setScale({ field: OBJECTS.FLOWERS.crocus.name, value: 1 });
        break;
      case OBJECTS.FLOWERS.daffodil.name:
        scope.setScale({ field: OBJECTS.FLOWERS.daffodil.name, value: 1 });
        break;
      case OBJECTS.FLOWERS.tulip.name:
        scope.setScale({ field: OBJECTS.FLOWERS.tulip.name, value: 1 });
        break;
      case OBJECTS.BOTTLES.name:
        scope.setScale({ field: DESIGN.HERO.scales.ammo.name, value: DESIGN.EFFECTS.bottle.ammo });
        break;
    }

    // Sound
    if (pick && pick.children[0]) pick.children[0].play();
  };

  this.toggle = function(scope) {
    scope.objectsThings.forEach((thing) => {
      if (scope.isDrone) {
        thing.scale.set(2, 2, 2);
        thing.position.y += 0.5;
        thing.visible = scope.isDrone;
      } else {
        thing.visible = scope.isDrone;
        thing.scale.set(1, 1, 1);
        thing.position.y -= 0.5;
      }
      thing.updateMatrix();
    });
  };
}

export default Things;
