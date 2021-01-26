/* eslint-disable import/no-cycle */
import Vue from 'vue';
import Vuex from 'vuex';

import preloader from './modules/preloader';
import utilities from './modules/utilities';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
  modules: {
    utilities,
    preloader,
  },
  strict: debug,
});
