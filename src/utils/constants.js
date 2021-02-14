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

// World

// Тут главный размер, относительно которого все по ширине,
// кроме того что должно быть адекватным росту по высоте
const size = (size) => {
  return size * 2000;
};

// Количество реальных объектов-капель в обойме вино-оружия
const ammo = 25;

export const DESIGN = {
  V: 0.2,
  BREAKPOINTS: {
    desktop: 1025,
  },
  COLORS: {
    primary0x: 0x621211,
    anemone0x: 0xffffff,
    crocus0x: 0x8267bf,
    daffodil0x: 0xf0cf08,
    tulip0x: 0xcf3326,
    horse0x: 0x623611,
    parrot0x: 0x3c9d9d,
    robot0x: 0x7c5415,
  },
  GROUND_SIZE: size(1),
  checkDistance: size(0.025), // проверки при изменении позиции на 50 метров
  VOLUME: {
    small: 0.35,
    normal: 0.5,
    max: 1,
    masha: 0.75,
    wind: 0.35,
    positional: {
      ref: 50,
      max: 2000,
    },
    horses: {
      volume: 1,
      fr: 0.75,
      cry: 0.75,
    },
    parrots: {
      volume: 0.7,
      cry: 1,
      cry2: 1,
    },
    robots: {
      run: 0.8,
      noize: 1,
    },
  },
  HERO: {
    scale: 0.02,
    mass: 100,
    height: 3, // средний рост челевеческой особи, мужики 1.7, бабы 1.6 - наш робот сильно выше
    speed: 400,
    jumpspeed: 250,
    jumpheight: 33,
    start: [size(-0.33), size(0.53)],
    damage: {
      water: -1,
      robot: -0.25,
    },
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
        start: ammo * 100,
        objects: ammo,
      },
    },
  },
  ENEMIES: {
    mode: {
      idle: 'idle',
      active: 'active',
      drunk: 'drunk',
      thing: 'thing',
    },
    minIntoxication: 25,
  },
  MESSAGES_TIMEOUT: 3000,
  EFFECTS: {
    time: {
      health: 20,
      endurance: 20,
    },
    anemone: {
      health: 20,
    },
    crocus: {
      health: 30,
      power: 2,
    },
    daffodil: {
      health: 10,
    },
    tulip: {
      health: 40,
    },
    bottle: {
      ammo: ammo * 4,
    },
    horse: {
      power: 10,
    },
    parrot: {
      power: 7,
    },
  },
};

