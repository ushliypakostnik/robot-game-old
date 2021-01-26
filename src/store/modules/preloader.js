/* eslint-disable import/no-cycle, no-shadow */
const initialState = {
  isGameLoaded: false,
  isGrassLoaded: false,
  isStoneLoaded: false,
  isGroundBuilt: false,
  isMountainsBuilt: false,
  isStonesBuilt: false,
  isSandLoaded: false,
  isBeachBuilt: false,
  isSandsBuilt: false,
  isWaterLoaded: false,
  isOceanBuilt: false,
  isLakesBuilt: false,
  isPuddlesBuilt: false,
  isStepComplete: false,
  isRunComplete: false,
};
const state = initialState;

const getters = {
  isGameLoaded: state => state.isGameLoaded,
};

const actions = {
  grassLoaded: ({ commit }) => {
    commit('grassLoaded');
  },

  groundBuilt: ({ commit }) => {
    commit('groundBuilt');
  },

  stoneLoaded: ({ commit }) => {
    commit('stoneLoaded');
  },

  mountainsBuilt: ({ commit }) => {
    commit('mountainsBuilt');
  },

  stonesBuilt: ({ commit }) => {
    commit('stonesBuilt');
  },

  sandLoaded: ({ commit }) => {
    commit('sandLoaded');
  },

  beachBuilt: ({ commit }) => {
    commit('beachBuilt');
  },

  sandsBuilt: ({ commit }) => {
    commit('sandsBuilt');
  },

  waterLoaded: ({ commit }) => {
    commit('waterLoaded');
  },

  oceanBuilt: ({ commit }) => {
    commit('oceanBuilt');
  },

  lakesBuilt: ({ commit }) => {
    commit('lakesBuilt');
  },

  puddlesBuilt: ({ commit }) => {
    commit('puddlesBuilt');
  },

  stepComplete: ({ commit }) => {
    commit('stepComplete');
  },

  runComplete: ({ commit }) => {
    commit('runComplete');
  },

  isAllLoadedAndBuilt: ({ commit }) => {
    commit('isAllLoadedAndBuilt');
  },
};

const mutations = {
  grassLoaded: (state) => {
    state.isGrassLoaded = true;
  },

  groundBuilt: (state) => {
    state.isGroundBuilt = true;
  },

  stoneLoaded: (state) => {
    state.isStoneLoaded = true;
  },

  mountainsBuilt: (state) => {
    state.isMountainsBuilt = true;
  },

  stonesBuilt: (state) => {
    state.isStonesBuilt = true;
  },

  sandLoaded: (state) => {
    state.isSandLoaded = true;
  },

  beachBuilt: (state) => {
    state.isBeachBuilt = true;
  },

  sandsBuilt: (state) => {
    state.isSandsBuilt = true;
  },

  waterLoaded: (state) => {
    state.isWaterLoaded = true;
  },

  oceanBuilt: (state) => {
    state.isOceanBuilt = true;
  },

  lakesBuilt: (state) => {
    state.isLakesBuilt = true;
  },

  puddlesBuilt: (state) => {
    state.isPuddlesBuilt = true;
  },

  stepComplete: (state) => {
    state.isStepComplete = true;
  },

  runComplete: (state) => {
    state.isRunComplete = true;
  },

  isAllLoadedAndBuilt: (state) => {
    let stateCopy = Object.assign({}, state);
    delete stateCopy.isGameLoaded;
    const result = Object.values(stateCopy).every(element => element === true)
    if (result) state.isGameLoaded = true;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
