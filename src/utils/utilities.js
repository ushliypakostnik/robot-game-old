import * as Three from 'three';

import { DESIGN } from '@/utils/constants';

export const randomInteger = (min, max) => {
  const rand = min + Math.random() * (max + 1 - min);
  return Math.floor(rand);
};

export const yesOrNo = () => {
  let result = 0;
  while (result === 0) {
    result = randomInteger(-1, 1);
  }
  return result;
};

export const lightRandomRaduis = (raduis) => {
  return raduis * (1 + ((Math.random() + 0.01) / 5) * yesOrNo());
};

export const loaderDispatchHelper = (store, field) => {
  store.dispatch('preloader/preloadOrBuilt', field).then(() => {
    store.dispatch('preloader/isAllLoadedAndBuilt');
  }).catch((error) => { console.log(error); });
};

function delay(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });
}

export const messagesDispatchHelper = (scope, name) => {
  let id = scope.message++;
  scope.$store.dispatch('layout/showMessage', { id, view: 2, name }).then(() => {
    delay(DESIGN.MESSAGES_TIMEOUT).then(() => {
      scope.$store.dispatch('layout/hideMessageById', id);
    }).catch((error) => { console.log(error); });
  }).catch((error) => { console.log(error); });
};

export const distance2D = (x1, y1, x2, y2) => {
  return Math.sqrt(((x2 - x1) ** 2) + ((y2 - y1) ** 2));
};

export const degreesToRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

export const randomPointInCircle = (radius, x, y) => {
  const r = radius * Math.sqrt(Math.random());
  const theta = Math.random() * 2 * Math.PI;
  return [x + Math.cos(theta) * r, y + Math.sin(theta) * r];
};

export const getNumberSign = (number) => {
  return number === 0 ? 0 : number > 0 ? 1 : -1;
};

export const isInPointObjectsWithDistance = (objects, x, z, distance) => {
  const result = objects.filter(object => distance2D(object[0], object[1], x, z) < distance);
  return result.length > 0 ? true : false;
};

export const isInRoundObjectsWithCoefficient = (objects, x, z, coefficient) => {
  const result = objects.filter(object => distance2D(object[0], object[1], x, z) < object[2] * coefficient);
  return result.length > 0 ? true : false;
};

export const fixEnemyPosition = (raduis, stones, trees, x, z) => {
  let counter = 0;
  let newX = x;
  let newZ = z;
  while (isInPointObjectsWithDistance(trees, newX, newZ, 3) ||
        isInRoundObjectsWithCoefficient(stones, newX, newZ, 2) ||
        distance2D(0, 0, newX, newZ) > raduis) {
    counter++;
    newX = randomInteger(raduis * -1, raduis);
    newZ = randomInteger(raduis * -1, raduis);
    if (counter > 50) break;
  }
  return [newX, newZ];
};

export const addImmediateAudioToObjects = (scope, objects, buffer) => {
  let audio;
  objects.forEach((object) => {
    audio = new Three.PositionalAudio(scope.listener);

    audio.setBuffer(buffer);
    audio.setVolume(0);
    audio.setRefDistance(DESIGN.VOLUME.horses.ref);
    audio.setMaxDistance(DESIGN.VOLUME.horses.max);
    audio.setLoop(true);
    audio.setRolloffFactor(1) ;
    // audio.setDistanceModel('exponential');

    object.mesh.add(audio);
  });
};

export const addAudioToPseudoObjects = (scope, objects, field, buffer, volume) => {
  let audio;
  objects.forEach((object) => {
    audio = new Three.PositionalAudio(scope.listener);

    audio.setBuffer(buffer);
    audio.setVolume(volume);
    audio.setRefDistance(DESIGN.VOLUME.horses.ref);
    audio.setMaxDistance(DESIGN.VOLUME.horses.max);
    audio.setLoop(false);
    audio.setRolloffFactor(1) ;
    // audio.setDistanceModel('exponential');

    if (field === 'pseudoHorse') object.pseudoHorse.add(audio);
    else if (field === 'pseudoParrot') object.pseudoParrot.add(audio);
  });
};

