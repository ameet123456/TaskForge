import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();


  const handleManualLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/users/login", {
        email,
        password,
      });

      console.log("Backend Response:", response.data); 
      if (response.data.success && response.data.data) {
        const { token, user } = response.data.data;
        console.log("Received User From Backend:", user);
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        const teams = user.teams;

        if (user.isAdmin) {
          navigate("/teams");
          return;
        }

        if (!teams || teams.length === 0) {
          alert("⚠️ No team membership found.");
          return;
        }

        if (teams.length === 1) {
          const selectedTeam = teams[0];
          localStorage.setItem("teamId", selectedTeam.teamId);
          localStorage.setItem("role", selectedTeam.role);

          if (selectedTeam.role === "team_lead") {
            navigate("/projects");
          } else {
            navigate("/tasks");
          }
        } else {
          localStorage.setItem("availableTeams", JSON.stringify(teams));
          navigate("/select-team");
        }
      } else {
        setError("User data missing from response!");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Login failed. Please try again.");
    }
  };

  
  const handleGoogleLogin = () => {
    window.open("http://localhost:5000/user/auth/google", "_self");
  };

  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const user = urlParams.get("user");

    if (token && user) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(user));

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(parsedUser));

        console.log("Stored User (Google Login):", parsedUser);

        navigate("/welcome");
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, [navigate]);

  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const isDemo = params.get("demo");

    if (isDemo === "true") {
      console.log("DEMO MODE ACTIVATED");

      setEmail("admin@example.com");
      setPassword("123456");

      setTimeout(() => {
        document.getElementById("demo-login-btn")?.click();
      }, 800);
    }
  }, [location.search]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Login</h2>
      <form onSubmit={handleManualLogin}>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button id="demo-login-btn" type="submit">
          Login
        </button>
      </form>
      <p>OR</p>
      <button onClick={handleGoogleLogin}>Sign in with Google</button>
    </div>
  );
};

export default Login;
 