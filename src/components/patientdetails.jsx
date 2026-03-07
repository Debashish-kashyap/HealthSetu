import { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import Icon from "./icon";
import { getBPStatus, getTempStatus } from "../utils/helpers";
import { VACCINES } from "../Config";

export default function PatientDetail({ patient, onClose, onUpdateVitals, onToggleVaccine }) {
  const [tab,      setTab]      = useState("overview");
  const [editMode, setEditMode] = useState(false);
  const [bp,       setBp]       = useState(patient.bp);
  const [temp,     setTemp]     = useState(patient.temp);
  const [weight,   setWeight]   = useState(patient.weight);

  const bpStatus   = getBPStatus(patient.bp);
  const tempStatus = getTempStatus(patient.temp);

  const handleSaveVitals = () => {
    onUpdateVitals(patient.id, {
      bp,
      temp:   parseFloat(temp),
      weight: parseFloat(weight),
    });
    setEditMode(false);
  };

  const TABS = ["overview", "vitals", "vaccines", "history"];

  return (
    <div style={{ animation: "slideIn 0.2s ease" }}>
      <div className="detail-panel">

        {/* ── Header ── */}
        <div className="detail-header">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div className="detail-name">{patient.name}</div>
              <div className="detail-meta">
                {patient.age} yrs · {patient.gender === "F" ? "Female" : "Male"} · {patient.village}
              </div>
              <div className="detail-meta" style={{ marginTop: 2 }}>📞 {patient.phone}</div>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={onClose}
              style={{ color: "rgba(255,255,255,0.7)", borderColor: "rgba(255,255,255,0.2)" }}
            >
              <Icon name="close" size={14} /> Close
            </button>
          </div>

          <div className="detail-tags">
            <span className="detail-tag">ID: {patient.id}</span>
            <span className="detail-tag highlight">{patient.condition}</span>
            <span className="detail-tag">Last: {patient.lastVisit}</span>
            {!patient.synced && (
              <span className="detail-tag" style={{ background: "var(--gold)" }}>⏳ Not Synced</span>
            )}
          </div>

          {/* Sub-tabs */}
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: "5px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                  background:  tab === t ? "rgba(255,255,255,0.2)" : "transparent",
                  color:       tab === t ? "white" : "rgba(255,255,255,0.55)",
                  fontFamily: "'Sora',sans-serif", fontSize: 12, fontWeight: 600,
                  textTransform: "capitalize",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="detail-body">

          {/* OVERVIEW */}
          {tab === "overview" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div className="detail-section-title" style={{ marginTop: 0 }}>Current Vitals</div>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditMode((e) => !e)}>
                  <Icon name="edit" size={13} /> {editMode ? "Cancel" : "Edit"}
                </button>
              </div>

              {editMode ? (
                <div style={{ background: "var(--cream)", borderRadius: 12, padding: 16, marginBottom: 12 }}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Blood Pressure</label>
                      <input className="form-input" value={bp} onChange={(e) => setBp(e.target.value)} placeholder="120/80" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Temperature °F</label>
                      <input className="form-input" type="number" step="0.1" value={temp} onChange={(e) => setTemp(e.target.value)} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Weight (kg)</label>
                    <input className="form-input" type="number" step="0.5" value={weight} onChange={(e) => setWeight(e.target.value)} />
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={handleSaveVitals}>
                    <Icon name="check" size={13} /> Save & Flag for Sync
                  </button>
                </div>
              ) : (
                <div className="vitals-grid">
                  <div className="vital-box">
                    <div className="vital-box-label">Blood Pressure</div>
                    <div className="vital-box-value" style={{ color: bpStatus === "danger" ? "var(--red)" : bpStatus === "warning" ? "var(--terra)" : "inherit" }}>
                      {patient.bp}
                    </div>
                    <div className="vital-box-unit">mmHg</div>
                  </div>
                  <div className="vital-box">
                    <div className="vital-box-label">Temperature</div>
                    <div className="vital-box-value" style={{ color: tempStatus === "danger" ? "var(--red)" : tempStatus === "warning" ? "var(--terra)" : "inherit" }}>
                      {patient.temp}°
                    </div>
                    <div className="vital-box-unit">Fahrenheit</div>
                  </div>
                  <div className="vital-box">
                    <div className="vital-box-label">Weight</div>
                    <div className="vital-box-value">{patient.weight}</div>
                    <div className="vital-box-unit">kg</div>
                  </div>
                </div>
              )}

              {/* Pregnancy tracker */}
              {patient.condition === "Pregnancy" && patient.pregnancyWeek && (
                <>
                  <div className="detail-section-title">Pregnancy Tracking</div>
                  <div style={{ background: "var(--cream)", borderRadius: 12, padding: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700 }}>
                        Week {patient.pregnancyWeek} of 40
                      </span>
                      <span style={{ fontSize: 12, color: "var(--text-light)" }}>
                        {40 - patient.pregnancyWeek} weeks remaining
                      </span>
                    </div>
                    <div className="preg-bar">
                      <div className="preg-fill" style={{ width: `${(patient.pregnancyWeek / 40) * 100}%` }} />
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-mid)", marginTop: 6 }}>
                      {patient.pregnancyWeek >= 28
                        ? "🌟 Third Trimester — Increased monitoring needed"
                        : patient.pregnancyWeek >= 14
                        ? "✨ Second Trimester"
                        : "🌱 First Trimester"}
                    </div>
                  </div>
                </>
              )}

              {/* Risk alert */}
              {(bpStatus === "danger" || tempStatus === "danger") && (
                <div className="alert-banner" style={{ marginTop: 14 }}>
                  <Icon name="alert" size={16} color="var(--terra)" />
                  <strong>Alert:</strong>
                  {bpStatus === "danger"   ? " High BP detected." : ""}
                  {tempStatus === "danger" ? " Elevated temperature." : ""}
                  {" "}Refer to PHC if persistent.
                </div>
              )}
            </>
          )}

          {/* VITALS CHART */}
          {tab === "vitals" && (
            <>
              <div className="detail-section-title">BP Trend (mmHg)</div>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={patient.vitalsHistory}>
                  <defs>
                    <linearGradient id="sysFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#c94040" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#c94040" stopOpacity={0}   />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ece5" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={["auto", "auto"]} />
                  <Tooltip />
                  <Area type="monotone" dataKey="systolic"  stroke="#c94040" fill="url(#sysFill)" strokeWidth={2} name="Systolic"  />
                  <Area type="monotone" dataKey="diastolic" stroke="#2d7a6e" fill="none"          strokeWidth={2} strokeDasharray="4 2" name="Diastolic" />
                </AreaChart>
              </ResponsiveContainer>

              <div className="detail-section-title" style={{ marginTop: 14 }}>Weight Trend (kg)</div>
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart data={patient.vitalsHistory}>
                  <defs>
                    <linearGradient id="wtFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#e8732a" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#e8732a" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ece5" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={["auto", "auto"]} />
                  <Tooltip />
                  <Area type="monotone" dataKey="weight" stroke="#e8732a" fill="url(#wtFill)" strokeWidth={2} name="Weight (kg)" />
                </AreaChart>
              </ResponsiveContainer>
            </>
          )}

          {/* VACCINES */}
          {tab === "vaccines" && (
            <>
              <div className="detail-section-title">Vaccination Status — click to toggle</div>
              <div className="vaccine-grid">
                {VACCINES.map((v) => (
                  <span
                    key={v}
                    className={`vaccine-chip ${patient.vaccinations.includes(v) ? "done" : "pending"}`}
                    onClick={() => onToggleVaccine(patient.id, v)}
                  >
                    {patient.vaccinations.includes(v) ? "✓ " : ""}{v}
                  </span>
                ))}
              </div>
              <div style={{ marginTop: 14, fontSize: 13, color: "var(--text-light)" }}>
                {patient.vaccinations.length}/{VACCINES.length} vaccines completed
              </div>
            </>
          )}

          {/* HISTORY */}
          {tab === "history" && (
            <>
              <div className="detail-section-title">Visit Records</div>
              {patient.vitalsHistory.map((v, i) => (
                <div
                  key={i}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "var(--cream)", borderRadius: 10, marginBottom: 8 }}
                >
                  <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 600, fontSize: 13 }}>{v.date}</span>
                  <div style={{ display: "flex", gap: 12, fontSize: 13, color: "var(--text-mid)" }}>
                    <span>BP: <strong>{v.systolic}/{v.diastolic}</strong></span>
                    <span>Wt: <strong>{v.weight}kg</strong></span>
                  </div>
                </div>
              ))}
            </>
          )}

        </div>
      </div>
    </div>
  );
}