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

  details: 0,
  bottles: 0,

  isHeroOnDamage: false,
  isHeroOnFire: false,
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

  anemone: state => state.anemone,
  crocus: state => state.crocus,
  daffodil: state => state.daffodil,
  tulip: state => state.tulip,

  details: state => state.details,
  bottles: state => state.bottles,

  isHeroOnDamage: state => state.isHeroOnDamage,
  isHeroOnFire: state => state.isHeroOnFire,
  isHeroOnWater: state => state.isHeroOnWater,
  isHeroTired: state => state.isHeroTired,
  isNotDamaged: state => state.isNotDamaged,
  isNotTired: state => state.isNotTired,
};

const actions = {
  setHeroOnDamage: ({ commit }, isHeroOnDamage) => {
    commit('setHeroOnDamage', isHeroOnDamage);
  },

  setHeroOnFire: ({ commit }, isHeroOnFire) => {
    commit('setHeroOnFire', isHeroOnFire);
  },

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
};

const mutations = {
  setHeroOnDamage: (state, isHeroOnDamage) => {
    state.isHeroOnDamage = isHeroOnDamage;
  },

  setHeroOnFire: (state, isHeroOnFire) => {
    state.isHeroOnFire = isHeroOnFire;
  },

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
      && state[payload.field] + payload.value > 99.999999) {
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
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
