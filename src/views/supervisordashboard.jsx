import { useState } from "react";
import {
  PieChart, Pie, Cell,
  Tooltip, ResponsiveContainer,
} from "recharts";
import SupervisorTopBar from "../components/supervisortopbar";
import { useAuth } from "../auth/authcontext";
import { loadPatients } from "../utils/storage";
import { VILLAGES, CONDITION_COLORS } from "../Config";
import { getBPStatus, getTempStatus } from "../utils/helpers";
import { useLanguage } from "../context/LanguageContext";

export default function SupervisorDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("overview");
  const patients = loadPatients();

  // ── Derive all stats from real patient data ──
  const totalPts = patients.length;
  const highRiskCount = patients.filter((p) => getBPStatus(p.bp) === "danger" || getTempStatus(p.temp) === "danger").length;
  const syncedCount = patients.filter((p) => p.synced).length;
  const syncPct = totalPts > 0 ? Math.round((syncedCount / totalPts) * 100) : 0;
  const pregnancyCount = patients.filter((p) => p.condition === "Pregnancy").length;

  // Condition distribution from real data
  const condCountMap = {};
  patients.forEach((p) => {
    if (p.condition && p.condition !== "None") {
      condCountMap[p.condition] = (condCountMap[p.condition] || 0) + 1;
    }
  });
  const COND_DIST = Object.entries(condCountMap).map(([name, value]) => ({
    name,
    value,
    color: CONDITION_COLORS[name] || "#94a3b8",
  }));

  // Village stats from real data
  const villageStats = VILLAGES.map((village) => {
    const vPats = patients.filter((p) => p.village === village);
    return {
      village,
      patients: vPats.length,
      vaccinated: vPats.filter((p) => p.vaccinations && p.vaccinations.length > 0).length,
      highRisk: vPats.filter((p) => getBPStatus(p.bp) === "danger" || getTempStatus(p.temp) === "danger").length,
      synced: vPats.filter((p) => p.synced).length,
    };
  });

  // Alerts from real data (patients with high BP or elevated temp)
  const alerts = patients
    .map((p) => {
      const bpS = getBPStatus(p.bp);
      const tempS = getTempStatus(p.temp);
      const issues = [];
      if (bpS === "danger") issues.push({ type: "High BP", detail: `BP: ${p.bp}`, severity: "high" });
      if (tempS === "danger") issues.push({ type: "Elevated Temp", detail: `Temp: ${p.temp}°F`, severity: "medium" });
      if (!p.synced) issues.push({ type: "Unsynced Record", detail: "", severity: "low" });
      return issues.map((issue) => ({
        id: `${p.id}-${issue.type}`,
        patient: p.name,
        village: p.village,
        ...issue,
        lastVisit: p.lastVisit,
      }));
    })
    .flat()
    .sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return (order[a.severity] ?? 3) - (order[b.severity] ?? 3);
    });

  return (
    <div style={{ minHeight: "100vh", background: "#f4efe6", fontFamily: "'Nunito',sans-serif" }}>
      <style>{CSS}</style>

      <SupervisorTopBar activeTab={activeTab} onTabChange={setActiveTab} />

      <div style={S.main}>

        {/* ── OVERVIEW ── */}
        {activeTab === "overview" && (
          <>
            {/* Welcome */}
            <div className="welcome-bar" style={S.welcomeBar}>
              <div>
                <h2 style={S.welcomeTitle}>{t("sup.overview.title")}</h2>
                <p style={S.welcomeSub}>Dima Hasao · {new Date().toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}</p>
              </div>
              <div style={S.syncStatus}>
                <span style={S.syncDot} />
                {t("sup.overview.liveData")} · {t("sup.overview.lastSync")}
              </div>
            </div>

            {/* KPI row */}
            <div style={S.kpiGrid}>
              {[
                { label: t("sup.kpi.villages"),       value: VILLAGES.length, sub: t("sup.kpi.villagesSub"),    color: "#2d7a6e", icon: "🏘️" },
                { label: t("sup.kpi.totalPatients"), value: totalPts,        sub: t("sup.kpi.totalPatientsSub"),        color: "#e8732a", icon: "👥" },
                { label: t("sup.kpi.highRisk"),      value: highRiskCount,   sub: t("sup.kpi.highRiskSub"),    color: "#c94040", icon: "⚠️" },
                { label: t("sup.kpi.syncRate"),      value: `${syncPct}%`,   sub: t("sup.kpi.syncRateSub"),     color: "#d4a843", icon: "📡" },
                { label: t("sup.kpi.pregnancies"),    value: pregnancyCount,  sub: t("sup.kpi.pregnanciesSub"),     color: "#e8732a", icon: "🤱" },
              ].map((k) => (
                <div key={k.label} style={{ ...S.kpi, borderTopColor: k.color }}>
                  <div style={S.kpiIcon}>{k.icon}</div>
                  <div style={{ ...S.kpiValue, color: k.color }}>{k.value}</div>
                  <div style={S.kpiLabel}>{k.label}</div>
                  <div style={S.kpiSub}>{k.sub}</div>
                </div>
              ))}
            </div>

            {/* Condition Distribution (Pie Chart) — only if there are patients */}
            {COND_DIST.length > 0 && (
              <div style={S.chartCard}>
                <div style={S.chartTitle}>{t("sup.chart.dist")}</div>
                <div style={{display:"flex",alignItems:"center",gap:20,paddingTop:12}}>
                  <ResponsiveContainer width={160} height={160}>
                    <PieChart>
                      <Pie data={COND_DIST} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={4}>
                        {COND_DIST.map((e,i)=><Cell key={i} fill={e.color}/>)}
                      </Pie>
                      <Tooltip contentStyle={{background:"white",border:"1px solid #ebe4d8",borderRadius:8,color:"#1a2b22",boxShadow:"0 4px 12px rgba(22,45,32,0.08)"}} itemStyle={{color:"#1a2b22"}} formatter={(v,n)=>[`${v} patients`,n]}/>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{flex:1}}>
                    {COND_DIST.map((c)=>(
                      <div key={c.name} style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                        <div style={{width:10,height:10,borderRadius:3,background:c.color,flexShrink:0}}/>
                        <div style={{flex:1,fontSize:13,color:"#7a9186"}}>{t(`cond.${c.name.toLowerCase()}`)}</div>
                        <div style={{fontFamily:"'Sora',sans-serif",fontSize:16,fontWeight:800,color:"#1a2b22"}}>{c.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Village sync table */}
            <div style={S.chartCard}>
              <div style={S.chartTitle}>{t("sup.table.sync")}</div>
              <div className="table-responsive">
                <table style={S.table}>
                  <thead>
                    <tr>{[t("sup.th.village"),t("sup.th.patients"),t("sup.th.vaccinated"),t("sup.th.highRisk"),t("sup.th.syncRate"),t("sup.th.status")].map((h)=>(
                      <th key={h} style={S.th}>{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {villageStats.map((v)=>(
                      <tr key={v.village} style={S.tr}>
                        <td style={{...S.td,fontWeight:700,color:"#1a2b22"}}>📍 {v.village}</td>
                        <td style={S.td}>{v.patients}</td>
                        <td style={{...S.td,color:"#2d7a6e"}}>{v.vaccinated}</td>
                        <td style={{...S.td,color: v.highRisk>0?"#c94040":"#3d5248"}}>{v.highRisk}</td>
                        <td style={S.td}>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <div style={{height:6,width:80,background:"#ebe4d8",borderRadius:3,overflow:"hidden"}}>
                              <div style={{height:"100%",background:"#2d7a6e",borderRadius:3,width: v.patients > 0 ? `${Math.round(v.synced/v.patients*100)}%` : "0%"}}/>
                            </div>
                            <span style={{fontSize:11,color:"#7a9186"}}>{v.patients > 0 ? Math.round(v.synced/v.patients*100) : 0}%</span>
                          </div>
                        </td>
                        <td style={S.td}>
                          <span style={{padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700,
                            background: v.synced===v.patients && v.patients > 0?"rgba(45,122,110,0.1)":"rgba(212,168,67,0.1)",
                            color:      v.synced===v.patients && v.patients > 0?"#2d7a6e":"#d4a843",
                            border:     `1px solid ${v.synced===v.patients && v.patients > 0?"rgba(45,122,110,0.2)":"rgba(212,168,67,0.2)"}`}}>
                            {v.synced===v.patients && v.patients > 0?t("sup.td.fullySynced"):v.patients === 0 ? "—" : t("sup.td.pending")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Empty state */}
            {totalPts === 0 && (
              <div style={{textAlign:"center",padding:"48px 24px",color:"#7a9186"}}>
                <div style={{fontSize:48,marginBottom:12,opacity:0.4}}>📋</div>
                <div style={{fontFamily:"'Sora',sans-serif",fontWeight:600}}>No patient data yet. ASHA workers need to register patients first.</div>
              </div>
            )}
          </>
        )}

        {/* ── ALL PATIENTS ── */}
        {activeTab === "patients" && (
          <>
            <div style={S.sectionTitle}>All Registered Patients ({patients.length})</div>
            {patients.length === 0 ? (
              <div style={{textAlign:"center",padding:"48px 24px",color:"#7a9186"}}>
                <div style={{fontSize:48,marginBottom:12,opacity:0.4}}>👥</div>
                <div style={{fontFamily:"'Sora',sans-serif",fontWeight:600}}>No patients registered yet.</div>
              </div>
            ) : (
              <div className="patient-list-grid">
                {patients.map((p) => {
                  const bpS = getBPStatus(p.bp);
                  return (
                    <div key={p.id} style={S.patientRow}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                        <div>
                          <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:"#1a2b22"}}>{p.name}</div>
                          <div style={{fontSize:12,color:"#7a9186",marginTop:2}}>
                            {p.age}y · {p.village} · {p.gender === "F" ? "F" : "M"}
                          </div>
                        </div>
                        <span style={{padding:"3px 9px",borderRadius:20,fontSize:11,fontWeight:700,color:"white",
                          background: CONDITION_COLORS[p.condition] || "#94a3b8"}}>
                          {t(`cond.${p.condition.toLowerCase()}`)}
                        </span>
                      </div>
                      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                        <span style={{...S.vitalPill, color: bpS==="danger"?"#c94040":"#3d5248", background: bpS==="danger"?"#ffebeb":"#f4efe6"}}>{p.bp}</span>
                        <span style={S.vitalPill}>{p.temp}°F</span>
                        <span style={S.vitalPill}>{p.weight}kg</span>
                        {!p.synced && <span style={{...S.vitalPill,color:"#d4a843", background:"#fff9e6"}}>⏳ Unsynced</span>}
                      </div>
                      <div style={{fontSize:11,color:"#a3b8ad",marginTop:8}}>Last visit: {p.lastVisit}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── VILLAGE MAP ── */}
        {activeTab === "villages" && (
          <>
            <div style={S.sectionTitle}>Village Health Coverage</div>
            <div className="village-grid">
              {villageStats.map((v)=>(
                <div key={v.village} style={S.villageCard}>
                  <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:17,color:"#1a2b22",marginBottom:12}}>📍 {v.village}</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                    {[["Patients",v.patients,"#1a2b22"],["Vaccinated",v.vaccinated,"#2d7a6e"],["High Risk",v.highRisk,"#c94040"],["Synced",v.synced,"#d4a843"]].map(([label,val,col])=>(
                      <div key={label} style={{background:"#f4efe6",borderRadius:8,padding:"8px 10px"}}>
                        <div style={{fontSize:10,color:"#7a9186",textTransform:"uppercase",letterSpacing:"0.6px",fontWeight:600}}>{label}</div>
                        <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:20,color:col,marginTop:2}}>{val}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{height:6,background:"#ebe4d8",borderRadius:3,overflow:"hidden"}}>
                    <div style={{height:"100%",background:"linear-gradient(90deg,#2d7a6e,#5ce0cc)",borderRadius:3,width: v.patients > 0 ? `${Math.round(v.vaccinated/v.patients*100)}%` : "0%"}}/>
                  </div>
                  <div style={{fontSize:11,color:"#7a9186",marginTop:5}}>{v.patients > 0 ? Math.round(v.vaccinated/v.patients*100) : 0}% vaccination coverage</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── ALERTS ── */}
        {activeTab === "alerts" && (
          <>
            <div style={S.sectionTitle}>Active Alerts · {alerts.length} notifications</div>
            {alerts.length === 0 ? (
              <div style={{textAlign:"center",padding:"48px 24px",color:"#7a9186"}}>
                <div style={{fontSize:48,marginBottom:12,opacity:0.4}}>✅</div>
                <div style={{fontFamily:"'Sora',sans-serif",fontWeight:600}}>No alerts. All patients are in normal range.</div>
              </div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {alerts.map((a)=>(
                  <div key={a.id} style={{
                    ...S.alertRow,
                    borderLeftColor: a.severity==="high"?"#c94040":a.severity==="medium"?"#d4a843":a.severity==="info"?"#2d7a6e":"#ebe4d8"
                  }}>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:4}}>
                        <span style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:"#1a2b22"}}>{a.patient}</span>
                        <span style={{padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:700,
                          background: a.severity==="high"?"#ffebeb":a.severity==="medium"?"#fff9e6":"#e8f5e9",
                          color: a.severity==="high"?"#c94040":a.severity==="medium"?"#d4a843":"#2d7a6e"}}>
                          {a.type}
                        </span>
                      </div>
                      <div style={{fontSize:13,color:"#7a9186"}}>
                        📍 {a.village}
                        {a.detail && ` · ${a.detail}`}
                      </div>
                    </div>
                    <div style={{fontSize:12,color:"#a3b8ad",flexShrink:0}}>Last: {a.lastVisit}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Nunito:wght@400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Nunito',sans-serif;}
  ::-webkit-scrollbar{width:6px;}
  ::-webkit-scrollbar-track{background:transparent;}
  ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px;}

  .patient-list-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  .village-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 20px; }
  
  @media(max-width:768px){
    .patient-list-grid { grid-template-columns: 1fr; }
    .village-grid { grid-template-columns: 1fr; }
    .welcome-bar { flex-direction: column !important; align-items: flex-start !important; gap: 10px; }
    .table-responsive { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  }
`;

const S = {
  main: { maxWidth: 1140, margin: "0 auto", padding: "24px 20px" },

  welcomeBar: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    marginBottom: 22,
  },
  welcomeTitle: { fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 800, color: "#1a2b22" },
  welcomeSub:   { fontSize: 13, color: "#7a9186", marginTop: 4 },
  syncStatus: {
    display: "flex", alignItems: "center", gap: 8,
    fontSize: 12, color: "#7a9186", fontWeight: 600,
  },
  syncDot: {
    width: 8, height: 8, borderRadius: "50%", background: "#2d7a6e",
    boxShadow: "0 0 6px #2d7a6e", flexShrink: 0,
  },

  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 20 },
  kpi: {
    background: "white", borderRadius: 12,
    padding: "16px 14px", borderTop: "4px solid",
    border: "1px solid #ebe4d8", boxShadow: "0 2px 12px rgba(22,45,32,0.08)",
  },
  kpiIcon:  { fontSize: 20, marginBottom: 8 },
  kpiValue: { fontFamily: "'Sora',sans-serif", fontSize: 26, fontWeight: 800, lineHeight: 1 },
  kpiLabel: { fontFamily: "'Sora',sans-serif", fontSize: 12, fontWeight: 700, color: "#7a9186", marginTop: 4 },
  kpiSub:   { fontSize: 11, color: "#a3b8ad", marginTop: 2 },

  chartCard: {
    background: "white",
    border: "1px solid #ebe4d8", boxShadow: "0 2px 12px rgba(22,45,32,0.08)",
    borderRadius: 14, padding: "18px 20px", marginBottom: 16,
  },
  chartTitle: { fontFamily: "'Sora',sans-serif", fontSize: 14, fontWeight: 700, color: "#1a2b22", marginBottom: 14 },

  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left", padding: "8px 12px",
    fontSize: 11, fontWeight: 700, textTransform: "uppercase",
    letterSpacing: "0.7px", color: "#7a9186",
    borderBottom: "1px solid #ebe4d8",
  },
  td: { padding: "12px 12px", fontSize: 13, color: "#3d5248", borderBottom: "1px solid #f4efe6" },
  tr: {},

  sectionTitle: { fontFamily: "'Sora',sans-serif", fontSize: 18, fontWeight: 800, color: "#1a2b22", marginBottom: 16 },

  patientRow: {
    background: "white",
    border: "1px solid transparent", boxShadow: "0 2px 12px rgba(22,45,32,0.10)",
    borderRadius: 14, padding: "16px 18px",
    transition: "all 0.15s", cursor: "pointer",
  },
  vitalPill: {
    padding: "4px 10px", borderRadius: 8,
    background: "#f4efe6",
    fontSize: 12, fontWeight: 600,
    color: "#3d5248",
  },

  villageCard: {
    background: "white",
    border: "1px solid #ebe4d8", boxShadow: "0 2px 12px rgba(22,45,32,0.08)",
    borderRadius: 14, padding: "18px",
  },

  alertRow: {
    background: "white",
    border: "1px solid #ebe4d8", boxShadow: "0 2px 12px rgba(22,45,32,0.08)",
    borderLeft: "4px solid",
    borderRadius: 12, padding: "14px 16px",
    display: "flex", alignItems: "center", gap: 16,
  },
};