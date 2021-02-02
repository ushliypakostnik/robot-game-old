/* eslint-disable import/no-cycle, no-shadow */
const initialState = {
  isGameLoaded: false,
  isHeroLoaded: false,
  isMashaComplete: false,
  isGrassLoaded: false,
  isGrassBuilt: false,
  isStoneLoaded: false,
  isStonesBuilt: false,
  isSandLoaded1: false,
  isSandLoaded2: false,
  isSandsBuilt: false,
  isWaterLoaded: false,
  isWatersBuilt: false,
  isStepComplete: false,
  isRunComplete: false,
  isWaterStepsComplete: false,
  isWaterRunComplete: false,
  isJumpComplete: false,
  isWaterJumpComplete: false,
  isSpitComplete: false,
  isDropComplete: false,
  isOceanComplete: false,
  isWindComplete: false,
  isTree1Loaded: false,
  isTree2Loaded: false,
  isTressBuilt: false,
  isAnemoneLoaded: false,
  isCrocusLoaded: false,
  isDaffodilLoaded: false,
  isTulipLoaded: false,
  isAnemoneBuilt: false,
  isCrocusBuilt: false,
  isDaffodilBuilt: false,
  isTulipBuilt: false,
};
const state = initialState;

const getters = {
  isGameLoaded: state => state.isGameLoaded,
};

const actions = {
  preloadOrBuilt: ({ commit }, name) => {
    commit('preloadOrBuilt', name);
  },

  isAllLoadedAndBuilt: ({ commit }) => {
    commit('isAllLoadedAndBuilt');
  },
};

const mutations = {
  preloadOrBuilt: (state, name) => {
    // console.log('preloadOrBuilt', name);
    state[name] = true;
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
