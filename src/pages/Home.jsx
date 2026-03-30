import React from "react";
import Header from "../components/Header";
import "../styles/Home.css";
import AddPatBtn from "../components/AddPatBtn";
import PatientItem from "../components/PatientItem";
import oldMan from "../assets/oldMan.png";
import oldWoman from "../assets/oldWoman.png";

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
            <PatientItem
              name="John"
              age="82"
              profile={oldMan}
              selected={true}
            />
            <PatientItem
              name="Emily"
              age="75"
              profile={oldWoman}
              selected={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Test;
