/* eslint-disable import/no-cycle, no-shadow */
import storage from '@/utils/storage';

const initialState = {
  language: null,
};

const state = initialState;

const getters = {
  language: state => state.language,
};

const actions = {
  changeLanguage: ({ commit }, language) => {
    commit('changeLanguage', language);
    storage.rememberLanguage(language);
  },
};

const mutations = {
  changeLanguage: (state, language) => {
    state.language = language;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
