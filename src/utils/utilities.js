export const randomInteger = (min, max) => {
  let rand = min + Math.random() * (max + 1 - min);
  return Math.floor(rand);
};

export const yesOrNo = () => {
  let result = 0;
  while (result === 0) {
    result = randomInteger(-1, 1);
  }
  return result;
};

export const loaderDispatchHelper = (store, name) => {
  store.dispatch('preloader/preloadOrBuilt', name).then(() => {
    store.dispatch('preloader/isAllLoadedAndBuilt');
  });
};

export const distance2D = (x1, y1, x2, y2) => {
  return Math.sqrt(((x2 - x1) ** 2) + ((y2 - y1) ** 2));
}
