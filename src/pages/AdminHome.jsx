import React, { useEffect, useState } from "react";
import { Header } from "../components";
import { deleteUser, getUsers } from "../api";
import "../styles/AdminHome.css";

const AdminHome = () => {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadUsers() {
      try {
        const loadedUsers = await getUsers();
        setUsers(loadedUsers);
      } catch (error) {
        setMessage(error.message);
      }
    }

    loadUsers();
  }, []);

  const handleDeleteUser = async (userId) => {
    try {
      await deleteUser(userId);
      setUsers((currentUsers) =>
        currentUsers.filter((user) => user._id !== userId)
      );
      setMessage("");
    } catch (error) {
      setMessage(error.message);
    }
  };

  const patients = users.filter((user) => user.role === "patient");
  const caretakers = users.filter((user) => user.role === "caretaker");

  return (
    <div className="admin-home">
      <Header />

      <main className="admin-main">
        <div className="admin-title">
          <h1>Admin Dashboard</h1>
        </div>

        {message && <div className="admin-message">{message}</div>}

        <section className="admin-section">
          <h2>Patients</h2>
          <div className="admin-user-list">
            {patients.length > 0 ? (
              patients.map((patient) => (
                <article className="admin-user-card" key={patient._id}>
                  <div className="admin-user-header">
                    <div>
                      <h3>{patient.name || patient.username}</h3>
                      <p>
                        @{patient.username}
                        {patient.age ? ` | Age ${patient.age}` : ""}
                      </p>
                    </div>
                    <button
                      className="admin-delete-button"
                      type="button"
                      onClick={() => handleDeleteUser(patient._id)}
                    >
                      Delete
                    </button>
                  </div>

                  <div className="admin-medicine-list">
                    <strong>Medicines</strong>
                    {patient.medicines?.length > 0 ? (
                      patient.medicines.map((medicine) => (
                        <div className="admin-medicine" key={medicine.id}>
                          <span>{medicine.name}</span>
                          <span>{medicine.dosage}</span>
                          <span>Every {medicine.intervalHours}h</span>
                        </div>
                      ))
                    ) : (
                      <p>No medicines added</p>
                    )}
                  </div>
                </article>
              ))
            ) : (
              <div className="admin-empty">No patients found</div>
            )}
          </div>
        </section>

        <section className="admin-section">
          <h2>Caretakers</h2>
          <div className="admin-user-list">
            {caretakers.length > 0 ? (
              caretakers.map((caretaker) => (
                <article className="admin-user-card" key={caretaker._id}>
                  <div className="admin-user-header">
                    <div>
                      <h3>{caretaker.username}</h3>
                      <p>
                        Linked patients: {caretaker.patientIds?.length || 0}
                      </p>
                    </div>
                    <button
                      className="admin-delete-button"
                      type="button"
                      onClick={() => handleDeleteUser(caretaker._id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="admin-empty">No caretakers found</div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminHome;
