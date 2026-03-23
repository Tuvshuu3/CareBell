import React from "react";
import "../styles/Header.css";

const Header = () => {
  return (
    <div className="header-cont">
      <div className="logo">
        <div>logo</div>
        <div>Care Bell</div>
      </div>
      <div className="userPart">
        <div>BELL</div>
        <div className="pro-ball">PROFILE</div>
      </div>
    </div>
  );
};

export default Header;
