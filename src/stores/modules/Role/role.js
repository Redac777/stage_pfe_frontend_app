import CustomizedAxios from "../../../plugins/axios";
const rolesModule = {
  state: {
    roles: [],
  },
  mutations: {
    SET_ROLES(state, payload) {
      state.roles = payload;
    },
  },
  actions: {
       setRolesAction({ commit, state }) {
      return new Promise((resolve, reject) => {
        CustomizedAxios.get("roles/")
          .then((response) => {
            commit("SET_ROLES", response.data.payload);
            resolve(response);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
  },
  getters: {
    getRoles: (state) => {
      return state.roles;
    },
   
  },
};

export default rolesModule;
