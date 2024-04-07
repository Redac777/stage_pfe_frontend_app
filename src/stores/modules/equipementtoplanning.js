import CustomizedAxios from "../../plugins/axios";
const equipementToPlanningModule = {
  state: {
  },
  mutations: {
   
  },
  actions: {
    
    addEquipementsToPlanningAction({ commit, state }, user) {
      return new Promise((resolve, reject) => {
        CustomizedAxios.post("users/register", user)
          .then((response) => {
            commit("REGISTER_USER", response);
            resolve(response.data.payload);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
   
  },
  getters: {
    getUserActive: (state) => {
      return state.activeUser;
    },
    getToken: (state) => {
      return state.token;
    },
    getMessages: (state) => {
      return state.messages;
    },
    getUsers: (state) => {
      return state.users;
    },
  },
};

export default equipementToPlanningModule;
