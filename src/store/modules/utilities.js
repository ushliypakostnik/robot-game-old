/* eslint-disable import/no-cycle, no-shadow */
import storage from '@/utils/storage';

const initialState = {
  language: null,
  pause: true,
};

const state = initialState;

const getters = {
  language: state => state.language,
  pause: state => state.pause,
};

const actions = {
  changeLanguage: ({ commit }, language) => {
    commit('changeLanguage', language);
    storage.rememberLanguage(language);
  },

  changePause: ({ commit }, isPause) => {
    commit('changePause', isPause);
  },
};

const mutations = {
  changeLanguage: (state, language) => {
    state.language = language;
  },

  changePause: (state, isPause) => {
    state.pause = isPause;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
