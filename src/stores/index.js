import VuexPersist from 'vuex-persist'
import user from './modules/user'
import loading from './modules/loading'
import role from './modules/role'
import shift from './modules/shift'
import profilegroup from './modules/profilegroup'
import equipement from './modules/equipement'
import { createStore } from 'vuex'
const vuexLocalStorage = new VuexPersist({
    key: "ResourcesPlanningApp",
    storage: window.localStorage,
    reducer: (state) => ({
      user: state.user,
      loading: state.loading,
      role : state.role,
      shift : state.shift,
      profilegroup : state.profilegroup,
      equipement : state.equipement
    }),
    filter: (mutation) => true,
  });
  
const Store = createStore({
    modules: {
      user: user,
      loading: loading,
      role: role,
      shift: shift,
      profilegroup: profilegroup,
      equipement: equipement
    },
    plugins: [vuexLocalStorage.plugin],
  })


export default Store
