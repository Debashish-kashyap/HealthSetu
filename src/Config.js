// ─── API ──────────────────────────────────────────────────────────────────────
// Change this to your Railway/Render URL when deployed
// e.g. "https://healthsetu-production.up.railway.app"
const rawApiBase =
  import.meta.env.VITE_API_BASE ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:3001";

export const API_BASE = /^https?:\/\//i.test(rawApiBase)
  ? rawApiBase
  : /^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(rawApiBase)
    ? `http://${rawApiBase}`
    : `https://${rawApiBase}`;

// ─── APP CONSTANTS ────────────────────────────────────────────────────────────
export const STORAGE_KEY = "healthsetu_patients";

export const VILLAGES = ["Haflong", "Maibang", "Langting", "Umrangso", "Jatinga"];

export const VACCINES = [
  "BCG", "OPV-0", "HepB-0",
  "Penta-1", "Penta-2", "Penta-3",
  "MR", "JE", "Td",
];

export const CONDITIONS = [
  "None", "Hypertension", "Diabetes",
  "Anemia", "Tuberculosis", "Pregnancy",
];

export const CONDITION_COLORS = {
  Pregnancy:    "#e8732a",
  Hypertension: "#c94040",
  Diabetes:     "#2d7a6e",
  Anemia:       "#8b5cf6",
  Tuberculosis: "#a0522d",
  None:         "#94a3b8",
};