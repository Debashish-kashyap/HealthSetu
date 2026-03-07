import { STORAGE_KEY } from "../Config";
import { SEED_PATIENTS } from "../data/seedData";

export function loadPatients() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load from localStorage:", e);
  }
  // First run — seed demo data
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_PATIENTS));
  return SEED_PATIENTS;
}

export function savePatients(patients) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
  } catch (e) {
    console.error("Failed to save to localStorage:", e);
  }
}

export function clearPatients() {
  localStorage.removeItem(STORAGE_KEY);
}

