import { DESIGN } from '@/utils/constants';

const initialState = {
  // scales
  health: DESIGN.HERO.scales.health.start,
  endurance: DESIGN.HERO.scales.endurance.start,
  power: DESIGN.HERO.scales.power.start,
  ammo: DESIGN.HERO.scales.ammo.start,

  isHeroOnWater: false,
  isHeroTired: false,
};

const state = Object.assign({}, initialState);

const getters = {
  health: state => state.health,
  endurance: state => state.endurance,
  power: state => state.power,
  ammo: state => state.ammo,

  isHeroOnWater: state => state.isHeroOnWater,
  isHeroTired: state => state.isHeroTired,
};

const actions = {
  setHeroOnWater: ({ commit }, isHeroOnWater) => {
    commit('setHeroOnWater', isHeroOnWater);
  },

  setHeroTired: ({ commit }, isHeroTired) => {
    commit('setHeroTired', isHeroTired);
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

  setScale: (state, payload) => {
    state[payload.field] = state[payload.field] + payload.value;

    if (payload.field === DESIGN.HERO.scales.endurance.name && state[payload.field] > 99) {
      state[payload.field] = 100;
      state.isHeroTired = false;
    }
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
