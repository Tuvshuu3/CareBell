import React, { useState } from "react";
import { LinkButton } from "../components";
import "../styles/Login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const handleChange = (e) => {
    setUsername(e.target.value);
  };
  return (
    <div className="body">
      <div className="loginCont">
        <h1>Welcome to Login</h1>
        <div className="inputCont">
          <input
            type="text"
            placeholder="Username"
            onChange={handleChange}
            className="inputField"
          />
          <input
            type="password"
            placeholder="Password"
            className="inputField"
          />
          <LinkButton username={username} />
        </div>
      </div>
    </div>
  );
};

export default Login;
