import { useState } from "react";
import { useAuth } from "../auth/authcontext";
import Icon from "./Icon";

export default function AshaTopBar({ online, syncing, syncError, pendingSync, onSync }) {
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const syncLabel = syncing ? "Syncing…"
    : syncError   ? "Retry"
    : online       ? (pendingSync > 0 ? `Sync ${pendingSync}` : "All Synced ✓")
    : "Offline";

  const syncClass = syncing ? "syncing"
    : syncError   ? "error"
    : online       ? "online"
    : "offline";

  return (
    <header style={S.bar}>
      {/* Brand */}
      <div style={S.brand}>
        <div style={S.logo}>HS</div>
        <div>
          <div style={S.title}>HealthSetu NER</div>
          <div style={S.sub}>ASHA Field App · {user?.village}</div>
        </div>
      </div>

      {/* Right controls */}
      <div style={S.right}>
        {/* Network + sync badge */}
        {pendingSync > 0 && (
          <div style={S.pendingBadge}>{pendingSync}</div>
        )}
        <div
          className={`sync-badge ${syncClass}`}
          onClick={online && pendingSync > 0 && !syncing ? onSync : undefined}
          style={{ cursor: online && pendingSync > 0 && !syncing ? "pointer" : "default" }}
        >
          <Icon name={online ? "sync" : "wifiOff"} size={13} />
          {syncLabel}
        </div>

        {/* User avatar + dropdown */}
        <div style={{ position: "relative" }}>
          <button style={S.avatar} onClick={() => setShowMenu((v) => !v)}>
            {user?.avatar}
          </button>
          {showMenu && (
            <div style={S.menu}>
              <div style={S.menuName}>{user?.name}</div>
              <div style={S.menuRole}>ASHA Worker · {user?.village}</div>
              <div style={S.menuDivider} />
              <button style={S.menuItem} onClick={logout}>🚪 Sign Out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

const S = {
  bar: {
    background: "#162d20", color: "white",
    padding: "0 24px", height: 60,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    position: "sticky", top: 0, zIndex: 100,
    boxShadow: "0 2px 16px rgba(0,0,0,0.25)",
    fontFamily: "'Nunito', sans-serif",
  },
  brand: { display: "flex", alignItems: "center", gap: 10 },
  logo: {
    width: 34, height: 34, background: "#e8732a",
    borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 15, color: "white",
  },
  title: { fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 16 },
  sub:   { fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 1 },
  right: { display: "flex", alignItems: "center", gap: 12 },
  pendingBadge: {
    background: "#e8732a", color: "white",
    width: 22, height: 22, borderRadius: "50%",
    fontSize: 11, fontWeight: 700,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  avatar: {
    width: 34, height: 34, borderRadius: "50%",
    background: "#2a5240", border: "2px solid rgba(255,255,255,0.2)",
    color: "white", fontFamily: "'Sora',sans-serif",
    fontSize: 12, fontWeight: 700, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  menu: {
    position: "absolute", right: 0, top: "calc(100% + 8px)",
    background: "white", borderRadius: 12, padding: "12px 0",
    boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
    minWidth: 200, zIndex: 200,
  },
  menuName:    { padding: "4px 16px", fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 14, color: "#1a2b22" },
  menuRole:    { padding: "0 16px 8px", fontSize: 12, color: "#7a9186" },
  menuDivider: { height: 1, background: "#ebe4d8", margin: "4px 0 8px" },
  menuItem: {
    display: "block", width: "100%", padding: "8px 16px",
    background: "none", border: "none", textAlign: "left",
    fontSize: 13, color: "#c94040", cursor: "pointer",
    fontFamily: "'Nunito',sans-serif", fontWeight: 600,
  },
};