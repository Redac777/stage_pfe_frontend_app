import VuexPersist from 'vuex-persist'
import user from './modules/user'
import loading from './modules/loading'
import { createStore } from 'vuex'
const vuexLocalStorage = new VuexPersist({
    key: "ResourcesPlanningApp",
    storage: window.localStorage,
    reducer: (state) => ({
      user: state.user,
      loading: state.loading
    }),
    filter: (mutation) => true,
  });
  
const Store = createStore({
    modules: {
      user: user,
      loading: loading
    },
    plugins: [vuexLocalStorage.plugin],
  })


export default Store
