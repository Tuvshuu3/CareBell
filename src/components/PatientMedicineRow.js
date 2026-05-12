import React, { useState } from "react";

const formatDate = (date) =>
  new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));

const formatDateTime = (date) =>
  new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));

const getDateOnly = (date) => {
  if (typeof date === "string") {
    const [year, month, day] = date.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  const currentDate = new Date();
  return new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate()
  );
};

const isCourseActive = (course, date = new Date()) => {
  const today = getDateOnly(date);
  const startDate = getDateOnly(course.startDate);
  const endDate = getDateOnly(course.endDate);

  return today >= startDate && today <= endDate;
};

export const getActiveCourse = (medicine, date = new Date()) =>
  medicine.courses.find((course) => isCourseActive(course, date));

export const isMedicineActive = (medicine, date = new Date()) =>
  Boolean(getActiveCourse(medicine, date));

const getLatestDoseLog = (doseLogs = []) =>
  [...doseLogs].sort(
    (firstLog, secondLog) => new Date(secondLog.time) - new Date(firstLog.time)
  )[0];

const getLatestTakenLog = (doseLogs = []) =>
  doseLogs
    .filter((doseLog) => doseLog.status === "taken")
    .sort(
      (firstLog, secondLog) =>
        new Date(secondLog.time) - new Date(firstLog.time)
    )[0];

export const getNextDoseTime = (medicine, currentTime) => {
  const latestDoseLog = getLatestDoseLog(medicine.doseLogs);

  if (!latestDoseLog) {
    return null;
  }

  const latestDoseTime = new Date(latestDoseLog.time).getTime();
  const intervalMs = medicine.intervalHours * 60 * 60 * 1000;
  const firstNextDoseTime = latestDoseTime + intervalMs;

  if (firstNextDoseTime > currentTime.getTime()) {
    return new Date(firstNextDoseTime);
  }

  const intervalsSinceLatestDose =
    Math.floor((currentTime.getTime() - latestDoseTime) / intervalMs) + 1;

  return new Date(latestDoseTime + intervalsSinceLatestDose * intervalMs);
};

const getTimeRemaining = (nextDoseTime, currentTime) => {
  if (!nextDoseTime) {
    return "No dose logged";
  }

  const remainingMs = nextDoseTime.getTime() - currentTime.getTime();

  if (remainingMs <= 0) {
    return "00:00:00";
  }

  const totalSeconds = Math.floor(remainingMs / 1000);
  const totalDays = Math.floor(totalSeconds / 86400);

  if (totalDays >= 1) {
    return `${totalDays} ${totalDays === 1 ? "day" : "days"}`;
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pHours = String(hours).padStart(2, "0");
  const pMinutes = String(minutes).padStart(2, "0");
  const pSeconds = String(seconds).padStart(2, "0");

  return `${pHours}:${pMinutes}:${pSeconds}`;
};

export default function PatientMedicineRow({ medicine, currentTime }) {
  const [isOpen, setIsOpen] = useState(false);
  const medicineIsActive = isMedicineActive(medicine, currentTime);
  const latestTakenLog = getLatestTakenLog(medicine.doseLogs);
  const nextDoseTime = getNextDoseTime(medicine, currentTime);
  const timeRemaining = medicineIsActive
    ? getTimeRemaining(nextDoseTime, currentTime)
    : "Not active";

  return (
    <div className={`patient-med-row ${isOpen ? "open" : ""}`}>
      <button
        className="patient-med-bar"
        type="button"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
      >
        <div className="patient-med-main">
          <img
            className="patient-med-image"
            src={medicine.image}
            alt={medicine.name}
          />
          <div>
            <h2>{medicine.name}</h2>
            <p>{medicine.dosage}</p>
          </div>
        </div>

        <div className="patient-med-timer">
          <span>Next dose</span>
          <strong>{timeRemaining}</strong>
        </div>
      </button>

      {isOpen && (
        <div className="patient-med-details">
          <div className="patient-detail-grid">
            <p>
              <strong>Interval:</strong> Every {medicine.intervalHours} hours
            </p>
            <p>
              <strong>Last taken:</strong>{" "}
              {latestTakenLog ? formatDateTime(latestTakenLog.time) : "None"}
            </p>
            <p>
              <strong>Next dosage:</strong>{" "}
              {medicineIsActive && nextDoseTime
                ? formatDateTime(nextDoseTime)
                : "Not active"}
            </p>
          </div>

          <div className="patient-course-list">
            <strong>Courses</strong>
            {medicine.courses.length > 0 ? (
              medicine.courses.map((course) => (
                <div className="patient-course" key={course.courseId}>
                  {formatDate(course.startDate)} to {formatDate(course.endDate)}
                </div>
              ))
            ) : (
              <p>No courses added</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
