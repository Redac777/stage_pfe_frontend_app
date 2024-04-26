import CustomizedAxios from "../../../plugins/axios";
const boxModule = {
  state: {
    planningBoxes: [],
  },
  mutations: {
    SET_PLANNING_BOXES(state, payload) {
      state.planningBoxes = payload;
    },
  },
  actions: {
    setBoxAction({ commit, state }, box) {
      return new Promise((resolve, reject) => {
        CustomizedAxios.post("boxes/add", box)
          .then((response) => {
            resolve(response.data.payload);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },

    setPlanningBoxes({ commit, state }, planning) {
      return new Promise((resolve, reject) => {
        CustomizedAxios.post("boxes/getByPlanning", planning)
          .then((response) => {
            commit("SET_PLANNING_BOXES", response.data.payload);
            resolve(response.data.payload);

          })
          .catch((error) => {
            reject(error);
          });
      });
    },
  },
  getters: {
    getPlanningBoxes(state) {
      return state.planningBoxes;
    },
  },
};
export default boxModule;
