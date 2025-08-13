import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import ClipLoader from "react-spinners/ClipLoader";
import Login from "./pages/Login";
import Signin from "./pages/Signin";
import Welcome from "./pages/Welcome";
import TaskList from "./pages/TaskList";
import TaskForm from "./pages/TaskForm";
import TaskCart from "./pages/TaskCart";
import ProjectList from "./pages/ProjectList";
import ProjectDetails from "./pages/ProjectDetails";
import ProjectForm from "./pages/ProjectForm";
import CreateTeamForm from "./pages/CreateTeamForm";
import TeamList from "./pages/TeamList";
import SelectTeam from "./pages/SelectTeam";
import TeamDetails from "./pages/TeamDetails";
import Landing from "./pages/Lending";

import LandingNavbar from "./components/LendingNavbar";
import WebsiteNavbar from "./components/websiteNavbar";
import Profile from "./pages/Profile";
import Setting from "./pages/Setting";
import HomePage from "./pages/HomePage";

const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

const NavbarController = () => {
  const location = useLocation();

  const landingRoutes = ["/", "/login", "/register"];

  const isLandingPage = landingRoutes.includes(location.pathname);

  const hideNavbarRoutes = ["/login", "/register"];
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  if (shouldHideNavbar) {
    return null;
  }

  return isLandingPage ? <LandingNavbar /> : <WebsiteNavbar />;
};

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1500);
  }, []);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get("token");
    const user = queryParams.get("user");

    if (token && user) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", user);
      window.history.replaceState({}, document.title, "/welcome");
    }
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <ClipLoader size={60} color={"#3B82F6"} />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <NavbarController />

        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Landing />} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Signin />} />

            <Route path="/welcome" element={<PrivateRoute><Welcome /></PrivateRoute>} />
            <Route path="/tasks" element={<PrivateRoute><TaskList /></PrivateRoute>} />
            <Route path="/task/new" element={<PrivateRoute><TaskForm /></PrivateRoute>} />
            <Route path="/task/edit/:id" element={<PrivateRoute><TaskForm isEdit={true} /></PrivateRoute>} />

            <Route path="/projects" element={<PrivateRoute><ProjectList /></PrivateRoute>} />
            <Route path="/projects/:id" element={<PrivateRoute><ProjectDetails /></PrivateRoute>} />
            <Route path="/project/new" element={<PrivateRoute><ProjectForm /></PrivateRoute>} />

            <Route path="/:projectId/:taskId" element={<PrivateRoute><TaskCart /></PrivateRoute>} />
            <Route path="/home" element={<PrivateRoute><HomePage/></PrivateRoute>}/>
            <Route path="/teams" element={<PrivateRoute><TeamList /></PrivateRoute>} />
            <Route path="/team/new" element={<PrivateRoute><CreateTeamForm /></PrivateRoute>} />
            <Route path="/select-team" element={<PrivateRoute><SelectTeam /></PrivateRoute>} />
            <Route path="/teams/:teamId" element={<PrivateRoute><TeamDetails /></PrivateRoute>} />
            <Route path="/user/profile" element={<PrivateRoute><Profile/></PrivateRoute>}/>
            <Route path="/setting" element={<PrivateRoute><Setting/></PrivateRoute>}/>
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
