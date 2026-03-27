// Hybrid API — REAL auth (Firebase verified) + REAL backend+ML for session/interview/results
import mockClient from "./mockClient";
import realClient from "./client";

// Auth uses REAL backend with Firebase verification
// Session uses REAL backend → REAL ML service for actual AI analysis
export const authApi = {
  register: (data) => realClient.post("/auth/register", data),
  login:    (data) => realClient.post("/auth/login", data),
  googleAuth: (firebaseToken, fullName, photoUrl) =>
    realClient.post("/auth/google", { firebase_token: firebaseToken, full_name: fullName, photo_url: photoUrl }),
  getMe:    ()     => realClient.get("/auth/me"),
  updateMe: (data) => realClient.patch("/auth/me", data),
};

export const sessionApi = {
  startSession:      ()       => realClient.post("/session/start", {}),
  submitAnswer:      (data)   => realClient.post("/session/answer", data),
  getResult:         (id)     => realClient.get(`/session/result/${id}`),
  getHistory:        ()       => mockClient.get("/session/history"),
  populationReport:  (data)   => mockClient.post("/session/population/report", data),
  populationSummary: ()       => mockClient.get("/session/population/summary"),
};
