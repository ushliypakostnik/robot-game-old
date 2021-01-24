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
    primary: '#722f37',
    primary0x: 0x722f37,
    primaryDark0x: 0x621211,
  },
  GROUND_SIZE: 5000,
  HERO_SPEED: 500,
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
  PUDDLES: [
    // x, z, r, y
    [1300, -1300, 250, 0.01],
    [-800, 933, 200,0.01],
    [-1500, -1200, 300, 0.01],
    [-200, -300, 150, 0.01],
    [0, 0, 10000, -0.01], // great ocean
  ],
  STONES: {
    position: [
      // x, y
      [1600, 25],
      [942, 81],
      [-50, 600],
      [76, -1283],
      [255, -695],
      [-1583, -982],
      [-1387, -334],
    ],
  },
  MOUNTAINS: {
    position: [
      // x, z, h
      [1200, 1400, 100],
      [1250, 1450, 200],
      [-1400, -1350, 150],
      [-3400, -1350, 250],
      [-3450, -1300, 400],
      [2450, -2300, 150],
      [2400, -2250, 230],
      [2500, -2200, 170],
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
      gadgetstext: 'You need a PC keyboard to play',
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
    },
    page404: {
      text: 'Страница не найдена!!!',
    },
  },
};
