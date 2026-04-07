import React, {useState} from "react";
import "../styles/AddCard.css";
import AddIcon from "../assets/AddIcon";

const AddCard = () => {
    const [isHovered, setIsHovered] = useState(false);
  return (
    <div className="add-card" 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}>
            <AddIcon fill={isHovered ? "#ffffff" : "#000000"} height="80px" width="80px" />
    </div>
  )
}

export default AddCard;