import CustomizedAxios from "../../../plugins/axios";
const shiftsModule = {
  state: {
    shifts: [],
  },
  mutations: {
    SET_SHIFTS(state, payload) {
      state.shifts = payload;
    },
  },
  actions: {
       setShiftsAction({ commit, state }) {
      return new Promise((resolve, reject) => {
        CustomizedAxios.get("shifts/")
          .then((response) => {
            commit("SET_SHIFTS", response.data.payload);
            resolve(response);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },

    setShiftByCategory({ commit, state }, category) {
      return new Promise((resolve, reject) => {
        CustomizedAxios.post("shifts/getByCategory", category)
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
    getShifts: (state) => {
      return state.shifts;
    },
   
  },
};

export default shiftsModule;
