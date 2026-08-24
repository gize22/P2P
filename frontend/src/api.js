import axios from "axios";

const API = axios.create({
  baseURL: "https://p2plearn.onrender.com/api",
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