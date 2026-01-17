import api from "./api";

export const registerUser = (data) =>
  api.post("/auth/register", data);

export const loginUser = (data) =>
  api.post("/auth/login", data);

export const sendOTP = (userId) =>
  api.post("/auth/send-otp", { userId });

export const verifyOTP = (userId, otp) =>
  api.post("/auth/verify-otp", { userId, otp });
