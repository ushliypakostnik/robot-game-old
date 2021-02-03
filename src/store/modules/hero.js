const initialState = {
  health: 100,
  endurance: 100,
  power: 2,
  heroOnWater: false,
};

const state = Object.assign({}, initialState);

const getters = {
  health: state => state.health,
  endurance: state => state.endurance,
  power: state => state.power,
  heroOnWater: state => state.heroOnWater,
};

const actions = {
  setHeroOnWater: ({ commit }, heroOnWater) => {
    commit('setHeroOnWater', heroOnWater);
  },

  setDamage: ({ commit }, damage) => {
    commit('setDamage', damage);
  },

  heroReload: ({ commit }) => {
    commit('heroReload');
  },
};

const mutations = {
  setHeroOnWater: (state, heroOnWater) => {
    state.heroOnWater = heroOnWater;
  },

  setDamage: (state, damage) => {
    state.health = state.health - damage;
  },

  heroReload: (state) => {
    let field;
    for (field in initialState) {
      state[field] = initialState[field];
    }
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
