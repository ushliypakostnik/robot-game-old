import { DESIGN } from '@/utils/constants';

const initialState = {
  // scales
  health: DESIGN.HERO.scales.health.start,
  endurance: DESIGN.HERO.scales.endurance.start,
  power: DESIGN.HERO.scales.power.start,
  ammo: DESIGN.HERO.scales.ammo.start,

  anemone: 0,
  crocus: 0,
  daffodil: 0,
  tulip: 0,

  isHeroOnWater: false,
  isHeroTired: false,
  isNotDamaged: false,
  isNotTired: false,
};

const state = Object.assign({}, initialState);

const getters = {
  health: state => state.health,
  endurance: state => state.endurance,
  power: state => state.power,
  ammo: state => state.ammo,

  anemone: state => state.anemone,
  crocus: state => state.crocus,
  daffodil: state => state.daffodil,
  tulip: state => state.tulip,

  isHeroOnWater: state => state.isHeroOnWater,
  isHeroTired: state => state.isHeroTired,
  isNotDamaged: state => state.isNotDamaged,
  isNotTired: state => state.isNotTired,
};

const actions = {
  setHeroOnWater: ({ commit }, isHeroOnWater) => {
    commit('setHeroOnWater', isHeroOnWater);
  },

  setHeroTired: ({ commit }, isHeroTired) => {
    commit('setHeroTired', isHeroTired);
  },

  setNotDamaged: ({ commit }, isNotDamaged) => {
    commit('setNotDamaged', isNotDamaged);
  },

  setNotTired: ({ commit }, isNotTired) => {
    commit('setNotTired', isNotTired);
  },

  setScale: ({ commit }, payload) => {
    commit('setScale', payload);
  },

  heroReload: ({ commit }) => {
    commit('heroReload');
  },
};

const mutations = {
  setHeroOnWater: (state, isHeroOnWater) => {
    state.isHeroOnWater = isHeroOnWater;
  },

  setHeroTired: (state, isHeroTired) => {
    state.isHeroTired = isHeroTired;
  },

  setNotDamaged: (state, isNotDamaged) => {
    state.isNotDamaged = isNotDamaged;
  },

  setNotTired: (state, isNotTired) => {
    state.isNotTired = isNotTired;
  },

  setScale: (state, payload) => {
    if (payload.field === DESIGN.HERO.scales.health.name
      && state[payload.field] + payload.value > 99) {
      state[payload.field] = 100;
    } else if (payload.field === DESIGN.HERO.scales.endurance.name
            && state[payload.field] + payload.value > 99){
      state[payload.field] = 100;
      state.isHeroTired = false;
    } else if (payload.field === DESIGN.HERO.scales.power.name
      && state[payload.field] + payload.value > 99){
      state[payload.field] = 100;
    } else state[payload.field] = state[payload.field] + payload.value;
  },

  heroReload: (state) => {
    for (let field in initialState) state[field] = initialState[field];
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
