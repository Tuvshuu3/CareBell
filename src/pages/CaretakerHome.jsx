import React, { useEffect, useState } from "react";
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
import {
  createCourse,
  createMedicine,
  createPatient,
  deleteMedicine,
  getPatients,
} from "../api";

const defaultPatientProfile = oldMan;
const patientProfiles = {
  John: oldMan,
  Emily: oldWoman,
};
const patientAges = {
  John: "82",
  Emily: "75",
};

const CaretakerHome = () => {
  const [patient, setPatient] = useState("");
  const [loading, setLoading] = useState(false);
  const [medicineData, setMedicineData] = useState([]);
  const filteredMedicines =
    medicineData.find((med) => med.name === patient)?.medicines || [];

  useEffect(() => {
    async function loadPatients() {
      try {
        const patients = await getPatients();
        setMedicineData(patients);

        if (patients.length > 0) {
          setPatient((currentPatient) =>
            patients.some((item) => item.name === currentPatient)
              ? currentPatient
              : patients[0].name
          );
        }
      } catch (error) {
        console.error(error);
      }
    }

    loadPatients();
  }, []);

  const handlePatientChange = (newPatient) => {
    if (newPatient !== patient) {
      setLoading(true);
      setTimeout(() => {
        setPatient(newPatient);
        setLoading(false);
      }, 1000);
    }
  };

  const handleAddPatient = async (newPatient) => {
    const patientName = newPatient.name.trim();

    if (!patientName) {
      return;
    }

    const patientExists = medicineData.some(
      (e) => e.name.toLowerCase() === patientName.toLowerCase()
    );

    if (patientExists) {
      return;
    }

    try {
      const createdPatient = await createPatient({
        ...newPatient,
        name: patientName,
        profile: newPatient.profile || defaultPatientProfile,
      });

      setMedicineData((currentMedicineData) => [
        ...currentMedicineData,
        createdPatient,
      ]);
      setPatient(createdPatient.name);
      return;
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddMedicine = async (medicine) => {
    const currentPatient = medicineData.find((e) => e.name === patient);

    if (currentPatient?._id) {
      try {
        const createdMedicine = await createMedicine(
          currentPatient._id,
          medicine
        );

        setMedicineData((currentMedicineData) =>
          currentMedicineData.map((e) => {
            if (e.name !== patient) {
              return e;
            }

            return {
              ...e,
              medicines: [...e.medicines, createdMedicine],
            };
          })
        );
        return;
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleDeleteMedicine = async (medicineId) => {
    const currentPatient = medicineData.find((e) => e.name === patient);

    if (currentPatient?._id) {
      try {
        await deleteMedicine(currentPatient._id, medicineId);
      } catch (error) {
        console.error(error);
      }
    }

    setMedicineData((currentMedicineData) =>
      currentMedicineData.map((e) => {
        if (e.name !== patient) {
          return e;
        }

        return {
          ...e,
          medicines: e.medicines.filter(
            (medicine) => medicine.id !== medicineId
          ),
        };
      })
    );
  };

  const handleAddCourse = async (medicineId, course) => {
    const currentPatient = medicineData.find((e) => e.name === patient);
    let courseToAdd = course;

    if (currentPatient?._id) {
      try {
        courseToAdd = await createCourse(
          currentPatient._id,
          medicineId,
          course
        );
      } catch (error) {
        console.error(error);
      }
    }

    setMedicineData((currentMedicineData) =>
      currentMedicineData.map((e) => {
        if (e.name !== patient) {
          return e;
        }

        return {
          ...e,
          medicines: e.medicines.map((medicine) => {
            if (medicine.id !== medicineId) {
              return medicine;
            }

            return {
              ...medicine,
              courses: [...medicine.courses, courseToAdd],
            };
          }),
        };
      })
    );
  };

  return (
    <div className="homeBody">
      <Header />
      <div className="mainCont">
        <div className="patListCont">
          <div className="addBtnCont">
            <AddPatBtn onAddPatient={handleAddPatient} />
          </div>

          <div className="patList">
            {medicineData.map((patientMedicineData) => (
              <PatientItem
                key={patientMedicineData.name}
                name={patientMedicineData.name}
                age={patientAges[patientMedicineData.name]}
                profile={
                  patientMedicineData.profile ||
                  patientProfiles[patientMedicineData.name] ||
                  defaultPatientProfile
                }
                selected={patient === patientMedicineData.name}
                onClick={() => handlePatientChange(patientMedicineData.name)}
              />
            ))}
          </div>
        </div>
        <div className="patInfoCont">
          {loading ? (
            <div className="loader">Loading...</div>
          ) : (
            filteredMedicines.map((medicine) => (
              <MedicineCard
                key={medicine.id}
                id={medicine.id}
                image={medicine.image}
                name={medicine.name}
                dosage={medicine.dosage}
                intervalHours={medicine.intervalHours}
                courses={medicine.courses}
                doseLogs={medicine.doseLogs}
                onDelete={handleDeleteMedicine}
                onAddCourse={handleAddCourse}
              />
            ))
          )}
          {!loading && <AddCard onAddMedicine={handleAddMedicine} />}
        </div>
      </div>
    </div>
  );
};

export default CaretakerHome;
