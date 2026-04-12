import { Link } from "react-router-dom";

const LinkButton = ({ username }) => {
  const linkPath =
    username === "Patient"
      ? "/patientHome"
      : username === "Caretaker"
      ? "/caretakerHome"
      : "/";
  return (
    <Link to={linkPath}>
      <button>Login</button>
    </Link>
  );
};

export default LinkButton;
