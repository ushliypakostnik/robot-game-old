import { DESIGN } from '@/utils/constants';

const initialState = {
  // scales
  health: DESIGN.HERO.scales.health.start,
  endurance: DESIGN.HERO.scales.endurance.start,
  power: DESIGN.HERO.scales.power.start,
  ammo: DESIGN.HERO.scales.ammo.start,

  isHeroOnWater: false,
  isHeroTired: false,
  isNotDamaged: false,
  isNotTired: false,
};

const state = initialState;

const getters = {
  health: state => state.health,
  endurance: state => state.endurance,
  power: state => state.power,
  ammo: state => state.ammo,

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
    let field;
    for (field in initialState) {
      state[field] = initialState[field];
    }
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
