import CustomizedAxios from "../../../plugins/axios";
const profilegroupsModule = {
  state: {
    profilegroups: [],
  },
  mutations: {
    SET_PROFILEGROUPS(state, payload) {
      state.profilegroups = payload;
    },
  },
  actions: {
       setProfileGroupsAction({ commit, state }) {
      return new Promise((resolve, reject) => {
        CustomizedAxios.get("profilegroups/")
          .then((response) => {
            commit("SET_PROFILEGROUPS", response.data.payload);
            resolve(response);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
  },
  getters: {
    getProfileGroups: (state) => {
      return state.profilegroups;
    },
   
  },
};

export default profilegroupsModule;
