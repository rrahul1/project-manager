import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000/api" });

export const loginUser = (formData) => API.post("/auth/login", formData);
export const registerUser = (formData) => API.post("/auth/signup", formData);
export const createTask = (formData, token) =>
   API.post("/project/create-project", formData, {
      headers: {
         Authorization: `Bearer ${token}`,
      },
   });

export const fetchUser = () => API.get("/auth/user-email");

export const updateUser = (formData, id) =>
   API.put(`/auth/update-user/${id}`, formData);
