import React from "react";
import "../styles/PatientItem.css";

const PatientItem = ({ name, age, profile, selected }) => {
  return (
    <div className={`patient-itemCont ${selected ? "selected" : ""}`}>
      <div className="patient-item">
        <img
          src={profile}
          alt={`${name}'s profile`}
          className="patient-profile"
        />
        <div className="patient-info">
          <h3>{name}</h3>
          <p>Age: {age}</p>
        </div>
      </div>
    </div>
  );
};

export default PatientItem;
