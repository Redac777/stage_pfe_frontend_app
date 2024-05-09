import CustomizedAxios from "../../../plugins/axios";
const equipementToPlanningModule = {
  state: {
    plannings: [],
    rsPlannings:[],
    currentPlanning: null,
    currentSTSPlanning: null,
    currentRSPlanning: null,
    currentAMPlanning: null,
    planningDrivers: [],
    setPlanningEquipements: [],
    planningEquipements:[],
  },
  mutations: {
    ADD_PLANNING(state, payload) {
      state.plannings.push(payload);
    },
    ADD_RS_PLANNING(state, payload) {
      state.rsPlannings.push(payload);
    },
    SET_CURRENT_PLANNING(state, payload) {
      state.currentPlanning = payload;
    },
    SET_CURRENT_RS_PLANNING(state, payload) {
      state.currentRSPlanning = payload;
    },
    SET_PLANNING_DRIVERS(state, payload) {
      state.planningDrivers = payload;
    },
    SET_PLANNING_EQUIPEMENTS(state, payload) {
      state.planningEquipements = payload;
    },
    CLEAR_PLANNINGS(state) {
      state.plannings = [];
      state.rsPlannings = [];
      state.currentPlanning = null;
      state.currentSTSPlanning = null;
      state.currentRSPlanning = null;
      state.currentAMPlanning = null;
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
    createRSPlanningAction({ commit, state }, planning) {
      return new Promise((resolve, reject) => {
        CustomizedAxios.post("plannings/add", planning)
          .then((response) => {
            commit("ADD_RS_PLANNING", response.data.payload);
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
            // commit("SET_CURRENT_PLANNING", response.data.payload);
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
    setCurrentRSPlanning({ commit, state }, date) {
      return new Promise((resolve, reject) => {
        delete date.profileType;
        CustomizedAxios.post("plannings/getByDate", date)
          .then((response) => {
              commit("SET_CURRENT_RS_PLANNING", response.data.payload);
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
        localStorage.removeItem('rsPlannings')
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
    getRSPlannings(state){
      return state.rsPlannings;
    },
    getCurrentPlanning(state) {
      return state.currentPlanning;
    },
    getCurrentRSPlanning(state){
      return state.currentRSPlanning
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
