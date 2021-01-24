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
    primary: '##722f37',
    primary0x: 0x722f37,
  },
  HERO_SPEED: 500,
  UNDER_FLOOR: 20,
  AMMO_GRAVITY: 5,
  NUM_AMMO: 20,
  AMMO_RADIUS: 5,
};

export const OBJECTS = {
  HORSES: {
    start: [
      // x, y
      [130, 150],
      [200, -230],
      [-160, 220],
      [150, -200],
      [-100, 220],
      [-300, 320],
      [300, 350],
    ],
    velocity: 150,
  },
  PARROTS: {
    quantity: 20,
    velocity: 100,
  },
  BOXES: {
    size: 50,
    position: [
      // x, y, z
      [-20, 20, -80],
      [-100, 20, 100],
      [-100, 70, 100],
      [-50, 20, 100],
      [0, 20, 100],
      [100, 20, 100],
      [100, 70, 100],
      [150, 20, 50],
      [100, 20, 50],
      [50, 20, 50],
      [0, 20, 50],
      [-50, 20, 50],
      [50, 20, 100],
      [150, 20, 100],
      [150, 20, 0],
      [150, 70, 100],
      [150, 120, 100],
      [0, 20, 150],
      [100, 120, 100],
      [100, 170, 100],
      [50, 120, 100],
      [50, 70, 100],
      [200, 20, 100],
      [250, 20, 100],
      [200, 70, 100],
      [150, 20, 150],
      [100, 20, 150],
      [50, 70, 150],
      [50, 20, 150],
      [100, 20, 200],
      [250, 20, 100],
    ],
  },
  PUDDLES: [
    // x, z, r, y
    [-700, -800, 450, 0],
    [-1700, -1800, 500, 0],
    [1000, 1500, 950, 0],
    [-1150, 1250, 850, 0],
    [1250, -950, 550, 0],
    [500, 150, 200, 0],
    [-300, 150, 150, 0],
    [300, -200, 100, 0],
    [-4211, 933, 130, 0],
    [-2883, -665, 70, 0],
    [0, 0, 20000, -10], // great ocean
  ],
  STONES: {
    position: [
      // x, y
      [1600, 25],
      [942, 81],
      [-50, 600],
      [76, -1483],
      [255, -695],
      [-3083, -982],
      [-1687, -334],
    ],
  },
  MOUNTAINS: {
    position: [
      // x, z, h
      [1200, 1400, 500],
      [1250, 1450, 600],
      [-1400, -1350, 450],
      [-3400, -1350, 750],
      [-3450, -1300, 400],
      [2450, -2300, 850],
      [2400, -2250, 400],
      [2500, -2200, 270],
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
      text1: 'Выстрел: Левая кнопка мыши',
      text2: 'Движение: WASD',
      text3: 'Прыжок SPACE',
      text4: 'Бежать: Shift',
      text5: 'Осмотреться: MOUSE',
      text6: 'Pause: Ecs',
      startbutton: 'Играть',
      gadgetstext: 'Для того чтобы играть нужна клавиатура персонального компьютера',
    },
    page404: {
      text: 'Страница не найдена!!!',
    },
  },
};
