import React from "react";
import "../styles/PatientItem.css";
import AddIcon from "../assets/AddIcon";

const PatientItem = ({ name, age, profile, selected }) => {
  return (
    <div className={`patient-itemCont ${selected ? "selectedItemCont" : ""}`}>
      <div className={`patient-item ${selected ? "selectedItem" : ""}`}>
        <div className="patient-profCont">
          <img
          src={profile}
          alt={`${name}'s profile`}
          className="patient-profile"
          />
        </div>
        
        <div className="patient-info">
          <div style={{fontSize: "20px", fontWeight: "600"}}>{name}</div>
          <div style={{fontSize: "15px", fontWeight: "200"}}>Age: {age}</div>
        </div>
        <div className="selectedBtnCont">
          <div className={`selectBtn ${selected ? "selectedBtn" : ""}`}>
            <AddIcon fill={selected ? "#ffffff" : "#000000"} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientItem;
