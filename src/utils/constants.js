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
  HERO_SPEED: 300,
  HERO_JUMP: 150,
  HERO_MASS: 100,
  UNDER_FLOOR: 1.7, // средний рост челевеческой особи
  AMMO_GRAVITY: 5,
  NUM_AMMO: 20,
  AMMO_RADIUS: 0.5,
};

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
  BOXES: {
    size: 2,
    position: [
      // x, y, z
    ],
  },
  OCEAN: [0, 0, 1500], // great ocean // x, z, r
  LAKES: [
    // x, z, r
    [700, -700, 130],
    [-800, 933, 90],
    [-300, -600, 110],
    [200, 300, 150],
  ],
  PUDDLES: {
    // x, z, r
    quantity: 49, // лучше квадратное число
    min: 20,
    max: 50,
  },
  SANDS: {
    // x, z, r
    quantity: 49, // лучше квадратное число
    min: 15,
    max: 45,
  },
  STONES: {
    position: [
      // x, y
      [600, 125],
      [842, 181],
      [820, 160],
      [800, 220],
      [-150, 600],
      [176, -283],
      [255, -695],
      [-583, -982],
      [-387, -334],
    ],
  },
  MOUNTAINS: {
    position: [
      // x, z, h
      [850, 850, 120],
      [900, 950, 200],
      [-850, -900, 150],
      [-750, -800, 270],
      [-850, -750, 400],
      [-920, -700, 130],
      [-900, -700, 70],
      [900, -900, 150],
      [500, -550, 230],
      [-500, 680, 170],
    ],
  }
};

export const LOCALES = {
  [LANGUAGES[0].name]: {
    layout: {
      text0: 'Drinking robot',
      text1: 'Shot: LEFT MOUSE',
      text2: 'Move: WASD',
      text3: 'Jump SPACE',
      text4: 'Run: Shift',
      text5: 'Look: MOUSE',
      text6: 'Pause: Ecs',
      startbutton: 'Play',
      gadgetsgate: 'You need a PC keyboard to play',
      chromegate: 'In order to play, open in the Google Chrome browser',
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
      text3: 'Прыжок SPACE',
      text4: 'Бежать: Shift',
      text5: 'Осмотреться: Мышь',
      text6: 'Pause: Ecs',
      startbutton: 'Играть',
      gadgetstext: 'Для того чтобы играть нужна клавиатура персонального компьютера',
      chromegate: 'Для того чтобы играть откройте в браузере Google Chrome',
    },
    page404: {
      text: 'Страница не найдена!!!',
    },
  },
};
