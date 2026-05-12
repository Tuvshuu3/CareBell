import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Header, PatientMedicineRow } from "../components";
import {
  getActiveCourse,
  getNextDoseTime,
  isMedicineActive,
} from "../components/PatientMedicineRow";
import { createDoseLog, getPatients } from "../api";
import "../styles/PatientHome.css";

const PatientHome = () => {
  const [searchParams] = useSearchParams();
  const requestedPatient = searchParams.get("patient");
  const [medicineData, setMedicineData] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeAlert, setActiveAlert] = useState(null);
  const [handledAlerts, setHandledAlerts] = useState([]);
  const patientData =
    medicineData.find(
      (patient) =>
        patient.name.toLowerCase() === requestedPatient?.toLowerCase()
    ) || medicineData[0];
  const patientName = patientData?.name;
  const patientId = patientData?._id;

  useEffect(() => {
    async function loadPatients() {
      try {
        const patients = await getPatients();
        setMedicineData(patients);
      } catch (error) {
        console.error(error);
      }
    }

    loadPatients();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!patientData || activeAlert) {
      return;
    }

    const previousTime = new Date(currentTime.getTime() - 1000);
    const dueMedicine = patientData.medicines
      .map((medicine) => {
        if (!isMedicineActive(medicine, currentTime)) {
          return null;
        }

        const dueTime = getNextDoseTime(medicine, previousTime);
        const activeCourse = getActiveCourse(medicine, currentTime);

        if (!dueTime || !activeCourse) {
          return null;
        }

        const alertKey = `${medicine.id}-${dueTime.toISOString()}`;
        const crossedDueTime = dueTime > previousTime && dueTime <= currentTime;

        if (!crossedDueTime || handledAlerts.includes(alertKey)) {
          return null;
        }

        return {
          key: alertKey,
          medicineId: medicine.id,
          medicineName: medicine.name,
          courseId: activeCourse.courseId,
          dueTime,
        };
      })
      .find(Boolean);

    if (dueMedicine) {
      setActiveAlert(dueMedicine);
      setHandledAlerts((currentAlerts) => [...currentAlerts, dueMedicine.key]);
    }
  }, [activeAlert, currentTime, handledAlerts, patientData]);

  const addDoseLog = useCallback(
    async (medicineId, doseLog) => {
      if (!patientId) {
        return;
      }

      let savedDoseLog;

      try {
        savedDoseLog = await createDoseLog(patientId, medicineId, doseLog);
      } catch (error) {
        console.error(error);
        return;
      }

      setMedicineData((currentMedicineData) =>
        currentMedicineData.map((patientMedicineData) => {
          if (patientMedicineData.name !== patientName) {
            return patientMedicineData;
          }

          return {
            ...patientMedicineData,
            medicines: patientMedicineData.medicines.map((medicine) => {
              if (medicine.id !== medicineId) {
                return medicine;
              }

              return {
                ...medicine,
                doseLogs: [...medicine.doseLogs, savedDoseLog],
              };
            }),
          };
        })
      );
    },
    [patientId, patientName]
  );

  const handleTaken = async () => {
    if (!activeAlert) {
      return;
    }

    await addDoseLog(activeAlert.medicineId, {
      courseId: activeAlert.courseId,
      time: currentTime.toISOString(),
      status: "taken",
    });
    setActiveAlert(null);
  };

  return (
    <div className="patient-home">
      <Header />

      <main className="patient-home-main">
        <div className="patient-home-title">
          <h1>{patientData?.name || "Patient"}'s medicines</h1>
        </div>

        <div className="patient-medicine-list">
          {patientData?.medicines?.length > 0 ? (
            patientData.medicines.map((medicine) => (
              <PatientMedicineRow
                key={medicine.id}
                medicine={medicine}
                currentTime={currentTime}
              />
            ))
          ) : (
            <div className="patient-empty-state">No medicines added</div>
          )}
        </div>
      </main>

      {activeAlert && (
        <div className="dose-alert-backdrop">
          <div className="dose-alert">
            <h2>{activeAlert.medicineName}'s time is up</h2>
            <p>Take this medicine.</p>
            <button type="button" onClick={handleTaken}>
              Taken
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientHome;
