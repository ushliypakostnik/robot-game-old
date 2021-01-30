const isProd = process.env.NODE_ENV === 'production';
const apiUrl = process.env.VUE_APP_API_URL;
export const API_URL = isProd ? apiUrl || 'https://???' : apiUrl || 'http://localhost:8082';

export const LOCALSTORAGE = {
  LANGUAGE: 'language',
};

/* export const SESSIONSTORAGE = {
}; */

export const LANGUAGES = [
  { id: 1, name: 'en' },
  { id: 2, name: 'ru' },
];

// Auto language
export const AUTO_LANG = localStorage.getItem(LOCALSTORAGE.LANGUAGE) || null;

export const DESIGN = {
  BREAKPOINTS: {
    desktop: 1025,
  },
  COLORS: {
    primary: '#621211',
    primary0x: 0x621211,
  },
  GROUND_SIZE: 2000,
  HERO_SPEED: 400,
  HERO_JUMP_SPEED: 250,
  HERO_JUMP_HEIGHT: 33,
  HERO_MASS: 100,
  UNDER_FLOOR: 3, // средний рост челевеческой особи, мужики 1.7, бабы 1.6 - наш робот чуть выше
  AMMO_GRAVITY: 5,
  NUM_AMMO: 40,
  AMMO_RADIUS: 0.5,
  VOLUME: 0.5,
};

const size = (size) => {
 return size * DESIGN.GROUND_SIZE;
};

/*
const boxPack = (x, z, y, quantityX, quantityZ, quantityY) => {
  const pack = [];
  for (let i = 0; i < quantityX; i++) {
    for (let k = 0; k < quantityZ; k++) {
      for (let n = 0; n < quantityY; n++) {
        pack.push([x + size(0.001) * i, z + + size(0.001) * k, y + size(0.001) * n]);
      }
    }
  }
  return pack;
};
*/

