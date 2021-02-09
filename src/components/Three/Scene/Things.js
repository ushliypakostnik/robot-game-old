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
  messagesByIdDispatchHelper,
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
  let t;
  let thing;
  let randomX;
  let randomZ;
  let x;
  let y;
  let z;
  let sand;
  let onSands;
  let sandIndex;
  let pick;

  const pseudoGeometry = new Three.SphereBufferGeometry(DESIGN.HERO.height / 2, 32, 32);
  let material;
  let pseudoThing;
  let pseudoMesh;
  let isBottles;

  const THINGS_RADIUS = DESIGN.GROUND_SIZE * 0.545;

  // Острова без стартового
  const sands = OBJECTS.SANDS.position.slice(1);

  const fixThingOnSandPosition = (isle, stones, waters, trees, x, z) => {
    let newX = x;
    let newZ = z;
    let counter = 0;
    while (isInPointObjectsWithDistance(trees, newX, newZ, 2) ||
          isInRoundObjectsWithCoefficient(stones, newX, newZ, 1.1) ||
          isInRoundObjectsWithCoefficient(waters, newX, newZ, 1.25)) {
      counter++;
      [randomX, randomZ] = randomPointInCircle(isle[2] * 0.8, isle[0], isle[1]);
      if (counter > 50) break;
    }
    return [newX, newZ];
  };

  const fixThingOnGroundPosition = (raduis, stones, waters, trees, x, z) => {
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
    t = [];

    // Бутылки?
    isBottles = name === OBJECTS.BOTTLES.name;

    // Первый остров на который будем ставитьж
    sandIndex = isBottles ? 1 : 0;

    // Столько таких предметов пойдут на острова
    onSands = randomInteger(Math.floor(quantity / 4), Math.floor(quantity / 2));

    for (let i = 0; i < quantity; i++) {
      thing = object.clone();

      thing.scale.set(scale, scale, scale);
      thing.rotateX(-Math.PI / 2);
      thing.rotateZ(degreesToRadians(randomInteger(-1, 360)));

      if (isBottles) thing.rotateY(degreesToRadians(randomInteger(-33, 33)));

      // На стартовый - только бутылки
      if (isBottles && i < 5) {
        switch (i) {
          case 0:
            [x, z] = [DESIGN.HERO.start[0] + 3, DESIGN.HERO.start[1] - 7];
            break;
          case 1:
            [x, z] = [DESIGN.HERO.start[0] - 7, DESIGN.HERO.start[1] - 12];
            break;
          case 2:
            [x, z] = [DESIGN.HERO.start[0] + 2, DESIGN.HERO.start[1] - 15];
            break;
          case 3:
            [x, z] = [DESIGN.HERO.start[0] + 15, DESIGN.HERO.start[1] + 12];
            break;
          case 4:
            [x, z] = [DESIGN.HERO.start[0] - 17, DESIGN.HERO.start[1] + 10];
            break;
        }
      } else if (onSands > 0) {
        // На другие острова
        if (sandIndex > sands.length - 1) sandIndex = isBottles ? 1 : 0;

        sand = sands[sandIndex];
        [randomX, randomZ] = randomPointInCircle(sand[2] * 0.8, sand[0], sand[1]);
        [x, z] = fixThingOnSandPosition(
          sand,
          scope.objectsStoneData,
          scope.objectsWaterData,
          scope.objectsTreesData,
          randomX,
          randomZ
        );

        onSands--;
        sandIndex = sandIndex + randomInteger(1, Math.floor(OBJECTS.SANDS.position.length / 3));
      } else {
        // Куда-нибудь на суше
        [randomX, randomZ] = randomPointInCircle(THINGS_RADIUS, 0, 0);
        [x, z] = fixThingOnGroundPosition(
          THINGS_RADIUS,
          scope.objectsStoneData,
          scope.objectsWaterData,
          scope.objectsTreesData,
          randomX,
          randomZ
        );
      }

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
      t.push({
        mesh: thing,
        pseudoThing,
      });
    }

    return t;
  };

  this.init = (scope) => {
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

  // Отрендерить бутылки - важно на старте
  this.update = scope => scope.render();

  this.pick = (scope) => {
    thing = things.find(item => item.pseudoThing.id === scope.thing.id);
    if (thing) {
      const { mesh, pseudoThing } = thing;
      scope.scene.remove(mesh);
      scope.scene.remove(pseudoThing);
      scope.objectsThings.splice(scope.objectsThings.indexOf(pseudoThing), 1);

      switch (pseudoThing.name) {
        case OBJECTS.FLOWERS.daffodil.name:
          scope.setScale({ field: OBJECTS.FLOWERS.daffodil.name, value: 1 });
          messagesByIdDispatchHelper(scope, 2, 'pickFlower', OBJECTS.FLOWERS.daffodil.name);
          break;
        case OBJECTS.FLOWERS.anemone.name:
          scope.setScale({ field: OBJECTS.FLOWERS.anemone.name, value: 1 });
          messagesByIdDispatchHelper(scope, 2, 'pickFlower', OBJECTS.FLOWERS.anemone.name);
          break;
        case OBJECTS.FLOWERS.crocus.name:
          scope.setScale({ field: OBJECTS.FLOWERS.crocus.name, value: 1 });
          messagesByIdDispatchHelper(scope, 2, 'pickFlower', OBJECTS.FLOWERS.crocus.name);
          break;
        case OBJECTS.FLOWERS.tulip.name:
          scope.setScale({ field: OBJECTS.FLOWERS.tulip.name, value: 1 });
          messagesByIdDispatchHelper(scope, 2, 'pickFlower', OBJECTS.FLOWERS.tulip.name);
          break;
        case OBJECTS.BOTTLES.name:
          scope.setScale({ field: DESIGN.HERO.scales.ammo.name, value: DESIGN.EFFECTS.bottle.ammo });
          messagesByIdDispatchHelper(scope, 2, 'pickBottle');
          break;
      }
    } else {
      thing = scope.objectsEnemies.find(enemy => enemy.pseudoMesh.id === scope.thing.id);
      if (thing) {
        const { mesh, pseudoMesh } = thing;
        scope.scene.remove(mesh);
        scope.scene.remove(pseudoMesh);
        scope.objectsEnemies.splice(scope.objectsEnemies.indexOf(thing), 1);
        scope.objectsPseudoEnemies.splice(scope.objectsPseudoEnemies.indexOf(pseudoMesh), 1);

        switch (pseudoMesh.name) {
          case OBJECTS.HORSES.name:
            scope.setScale({ field: DESIGN.HERO.scales.power.name, value: DESIGN.EFFECTS.horse.power });
            messagesByIdDispatchHelper(scope, 2, 'pickAnimal', OBJECTS.HORSES.name);
            break;
          case OBJECTS.PARROTS.name:
            scope.setScale({ field: DESIGN.HERO.scales.power.name, value: DESIGN.EFFECTS.parrot.power });
            messagesByIdDispatchHelper(scope, 2, 'pickAnimal', OBJECTS.PARROTS.name);
            break;
        }
      }
    }

    // Sound
    if (pick && pick.children[0]) {
      if (pick.children[0].isPlaying) pick.children[0].stop();
      pick.children[0].play();
    }
  };

  this.toggle = (scope) => {
    scope.objectsThings.forEach((thing) => {
      if (scope.isDrone) {
        thing.scale.set(3.5, 3.5, 3.5);
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
