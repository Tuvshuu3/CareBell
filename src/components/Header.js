import React from "react";
import "../styles/Header.css";
import BellLogo from "../assets/BellLogo";
import NotifLogo from "../assets/NotifLogo"
import AccLogo from "../assets/AccLogo";

const Header = () => {
  return (
    <div className="header-cont">
      <div className="logo">
        <BellLogo />
        <div>Care Bell</div>
      </div>
      <div className="userPart">
        <NotifLogo />
        <div className="accSt">
          <AccLogo />
        </div>
      </div>
    </div>
  );
};

export default Header;
