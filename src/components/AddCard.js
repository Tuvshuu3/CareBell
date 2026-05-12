import React, { useState } from "react";
import "../styles/AddCard.css";
import AddIcon from "../assets/AddIcon";

const initialForm = {
  name: "",
  dosage: "",
  intervalHours: "24",
  startDate: "",
  endDate: "",
  firstDoseTime: "",
  image: "",
};

const defaultMedicineImage =
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b";

const AddCard = ({ onAddMedicine }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState(initialForm);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const courseId = Date.now();
    const firstDoseTime = form.firstDoseTime || "08:00";

    onAddMedicine({
      name: form.name.trim(),
      dosage: form.dosage.trim(),
      intervalHours: Number(form.intervalHours),
      image: form.image.trim() || defaultMedicineImage,
      courses: [
        {
          courseId,
          startDate: form.startDate,
          endDate: form.endDate,
          active: true,
        },
      ],
      doseLogs: [
        {
          courseId,
          time: `${form.startDate}T${firstDoseTime}:00`,
          status: "taken",
        },
      ],
    });

    setForm(initialForm);
    setIsOpen(false);
  };

  const handleClose = () => {
    setForm(initialForm);
    setIsOpen(false);
  };

  return (
    <>
      <button
        className="add-card"
        type="button"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsOpen(true)}
        aria-label="Add medicine"
      >
        <AddIcon
          fill={isHovered ? "#ffffff" : "#000000"}
          height="80px"
          width="80px"
        />
      </button>

      {isOpen && (
        <div className="add-modal-backdrop">
          <form className="add-modal" onSubmit={handleSubmit}>
            <div className="add-modal-header">
              <h2>Add medicine</h2>
              <button
                className="add-modal-close"
                type="button"
                onClick={handleClose}
                aria-label="Close add medicine form"
              >
                x
              </button>
            </div>

            <label>
              Medicine name
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Dosage
              <input
                name="dosage"
                value={form.dosage}
                onChange={handleChange}
                required
              />
            </label>

            <div className="add-modal-row">
              <label>
                Interval (hours)
                <input
                  name="intervalHours"
                  type="number"
                  min="1"
                  value={form.intervalHours}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Start date
                <input
                  name="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={handleChange}
                  required
                />
              </label>
            </div>

            <label>
              End date
              <input
                name="endDate"
                type="date"
                value={form.endDate}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              First dose time
              <input
                name="firstDoseTime"
                type="time"
                value={form.firstDoseTime}
                onChange={handleChange}
              />
            </label>

            <label>
              Image URL
              <input
                name="image"
                type="url"
                value={form.image}
                onChange={handleChange}
              />
            </label>

            <button className="add-modal-submit" type="submit">
              Add medicine
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AddCard;
