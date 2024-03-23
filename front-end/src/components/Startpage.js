import React from "react";
import { useNavigate } from "react-router-dom";

const StartPage = ({ userName, setUserName }) => {
  const navigate = useNavigate(); // Initialize navigate
  const handleStartClick = () => {
    // Navigate to the "/Board" route
    navigate("/Board");
  };

  return (
    <div className="start-page">
      <div>
        <h2>Chess Go</h2>
        <input
          type="text"
          value={userName}
          placeholder="Guest Name"
          onChange={(e) => {
            setUserName(e.target.value);
          }}
        />
        <button type="button" onClick={handleStartClick}>
          Start
        </button>
      </div>
    </div>
  );
};

export default StartPage;
