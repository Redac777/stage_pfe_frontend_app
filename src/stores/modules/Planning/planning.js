import CustomizedAxios from "../../../plugins/axios";
const equipementToPlanningModule = {
  state: {
    plannings: [],
    currentPlanning: null,
    currentStsPlanning: null,
    currentRsPlanning: null,
    currentAmPlanning: null,
    planningDrivers: [],
    setPlanningEquipements: [],
  },
  mutations: {
    ADD_PLANNING(state, payload) {
      state.plannings.push(payload);
    },
    SET_CURRENT_PLANNING(state, payload) {
      state.currentPlanning = payload;
    },
    SET_PLANNING_DRIVERS(state, payload) {
      state.planningDrivers = payload;
    },
    SET_PLANNING_EQUIPEMENTS(state, payload) {
      state.planningEquipements = payload;
    },
    CLEAR_PLANNINGS(state) {
      state.plannings = [];
      state.currentPlanning = null;
      state.currentStsPlanning = null;
      state.currentRsPlanning = null;
      state.currentAmPlanning = null;
      state.planningDrivers = [];
      state.setPlanningEquipements = [];
      // Clear other related states as needed
    }
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
            commit("SET_CURRENT_PLANNING", response.data.payload);
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

    addEquipementWorkingHoursToPlanning(
      { commit, state },
      equipementWWHPlanning
    ) {
      return new Promise((resolve, reject) => {
        CustomizedAxios.post(
          "equipementsplanningsworkinghours/add",
          equipementWWHPlanning
        )
          .then((response) => {
            resolve(response.data.payload);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },

    setCurrentPlanning({ commit, state }, date) {
      return new Promise((resolve, reject) => {
        let profileType = date.profileType;
        delete date.profileType;
        CustomizedAxios.post("plannings/getByDate", date)
          .then((response) => {
              commit("SET_CURRENT_PLANNING", response.data.payload);
              resolve(response.data.payload);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },

    setPlanningDrivers({ commit, state }, planning) {
      return new Promise((resolve, reject) => {
        CustomizedAxios.post("usersplannings/getByPlanning", planning)
          .then((response) => {
            commit("SET_PLANNING_DRIVERS", response.data.payload);
            resolve(response.data.payload);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },

    setPlanningEquipements({ commit, state }, planning) {
      return new Promise((resolve, reject) => {
        CustomizedAxios.post("equipementsplannings/getByPlanning", planning)
          .then((response) => {
            commit("SET_PLANNING_EQUIPEMENTS", response.data.payload);
            resolve(response.data.payload);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    
      clearPlannings({ commit }) {
        // Clear plannings array and related states
        commit('CLEAR_PLANNINGS');
        // Clear data stored in localStorage
        localStorage.removeItem('plannings');
        localStorage.removeItem('currentPlanning');
        localStorage.removeItem('currentStsPlanning');
        localStorage.removeItem('currentRsPlanning');
        localStorage.removeItem('currentAmPlanning');
        localStorage.removeItem('planningDrivers');
        localStorage.removeItem('setPlanningEquipements');
        // Clear other related data stored in localStorage as needed
      
    }
    
    


  },
  getters: {
    getPlannings(state) {
      return state.plannings;
    },
    getCurrentPlanning(state) {
      return state.currentPlanning;
    },
    getPlanningDrivers(state) {
      return state.planningDrivers;
    },
    getPlanningEquipements(state) {
      return state.planningEquipements;
    },
    resetCurrentPlanning() {
      return (this.currentPlanning = null);
    },
  },
};
export default equipementToPlanningModule;
