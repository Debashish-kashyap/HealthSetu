import { STORAGE_KEY } from "../Config";
import { SEED_PATIENTS } from "../data/seedData";

export function loadPatients() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      let patients = JSON.parse(raw);
      // Migrate: assign old patients without ashaId to demo worker A001
      let needsSave = false;
      patients = patients.map((p) => {
        if (!p.ashaId) {
          needsSave = true;
          return { ...p, ashaId: "A001" };
        }
        return p;
      });
      // De-duplicate by patient id (keep first occurrence)
      const seen = new Set();
      patients = patients.filter((p) => {
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      });
      if (needsSave) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
      }
      return patients;
    }
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

export function saveAshaPatients(ashaId, ashaPatients) {
  try {
    // Load all patients globally
    const allPatients = loadPatients();
    // Filter out the old patients belonging to THIS asha
    const otherPatients = allPatients.filter((p) => p.ashaId !== ashaId);
    // Merge other patients with this asha's updated list
    const updatedGlobal = [...otherPatients, ...ashaPatients];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedGlobal));
  } catch (e) {
    console.error("Failed to save to localStorage:", e);
  }
}


