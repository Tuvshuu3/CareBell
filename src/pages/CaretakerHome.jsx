import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
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
  addCaretakerPatient,
  createCourse,
  createMedicine,
  deleteMedicine,
  getCaretakerPatients,
} from "../api";

const defaultPatientProfile = oldMan;
const patientProfiles = {
  John: oldMan,
  Emily: oldWoman,
};

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

const medicineHasActiveCourse = (medicine) =>
  Boolean(medicine.courses?.some(isCourseActive));

const getLatestCourseTime = (medicine) => {
  const latestCourse = [...(medicine.courses || [])].sort(
    (firstCourse, secondCourse) =>
      new Date(secondCourse.endDate) - new Date(firstCourse.endDate)
  )[0];

  return latestCourse ? new Date(latestCourse.endDate).getTime() : 0;
};

const filterOptions = [
  { value: "all", label: "All medicines" },
  { value: "active", label: "Active courses" },
  { value: "inactive", label: "Inactive courses" },
];

const sortOptions = [
  { value: "active", label: "Active first" },
  { value: "name", label: "Name A-Z" },
  { value: "interval", label: "Shortest interval" },
  { value: "latest", label: "Latest course" },
];

const ToolbarSelect = ({ label, value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption =
    options.find((option) => option.value === value) || options[0];

  const handleBlur = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsOpen(false);
    }
  };

  return (
    <div className="medicine-control medicine-select-control" onBlur={handleBlur}>
      <span className="medicine-control-label">{label}</span>
      <button
        className={`medicine-select-button ${isOpen ? "open" : ""}`}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((currentIsOpen) => !currentIsOpen)}
      >
        <span>{selectedOption.label}</span>
        <span className="medicine-select-arrow" aria-hidden="true" />
      </button>

      {isOpen && (
        <div className="medicine-select-menu" role="listbox">
          {options.map((option) => (
            <button
              className={`medicine-select-option ${
                option.value === value ? "selected" : ""
              }`}
              type="button"
              role="option"
              aria-selected={option.value === value}
              key={option.value}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const CaretakerHome = () => {
  const [searchParams] = useSearchParams();
  const caretakerId = searchParams.get("caretakerId");
  const [patient, setPatient] = useState("");
  const [loading, setLoading] = useState(false);
  const [medicineData, setMedicineData] = useState([]);
  const [medicineSearch, setMedicineSearch] = useState("");
  const [medicineFilter, setMedicineFilter] = useState("all");
  const [medicineSort, setMedicineSort] = useState("active");
  const selectedPatient = medicineData.find((med) => med.name === patient);
  const patientMedicines = selectedPatient?.medicines || [];
  const visibleMedicines = patientMedicines
    .filter((medicine) => {
      const searchValue = medicineSearch.trim().toLowerCase();
      const matchesSearch =
        !searchValue ||
        medicine.name.toLowerCase().includes(searchValue);

      if (!matchesSearch) {
        return false;
      }

      const isActive = medicineHasActiveCourse(medicine);

      if (medicineFilter === "active") {
        return isActive;
      }

      if (medicineFilter === "inactive") {
        return !isActive;
      }

      return true;
    })
    .sort((firstMedicine, secondMedicine) => {
      if (medicineSort === "name") {
        return firstMedicine.name.localeCompare(secondMedicine.name);
      }

      if (medicineSort === "interval") {
        return firstMedicine.intervalHours - secondMedicine.intervalHours;
      }

      if (medicineSort === "latest") {
        return (
          getLatestCourseTime(secondMedicine) - getLatestCourseTime(firstMedicine)
        );
      }

      return (
        Number(medicineHasActiveCourse(secondMedicine)) -
          Number(medicineHasActiveCourse(firstMedicine)) ||
        firstMedicine.name.localeCompare(secondMedicine.name)
      );
    });
  const hasMedicineControls =
    patientMedicines.length > 0 ||
    medicineSearch ||
    medicineFilter !== "all" ||
    medicineSort !== "active";

  useEffect(() => {
    async function loadPatients() {
      if (!caretakerId) {
        return;
      }

      try {
        const patients = await getCaretakerPatients(caretakerId);
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
  }, [caretakerId]);

  const handlePatientChange = (newPatient) => {
    if (newPatient !== patient) {
      setLoading(true);
      setMedicineSearch("");
      setMedicineFilter("all");
      setMedicineSort("active");
      setTimeout(() => {
        setPatient(newPatient);
        setLoading(false);
      }, 1000);
    }
  };

  const handleAddPatient = async ({ username }) => {
    const patientUsername = username.trim();

    if (!patientUsername || !caretakerId) {
      return;
    }

    const patientExists = medicineData.some(
      (e) => e.name.toLowerCase() === patientUsername.toLowerCase()
    );

    if (patientExists) {
      return;
    }

    try {
      const linkedPatient = await addCaretakerPatient(
        caretakerId,
        patientUsername
      );

      setMedicineData((currentMedicineData) => [
        ...currentMedicineData,
        linkedPatient,
      ]);
      setPatient(linkedPatient.name);
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
                age={patientMedicineData.age}
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
            <>
              {hasMedicineControls && (
                <div className="medicine-toolbar">
                  <div className="medicine-toolbar-main">
                    <label className="medicine-search-label">
                      Search medicines
                      <input
                        type="search"
                        value={medicineSearch}
                        onChange={(event) =>
                          setMedicineSearch(event.target.value)
                        }
                        placeholder="Medicine name"
                      />
                    </label>

                    <ToolbarSelect
                      label="Filter"
                      value={medicineFilter}
                      options={filterOptions}
                      onChange={setMedicineFilter}
                    />

                    <ToolbarSelect
                      label="Sort"
                      value={medicineSort}
                      options={sortOptions}
                      onChange={setMedicineSort}
                    />
                  </div>
                </div>
              )}

              <div className="medicine-grid">
                {visibleMedicines.map((medicine) => (
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
                ))}

                {visibleMedicines.length === 0 && patientMedicines.length > 0 && (
                  <div className="caretaker-empty-state">
                    No matching medicines
                  </div>
                )}

                <AddCard onAddMedicine={handleAddMedicine} />
              </div>
            </>
          )}
        </div>
      </div>
      <footer className="caretaker-mobile-footer" aria-label="Caregiver actions">
        <div className="caretaker-footer-summary">
          <strong>{selectedPatient?.name || "No patient selected"}</strong>
          <span>{patientMedicines.length} medicines</span>
        </div>
        <AddCard
          onAddMedicine={handleAddMedicine}
          variant="footer"
          disabled={!selectedPatient}
        />
      </footer>
    </div>
  );
};

export default CaretakerHome;
