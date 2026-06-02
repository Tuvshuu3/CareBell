import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Header, PatientMedicineRow } from "../components";
import {
  getActiveCourse,
  getNextDoseTime,
  isMedicineActive,
} from "../components/PatientMedicineRow";
import { createDoseLog, getPatient } from "../api";
import "../styles/PatientHome.css";

const missed_dose_interval = 30 * 1000;

const getLatestCourseDoseLog = (doseLogs = [], courseId) =>
  [...doseLogs]
    .filter((doseLog) => doseLog.courseId === courseId)
    .sort(
      (firstLog, secondLog) =>
        new Date(secondLog.time) - new Date(firstLog.time)
    )[0];

const PatientHome = () => {
  const [searchParams] = useSearchParams();
  const requestedPatientId = searchParams.get("patientId");
  const [medicineData, setMedicineData] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeAlert, setActiveAlert] = useState(null);
  const [missedDoses, setMissedDoses] = useState([]);
  const [handledAlerts, setHandledAlerts] = useState([]);
  const pendingMissedDoseKeys = useRef(new Set());
  const patientData =
    medicineData.find((patient) => patient._id === requestedPatientId) ||
    medicineData[0];
  const patientName = patientData?.name;
  const patientId = patientData?._id;

  useEffect(() => {
    async function loadPatient() {
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

    loadPatient();
  }, [requestedPatientId]);

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

        const activeCourse = getActiveCourse(medicine, currentTime);
        const latestDoseLog = activeCourse
          ? getLatestCourseDoseLog(medicine.doseLogs, activeCourse.courseId)
          : null;

        if (latestDoseLog?.status === "missed") {
          return null;
        }

        const dueTime = getNextDoseTime(
          {
            ...medicine,
            doseLogs: activeCourse
              ? medicine.doseLogs.filter(
                  (doseLog) => doseLog.courseId === activeCourse.courseId
                )
              : medicine.doseLogs,
          },
          previousTime
        );

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
          deadline: new Date(dueTime.getTime() + missed_dose_interval),
        };
      })
      .find(Boolean);

    if (dueMedicine) {
      setActiveAlert(dueMedicine);
      setHandledAlerts((currentAlerts) => [...currentAlerts, dueMedicine.key]);
    }
  }, [activeAlert, currentTime, handledAlerts, patientData]);

  useEffect(() => {
    if (!patientData) {
      return;
    }

    const unresolvedMissedDoses = patientData.medicines
      .map((medicine) => {
        const activeCourse = getActiveCourse(medicine, currentTime);
        const latestDoseLog = activeCourse
          ? getLatestCourseDoseLog(medicine.doseLogs, activeCourse.courseId)
          : null;

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
      .filter(Boolean);

    if (unresolvedMissedDoses.length > 0) {
      setMissedDoses((currentMissedDoses) => {
        const newMissedDoses = unresolvedMissedDoses.filter(
          (missedDose) =>
            !currentMissedDoses.some(
              (currentMissedDose) => currentMissedDose.key === missedDose.key
            )
        );

        if (newMissedDoses.length === 0) {
          return currentMissedDoses;
        }

        return [...currentMissedDoses, ...newMissedDoses];
      });
    }
  }, [currentTime, patientData]);

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
        return null;
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

      return savedDoseLog;
    },
    [patientId, patientName]
  );

  useEffect(() => {
    if (!patientData || activeAlert) {
      return;
    }

    const overdueDose = patientData.medicines
      .map((medicine) => {
        if (!isMedicineActive(medicine, currentTime)) {
          return null;
        }

        const activeCourse = getActiveCourse(medicine, currentTime);

        if (!activeCourse) {
          return null;
        }

        const latestDoseLog = getLatestCourseDoseLog(
          medicine.doseLogs,
          activeCourse.courseId
        );

        if (!latestDoseLog || latestDoseLog.status === "missed") {
          return null;
        }

        const dueTime = new Date(
          new Date(latestDoseLog.time).getTime() +
            medicine.intervalHours * 60 * 60 * 1000
        );
        const deadline = new Date(dueTime.getTime() + missed_dose_interval);

        if (currentTime < deadline) {
          return null;
        }

        return {
          key: `${medicine.id}-${dueTime.toISOString()}`,
          medicineId: medicine.id,
          medicineName: medicine.name,
          courseId: activeCourse.courseId,
          dueTime,
          deadline,
        };
      })
      .find(Boolean);

    if (!overdueDose || pendingMissedDoseKeys.current.has(overdueDose.key)) {
      return;
    }

    pendingMissedDoseKeys.current.add(overdueDose.key);

    async function logOverdueMissedDose() {
      const savedDoseLog = await addDoseLog(overdueDose.medicineId, {
        courseId: overdueDose.courseId,
        time: overdueDose.dueTime.toISOString(),
        status: "missed",
      });

      if (savedDoseLog) {
        setMissedDoses((currentMissedDoses) => {
          if (
            currentMissedDoses.some(
              (currentMissedDose) => currentMissedDose.key === overdueDose.key
            )
          ) {
            return currentMissedDoses;
          }

          return [...currentMissedDoses, overdueDose];
        });
      }

      pendingMissedDoseKeys.current.delete(overdueDose.key);
    }

    logOverdueMissedDose();
  }, [activeAlert, addDoseLog, currentTime, patientData]);

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

  const handleTookMissedDose = async (missedDose) => {
    if (!missedDose) {
      return;
    }

    await addDoseLog(missedDose.medicineId, {
      courseId: missedDose.courseId,
      time: currentTime.toISOString(),
      status: "taken",
    });
    setMissedDoses((currentMissedDoses) =>
      currentMissedDoses.filter(
        (currentMissedDose) => currentMissedDose.key !== missedDose.key
      )
    );
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
      setMissedDoses((currentMissedDoses) => {
        if (
          currentMissedDoses.some(
            (currentMissedDose) => currentMissedDose.key === missedAlert.key
          )
        ) {
          return currentMissedDoses;
        }

        return [...currentMissedDoses, missedAlert];
      });
    }

    logMissedDose();
  }, [activeAlert, addDoseLog, currentTime]);

  return (
    <div className="patient-home">
      <Header />

      <main className="patient-home-main">
        {missedDoses.map((missedDose) => (
          <div className="missed-dose-banner" key={missedDose.key}>
            <span>{missedDose.medicineName} was missed.</span>
            <span> </span>
            <button
              type="button"
              onClick={() => handleTookMissedDose(missedDose)}
            >
              Took it
            </button>
          </div>
        ))}

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
