import React from "react";
import ButtonEx from "../components/ButtonExample";
import "../styles/Login.css";

const Login = () => {
  return (
    <div className="body">
      <div className="loginCont">
        <h1>Welcome to Login</h1>
        <div className="inputCont">
          <input type="text" placeholder="Username" className="inputField" />
          <input
            type="password"
            placeholder="Password"
            className="inputField"
          />
          <ButtonEx />
        </div>
      </div>
    </div>
  );
};

export default Login;
