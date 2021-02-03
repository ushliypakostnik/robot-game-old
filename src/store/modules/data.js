/*
Провальный эксперимент для быстрого релоада игры.

B модулях JS:

Для аудио и текстур, например:

store.setData({ field: 'dropAudioData', data: buffer });
store.setData({ field: 'grassData', data: texture });

Для объектов:

store.setData({ field: 'heroData', data: JSON.parse(JSON.stringify(hero)) });

В основном компоненте:

import { mapGetters, mapActions } from 'vuex';

...

computed: {
  ...mapGetters({
    // Materials
    heroData: 'data/heroData',
    stoneData: 'data/stoneData',
    sand1Data: 'data/sand1Data',
    sand2Data: 'data/sand2Data',
    grassData: 'data/grassData',
    waterData: 'data/waterData',
    tree1Data: 'data/tree1Data',
    tree2Data: 'data/tree2Data',
    anemoneData: 'data/anemoneData',
    crocusData: 'data/crocusData',
    daffodilData: 'data/daffodilData',
    tulipData: 'data/tulipData',

    // Sound
    mashaAudioData: 'data/mashaAudioData',
    stepAudioData: 'data/stepAudioData',
    runAudioData: 'data/runAudioData',
    waterStepAudioData: 'data/waterStepAudioData',
    waterRunAudioData: 'data/waterRunAudioData',
    jumpAudioData: 'data/jumpAudioData',
    waterJumpAudioData: 'data/waterJumpAudioData',
    spitAudioData: 'data/spitAudioData',
    dropAudioData: 'data/dropAudioData',
    oceanAudioData: 'data/oceanAudioData',
    windAudioData: 'data/windAudioData',
  }),
},

...

methods: {
  ...mapActions({
    setData: 'data/setData',
  }),
},

И... Тадам! Экземпляр становиться неподъемным! ((((

Видимо, единственный вариант - попробовать отправлять на сервер.
*/

const initialState = {
  heroData: null,
  stoneData: null,
  sand1Data: null,
  sand2Data: null,
  grassData: null,
  waterData: null,
  tree1Data: null,
  tree2Data: null,
  anemoneData: null,
  crocusData: null,
  daffodilData: null,
  tulipData: null,

  mashaAudioData: null,
  stepAudioData: null,
  runAudioData: null,
  waterStepAudioData: null,
  waterRunAudioData: null,
  jumpAudioData: null,
  waterJumpAudioData: null,
  spitAudioData: null,
  dropAudioData: null,
  oceanAudioData: null,
  windAudioData: null,
};
const state = initialState;

const getters = {
  heroData: state => state.heroData,
  stoneData: state => state.stoneData,
  sand1Data: state => state.sand1Data,
  sand2Data: state => state.sand2Data,
  grassData: state => state.grassData,
  waterData: state => state.waterData,
  tree1Data: state => state.tree1Data,
  tree2Data: state => state.tree2Data,
  anemoneData: state => state.anemoneData,
  crocusData: state => state.crocusData,
  daffodilData: state => state.daffodilData,
  tulipData: state => state.tulipData,

  mashaAudioData: state => state.mashaAudioData,
  stepAudioData: state => state.stepAudioData,
  runAudioData: state => state.runAudioData,
  waterStepAudioData: state => state.waterStepAudioData,
  waterRunAudioData: state => state.waterRunAudioData,
  jumpAudioData: state => state.jumpAudioData,
  waterJumpAudioData: state => state.waterJumpAudioData,
  spitAudioData: state => state.spitAudioData,
  dropAudioData: state => state.dropAudioData,
  oceanAudioData: state => state.oceanAudioData,
  windAudioData: state => state.windAudioData,
};

const actions = {
  setData: ({ commit }, payload) => {
    commit('setData', payload);
  },
};

const mutations = {
  setData: (state, payload) => {
    const { field, data } = payload;
    state[field] = data;
    console.log(this, state);
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
};
