import { useState } from "react";
import { useAuth } from "../auth/authcontext";
import { useLanguage } from "../context/LanguageContext";
import Icon from "./Icon";

export default function AshaTopBar({ online, syncing, syncError, pendingSync, onSync }) {
  const { user, logout } = useAuth();
  const { t, toggleLanguage, language } = useLanguage();
  const [showMenu, setShowMenu] = useState(false);

  const syncLabel = syncing ? t("topbar.syncing")
    : syncError   ? t("topbar.retry")
    : online       ? (pendingSync > 0 ? `${t("topbar.sync")} ${pendingSync}` : t("topbar.allSynced"))
    : t("topbar.offline");

  const syncClass = syncing ? "syncing"
    : syncError   ? "error"
    : online       ? "online"
    : "offline";

  return (
    <header className="top-bar" style={S.bar}>
      <style>{`
        @media(max-width: 600px){
          .hide-mobile { display: none !important; }
          .top-bar { padding: 10px 16px !important; }
        }
      `}</style>
      {/* Brand */}
      <div style={S.brand}>
        <div style={S.logo}>HS</div>
        <div>
          <div style={S.title}>{t("app.title")}</div>
          <div className="hide-mobile" style={S.sub}>{t("app.subtitle.asha")} · {user?.village}</div>
        </div>
      </div>

      {/* Right controls */}
      <div style={S.right}>
        <button onClick={toggleLanguage} style={S.langSwitcher}>
          {language === "en" ? "A / অ" : "A / EN"}
        </button>
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
              <div style={S.menuName}>{user?.role === "asha" && user?.username === "asha_priya" ? t("name.asha_priya") : user?.role === "asha" && user?.username === "asha_manju" ? t("name.asha_manju") : user?.name}</div>
              <div style={S.menuRole}>{t("asha.role")} · {user?.village}</div>
              <div style={S.menuDivider} />
              <button style={S.menuItem} onClick={logout}>{t("topbar.signOut")}</button>
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
    padding: "10px 24px", minHeight: 60,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    flexWrap: "wrap", gap: 10,
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
  langSwitcher: {
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.2)",
    color: "white",
    padding: "5px 10px",
    borderRadius: "6px",
    cursor: "pointer",
    fontFamily: "'Sora', sans-serif",
    fontSize: 12,
    fontWeight: 700,
    transition: "all 0.2s"
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