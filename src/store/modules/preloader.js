import storage from '@/utils/storage';

const initialState = {
  isGameLoaded: false,

  isHeroLoaded: false,
  isStoneLoaded: false,
  isSandLoaded1: false,
  isSandLoaded2: false,
  isGrassLoaded: false,
  isWaterLoaded: false,
  isTree1Loaded: false,
  isTree2Loaded: false,
  isAnemoneLoaded: false,
  isCrocusLoaded: false,
  isDaffodilLoaded: false,
  isTulipLoaded: false,

  isMashaComplete: false,
  isStepComplete: false,
  isRunComplete: false,
  isWaterStepComplete: false,
  isWaterRunComplete: false,
  isJumpComplete: false,
  isWaterJumpComplete: false,
  isSpitComplete: false,
  isDropComplete: false,
  isOceanComplete: false,
  isWindComplete: false,

  isAmmoBuilt: false,
  isGrassBuilt: false,
  isStonesBuilt: false,
  isSandsBuilt: false,
  isWatersBuilt: false,
  isTressBuilt: false,
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
  preloadOrBuilt: ({ commit }, field) => {
    commit('preloadOrBuilt', field);
  },

  isAllLoadedAndBuilt: ({ commit }) => {
    commit('isAllLoadedAndBuilt');
  },

  preloaderReload: ({ commit}) => {
    commit('preloaderReload');
  },
};

const mutations = {
  preloadOrBuilt: (state, field) => {
    state[field] = true;
  },

  isAllLoadedAndBuilt: (state) => {
    const stateCopy = Object.assign({}, state);
    delete stateCopy.isGameLoaded;
    const result = Object.values(stateCopy).every(field => field === true);
    if (result) state.isGameLoaded = true;
  },

  preloaderReload: (state) => {
    state.isGrassBuilt = false;
    state.isStonesBuilt = false;
    state.isSandsBuilt = false;
    state.isWatersBuilt = false;
    state.isTressBuilt = false;
    state.isAnemoneBuilt = false;
    state.isCrocusBuilt = false;
    state.isDaffodilBuilt = false;
    state.isTulipBuilt = false;

    state.isGameLoaded = false;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
