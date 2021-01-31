/* eslint-disable import/no-cycle, no-shadow */
import storage from '@/utils/storage';

const initialState = {
  language: null,
  isPause: true,
  isDrone: false,
};

const state = initialState;

const getters = {
  language: state => state.language,
  isPause: state => state.isPause,
  isDrone: state => state.isDrone,
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
    if (isDrone) state.isPause = false;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
