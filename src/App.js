import { BrowserRouter, Routes, Route } from "react-router-dom";
import CaretakerHome from "./pages/CaretakerHome";
import PatientHome from "./pages/PatientHome";
import Login from "./pages/Login";
import AdminHome from "./pages/AdminHome";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/adminHome" element={<AdminHome />} />
        <Route path="/caretakerHome" element={<CaretakerHome />} />
        <Route path="/patientHome" element={<PatientHome />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
