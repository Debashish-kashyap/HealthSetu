import { createContext, useContext, useState, useEffect } from "react";

// ─── Demo credentials ─────────────────────────────────────────────────────
// In production replace this with a real API call: POST /api/auth/login
export const DEMO_USERS = [
  {
    id: "A001",
    name: "Priya Thaosen",
    username: "asha_priya",
    password: "asha123",
    role: "asha",
    village: "Haflong",
    avatar: "PT",
    phone: "94360-11111",
  },
  {
    id: "A002",
    name: "Manju Borthakur",
    username: "asha_manju",
    password: "asha123",
    role: "asha",
    village: "Maibang",
    avatar: "MB",
    phone: "94360-22222",
  },
  {
    id: "S001",
    name: "Dr. Ratan Das",
    username: "supervisor_ratan",
    password: "super123",
    role: "supervisor",
    designation: "District Health Officer",
    district: "Dima Hasao",
    avatar: "RD",
  },
  {
    id: "S002",
    name: "Dr. Anita Singha",
    username: "supervisor_anita",
    password: "super123",
    role: "supervisor",
    designation: "Block Medical Officer",
    district: "Dima Hasao",
    avatar: "AS",
  },
];

const AUTH_STORAGE_KEY = "healthsetu_auth";

// ─── Context ──────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [loginError, setLoginError] = useState("");

  // Persist session across refreshes
  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  function login(username, password) {
    setLoginError("");
    const found = DEMO_USERS.find(
      (u) => u.username === username.trim() && u.password === password
    );
    if (found) {
      const { password: _, ...safeUser } = found; // never store password
      setUser(safeUser);
      return true;
    }
    setLoginError("Invalid username or password. Please try again.");
    return false;
  }

  function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loginError, setLoginError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}