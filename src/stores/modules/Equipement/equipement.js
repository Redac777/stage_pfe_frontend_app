import CustomizedAxios from "../../../plugins/axios";
const equipementsModule = {
  state: {
    equipements: [],
    },
  mutations: {
   
    SET_EQUIPEMENTS(state, payload) {
      state.equipements = payload;
    },

    ADD_EQUIPEMENT(state, payload) {
      state.equipements.push(payload);
    },
    DELETE_EQUIPEMENT(state, equipement) {
      state.equipements = state.equipements.filter((c) => c.id != equipement);
    },
    EDIT_EQUIPEMENT(state, equipement) {
      state.equipements = state.equipements.map((c) => {
        if (c.id == equipement.id) return equipement;
        return c;
      });
    },
  },
  actions: {

    addEquipementAction({ commit, state }, equipement) {
      return new Promise((resolve, reject) => {
        CustomizedAxios.post("equipements/add", equipement)
          .then((response) => {
            commit("ADD_EQUIPEMENT", response);
            resolve(response.data.payload);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    setEquipementsAction({ commit, state }) {
        return new Promise((resolve, reject) => {
          CustomizedAxios.get("equipements/")
            .then((response) => {
              commit("SET_EQUIPEMENTS", response.data.payload);
              resolve(response);
            })
            .catch((error) => {
              reject(error);
            });
        });
      },
      deleteEquipementAction({ commit, state }, equipement) {
        return new Promise((resolve, reject) => {
          let data = {
            id: equipement,
          };
          CustomizedAxios.post("equipements/delete", data)
            .then((response) => {
              console.log(response.data.payload);
              commit("DELETE_EQUIPEMENT", equipement);
              resolve(response.data.payload);
            })
            .catch((error) => {
              reject(error);
            });
        });
      },
      editEquipementAction({ commit }, equipement) {
        return new Promise((resolve, reject) => {
          CustomizedAxios.put("equipements/update", equipement)
            .then((response) => {
              commit("EDIT_EQUIPEMENT", response.data.payload);
              resolve(response.data.payload);
            })
            .catch((error) => {
              reject(error);
            });
        });
      },    
      setEquipementById({ commit, state }, equipement) {
        return new Promise((resolve, reject) => {
          CustomizedAxios.post("equipements/getById",equipement)
            .then((response) => {
              resolve(response.data.payload);
            })
            .catch((error) => {
              reject(error);
            });
        });
      }
  },
  getters: {

    getEquipements: (state) => {
      return state.equipements;
    },
  },
};

export default equipementsModule;
