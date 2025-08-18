const verifyRole = (...allowedRoles) => {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      console.log("No user info in request");
      return res.status(401).json({ message: "Unauthorized: No user information found" });
    }

    const role = user.role || "unknown";
    

    if (user.isAdmin && allowedRoles.includes("admin")) {
      console.log(" Admin access granted");
      return next();
    }

    if (allowedRoles.includes(role)) {
      console.log(`Access granted for role: ${role}`);
      return next();
    }

    console.log("Access denied: role not allowed");
    return res.status(403).json({ message: "Forbidden: You do not have permission" });
  };
};

export default verifyRole;
