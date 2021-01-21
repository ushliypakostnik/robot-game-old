/* eslint-disable import/no-cycle, no-shadow */
import storage from '@/utils/storage';

const initialState = {
  language: null,
  start: false,
};

const state = initialState;

const getters = {
  language: state => state.language,
  start: state => state.start,
};

const actions = {
  changeLanguage: ({ commit }, language) => {
    commit('changeLanguage', language);
    storage.rememberLanguage(language);
  },

  changeStart: ({ commit }, start) => {
    commit('changeStart', start);
  },
};

const mutations = {
  changeLanguage: (state, language) => {
    state.language = language;
  },

  changeStart: (state, start) => {
    state.start = start;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
