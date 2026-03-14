import { useState } from "react";
import Icon from "./icon";
import { VILLAGES, CONDITIONS } from "../Config";
import { generatePatientId, todayLabel, todayISO } from "../utils/helpers";
import { useLanguage } from "../context/LanguageContext";

const INITIAL_FORM = {
  name: "", age: "", gender: "F", village: "Haflong",
  phone: "", condition: "None", weight: "", bp: "", temp: "", pregnancyWeek: "",
};

export default function AddPatientModal({ onClose, onAdd }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const { t } = useLanguage();

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
          {t("form.title")}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">{t("form.fullName")}</label>
            <input className="form-input" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder={t("form.namePlaceholder")} />
          </div>
          <div className="form-group">
            <label className="form-label">{t("form.age")}</label>
            <input className="form-input" type="number" value={form.age} onChange={(e) => set("age", e.target.value)} placeholder={t("form.agePlaceholder")} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">{t("form.gender")}</label>
            <select className="form-input" value={form.gender} onChange={(e) => set("gender", e.target.value)}>
              <option value="F">{t("form.gender.female")}</option>
              <option value="M">{t("form.gender.male")}</option>
              <option value="O">{t("form.gender.other")}</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">{t("form.village")}</label>
            <select className="form-input" value={form.village} onChange={(e) => set("village", e.target.value)}>
              {VILLAGES.map((v) => <option key={v} value={v}>{t(`village.${v.toLowerCase()}`)}</option>)}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">{t("form.phone")}</label>
            <input className="form-input" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder={t("form.phonePlaceholder")} />
          </div>
          <div className="form-group">
            <label className="form-label">{t("form.condition")}</label>
            <select className="form-input" value={form.condition} onChange={(e) => set("condition", e.target.value)}>
              {CONDITIONS.map((c) => <option key={c} value={c}>{t(`cond.${c.toLowerCase()}`)}</option>)}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">{t("form.bp")}</label>
            <input className="form-input" value={form.bp} onChange={(e) => set("bp", e.target.value)} placeholder="120/80" />
          </div>
          <div className="form-group">
            <label className="form-label">{t("form.temp")}</label>
            <input className="form-input" type="number" step="0.1" value={form.temp} onChange={(e) => set("temp", e.target.value)} placeholder="98.6" />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">{t("form.weight")}</label>
            <input className="form-input" type="number" value={form.weight} onChange={(e) => set("weight", e.target.value)} placeholder="60" />
          </div>
          {form.condition === "Pregnancy" && (
            <div className="form-group">
              <label className="form-label">{t("form.pregWeek")}</label>
              <input className="form-input" type="number" value={form.pregnancyWeek} onChange={(e) => set("pregnancyWeek", e.target.value)} placeholder="1–40" />
            </div>
          )}
        </div>

        <div className="form-actions">
          <button className="btn btn-ghost" onClick={onClose}>{t("form.cancel")}</button>
          <button className="btn btn-primary" onClick={handleAdd} disabled={!form.name || !form.age}>
            <Icon name="check" size={15} /> {t("form.create")}
          </button>
        </div>
      </div>
    </div>
  );
}