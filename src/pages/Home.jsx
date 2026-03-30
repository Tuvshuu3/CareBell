import React from "react";
import Header from "../components/Header";
import "../styles/Home.css";
import AddPatBtn from "../components/AddPatBtn";
import PatientItem from "../components/PatientItem";

const Test = () => {
  return (
    <div className="homeBody">
      <Header />
      <div className="mainCont">
        <div className="patListCont">
          <div className="addBtnCont">
            <AddPatBtn />
          </div>

          <div className="patList">
            <PatientItem />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Test;
