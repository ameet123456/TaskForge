export const preventDemoEdits = (req, res, next) => {
    if (req.user?.email === "admin@test.com") {
      return res.status(403).json({ message: "Demo user cannot do this!" });
    }
    next();
  };
  