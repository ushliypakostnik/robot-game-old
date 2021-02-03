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

export const loaderDispatchHelper = (store, field) => {
  store.dispatch('preloader/preloadOrBuilt', field).then(() => {
    store.dispatch('preloader/isAllLoadedAndBuilt');
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
