import Vue from 'vue';
import Vuex from 'vuex';

import layout from './modules/layout';
import preloader from './modules/preloader';
import hero from './modules/hero';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
  modules: {
    layout,
    preloader,
    hero,
  },
  strict: debug,
});
