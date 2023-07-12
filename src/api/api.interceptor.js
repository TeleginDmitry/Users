import axios from "https://cdn.jsdelivr.net/npm/axios@1.3.5/+esm";
import { API_URL } from "../config/index.config.js";

const instance = axios.create({
  baseURL: API_URL,
});

export default instance;
