import VuexPersist from 'vuex-persist'
import user from './modules/User/user'
import loading from './modules/Loading/loading'
import role from './modules/Role/role'
import shift from './modules/Shift/shift'
import profilegroup from './modules/ProfileGroup/profilegroup'
import equipement from './modules/Equipement/equipement'
import planning from './modules/Planning/planning'
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
      equipement : state.equipement,
      planning : state.planning
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
      equipement: equipement,
      planning: planning
    },
    plugins: [vuexLocalStorage.plugin],
  })


export default Store
