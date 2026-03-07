import Icon from "./icon";
import { getBPStatus, getTempStatus } from "../utils/helpers";
import { CONDITION_COLORS } from "../Config";

export default function PatientCard({ patient, isActive, onClick }) {
  const bpStatus   = getBPStatus(patient.bp);
  const tempStatus = getTempStatus(patient.temp);

  return (
    <div
      className={`patient-card ${isActive ? "active" : ""}`}
      onClick={onClick}
    >
      {/* Gold dot = not yet synced to server */}
      {!patient.synced && <div className="unsync-dot" />}

      <div className="patient-card-header">
        <div>
          <div className="patient-name">{patient.name}</div>
          <div className="patient-meta">
            {patient.age}y · {patient.village}
          </div>
        </div>
        <span
          className="condition-tag"
          style={{ background: CONDITION_COLORS[patient.condition] || "#94a3b8" }}
        >
          {patient.condition}
        </span>
      </div>

      <div className="patient-vitals">
        <div className={`vital-chip ${bpStatus === "danger" ? "danger" : bpStatus === "warning" ? "warning" : ""}`}>
          <Icon name="activity" size={12} /> {patient.bp}
        </div>
        <div className={`vital-chip ${tempStatus === "danger" ? "danger" : tempStatus === "warning" ? "warning" : ""}`}>
          <Icon name="thermometer" size={12} /> {patient.temp}°
        </div>
        <div className="vital-chip">
          <Icon name="droplets" size={12} /> {patient.weight}kg
        </div>
      </div>
    </div>
  );
}