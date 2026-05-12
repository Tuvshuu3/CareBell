const LinkButton = ({ onLogin }) => {
  return (
    <button className="loginButton" type="button" onClick={onLogin}>
      Login
    </button>
  );
};

export default LinkButton;
