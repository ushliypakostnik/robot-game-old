/* eslint-disable import/no-cycle, no-shadow */
import storage from '@/utils/storage';

const initialState = {
  waterTexture: null,
  sandsTexture: null,
};

const state = initialState;

const getters = {
  waterTexture: state => state.waterTexture,
  sandsTexture: state => state.sandsTexture,
};

const actions = {
  storeWaterTexture: ({ commit }, texture) => {
    commit('storeWaterTexture', texture);
  },

  storeSandsTexture: ({ commit }, texture) => {
    commit('storeSandsTexture', texture);
  },
};

const mutations = {
  storeWaterTexture: (state, texture) => {
    state.waterTexture = texture;
  },

  storeSandsTexture: (state, texture) => {
    state.sandsTexture = texture;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
