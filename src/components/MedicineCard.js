import React, { useState } from "react";
import "../styles/MedicineCard.css";

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

const isCourseActive = (course) => {
  const today = getDateOnly();
  const startDate = getDateOnly(course.startDate);
  const endDate = getDateOnly(course.endDate);

  return today >= startDate && today <= endDate;
};

export default function MedicineCard({
  id,
  image,
  name,
  dosage,
  intervalHours,
  courses = [],
  doseLogs = [],
  onDelete,
  onAddCourse,
}) {
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [courseForm, setCourseForm] = useState({
    startDate: "",
    endDate: "",
  });
  const activeCourses = courses.filter(isCourseActive);
  const activeCourseIds = activeCourses.map((course) => course.courseId);
  const relevantDoseLogs =
    activeCourseIds.length > 0
      ? doseLogs.filter((log) => activeCourseIds.includes(log.courseId))
      : doseLogs;
  const latestDoseLog = [...relevantDoseLogs].sort(
    (firstLog, secondLog) => new Date(secondLog.time) - new Date(firstLog.time)
  )[0];

  const handleCourseChange = (event) => {
    const { name: fieldName, value } = event.target;
    setCourseForm((currentForm) => ({
      ...currentForm,
      [fieldName]: value,
    }));
  };

  const handleAddCourse = (event) => {
    event.preventDefault();

    onAddCourse(id, {
      courseId: Date.now(),
      startDate: courseForm.startDate,
      endDate: courseForm.endDate,
      active: false,
    });

    setCourseForm({
      startDate: "",
      endDate: "",
    });
    setIsManageOpen(false);
  };

  const handleDelete = () => {
    onDelete(id);
    setIsManageOpen(false);
  };

  return (
    <>
      <article
        className="medicine-card"
        role="button"
        tabIndex="0"
        onClick={() => setIsManageOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            setIsManageOpen(true);
          }
        }}
      >
        <img src={image} alt={name} className="medicine-image" />

      <div className="medicine-content">
        <h2 className="medicine-title">{name}</h2>

        <p>
          <strong>Dosage:</strong> {dosage}
        </p>
        <p>
          <strong>Interval:</strong> Every {intervalHours} hours
        </p>

        <div className="medicine-courses">
          <strong>Courses:</strong>
          {courses.length > 0 ? (
            courses.map((course) => {
              const courseIsActive = isCourseActive(course);

              return (
                <div className="medicine-course" key={course.courseId}>
                  <span>
                    {formatDate(course.startDate)} to{" "}
                    {formatDate(course.endDate)}
                  </span>
                  <span
                    className={`course-status ${
                      courseIsActive ? "active" : "inactive"
                    }`}
                  >
                    {courseIsActive ? "Active" : "Inactive"}
                  </span>
                </div>
              );
            })
          ) : (
            <p>No courses added</p>
          )}
        </div>

        {latestDoseLog && (
          <p>
            <strong>Last dose:</strong> {formatDateTime(latestDoseLog.time)}
          </p>
        )}
        </div>
      </article>

      {isManageOpen && (
        <div className="medicine-modal-backdrop">
          <div className="medicine-modal">
            <div className="medicine-modal-header">
              <h2>{name}</h2>
              <button
                className="medicine-modal-close"
                type="button"
                onClick={() => setIsManageOpen(false)}
                aria-label="Close medicine actions"
              >
                x
              </button>
            </div>

            <form className="medicine-course-form" onSubmit={handleAddCourse}>
              <h3>Add course</h3>

              <label>
                Start date
                <input
                  name="startDate"
                  type="date"
                  value={courseForm.startDate}
                  onChange={handleCourseChange}
                  required
                />
              </label>

              <label>
                End date
                <input
                  name="endDate"
                  type="date"
                  value={courseForm.endDate}
                  onChange={handleCourseChange}
                  required
                />
              </label>

              <button className="medicine-modal-submit" type="submit">
                Add course
              </button>
            </form>

            <button
              className="medicine-delete-button"
              type="button"
              onClick={handleDelete}
            >
              Delete medicine
            </button>
          </div>
        </div>
      )}
    </>
  );
}
