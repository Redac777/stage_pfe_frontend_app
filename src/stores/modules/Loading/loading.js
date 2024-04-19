const loadingModule = {
    state: {
      isLoading:false
    },
    mutations: {
     SET_LOADING_TRUE(state){
      state.isLoading=true;
     },
     SET_LOADING_FALSE(state){
      state.isLoading=false;
     }
    },
    actions: {
      setLoadingValueAction({commit},value){
          if(value===true)
          commit("SET_LOADING_TRUE")
          else
          commit("SET_LOADING_FALSE")
      }
    },
    getters: {
      getLoadingValue: (state) => {
        return state.isLoading;
      },
    },
  };
  
  export default loadingModule;
  