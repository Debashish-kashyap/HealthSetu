/**
 * Returns "danger" | "warning" | "normal" based on systolic BP.
 */
export function getBPStatus(bp) {
  if (!bp) return "normal";
  const [systolic] = bp.split("/").map(Number);
  if (systolic >= 140) return "danger";
  if (systolic >= 130) return "warning";
  return "normal";
}

/**
 * Returns "danger" | "warning" | "normal" based on temperature (°F).
 */
export function getTempStatus(temp) {
  if (temp >= 100) return "danger";
  if (temp >= 99.5) return "warning";
  return "normal";
}

/**
 * Generates a simple unique patient ID based on timestamp.
 */
export function generatePatientId() {
  return "P" + Date.now().toString().slice(-6);
}

/**
 * Returns today's date formatted as "Jan 1" style string.
 */
export function todayLabel() {
  return new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

/**
 * Returns today's date as ISO string (YYYY-MM-DD).
 */
export function todayISO() {
  return new Date().toISOString().split("T")[0];
}

