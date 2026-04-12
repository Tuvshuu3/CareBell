import React, { useState } from "react";
import {
  Header,
  AddPatBtn,
  PatientItem,
  MedicineCard,
  AddCard,
} from "../components";
import "../styles/Home.css";
import oldMan from "../assets/oldMan.png";
import oldWoman from "../assets/oldWoman.png";
import medicines from "../medicines.json";

const CaretakerHome = () => {
  const [patient, setPatient] = useState("John");
  const [loading, setLoading] = useState(false);
  const filteredMedicines =
    medicines.find((med) => med.name === patient)?.medicines || [];

  const handlePatientChange = (newPatient) => {
    if (newPatient !== patient) {
      setLoading(true);
      setTimeout(() => {
        setPatient(newPatient);
        setLoading(false);
      }, 1000);
    }
  };
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
              selected={patient === "John"}
              onClick={() => handlePatientChange("John")}
            />
            <PatientItem
              name="Emily"
              age="75"
              profile={oldWoman}
              selected={patient === "Emily"}
              onClick={() => handlePatientChange("Emily")}
            />
          </div>
        </div>
        <div className="patInfoCont">
          {loading ? (
            <div className="loader">Loading...</div>
          ) : (
            filteredMedicines.map((medicine) => (
              <MedicineCard
                key={medicine.id}
                image={medicine.image}
                name={medicine.name}
                dosage={medicine.dosage}
                startDate={medicine.startDate}
                endDate={medicine.endDate}
                time={medicine.time}
                status={medicine.status}
              />
            ))
          )}
          {!loading && <AddCard />}
        </div>
      </div>
    </div>
  );
};

export default CaretakerHome;
