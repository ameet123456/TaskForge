import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRoutes from "./routes/user_route.js";
import taskRoutes from "./routes/task_route.js";
import teamRoutes from "./routes/team_route.js";  
import teamMemberRoutes from "./routes/team_member_route.js";
import projectRoutes from "./routes/project_route.js";

import "./config/passportConfig.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(express.json());
app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));

app.use(session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
}));

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/team-members", teamMemberRoutes);
app.use("/api/projects", projectRoutes);

    
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: "Something went wrong!" });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
