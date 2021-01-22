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
};

export const OBJECTS = {
  HORSES: {
    start: [
      [30, 50],
      [200, -30],
      [-60, 220],
      [150, -100],
      [-100, 220],
    ],
    velocity: 150,
  },
};

export const LOCALES = {
  [LANGUAGES[0].name]: {
    layout: {
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
