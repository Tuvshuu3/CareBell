import { BrowserRouter, Routes, Route } from "react-router-dom";
import CaretakerHome from "./pages/CaretakerHome";
import PatientHome from "./pages/PatientHome";
import Login from "./pages/Login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/caretakerHome" element={<CaretakerHome />} />
        <Route path="/patientHome" element={<PatientHome />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
