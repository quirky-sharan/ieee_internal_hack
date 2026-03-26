// Set VITE_DEMO_MODE=true in .env to run without backend
// For production: use the real axios client
import mockClient from "./mockClient";
import realClient from "./client";

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true" || true; // set to true for demo
const api = DEMO_MODE ? mockClient : realClient;

export const authApi = {
  register: (data) => api.post("/auth/register", data),
  login:    (data) => api.post("/auth/login", data),
  googleAuth: (firebaseToken, fullName, photoUrl) =>
    api.post("/auth/google", { firebase_token: firebaseToken, full_name: fullName, photo_url: photoUrl }),
  getMe:    ()     => api.get("/auth/me"),
  updateMe: (data) => api.patch("/auth/me", data),
};

export const sessionApi = {
  startSession:      ()       => api.post("/session/start", {}),
  submitAnswer:      (data)   => api.post("/session/answer", data),
  getResult:         (id)     => api.get(`/session/result/${id}`),
  getHistory:        ()       => api.get("/session/history"),
  populationReport:  (data)   => api.post("/session/population/report", data),
  populationSummary: ()       => api.get("/session/population/summary"),
};
