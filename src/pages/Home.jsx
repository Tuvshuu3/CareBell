import React from "react";
import Header from "../components/Header";
import "../styles/Home.css";
import AddPatBtn from "../components/AddPatBtn";
import PatientItem from "../components/PatientItem";
import oldMan from "../assets/oldMan.png";
import oldWoman from "../assets/oldWoman.png";
import medicines from "../components/medicines.json";
import MedicineCard from "../components/MedicineCard";
import AddCard from "../components/AddCard";

const Test = () => {
  return (
    <div className="homeBody">
      <Header />
      <div className="mainCont">
        <div className="patListCont">
          <div className="addBtnCont">
            <AddPatBtn />
          </div>

          <div className="patList">
            <PatientItem
              name="John"
              age="82"
              profile={oldMan}
              selected={true}
            />
            <PatientItem
              name="Emily"
              age="75"
              profile={oldWoman}
              selected={false}
            />
          </div>
        </div>
        <div className="patInfoCont">
          {medicines.map((med) => (
            <MedicineCard
              key={med.id}
              image={med.image}
              name={med.name}
              dosage={med.dosage}
              startDate={med.startDate}
              endDate={med.endDate}
              time={med.time}
              status={med.status}
            />
          ))}
          <AddCard />
        </div>
      </div>
    </div>
  );
};

export default Test;
