import axios from "axios";

const mockAPI = axios.create({
  baseURL: "https://68ca27d4430c4476c34861d4.mockapi.io/", // thay bằng URL của bạn
});
export default mockAPI;