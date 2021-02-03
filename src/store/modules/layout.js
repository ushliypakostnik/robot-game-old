import storage from '@/utils/storage';

const initialState = {
  language: null,
  isPause: true,
  isDrone: false,
  isGameOver: false,
};

const state = initialState;

const getters = {
  language: state => state.language,
  isPause: state => state.isPause,
  isDrone: state => state.isDrone,
  isGameOver: state => state.isGameOver,
};

const actions = {
  changeLanguage: ({ commit }, language) => {
    commit('changeLanguage', language);
    storage.rememberLanguage(language);
  },

  togglePause: ({ commit }, isPause) => {
    commit('togglePause', isPause);
  },

  toggleDrone: ({ commit }, isDrone) => {
    commit('toggleDrone', isDrone);
  },

  setGameOver: ({ commit }, isGameOver) => {
    commit('setGameOver', isGameOver);
  },

  layoutReload: ({ commit }) => {
    commit('layoutReload');
  },
};

const mutations = {
  changeLanguage: (state, language) => {
    state.language = language;
  },

  togglePause: (state, isPause) => {
    state.isPause = isPause;
  },

  toggleDrone: (state, isDrone) => {
    state.isDrone = isDrone;
  },

  setGameOver: (state, isGameOver) => {
    state.isGameOver = isGameOver;
  },

  layoutReload: (state) => {
    state.isPause = true;
    state.isDrone = false;
    state.isGameOver = false;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
