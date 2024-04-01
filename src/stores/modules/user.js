import CustomizedAxios from "../../plugins/axios";
const usersModule = {
  state: {
    users: [],
    error: null,
    token: null,
    activeUser: null,
    messages: {
      logout: "",
    },
  },
  mutations: {
    LOGIN_USER(state, payload) {
      state.activeUser = payload.user;
      state.token = payload.token;
    },
    LOGOUT_USER(state, message) {
      
      state.activeUser = null;
      console.log(state.activeUser)
      state.token = null;
      state.messages.logout = message;
    },
    DISPLAY_ERROR(state, error, status) {
      state.error = {
        error: error,
        status: status,
      };
    },
    SET_USERS(state, payload) {
      state.users = payload;
    },
    REGISTER_USER(state, payload) {
      state.users.push(payload);
    },
    DELETE_USER(state, user) {
      state.users = state.users.filter((c) => c.id != user);
    },
    EDIT_USER(state, user) {
      state.users = state.users.map((c) => {
        if (c.id == user.id) return user;
        return c;
      });
    },
    RESET_PASS_USER(state, user) {
      const index = state.users.findIndex((c) => c.id === user.id);
      if (index == -1) {
        state.users[index] = user;
      }
    },
  },
  actions: {
    LoginAction({ commit }, user) {
      return new Promise((resolve, reject) => {
        CustomizedAxios.post("users/login", user)
          .then((response) => {
            commit("LOGIN_USER", response.data.payload);
            CustomizedAxios.defaults.headers.common['Authorization'] = `Bearer ${response.data.payload.token}`;
            resolve(response.data.payload);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    registerUserAction({ commit, state }, user) {
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
    logoutAction({ commit, state }) {
      return new Promise((resolve, reject) => {
        CustomizedAxios.post("users/logout")
          .then((response) => {
            commit("LOGOUT_USER", response.data.message);
            resolve(response.data.message);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    setUsersAction({ commit, state }) {
      return new Promise((resolve, reject) => {
        CustomizedAxios.get("users/")
          .then((response) => {
            commit("SET_USERS", response.data.payload);
            resolve(response);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    deleteUserAction({ commit, state }, user) {
      return new Promise((resolve, reject) => {
        let data = {
          id: user,
        };
        CustomizedAxios.post("users/delete", data)
          .then((response) => {
            console.log(response.data.payload)
            commit("DELETE_USER", user);
            resolve(response.data.payload);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    editUserAction({ commit }, user) {
      return new Promise((resolve, reject) => {
        CustomizedAxios.put("users/update", user)
          .then((response) => {
            commit("EDIT_USER", response.data.payload);
            resolve(response.data.payload);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    resetPasswordAction({ commit, state }, user) {
      return new Promise((resolve, reject) => {
        let data = {
          id: user,
        };
        CustomizedAxios.put("users/resetpass", data)
          .then((response) => {
            commit("RESET_PASS_USER", response.data.payload);
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

export default usersModule;
