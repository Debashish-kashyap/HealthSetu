import { API_BASE } from "../Config";

/**
 * Posts all unsynced patients to the backend.
 * Returns { success, synced } on success or { success: false, error } on failure.
 */
export async function syncToServer(patients) {
  const pending = patients.filter((p) => !p.synced);
  if (pending.length === 0) return { success: true, synced: 0 };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(`${API_BASE}/api/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patients: pending }),
      signal: controller.signal,
    });

    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    const data = await res.json();
    return { success: true, synced: data.synced ?? pending.length };
  } catch (err) {
    console.warn("Sync failed:", err.message);
    return { success: false, error: err.message };
  } finally {
    clearTimeout(timeoutId);
  }
}

