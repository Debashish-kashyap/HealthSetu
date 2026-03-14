import { useState } from "react";
import { useAuth } from "../auth/authcontext";
import { useLanguage } from "../context/LanguageContext";

export default function SupervisorTopBar({ activeTab, onTabChange }) {
  const { user, logout } = useAuth();
  const { t, toggleLanguage, language } = useLanguage();
  const [showMenu, setShowMenu] = useState(false);

  const TABS = [
    { id: "overview",  label: t("sup.tab.overview"), icon: "📊" },
    { id: "patients",  label: t("sup.tab.patients"), icon: "👥" },
    { id: "villages",  label: t("sup.tab.villages"), icon: "🗺️" },
    { id: "alerts",    label: t("sup.tab.alerts"),   icon: "🚨" },
  ];

  return (
    <header style={S.wrap}>
      <style>{`
        @media(max-width: 600px){
          .hide-mobile { display: none !important; }
          .top-row { padding: 12px 16px !important; }
          .tabs-nav { padding: 0 10px !important; }
        }
      `}</style>
      {/* Top row */}
      <div className="top-row" style={S.top}>
        <div style={S.brand}>
          <div style={S.logo}>HS</div>
          <div>
            <div style={S.title}>{t("app.title")}</div>
            <div className="hide-mobile" style={S.sub}>{t("app.subtitle.supervisor")} · {user?.district}</div>
          </div>
        </div>

        <div style={S.right}>
          <button onClick={toggleLanguage} style={S.langSwitcher}>
            {language === "en" ? "A / অ" : "A / EN"}
          </button>
          <div className="hide-mobile" style={S.officerBadge}>
            <span style={{ fontSize: 11, opacity: 0.7 }}>{t("sup.role") /* override exact "MOU" in demo if desired, else stick to user role */}</span>
          </div>

          <div style={{ position: "relative" }}>
            <div style={S.avatarRow} onClick={() => setShowMenu((v) => !v)}>
              <div style={S.avatar}>{user?.avatar}</div>
              <div>
                <div style={S.avatarName}>{user?.name}</div>
                <div style={S.avatarRole}>{t("sup.role")}</div>
              </div>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>▾</span>
            </div>

            {showMenu && (
              <div style={S.menu}>
                <div style={S.menuName}>{user?.name}</div>
                <div style={S.menuRole}>{t("sup.role")} · {user?.district}</div>
                <div style={S.menuDivider} />
                <button style={S.menuItem} onClick={logout}>{t("topbar.signOut")}</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab row */}
      <nav className="tabs-nav" style={S.tabs}>
        {TABS.map((t) => (
          <button
            key={t.id}
            style={{
              ...S.tab,
              ...(activeTab === t.id ? S.tabActive : {}),
            }}
            onClick={() => onTabChange(t.id)}
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </header>
  );
}

const S = {
  wrap: {
    background: "#162d20",
    position: "sticky", top: 0, zIndex: 100,
    boxShadow: "0 2px 20px rgba(0,0,0,0.3)",
    fontFamily: "'Nunito', sans-serif",
  },
  top: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    flexWrap: "wrap", gap: 10,
    padding: "12px 28px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  brand:  { display: "flex", alignItems: "center", gap: 12 },
  logo:   {
    width: 36, height: 36, background: "#2d7a6e",
    borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 15, color: "white",
  },
  title: { fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 16, color: "white" },
  sub:   { fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2 },

  right: { display: "flex", alignItems: "center", gap: 16 },
  officerBadge: {
    padding: "5px 12px", borderRadius: 20,
    background: "rgba(45,122,110,0.2)", border: "1px solid rgba(45,122,110,0.3)",
    color: "#5ce0cc", fontSize: 12, fontWeight: 600,
  },
  avatarRow: {
    display: "flex", alignItems: "center", gap: 10,
    cursor: "pointer",
    padding: "5px 10px", borderRadius: 10,
    transition: "background 0.15s",
  },
  avatar: {
    width: 34, height: 34, borderRadius: "50%",
    background: "rgba(45,122,110,0.4)",
    border: "2px solid rgba(45,122,110,0.6)",
    color: "#5ce0cc", fontFamily: "'Sora',sans-serif",
    fontSize: 12, fontWeight: 700,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  avatarName: { fontSize: 13, fontWeight: 600, color: "white", fontFamily: "'Sora',sans-serif" },
  avatarRole: { fontSize: 11, color: "rgba(255,255,255,0.45)" },

  menu: {
    position: "absolute", right: 0, top: "calc(100% + 8px)",
    background: "white", borderRadius: 12, padding: "12px 0",
    boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
    minWidth: 220, zIndex: 200,
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

  tabs: {
    display: "flex", padding: "0 20px",
    overflowX: "auto",
    WebkitOverflowScrolling: "touch",
  },
  tab: {
    display: "flex", alignItems: "center", gap: 7,
    padding: "12px 18px", flexShrink: 0,
    background: "none", border: "none", borderBottom: "3px solid transparent",
    color: "rgba(255,255,255,0.45)",
    fontFamily: "'Sora',sans-serif", fontSize: 13, fontWeight: 600,
    cursor: "pointer", transition: "all 0.15s",
    position: "relative", top: 1,
  },
  tabActive: {
    color: "#5ce0cc",
    borderBottomColor: "#2d7a6e",
    background: "rgba(45,122,110,0.07)",
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
};