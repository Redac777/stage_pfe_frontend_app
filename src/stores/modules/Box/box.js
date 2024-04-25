import CustomizedAxios from "../../../plugins/axios";
const boxModule = {
  state: {
    

  },
  mutations: {
    
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

 
},
  getters: {
   
    
  },
};
export default boxModule;
