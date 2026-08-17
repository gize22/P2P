import axios from "axios";

const API = axios.create({
  baseURL: "http://172.16.6.126:5000/api",
});

// ቶከኑን በ request ጊዜ አብሮ እንዲልክ ማድረግ (ለወደፊት ይጠቅመናል)
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;