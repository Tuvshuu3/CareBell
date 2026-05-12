import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LinkButton } from "../components";
import { getPatients } from "../api";
import "../styles/Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setUsername(e.target.value);
    setError("");
  };

  const handleLogin = async () => {
    const loginName = username.trim();

    if (loginName.toLowerCase() === "caretaker") {
      navigate("/caretakerHome");
      return;
    }

    try {
      const patient = (await getPatients()).find(
        (patientData) =>
          patientData.name.toLowerCase() === loginName.toLowerCase()
      );

      if (!patient) {
        setError("No name with that patient.");
        return;
      }

      navigate(`/patientHome?patient=${encodeURIComponent(patient.name)}`);
    } catch (error) {
      console.error(error);
      setError("couldnt connect");
    }
  };

  return (
    <div className="body">
      <div className="loginCont">
        <div className="loginHeader">
          <h1>Care Bell</h1>
          <p>Sign in as Caretaker or enter a patient name</p>
        </div>
        <div className="inputCont">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={handleChange}
            className="inputField"
          />
          <input
            type="password"
            placeholder="Password"
            className="inputField"
          />
          {error && <div className="loginError">{error}</div>}
          <LinkButton onLogin={handleLogin} />
        </div>
      </div>
    </div>
  );
};

export default Login;
