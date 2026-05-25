import React, { useState } from "react";
import "../styles/PatientItem.css";
import AddIcon from "../assets/AddIcon";

const initialForm = {
  username: "",
};

const AddPatBtn = ({ onAddPatient }) => {
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

  const handleClose = () => {
    setForm(initialForm);
    setIsOpen(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    onAddPatient({
      username: form.username.trim(),
    });

    handleClose();
  };

  return (
    <>
      <button
        className="addPatBtn"
        type="button"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsOpen(true)}
      >
        <AddIcon fill={isHovered ? "#ffffff" : "#000000"} />
        Add Senior
      </button>

      {isOpen && (
        <div className="patient-modal-backdrop">
          <form className="patient-modal" onSubmit={handleSubmit}>
            <div className="patient-modal-header">
              <h2>Add patient</h2>
              <button
                className="patient-modal-close"
                type="button"
                onClick={handleClose}
                aria-label="Close add patient form"
              >
                x
              </button>
            </div>

            <label>
              Patient username
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                required
              />
            </label>

            <button className="patient-modal-submit" type="submit">
              Add patient
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AddPatBtn;