export const OBJECTS = {
  DRONE: {
    startY: 75,
  },
  ROBOTS: {
    name: 'robot',
    scale: 1.75,
    quantity: 2,
    positionY: 0.3,
    velocityMove: {
      [DESIGN.ENEMIES.mode.idle]: 1,
      [DESIGN.ENEMIES.mode.active]: 2.5,
    },
    velocityBend: {
      [DESIGN.ENEMIES.mode.active]: 120,
    },
    distance: {
      [DESIGN.ENEMIES.mode.active]: 18,
    },
    damage: 1, // 0.005
  },
  HORSES: {
    name: 'horse',
    scale: 0.03,
    quantity: 4,
    velocityMove: {
      [DESIGN.ENEMIES.mode.idle]: 1.25,
      [DESIGN.ENEMIES.mode.active]: 2,
    },
    velocityBend: {
      [DESIGN.ENEMIES.mode.idle]: 30,
      [DESIGN.ENEMIES.mode.active]: 90,
    },
    distance: {
      [DESIGN.ENEMIES.mode.idle]: 10,
      [DESIGN.ENEMIES.mode.active]: 22.5,
    },
    frequency: {
      fr: 300,
      cry: 300,
    },
    damage: 0.02,
  },
  PARROTS: {
    name: 'parrot',
    scale: 0.09,
    quantity: 4,
    velocityMove: {
      [DESIGN.ENEMIES.mode.idle]: 1,
      [DESIGN.ENEMIES.mode.active]: 2.25,
    },
    velocityBend: {
      [DESIGN.ENEMIES.mode.idle]: 40,
      [DESIGN.ENEMIES.mode.active]: 110,
    },
    distance: {
      [DESIGN.ENEMIES.mode.idle]: 10,
      [DESIGN.ENEMIES.mode.active]: 17.5,
    },
    frequency: {
      cry: 250,
      cry2: 250,
    },
    minHeight: 2,
    maxHeight: 20,
    damage: 0.03,
  },
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
      // Отдельный залив 1
      [size(0.31), size(-0.26), size(0.125)],

      // Отдельный залив 2
      [size(-0.45), size(0.15), size(0.12)],

      // Большой залив из 3ех озер - от большего и у берега к меньшему ближе к центру
      [size(-0.3085), size(-0.375), size(0.13)], // 1
      [size(-0.15), size(-0.3), size(0.09)], // 2
      [size(-0.1), size(-0.2), size(0.07)], // 3

      // Рядом с центром
      [size(0.15), size(0.2), size(0.095)],
    ],
  },
  PUDDLES: {
    name: 'puddle',
    // x, z
    quantity: 12, // лучше квадратное число
    min: size(0.035),
    max: size(0.070),
    positionY: 0.3,
  },
  SANDS: {
    name: 'sand',
    // x, z, radius
    positionY: 0.15,
    position: [
      // Стартовый остров - рядом с отдельным заливом 2, который дальше и меньше
      [DESIGN.HERO.start[0] + size(-0.01), DESIGN.HERO.start[1] - size(-0.01), size(0.045)],

      // В 1
      [size(-0.31), size(-0.375), size(0.08)],

      // В море рядом с 1
      [size(-0.5), size(-0.33), size(0.09)], // соединенный с сушей (чаще всего - зависит от рандомной корректировки)
      [size(-0.67), size(-0.23), size(0.05)], // дальше в море больший
      [size(-0.63), size(-0.13), size(0.027)], // ближе к берегу меньший

      // В озере рядом с центром
      [size(0.15), size(0.19), size(0.04)],

      // Рядом с отдельным заливом 2
      [size(-0.55), size(0.35), size(0.07)], // рядом и больший

      // Рядом с отдельным заливом 1
      [size(0.45), size(-0.45), size(0.05)],

      // В море между предыдущим и заливом
      [size(0.225), size(-0.625), size(0.065)],
    ],
  },
  MOUNTAINS: {
    name: 'mountain',
    topMax: size(0.01),
    bottomMin: size(0.03),
    bottomMax: size(0.06),
    positionY: -0.1,
    position: [
      // x, z, height
      [size(-0.475), size(-0.5), size(0.1)],
      [size(-0.575), size(-0.525), size(0.135)],
      [size(-0.575), size(-0.55), size(0.2)],
      [size(-0.3), size(-0.69), size(0.115)],
      [size(-0.35), size(-0.633), size(0.12)],
      [size(-0.335), size(-0.66), size(0.16)],
      [size(-0.375), size(-0.65), size(0.2)],

      // В озере 1
      [size(-0.15), size(-0.3), size(0.135)],
      [size(-0.17), size(-0.28), size(0.1)],

      // Не в море
      // Отдельный залив 1
      [size(0.3), size(-0.25), size(0.125)],
      [size(0.32), size(-0.23), size(0.11)],
      [size(0.29), size(-0.19), size(0.085)],

      // Отдельный залив 2
      [size(-0.45), size(0.17), size(0.125)],
      [size(-0.43), size(0.14), size(0.14)],
      [size(-0.41), size(0.15), size(0.075)],
    ],
  },
  STONES: {
    name: 'stone',
    quantityMin: 5,
    quantityMax: 10,
    largeMin: DESIGN.HERO.jumpheight / 2,
    largeMax: DESIGN.HERO.jumpheight,
    smallMin: size(0.0066),
    smallMax: size(0.01),
    position: [
      // x, y
      [size(-0.3085), size(-0.375)],
      [size(0.3), size(-0.0625)],
      [size(0.421), size(0.0905)],
      [size(0.41), size(0.08)],
      [size(0.4), size(0.11)],

      [size(0.088), size(-0.1415)],
      [size(0.1275), size(-0.3475)],

      [size(-0.275), size(-0.31)],
      [size(-0.1935), size(-0.167)],

      [size(-0.185), size(0.3)],

      [size(-0.220), size(0)],
      [size(-0.290), size(0.15)],
      [size(-0.310), size(0.03)],
    ],
  },
  TREES: {
    tree1: {
      quantity: 10, // лучше квадратное число, реально в 2 раза больше (2 способа рандомной расстановки)
      heightMin: 15,
      heightMax: 70,
    },
    tree2: {
      quantity: 10, // лучше квадратное число, реально в 2 раза больше (2 способа рандомной расстановки)
      heightMin: 20,
      heightMax: 70,
    },
  },
  FLOWERS: {
    positionY: -0.3,
    anemone: {
      name: 'anemone',
      quantity: 10,
      scale: 0.1,
    },
    crocus: {
      name: 'crocus',
      quantity: 10,
      scale: 0.075,
    },
    daffodil: {
      name: 'daffodil',
      quantity: 10,
      scale: 0.35,
    },
    tulip: {
      name: 'tulip',
      quantity: 10,
      scale: 0.175,
    },
  },
  BOTTLES: {
    name: 'bottle',
    positionY: -0.3,
    quantity: 20,
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
      text8: 'Apply flower: 1234',
      text9: 'Launch drone: TAB',
      text10: 'Pause: P',
      music: 'Music: ',
      musiclink: 'Kafedra',
      startbutton: 'Play',
      attention: 'Attention!!! It is recommended to play on computers with a powerful video card.',
      gadgetsgate: 'You need a PC keyboard to play',
      chromegate: 'In order to play, open in the Google Chrome (or Yandex) browser',
      gameover: 'GAME OVER',
      gameovebutton: 'Replay',
    },
    messages: {
      message1: 'Pick up:',
      message2: {
        tired: 'The robot is tired of running',
        recovered: 'The robot can run again',
        hiddenMoveEnabled: 'The robot moves in stealth mode',
        hiddenMoveDisabled: 'Stealth mode disabled',
        startNoDamaged: `The robot is invulnerable for ${DESIGN.EFFECTS.time.health} seconds!`,
        startNoTired: `The robot will not get tired of running ${DESIGN.EFFECTS.time.endurance} seconds!`,
        endNoDamaged: 'The invulnerability effect is over',
        endNoTired: 'The robot gets tired of running again',
        appliedСrocus: `The robot used a crocus!<br />Strength has grown by ${DESIGN.EFFECTS.crocus.power}%`,
        appliedTulip: `The robot used a tulip!<br />It feels so much better!`,
        pickBottle: 'The wine tank has been refilled!',
        pickFlower: 'Robot plucked a:',
        pickAnimal: 'Robot reworked:',
      },
      message3: {
        start: `The drinking robot-woman says:<br />««When we get off this atoll?<br />'It\'s full of dancing yellow robots,<br />which can be drunk<br />and disassembled for spare parts,<br />to fix our boat?»`,
      },
      message4: {
        ocean: `The robot has climbed too far into the ocean!<br />He\'s going to drown now!`
      },
      message5: {
        enemiesBeside: `Enemies spotted nearby!<br />The robot should be careful!`,
        notEnemiesBeside: 'No one around...',
        discovered: 'The robot disturbed '
      },
    },
    things: {
      anemone: {
        name: 'Anemone',
        text: `: gives ${DESIGN.EFFECTS.anemone.health}% health and ${DESIGN.EFFECTS.time.endurance} seconds the robot does not get tired of running`,
      },
      crocus: {
        name: 'Crocus',
        text: `: grants ${DESIGN.EFFECTS.crocus.health}% health and ${DESIGN.EFFECTS.crocus.power}% damage power`,
      },
      daffodil: {
        name: 'Daffodil',
        text: `: gives ${DESIGN.EFFECTS.daffodil.health}% health and ${DESIGN.EFFECTS.time.health} seconds time the robot is invulnerable`,
      },
      tulip: {
        name: 'Tulip',
        text: `: grants ${DESIGN.EFFECTS.tulip.health}% health`,
      },
      bottle: {
        name: 'Bottle of wine',
        declination: 'A bottle of wine',
        text: `: contains ${DESIGN.EFFECTS.bottle.ammo} drops`,
      },
    },
    enemies: {
      horse: {
        name: 'Wild Horse',
        declination: 'a wild horse',
        text: `: good health, animal processing gives ${DESIGN.EFFECTS.horse.power}% to damage power`,
      },
      parrot: {
        name: 'Giant parrot',
        declination: 'a giant parrot',
        text: `: weak health, animal processing gives ${DESIGN.EFFECTS.parrot.power}% to damage power`,
      },
      robot: {
        name: 'Robot dancer',
        declination: ': the robot dancer',
        text: `: powerful health, you need to disassemble ${OBJECTS.ROBOTS.quantity} pieces to fix the boat`,
      },
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
      text8: 'Применить цветок: 1234',
      text9: 'Запустить дрон: TAB',
      text10: 'Pause: P',
      music: 'Музыка: ',
      musiclink: 'Kafedra',
      startbutton: 'Играть',
      attention: 'Внимание!!! Рекомендуется играть на компьютерах с производительной видеокартой.',
      gadgetstext: 'Для того чтобы играть нужна клавиатура персонального компьютера',
      chromegate: 'Для того чтобы играть откройте в браузере Google Chrome (или Яндекс)',
      gameover: 'КОНЕЦ ИГРЫ',
      gameovebutton: 'Играть заново',
    },
    messages: {
      message1: 'Подобрать:',
      message2: {
        tired: 'Робот устал от бега',
        recovered: 'Робот снова может бегать',
        hiddenMoveEnabled: 'Робот двигается в скрытном режиме',
        hiddenMoveDisabled: 'Скрытный режим отключен',
        startNoDamaged: `Робот получил неуязвимость на ${DESIGN.EFFECTS.time.health} секунд!`,
        startNoTired: `Робот не будет уставать от бега ${DESIGN.EFFECTS.time.endurance} секунд!`,
        endNoDamaged: 'Эффект неуязвимости закончился',
        endNoTired: 'Робот снова устает от бега',
        appliedСrocus: `Робот использовал крокус!<br />Сила выросла на ${DESIGN.EFFECTS.crocus.power}%`,
        appliedTulip: `Робот использовал тюльпан!<br />Он чувствует себя намного лучше!`,
        pickBottle: 'Бак с вином пополнен!',
        pickFlower: 'Робот сорвал:',
        pickAnimal: 'Робот переработал:',
      },
      message3: {
        start: `Робот-собутыльница говорит:<br />«Когда мы уже свалим с этого атолла?<br />Здесь полно танцующих желтых роботов,<br />которых можно опоить<br />и разобрать на запчасти,<br />чтобы починить наш катер?»`,
      },
      message4: {
        ocean: `Робот забрался слишком далеко в океан!<br />Он сейчас утонет!`,
      },
      message5: {
        enemiesBeside: `Рядом замечены враги!<br/>Роботу стоит быть осторожнее!`,
        notEnemiesBeside: 'Рядом никого...',
        discovered: 'Робот потревожил'
      },
    },
    things: {
      anemone: {
        name: 'Анемон',
        text: `: дает ${DESIGN.EFFECTS.anemone.health}% здоровья и ${DESIGN.EFFECTS.time.endurance} секунд робот не устает от бега`,
      },
      crocus: {
        name: 'Крокус',
        text: `: дает ${DESIGN.EFFECTS.crocus.health}% здоровья и ${DESIGN.EFFECTS.crocus.power}% к силе урона`,
      },
      daffodil: {
        name: 'Нарцисс',
        text: `: дает ${DESIGN.EFFECTS.daffodil.health}% здоровья и ${DESIGN.EFFECTS.time.health} cекунд робот неуязвим`,
      },
      tulip: {
        name: 'Тюльпан',
        text: `: дает ${DESIGN.EFFECTS.tulip.health}% здоровья`,
      },
      bottle: {
        name: 'Бутылка вина',
        declination: 'Бутылку вина',
        text: `: cодержит ${DESIGN.EFFECTS.bottle.ammo} капель`,
      },
    },
    enemies: {
      horse: {
        name: 'Дикая лощадь',
        declination: ': дикую лощадь',
        text: `: хорошее здоровье, переработка животного дает ${DESIGN.EFFECTS.horse.power}% к силе урона`,
      },
      parrot: {
        name: 'Гигансткий попугай',
        declination: ': гигансткого попугая',
        text: `: слабое здоровье, переработка животного дает ${DESIGN.EFFECTS.parrot.power}% к силе урона`,
      },
      robot: {
        name: 'Робот-танцор',
        declination: ': робота-танцора',
        text: `: мощнейшее здоровье, нужно разобрать на детали ${OBJECTS.ROBOTS.quantity} штуки чтобы починить катер`,
      },
    },
  },
};
