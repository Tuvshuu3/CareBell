import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Header.css";
import BellLogo from "../assets/BellLogo";
import NotifLogo from "../assets/NotifLogo";
import AccLogo from "../assets/AccLogo";

const Header = () => {
  const navigate = useNavigate();

  return (
    <div className="header-cont">
      <div className="logo">
        <BellLogo />
        <div>Care Bell</div>
      </div>
      <div className="userPart">
        <NotifLogo />
        <button
          className="accSt"
          type="button"
          onClick={() => navigate("/")}
          aria-label="Logout"
        >
          <AccLogo />
        </button>
      </div>
    </div>
  );
};

export default Header;
