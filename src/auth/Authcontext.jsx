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
const REGISTERED_USERS_KEY = "healthsetu_registered_users";

// ─── Helpers ──────────────────────────────────────────────────────────────
function getRegisteredUsers() {
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRegisteredUsers(users) {
  localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
}

function makeAvatar(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

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
  const [registerError, setRegisterError] = useState("");

  // Persist session across refreshes
  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  function login(identifier, password) {
    setLoginError("");

    const idTrim = identifier.trim();
    const idNum = idTrim.replace(/\D/g, "");

    // 1. Check demo users (match by username OR phone)
    const demoMatch = DEMO_USERS.find(
      (u) =>
        (u.username === idTrim || (idNum && u.phone && u.phone.replace(/\D/g, "") === idNum)) &&
        u.password === password
    );
    if (demoMatch) {
      const { password: _, ...safeUser } = demoMatch;
      setUser(safeUser);
      return true;
    }

    // 2. Check registered users (match by phone)
    const registered = getRegisteredUsers();
    const regMatch = registered.find(
      (u) =>
        (u.username === idTrim || u.phone === idTrim || (idNum && u.phone && u.phone.replace(/\D/g, "") === idNum)) &&
        u.password === password
    );
    if (regMatch) {
      const { password: _, ...safeUser } = regMatch;
      setUser(safeUser);
      return true;
    }

    setLoginError("Invalid username/phone or password. Please try again.");
    return false;
  }

  function register({ name, phone, password, village }) {
    setRegisterError("");

    // Validation
    if (!name.trim() || name.trim().length < 2) {
      setRegisterError("Please enter your full name.");
      return false;
    }
    const phoneNum = phone.trim().replace(/\D/g, "");
    if (!phoneNum || phoneNum.length < 10) {
      setRegisterError("Please enter a valid phone number (at least 10 digits).");
      return false;
    }
    if (!password || password.length < 4) {
      setRegisterError("Password must be at least 4 characters.");
      return false;
    }

    // Check for duplicate phone
    const existing = getRegisteredUsers();
    const demoPhoneMatch = DEMO_USERS.find((u) => u.phone && u.phone.replace(/\D/g, "") === phoneNum);
    const regPhoneMatch = existing.find((u) => u.phone && u.phone.replace(/\D/g, "") === phoneNum);
    if (demoPhoneMatch || regPhoneMatch) {
      setRegisterError("This phone number is already registered. Please sign in.");
      return false;
    }

    // Create new user
    const newUser = {
      id: `A${Date.now().toString(36).toUpperCase()}`,
      name: name.trim(),
      username: `asha_${phone.trim().replace(/\D/g, "").slice(-5)}`,
      phone: phone.trim(),
      password,
      role: "asha",
      village: village || "Haflong",
      avatar: makeAvatar(name),
    };

    // Save to localStorage
    const updated = [...existing, newUser];
    saveRegisteredUsers(updated);

    // Auto-login
    const { password: _, ...safeUser } = newUser;
    setUser(safeUser);
    return true;
  }

  function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        register,
        loginError,
        setLoginError,
        registerError,
        setRegisterError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}