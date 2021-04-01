import storage from '@/utils/storage';

import { DESIGN } from '@/utils/constants';

const initialState = {
  language: null,
  isPause: true,
  isDrone: false,

  messages: [],
  message: 0,

  isGameOver: false,
  isWin: false,
};

const state = initialState;

const getters = {
  language: state => state.language,
  isPause: state => state.isPause,
  isDrone: state => state.isDrone,
  messages: state => state.messages,
  message: state => state.message,
  isGameOver: state => state.isGameOver,
  isWin: state => state.isWin,
};

let messages;
let index;

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

  addMessage: ({ commit }) => {
    commit('addMessage');
  },

  showMessage: ({ commit }, { id, view, name, data }) => {
    commit('showMessage', { id, view, name, data });
  },

  hideMessageByView: ({ commit }, view) => {
    commit('hideMessageByView', view);
  },

  hideMessageById: ({ commit }, id) => {
    commit('hideMessageById', id);
  },

  setGameOver: ({ commit }, isGameOver) => {
    commit('setGameOver', isGameOver);
  },

  setWin: ({ commit }, isWin) => {
    commit('setWin', isWin);
  },
};

const mutations = {
  changeLanguage: (state, language) => {
    state.language = language;
  },

  togglePause: (state, isPause) => {
    state.isPause = isPause;
  },

  addMessage: (state) => {
    state.message = state.message + 1;
  },

  toggleDrone: (state, isDrone) => {
    state.isDrone = isDrone;
  },

  showMessage: (state, { id, view, name, data }) => {
    messages = state.messages;
    messages.push([id, view, name, data]);
    state.messages = messages;
  },

  hideMessageByView: (state, view) => {
    messages = state.messages;
    index = messages.find(message => message[1] === view);
    if (index) messages.splice(messages.indexOf(index), 1);
    state.messages = messages;
  },

  hideMessageById: (state, id) => {
    messages = state.messages;
    index = messages.find(message => message[0] === id);
    if (index) messages.splice(messages.indexOf(index), 1);
    state.messages = messages;
  },

  setGameOver: (state, isGameOver) => {
    state.isGameOver = isGameOver;
  },

  setWin: (state, isWin) => {
    state.isWin = isWin;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
