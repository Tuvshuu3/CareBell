import React, { useState } from "react";
import "../styles/PatientItem.css";
import AddIcon from "../assets/AddIcon";

const AddPatBtn = () => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <button
      className="addPatBtn"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AddIcon fill={isHovered ? "#ffffff" : "#000000"} />
      Add Senior
    </button>
  );
};

export default AddPatBtn;
