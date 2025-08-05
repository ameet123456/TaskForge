import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated, logout } from "../authUtils";

const Welcome = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const authenticatedUser = isAuthenticated();
    if (authenticatedUser) {
      setUser(authenticatedUser);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      {user ? (
        <>
          <h2>Welcome, {user.name} 👋</h2>
          <p>Email: {user.email}</p>
          <button onClick={() => logout(navigate)}>Logout</button>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Welcome;
