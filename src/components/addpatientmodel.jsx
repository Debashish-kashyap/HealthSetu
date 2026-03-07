import { useState } from "react";
import Icon from "./icon";
import { VILLAGES, CONDITIONS } from "../Config";
import { generatePatientId, todayLabel, todayISO } from "../utils/helpers";

const INITIAL_FORM = {
  name: "", age: "", gender: "F", village: "Haflong",
  phone: "", condition: "None", weight: "", bp: "", temp: "", pregnancyWeek: "",
};

export default function AddPatientModal({ onClose, onAdd }) {
  const [form, setForm] = useState(INITIAL_FORM);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleAdd = () => {
    if (!form.name.trim() || !form.age) return;

    const [sys, dia] = (form.bp || "120/80").split("/").map(Number);
    const today = todayLabel();

    const newPatient = {
      id:             generatePatientId(),
      name:           form.name.trim(),
      age:            Number(form.age),
      gender:         form.gender,
      village:        form.village,
      phone:          form.phone,
      condition:      form.condition,
      weight:         Number(form.weight)  || 60,
      temp:           Number(form.temp)    || 98.6,
      bp:             form.bp              || "120/80",
      pregnancyWeek:  form.condition === "Pregnancy" ? Number(form.pregnancyWeek) || null : null,
      vaccinations:   [],
      synced:         false,
      lastVisit:      todayISO(),
      vitalsHistory:  [{ date: today, systolic: sys || 120, diastolic: dia || 80, weight: Number(form.weight) || 60 }],
    };

    onAdd(newPatient);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">
          <Icon name="plus" size={22} color="var(--terra)" />
          New Patient Profile
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input className="form-input" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Patient name" />
          </div>
          <div className="form-group">
            <label className="form-label">Age *</label>
            <input className="form-input" type="number" value={form.age} onChange={(e) => set("age", e.target.value)} placeholder="Years" />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Gender</label>
            <select className="form-input" value={form.gender} onChange={(e) => set("gender", e.target.value)}>
              <option value="F">Female</option>
              <option value="M">Male</option>
              <option value="O">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Village</label>
            <select className="form-input" value={form.village} onChange={(e) => set("village", e.target.value)}>
              {VILLAGES.map((v) => <option key={v}>{v}</option>)}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input className="form-input" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="Mobile number" />
          </div>
          <div className="form-group">
            <label className="form-label">Condition</label>
            <select className="form-input" value={form.condition} onChange={(e) => set("condition", e.target.value)}>
              {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Blood Pressure</label>
            <input className="form-input" value={form.bp} onChange={(e) => set("bp", e.target.value)} placeholder="120/80" />
          </div>
          <div className="form-group">
            <label className="form-label">Temperature °F</label>
            <input className="form-input" type="number" step="0.1" value={form.temp} onChange={(e) => set("temp", e.target.value)} placeholder="98.6" />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Weight (kg)</label>
            <input className="form-input" type="number" value={form.weight} onChange={(e) => set("weight", e.target.value)} placeholder="60" />
          </div>
          {form.condition === "Pregnancy" && (
            <div className="form-group">
              <label className="form-label">Pregnancy Week</label>
              <input className="form-input" type="number" value={form.pregnancyWeek} onChange={(e) => set("pregnancyWeek", e.target.value)} placeholder="1–40" />
            </div>
          )}
        </div>

        <div className="form-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleAdd} disabled={!form.name || !form.age}>
            <Icon name="check" size={15} /> Create Profile
          </button>
        </div>
      </div>
    </div>
  );
}