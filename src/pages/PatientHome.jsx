import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Header, PatientMedicineRow } from "../components";
import {
  getActiveCourse,
  getLatestDoseLog,
  getNextDoseTime,
  isMedicineActive,
} from "../components/PatientMedicineRow";
import { createDoseLog, getPatient } from "../api";
import "../styles/PatientHome.css";

const PatientHome = () => {
  const [searchParams] = useSearchParams();
  const requestedPatientId = searchParams.get("patientId");
  const [medicineData, setMedicineData] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeAlert, setActiveAlert] = useState(null);
  const [missedDose, setMissedDose] = useState(null);
  const [handledAlerts, setHandledAlerts] = useState([]);
  const patientData =
    medicineData.find((patient) => patient._id === requestedPatientId) ||
    medicineData[0];
  const patientName = patientData?.name;
  const patientId = patientData?._id;

  useEffect(() => {
    async function loadPatients() {
      if (!requestedPatientId) {
        return;
      }

      try {
        const patient = await getPatient(requestedPatientId);
        setMedicineData([patient]);
      } catch (error) {
        console.error(error);
      }
    }

    loadPatients();
  }, [requestedPatientId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!patientData || activeAlert || missedDose) {
      return;
    }

    const previousTime = new Date(currentTime.getTime() - 1000);
    const dueMedicine = patientData.medicines
      .map((medicine) => {
        if (!isMedicineActive(medicine, currentTime)) {
          return null;
        }

        const latestDoseLog = getLatestDoseLog(medicine.doseLogs);

        if (latestDoseLog?.status === "missed") {
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
          deadline: new Date(dueTime.getTime() + 30 * 1000),
        };
      })
      .find(Boolean);

    if (dueMedicine) {
      setActiveAlert(dueMedicine);
      setHandledAlerts((currentAlerts) => [...currentAlerts, dueMedicine.key]);
    }
  }, [activeAlert, currentTime, handledAlerts, missedDose, patientData]);

  useEffect(() => {
    if (!patientData || activeAlert || missedDose) {
      return;
    }

    const unresolvedMissedDose = patientData.medicines
      .map((medicine) => {
        const latestDoseLog = getLatestDoseLog(medicine.doseLogs);
        const activeCourse = getActiveCourse(medicine, currentTime);

        if (latestDoseLog?.status !== "missed" || !activeCourse) {
          return null;
        }

        return {
          key: `${medicine.id}-${latestDoseLog.time}`,
          medicineId: medicine.id,
          medicineName: medicine.name,
          courseId: latestDoseLog.courseId,
          dueTime: new Date(latestDoseLog.time),
        };
      })
      .find(Boolean);

    if (unresolvedMissedDose) {
      setMissedDose(unresolvedMissedDose);
    }
  }, [activeAlert, currentTime, missedDose, patientData]);

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
    if (!activeAlert || currentTime > activeAlert.deadline) {
      return;
    }

    await addDoseLog(activeAlert.medicineId, {
      courseId: activeAlert.courseId,
      time: currentTime.toISOString(),
      status: "taken",
    });
    setActiveAlert(null);
  };

  const handleTookMissedDose = async () => {
    if (!missedDose) {
      return;
    }

    await addDoseLog(missedDose.medicineId, {
      courseId: missedDose.courseId,
      time: currentTime.toISOString(),
      status: "taken",
    });
    setMissedDose(null);
  };

  useEffect(() => {
    if (!activeAlert || currentTime < activeAlert.deadline) {
      return;
    }

    async function logMissedDose() {
      const missedAlert = activeAlert;
      setActiveAlert(null);
      await addDoseLog(missedAlert.medicineId, {
        courseId: missedAlert.courseId,
        time: missedAlert.dueTime.toISOString(),
        status: "missed",
      });
      setMissedDose(missedAlert);
    }

    logMissedDose();
  }, [activeAlert, addDoseLog, currentTime]);

  return (
    <div className="patient-home">
      <Header />

      <main className="patient-home-main">
        {missedDose && (
          <div className="missed-dose-banner">
            <span>{missedDose.medicineName} was missed.</span>
            <button type="button" onClick={handleTookMissedDose}>
              Took it
            </button>
          </div>
        )}

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
            <div className="patient-empty-state">No medicines</div>
          )}
        </div>
      </main>

      {activeAlert && (
        <div className="dose-alert-backdrop">
          <div className="dose-alert">
            <h2>{activeAlert.medicineName}'s time is up</h2>
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
