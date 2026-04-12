import React from "react";
import "../styles/MedicineCard.css";

const statusClasses = {
  taken: "status taken",
  half: "status half",
  missed: "status missed",
};

const statusText = {
  taken: "Taken",
  half: "Due",
  missed: "Missed",
};s

export default function MedicineCard({
  image,
  name,
  dosage,
  startDate,
  endDate,
  time,
  status,
}) {
  return (
    <article className="medicine-card">
      <img src={image} alt={name} className="medicine-image" />

      <div className="medicine-content">
        <h2 className="medicine-title">{name}</h2>

        <p>
          <strong>Dosage:</strong> {dosage}
        </p>
        <p>
          <strong>Duration:</strong> {startDate} → {endDate}
        </p>
        <p>
          <strong>Time:</strong> {time}
        </p>

        <div className="medicine-status">
          <span>
            <strong>Status:</strong>
          </span>
          <span className={statusClasses[status]}>{statusText[status]}</span>
        </div>
      </div>
    </article>
  );
}
