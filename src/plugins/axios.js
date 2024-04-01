import axios from "axios";
const CustomizedAxios = axios;
CustomizedAxios.defaults.baseURL = "http://127.0.0.1:8000/api";
let token;
if(localStorage.ResourcesPlanningApp) {
  token = JSON.parse(localStorage.ResourcesPlanningApp);
  CustomizedAxios.defaults.headers.common = {
    Authorization: `Bearer ${token.user.token}`,
    Accept: "application/json",
  };
}
export default CustomizedAxios;