export const OBJECTS = {
  HORSES: {
    size: 0.0125,
    start: [
      // x, y
      [130, 150],
      [200, -230],
      [-160, 220],
      [150, -200],
      [-100, 220],
      [-300, 320],
      [300, 350],
      [500, 750],
      [-400, -500],
      [-500, -800],
    ],
    velocity: 10,
  },
  PARROTS: {
    quantity: 10,
    velocity: 100,
  },
  /*
  BOXES: {
    size: 2,
    position: [
      // x, y, z, r
      ...boxPack(size(-0.598), size(-0.202), 0, 5, 3, 3),
      ...boxPack(size(-0.605), size(-0.205), 0, 3, 2, 3),
      ...boxPack(size(-0.595), size(-0.210), 0, 4, 3, 3),
      ...boxPack(size(-0.590), size(-0.216), 0, 2, 2, 3),
      ...boxPack(size(-0.611), size(-0.215), 0, 2, 3, 2),
      ...boxPack(size(-0.606), size(-0.211), 0, 2, 3, 2),
      ...boxPack(size(-0.619), size(-0.219), 0, 2, 3, 2),
      ...boxPack(size(-0.615), size(-0.220), 0, 4, 4, 3),
      ...boxPack(size(-0.593), size(-0.225), 0, 3, 5, 2),
      ...boxPack(size(-0.585), size(-0.230), 0, 7, 2, 2),
      ...boxPack(size(-0.575), size(-0.240), 0, 3, 6, 2),
    ],
  },
  */
  OCEAN: {
    name: 'ocean',
    // x, z, radius, y
    position: [0, 0, size(1), -0.3],
  },
  BEACH: {
    name: 'beach',
    positionY: -0.2,
    size: size(0.5) + size(0.05),
  },
  LAKES: {
    name: 'lake',
    positionY: 0,
    // x, z, radius
    position: [
      [size(0.35), size(-0.35), size(0.08)],
      [size(-0.3085), size(-0.3665), size(0.15)],
      [size(-0.15), size(-0.3), size(0.06)],
      [size(-0.125), size(-0.225), size(0.085)],
      [size(0.1), size(0.15), size(0.075)],
    ],
  },
  PUDDLES: {
    name: 'puddle',
    // x, z, radius
    quantity: 49, // лучше квадратное число
    min: size(0.015),
    max: size(0.03),
    positionY: 0.3,
  },
  SANDS: {
    name: 'sand',
    // x, z, radius
    positionY: 0.15,
    position: [
      [size(-0.27), size(-0.36), size(0.06)],
      [size(-0.52), size(-0.3), size(0.08)],
      [size(-0.67), size(-0.23), size(0.05)],
      [size(-0.63), size(-0.13), size(0.027)],

      [size(0.085), size(0.125), size(0.03)],

      [size(-0.4), size(0.4), size(0.09)],
      [size(-0.32), size(0.52), size(0.03)],

      [size(0.35), size(-0.43), size(0.065)],
      [size(0.12), size(-0.68), size(0.055)],
    ],
  },
  STONES: {
    name: 'stone',
    quantityMin: 5,
    quantityMax: 20,
    largeMin: DESIGN.HERO_JUMP_HEIGHT / 4,
    largeMax: DESIGN.HERO_JUMP_HEIGHT,
    smallMin: size(0.0025),
    smallMax: size(0.01),
    position: [
      // x, y
      [size(0.375), size(0.415)],
      [size(0.3), size(0.0625)],
      [size(0.421), size(0.0905)],
      [size(0.41), size(0.08)],
      [size(0.4), size(0.11)],

      [size(0.088), size(-0.1415)],
      [size(0.1275), size(-0.3475)],

      [size(-0.2915), size(-0.491)],
      [size(-0.1935), size(-0.167)],

      [size(-0.185), size(0.3)],

      [size(-0.220), size(0)],
      [size(-0.290), size(0.15)],
      [size(-0.340), size(0.035)],
    ],
  },
  MOUNTAINS: {
    topMax: size(0.01),
    bottomMin: size(0.01),
    bottomMax: size(0.1),
    positionY: -0.1,
    position: [
      // x, z, height
      [size(-0.45), size(-0.475), size(0.06)],
      [size(-0.475), size(-0.5), size(0.1)],
      [size(-0.525), size(-0.545), size(0.075)],
      [size(-0.575), size(-0.525), size(0.135)],
      [size(-0.575), size(-0.55), size(0.2)],
      [size(-0.6), size(-0.5), size(0.065)],
      [size(0.5), size(-0.6), size(0.045)],
      [size(-0.4), size(-0.422), size(0.075)],
      [size(-0.625), size(-0.625), size(0.115)],
      [size(-0.35), size(-0.633), size(0.085)],
      [size(-0.315), size(-0.66), size(0.16)],
      [size(-0.275), size(-0.725), size(0.2)],

      [size(0.405), size(0.405), size(0.06)],
      [size(0.37), size(0.385), size(0.1)],

      [size(-0.425), size(-0.445), size(0.075)],
      [size(-0.375), size(-0.4), size(0.135)],
      [size(-0.425), size(-0.375), size(0.2)],
      [size(-0.46), size(-0.35), size(0.065)],
      [size(0.45), size(-0.36), size(0.045)],

      [size(0.415), size(-0.42), size(0.075)],
      [size(0.25), size(-0.275), size(0.115)],

      [size(-0.25), size(0.34), size(0.085)],
      [size(-0.215), size(0.31), size(0.26)],
    ],
  }
};

export const LOCALES = {
  [LANGUAGES[0].name]: {
    layout: {
      text0: 'Drinking robot',
      text1: 'Shot: LEFT MOUSE',
      text2: 'Move: WASD',
      text3: 'Jump SPACE + WASD',
      text4: 'Run: Shift + W',
      text5: 'Look: MOUSE',
      text6: 'Pause: Ecs',
      startbutton: 'Play',
      gadgetsgate: 'You need a PC keyboard to play',
      chromegate: 'In order to play, open in the Google Chrome (or Yandex) browser',
    },
    page404: {
      text: 'Page not found!!!',
    },
  },
  [LANGUAGES[1].name]: {
    layout: {
      text0: 'Робот-собутыльник',
      text1: 'Выстрел: Кнопки мыши',
      text2: 'Движение: WASD',
      text3: 'Прыжок SPACE + WASD',
      text4: 'Бежать: Shift + W',
      text5: 'Осмотреться: Мышь',
      text6: 'Pause: Ecs',
      startbutton: 'Играть',
      gadgetstext: 'Для того чтобы играть нужна клавиатура персонального компьютера',
      chromegate: 'Для того чтобы играть откройте в браузере Google Chrome (или Яндекс)',
    },
    page404: {
      text: 'Страница не найдена!!!',
    },
  },
};
