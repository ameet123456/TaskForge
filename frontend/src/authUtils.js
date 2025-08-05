export const isAuthenticated = () => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  };
  
  export const logout = (navigate) => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };
  