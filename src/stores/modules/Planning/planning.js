import CustomizedAxios from "../../../plugins/axios";
const equipementToPlanningModule = {
  state: {
    plannings: [],
  },
  mutations: {
    ADD_PLANNING(state, payload) {
      state.plannings.push(payload);
    },
  },
  actions: {
    // addEquipementsToPlanningAction({ commit, state }, user) {
    //   return new Promise((resolve, reject) => {
    //     CustomizedAxios.post("users/register", user)
    //       .then((response) => {
    //         commit("REGISTER_USER", response);
    //         resolve(response.data.payload);
    //       })
    //       .catch((error) => {
    //         reject(error);
    //       });
    //   });
    // },

    createPlanningAction({ commit, state }, planning) {
      return new Promise((resolve, reject) => {
        CustomizedAxios.post("plannings/add", planning)
          .then((response) => {
            commit("ADD_PLANNING", response.data.payload);
            resolve(response.data.payload);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },

    addUserToPlanning({ commit, state }, userWPlanning) {
      return new Promise((resolve, reject) => {
        CustomizedAxios.post("usersplannings/add", userWPlanning)
          .then((response) => {
            resolve(response.data.payload);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    addEquipementToPlanning({ commit, state }, equipementWPlanning) {
      return new Promise((resolve, reject) => {
        CustomizedAxios.post("equipementsplannings/add", equipementWPlanning)
          .then((response) => {
            resolve(response.data.payload);
          })
          .catch((error) => {
            reject(error);
          });
      });
  },

    addEquipementWorkingHoursToPlanning({ commit, state }, equipementWWHPlanning) {
      return new Promise((resolve, reject) => {
        CustomizedAxios.post("equipementsplanningsworkinghours/add", equipementWWHPlanning)
          .then((response) => {
            resolve(response.data.payload);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
},
  getters: {
    getPlannings(state) {
      return state.plannings;
    },
  },
};
export default equipementToPlanningModule;
