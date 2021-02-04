// const isProd = process.env.NODE_ENV === 'production';
// const apiUrl = process.env.VUE_APP_API_URL;
// export const API_URL = isProd ? apiUrl || 'https://???' : apiUrl || 'http://localhost:8082';

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
    primary0x: 0x621211,
    anemone0x: 0xffffff,
    crocus0x: 0x8267bf,
    daffodil0x: 0xf0cf08,
    tulip0x: 0xcf3326,
  },
  GROUND_SIZE: 2000,
  VOLUME: {
    normal: 0.5,
    max: 1,
    masha: 0.75,
    wind: 0.35,
    horses: {
      volume: 1,
      fr: 0.75,
      ref: 50,
      max: 2000,
    },
    parrots: {
      volume: 0.8,
      cry: 1,
      ref: 35,
      max: 2000,
    },
  },
  HERO: {
    scale: 0.02,
    mass: 100,
    height: 3, // средний рост челевеческой особи, мужики 1.7, бабы 1.6 - наш робот сильно выше
    speed: 400,
    jumpspeed: 250,
    jumpheight: 33,
    scales: {
      health: {
        name: 'health',
        start: 100,
      },
      endurance: {
        name: 'endurance',
        start: 100,
      },
      power: {
        name: 'power',
        start: 2,
      },
      ammo: {
        name: 'ammo',
        start: 500,
        magazine: 50,
      },
    },
  },
};

const size = (size) => {
  return size * DESIGN.GROUND_SIZE;
};

export const OBJECTS = {
  DRONE: {
    startY: 75,
  },
  HORSES: {
    scale: 0.03,
    quantity: 7,
    velocity: 20,
  },
  PARROTS: {
    scale: 0.09,
    quantity: 7,
    velocity: 25,
    minHeight: 2,
    maxHeight: 30,
  },
  /*
  BOXES: {
    size: 2,
    position: [
      // x, y, z, r
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
    size: size(0.55),
  },
  GROUND: {
    name: 'grass',
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
    // x, z
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
    quantityMax: 15,
    largeMin: DESIGN.HERO.jumpheight / 4,
    largeMax: DESIGN.HERO.jumpheight,
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
    name: 'mountain',
    topMax: size(0.01),
    bottomMin: size(0.01),
    bottomMax: size(0.06),
    positionY: -0.1,
    position: [
      // x, z, height
      [size(-0.48), size(-0.47), size(0.06)],
      [size(-0.475), size(-0.5), size(0.1)],
      [size(-0.525), size(-0.545), size(0.075)],
      [size(-0.575), size(-0.525), size(0.135)],
      [size(-0.575), size(-0.55), size(0.2)],
      [size(-0.6), size(-0.5), size(0.065)],
      [size(0.5), size(-0.6), size(0.045)],
      [size(-0.45), size(-0.69), size(0.075)],
      [size(-0.3), size(-0.69), size(0.115)],
      [size(-0.35), size(-0.633), size(0.085)],
      [size(-0.335), size(-0.66), size(0.16)],
      [size(-0.375), size(-0.65), size(0.2)],

      [size(-0.14), size(-0.23), size(0.135)],

      // Не в море
      [size(0.37), size(0.385), size(0.033)],

      [size(-0.425), size(-0.445), size(0.037)],
      [size(-0.425), size(-0.375), size(0.045)],
      [size(-0.46), size(-0.35), size(0.049)],
      [size(0.45), size(-0.36), size(0.045)],

      [size(0.415), size(-0.42), size(0.055)],
      [size(0.25), size(-0.275), size(0.046)],

      [size(-0.25), size(0.34), size(0.051)],
    ],
  },
  TREES: {
    tree1: {
      quantity: 16,
      positionY: -1.5,
      heightMin: 15,
      heightMax: 70,
    },
    tree2: {
      quantity: 16,
      positionY: -0.5,
      heightMin: 20,
      heightMax: 70,
    },
  },
  FLOWERS: {
    positionY: -0.3,
    anemone: {
      quantity: 30,
      scale: 0.1,
    },
    crocus: {
      quantity: 30,
      scale: 0.075,
    },
    daffodil: {
      quantity: 30,
      scale: 0.35,
    },
    tulip: {
      quantity: 30,
      scale: 0.175,
    },
  },
  BOTTLES: {
    positionY: -0.3,
    quantity: 30,
    scale: 0.05,
  },
};

export const LOCALES = {
  [LANGUAGES[0].name]: {
    layout: {
      text0: 'Drinking robot',
      text1: 'Shot: LEFT MOUSE',
      text2: 'Move: WASD / Arrows',
      text3: 'Jump SPACE + WASD / Arrows',
      text4: 'Run: Shift + W',
      text5: 'Hidden movement: C or Alt',
      text6: 'Look: MOUSE',
      text7: 'Take a thing: E',
      text8: 'Launch drone: TAB',
      text9: 'Pause: P',
      music: 'Music: ',
      musiclink: 'Kafedra',
      startbutton: 'Play',
      attention: 'Attention!!! It is recommended to play on computers with a powerful video card.',
      gadgetsgate: 'You need a PC keyboard to play',
      chromegate: 'In order to play, open in the Google Chrome (or Yandex) browser',
    },
    gameplay: {
      gameover: 'GAME OVER',
      gameovebutton: 'Replay',
    },
  },
  [LANGUAGES[1].name]: {
    layout: {
      text0: 'Робот-собутыльник',
      text1: 'Выстрел: Кнопки мыши',
      text2: 'Движение: WASD / Стрелки',
      text3: 'Прыжок SPACE + WASD / Стрелки',
      text4: 'Бежать: Shift + W',
      text5: 'Cкрытное передвижение: C или Alt',
      text6: 'Осмотреться: Мышь',
      text7: 'Взять предмет: Е',
      text8: 'Запустить дрон: TAB',
      text9: 'Pause: P',
      music: 'Музыка: ',
      musiclink: 'Kafedra',
      startbutton: 'Играть',
      attention: 'Внимание!!! Рекомендуется играть на компьютерах с производительной видеокартой.',
      gadgetstext: 'Для того чтобы играть нужна клавиатура персонального компьютера',
      chromegate: 'Для того чтобы играть откройте в браузере Google Chrome (или Яндекс)',
    },
    gameplay: {
      gameover: 'КОНЕЦ ИГРЫ',
      gameovebutton: 'Играть заново',
    },
  },
};
