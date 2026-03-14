import { useState, useEffect, useCallback, useRef } from "react";
import AshaTopBar from "../components/ashatopbar";
import PatientCard from "../components/PatientCard";
import PatientDetail from "../components/patientdetails";
import AddPatientModal from "../components/addpatientmodel";
import Icon from "../components/Icon";
import Toast from "../components/Toast";
import { useAuth } from "../auth/Authcontext";
import { loadPatients, savePatients, saveAshaPatients } from "../utils/storage";
import { syncToServer } from "../utils/sync";
import { getBPStatus, getTempStatus, todayLabel, todayISO } from "../utils/helpers";
import { useLanguage } from "../context/LanguageContext";

export default function AshaDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [patients, setPatients] = useState(() => loadPatients().filter(p => p.ashaId === user.id));
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | high-risk | unsynced | pregnancy
  const [showAdd, setShowAdd] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const showToast = useCallback((message, type = "info") => {
    clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    const onOnline = () => { setOnline(true); showToast("Back online! Data will sync shortly.", "success"); };
    const onOffline = () => { setOnline(false); showToast("Offline — changes saved locally", "info"); };
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => { window.removeEventListener("online", onOnline); window.removeEventListener("offline", onOffline); };
  }, [showToast]);

  const pendingSync = patients.filter((p) => !p.synced).length;

  const handleSync = useCallback(async () => {
    if (syncing || !online || pendingSync === 0) return;
    setSyncing(true); setSyncError(null);
    const result = await syncToServer(patients);
    if (result.success) {
      setPatients((prev) => { const u = prev.map((p) => ({ ...p, synced: true })); saveAshaPatients(user.id, u); return u; });
      showToast(`✓ ${result.synced} records synced`, "success");
    } else {
      setSyncError(result.error);
      showToast("Sync failed — will retry", "error");
    }
    setSyncing(false);
  }, [syncing, online, pendingSync, patients, showToast]);

  useEffect(() => {
    if (!online || pendingSync === 0) return;

    const t = setTimeout(handleSync, 1500);
    const i = setInterval(handleSync, 15000);
    return () => { clearTimeout(t); clearInterval(i); };
  }, [online, pendingSync, syncing, handleSync]);

  // Filtered list
  const displayed = patients.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(q) ||
      p.village.toLowerCase().includes(q) ||
      p.condition.toLowerCase().includes(q);
    if (!matchSearch) return false;
    if (filter === "high-risk") return getBPStatus(p.bp) === "danger" || getTempStatus(p.temp) === "danger";
    if (filter === "unsynced") return !p.synced;
    if (filter === "pregnancy") return p.condition === "Pregnancy";
    return true;
  });

  const handleUpdateVitals = (id, { bp, temp, weight }) => {
    const [sys, dia] = bp.split("/").map(Number);
    setPatients((prev) => {
      const u = prev.map((p) => p.id !== id ? p : {
        ...p, bp, temp, weight, synced: false,
        lastVisit: todayISO(),
        vitalsHistory: [...p.vitalsHistory, { date: todayLabel(), systolic: sys, diastolic: dia, weight }],
      });
      saveAshaPatients(user.id, u); return u;
    });
    setSelected((s) => s?.id === id ? { ...s, bp, temp, weight, synced: false } : s);
    showToast("Vitals saved — pending sync", "info");
  };

  const handleToggleVaccine = (id, vaccine) => {
    setPatients((prev) => {
      const u = prev.map((p) => {
        if (p.id !== id) return p;
        const has = p.vaccinations.includes(vaccine);
        return { ...p, synced: false, vaccinations: has ? p.vaccinations.filter((v) => v !== vaccine) : [...p.vaccinations, vaccine] };
      });
      saveAshaPatients(user.id, u); return u;
    });
    setSelected((s) => {
      if (s?.id !== id) return s;
      const has = s.vaccinations.includes(vaccine);
      return { ...s, synced: false, vaccinations: has ? s.vaccinations.filter((v) => v !== vaccine) : [...s.vaccinations, vaccine] };
    });
  };

  const handleAddPatient = (p) => {
    p.ashaId = user.id; // Assign to current ASha worker
    setPatients((prev) => { const u = [p, ...prev]; saveAshaPatients(user.id, u); return u; });
    setShowAdd(false);
    showToast("Patient added — pending sync", "info");
  };

  const handleDeletePatient = (id) => {
    if (!window.confirm(t("patient.deleteConfirm"))) return;
    setPatients((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      saveAshaPatients(user.id, updated);
      return updated;
    });
    setSelected(null);
    showToast(t("patient.deleted"), "info");
  };

  const highRisk = patients.filter((p) => getBPStatus(p.bp) === "danger" || getTempStatus(p.temp) === "danger").length;

  const FILTERS = [
    { id: "all", label: `${t("asha.filter.all")} (${patients.length})` },
    { id: "high-risk", label: `${t("asha.filter.highRisk")} (${highRisk})` },
    { id: "pregnancy", label: `${t("asha.filter.pregnancy")} (${patients.filter((p) => p.condition === "Pregnancy").length})` },
    { id: "unsynced", label: `${t("asha.filter.unsynced")} (${pendingSync})` },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f4efe6", fontFamily: "'Nunito',sans-serif" }}>
      <style>{CSS}</style>

      <AshaTopBar
        online={online} syncing={syncing} syncError={syncError}
        pendingSync={pendingSync} onSync={handleSync}
      />

      {!online && (
        <div className="offline-banner">
          <Icon name="wifiOff" size={14} color="var(--red)" />
          {t("asha.offlineBanner")}
        </div>
      )}

      <div style={S.main}>
        {/* Welcome strip */}
        <div className="welcome" style={S.welcome}>
          <div>
            <h2 style={S.welcomeTitle}>{t("asha.welcome")}, {user?.username === "asha_priya" ? t("name.asha_priya") : user?.username === "asha_manju" ? t("name.asha_manju") : user?.name?.split(" ")[0]} 👋</h2>
            <p style={S.welcomeSub}>{t("asha.village")}: {user?.village} · {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>
          </div>
          <button style={S.addBtn} onClick={() => setShowAdd(true)}>
            <Icon name="plus" size={16} /> {t("asha.newPatient")}
          </button>
        </div>

        {/* APPMS Government Link */}
        <a
          href="https://nhmssd.assam.gov.in/APPMS_2024_25/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "12px 18px", borderRadius: 12,
            background: "linear-gradient(135deg, #2d7a6e 0%, #1e5c52 100%)",
            color: "#fff", textDecoration: "none",
            fontFamily: "'Sora',sans-serif", fontSize: 13, fontWeight: 600,
            marginBottom: 16, boxShadow: "0 2px 8px rgba(45,122,110,0.25)",
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(45,122,110,0.35)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(45,122,110,0.25)"; }}
        >
          <span style={{ fontSize: 22 }}>🏥</span>
          <span>{t("asha.appmsLink")}</span>
          <span style={{ marginLeft: "auto", opacity: 0.7, fontSize: 16 }}>↗</span>
        </a>

        {/* Stat chips */}
        <div style={S.chips}>
          {[
            { label: t("asha.totalPatients"), value: patients.length, color: "#e8732a" },
            { label: t("asha.highRisk"), value: highRisk, color: "#c94040" },
            { label: t("asha.pregnancies"), value: patients.filter((p) => p.condition === "Pregnancy").length, color: "#8b5cf6" },
            { label: t("asha.pendingSync"), value: pendingSync, color: "#d4a843" },
          ].map((c) => (
            <div key={c.label} style={{ ...S.chip, borderLeftColor: c.color }}>
              <div style={{ ...S.chipValue, color: c.color }}>{c.value}</div>
              <div style={S.chipLabel}>{c.label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={S.filterRow}>
          {FILTERS.map((f) => (
            <button
              key={f.id}
              style={{ ...S.filterBtn, ...(filter === f.id ? S.filterBtnActive : {}) }}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={S.searchWrap}>
          <span style={S.searchIcon}><Icon name="search" size={16} /></span>
          <input
            style={S.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("asha.searchPlaceholder")}
          />
        </div>

        {/* Content grid */}
        <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 1fr" : "1fr", gap: 20 }}>
          <div>
            <div className="patient-grid" style={{ gridTemplateColumns: selected ? "1fr" : "1fr 1fr" }}>
              {displayed.map((p) => (
                <PatientCard
                  key={p.id} patient={p}
                  isActive={selected?.id === p.id}
                  onClick={() => setSelected((s) => s?.id === p.id ? null : p)}
                />
              ))}
              {displayed.length === 0 && (
                <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "64px 24px", color: "#7a9186" }}>
                  <div style={{ fontSize: 44, marginBottom: 12, opacity: 0.4 }}>🔍</div>
                  <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 600 }}>{t("asha.noPatients")}</div>
                </div>
              )}
            </div>
          </div>

          {selected && (
            <PatientDetail
              patient={selected}
              onClose={() => setSelected(null)}
              onUpdateVitals={handleUpdateVitals}
              onToggleVaccine={handleToggleVaccine}
              onDelete={handleDeletePatient}
            />
          )}
        </div>
      </div>

      {showAdd && <AddPatientModal onClose={() => setShowAdd(false)} onAdd={handleAddPatient} />}
      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Nunito:wght@400;500;600&display=swap');
  :root {
    --forest:#162d20;--forest-mid:#1e3d2c;--forest-light:#2a5240;
    --cream:#f4efe6;--cream-dark:#ebe4d8;
    --terra:#e8732a;--terra-light:#f0924f;
    --teal:#2d7a6e;--teal-light:#3d9e90;
    --red:#c94040;--gold:#d4a843;
    --text-dark:#1a2b22;--text-mid:#3d5248;--text-light:#7a9186;
    --border:#ddd5c8;--card:#ffffff;
    --shadow:0 2px 12px rgba(22,45,32,0.10);--shadow-lg:0 8px 32px rgba(22,45,32,0.16);
  }
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Nunito',sans-serif;}

  .sync-badge{display:flex;align-items:center;gap:6px;padding:5px 12px;border-radius:20px;font-size:12px;font-weight:600;border:1px solid;}
  .sync-badge.offline{background:rgba(201,64,64,0.2);color:#ff8080;border-color:rgba(201,64,64,0.3);}
  .sync-badge.online{background:rgba(45,122,110,0.2);color:#5ce0cc;border-color:rgba(45,122,110,0.3);}
  .sync-badge.syncing{background:rgba(212,168,67,0.2);color:#ffd080;border-color:rgba(212,168,67,0.3);animation:pulse 1s infinite;}
  .sync-badge.error{background:rgba(201,64,64,0.2);color:#ffaaaa;border-color:rgba(201,64,64,0.3);}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.6}}

  .offline-banner{background:rgba(201,64,64,0.1);border-bottom:1px solid rgba(201,64,64,0.2);padding:6px 24px;font-size:12px;font-weight:600;color:#c94040;display:flex;align-items:center;gap:8px;}

  .patient-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
  .patient-card{background:#fff;border-radius:14px;padding:16px 18px;box-shadow:0 2px 12px rgba(22,45,32,0.10);cursor:pointer;transition:all 0.15s;border:2px solid transparent;position:relative;}
  .patient-card:hover{box-shadow:0 8px 32px rgba(22,45,32,0.16);border-color:#e8732a;transform:translateY(-1px);}
  .patient-card.active{border-color:#e8732a;background:#fff8f3;}
  .patient-card-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px;}
  .patient-name{font-family:'Sora',sans-serif;font-weight:700;font-size:15px;color:#1a2b22;}
  .patient-meta{font-size:12px;color:#7a9186;margin-top:2px;}
  .condition-tag{display:inline-block;padding:3px 9px;border-radius:20px;font-size:11px;font-weight:600;color:white;}
  .unsync-dot{position:absolute;top:12px;right:12px;width:8px;height:8px;border-radius:50%;background:#d4a843;box-shadow:0 0 6px rgba(212,168,67,0.6);}
  .patient-vitals{display:flex;gap:12px;flex-wrap:wrap;}
  .vital-chip{display:flex;align-items:center;gap:5px;background:#f4efe6;padding:4px 10px;border-radius:8px;font-size:12px;font-weight:600;color:#3d5248;}
  .vital-chip.warning{background:#fff0eb;color:#e8732a;}
  .vital-chip.danger{background:#ffebeb;color:#c94040;}

  .detail-panel{background:#fff;border-radius:16px;box-shadow:0 8px 32px rgba(22,45,32,0.16);overflow:hidden;}
  .detail-header{background:linear-gradient(135deg,#162d20 0%,#2a5240 100%);padding:22px 24px;color:white;}
  .detail-name{font-family:'Sora',sans-serif;font-size:20px;font-weight:800;}
  .detail-meta{font-size:13px;opacity:0.7;margin-top:4px;}
  .detail-tags{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;}
  .detail-tag{padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;background:rgba(255,255,255,0.15);color:white;}
  .detail-tag.highlight{background:#e8732a;}
  .detail-body{padding:20px 24px;}
  .detail-section-title{font-family:'Sora',sans-serif;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#7a9186;margin-bottom:10px;margin-top:16px;}
  .vitals-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}
  .vital-box{background:#f4efe6;border-radius:10px;padding:12px;text-align:center;}
  .vital-box-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;color:#7a9186;}
  .vital-box-value{font-family:'Sora',sans-serif;font-size:22px;font-weight:800;color:#1a2b22;line-height:1.2;margin-top:2px;}
  .vital-box-unit{font-size:10px;color:#7a9186;}
  .vaccine-grid{display:flex;flex-wrap:wrap;gap:8px;}
  .vaccine-chip{padding:5px 12px;border-radius:8px;font-size:12px;font-weight:600;border:2px solid;cursor:pointer;}
  .vaccine-chip.done{background:#e8f5e9;border-color:#4caf50;color:#2e7d32;}
  .vaccine-chip.pending{background:#f4efe6;border-color:#ddd5c8;color:#7a9186;}
  .preg-bar{height:10px;background:#ebe4d8;border-radius:5px;overflow:hidden;margin:8px 0;}
  .preg-fill{height:100%;border-radius:5px;background:linear-gradient(90deg,#2d7a6e,#e8732a);}
  .alert-banner{background:#fff3ed;border:1.5px solid #f5c6a0;border-radius:10px;padding:10px 14px;font-size:13px;color:#8b4513;display:flex;align-items:center;gap:8px;margin-bottom:12px;}

  .btn{display:inline-flex;align-items:center;gap:7px;padding:9px 18px;border-radius:10px;font-family:'Sora',sans-serif;font-size:13px;font-weight:600;cursor:pointer;border:none;transition:all 0.15s;}
  .btn-primary{background:#e8732a;color:white;}
  .btn-primary:hover{background:#f0924f;transform:translateY(-1px);}
  .btn-teal{background:#2d7a6e;color:white;}
  .btn-ghost{background:transparent;color:#3d5248;border:1px solid #ddd5c8;}
  .btn-ghost:hover{background:#ebe4d8;}
  .btn-sm{padding:6px 12px;font-size:12px;}
  .btn:disabled{opacity:0.5;cursor:not-allowed;transform:none!important;}

  .modal-overlay{position:fixed;inset:0;background:rgba(22,45,32,0.6);backdrop-filter:blur(4px);z-index:200;display:flex;align-items:center;justify-content:center;padding:16px;}
  .modal{background:#fff;border-radius:18px;padding:28px;width:100%;max-width:520px;max-height:90vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,0.2);}
  .modal-title{font-family:'Sora',sans-serif;font-size:20px;font-weight:800;color:#1a2b22;margin-bottom:20px;display:flex;align-items:center;gap:10px;}
  .form-group{margin-bottom:14px;}
  .form-label{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;color:#7a9186;margin-bottom:5px;display:block;}
  .form-input{width:100%;padding:10px 14px;border-radius:10px;border:1.5px solid #ddd5c8;font-family:'Nunito',sans-serif;font-size:14px;color:#1a2b22;background:#f4efe6;outline:none;transition:border-color 0.15s;}
  .form-input:focus{border-color:#e8732a;background:white;}
  .form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
  .form-actions{display:flex;gap:10px;margin-top:20px;justify-content:flex-end;}

  .section-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}
  .section-title{font-family:'Sora',sans-serif;font-size:16px;font-weight:700;color:#1a2b22;display:flex;align-items:center;gap:8px;}
  .section-title-dot{width:8px;height:8px;border-radius:50%;background:#e8732a;}

  .toast{position:fixed;bottom:24px;right:24px;padding:12px 20px;border-radius:12px;font-family:'Sora',sans-serif;font-size:13px;font-weight:600;box-shadow:0 8px 32px rgba(0,0,0,0.2);z-index:300;animation:slideUp 0.3s ease;}
  .toast.success{background:#2e7d32;color:white;}
  .toast.error{background:#c62828;color:white;}
  .toast.info{background:#162d20;color:white;}
  @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  @keyframes slideIn{from{opacity:0;transform:translateX(10px)}to{opacity:1;transform:translateX(0)}}

  ::-webkit-scrollbar{width:6px;}
  ::-webkit-scrollbar-track{background:transparent;}
  ::-webkit-scrollbar-thumb{background:#ddd5c8;border-radius:3px;}

  @media(max-width:768px){
    .patient-grid{grid-template-columns:1fr!important;}
    .vitals-grid{grid-template-columns:1fr 1fr;}
    .form-row{grid-template-columns:1fr;}
    .welcome{flex-direction:column !important; align-items:flex-start !important; gap:12px;}
  }
`;

const S = {
  main: { maxWidth: 1100, margin: "0 auto", padding: "20px" },
  welcome: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    background: "white", borderRadius: 14,
    padding: "18px 22px", marginBottom: 18,
    boxShadow: "0 2px 12px rgba(22,45,32,0.08)",
    border: "1px solid #ebe4d8",
  },
  welcomeTitle: { fontFamily: "'Sora',sans-serif", fontSize: 20, fontWeight: 800, color: "#1a2b22" },
  welcomeSub: { fontSize: 13, color: "#7a9186", marginTop: 3 },
  addBtn: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "10px 18px", borderRadius: 10,
    background: "#e8732a", color: "white", border: "none",
    fontFamily: "'Sora',sans-serif", fontSize: 13, fontWeight: 700,
    cursor: "pointer", boxShadow: "0 4px 12px rgba(232,115,42,0.3)",
  },
  chips: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 18 },
  chip: {
    background: "white", borderRadius: 12, padding: "14px 16px",
    borderLeft: "4px solid", boxShadow: "0 2px 8px rgba(22,45,32,0.07)",
  },
  chipValue: { fontFamily: "'Sora',sans-serif", fontSize: 24, fontWeight: 800, lineHeight: 1 },
  chipLabel: { fontSize: 11, color: "#7a9186", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.6px", marginTop: 4 },
  filterRow: { display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" },
  filterBtn: {
    padding: "7px 14px", borderRadius: 20,
    background: "white", border: "1.5px solid #ddd5c8",
    fontSize: 12, fontWeight: 600, color: "#7a9186", cursor: "pointer",
    fontFamily: "'Sora',sans-serif", transition: "all 0.15s",
  },
  filterBtnActive: {
    background: "#162d20", borderColor: "#162d20", color: "white",
  },
  searchWrap: { position: "relative", marginBottom: 16 },
  searchIcon: { position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#7a9186" },
  searchInput: {
    width: "100%", padding: "10px 16px 10px 40px",
    borderRadius: 10, border: "1.5px solid #ddd5c8",
    background: "white", fontFamily: "'Nunito',sans-serif",
    fontSize: 14, color: "#1a2b22", outline: "none",
  },
};