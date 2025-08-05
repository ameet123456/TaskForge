import express from "express";
import { createTask, getAllTasks, getTask, updateTask, deleteTask } from "../controller/taskController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import verifyRole from "../middleware/verifyRole.js";
import verifyTeamAccess from "../middleware/verifyTeamAccess.js"; 
import { preventDemoEdits } from "../middleware/preventDemoEdits.js";

const router = express.Router();

router.post("/", authMiddleware,verifyRole('team_lead', 'admin', 'team_member') , createTask);
router.get("/", authMiddleware, getAllTasks,verifyTeamAccess);
router.get("/:id", authMiddleware, getTask,verifyTeamAccess);
router.delete("/:id", authMiddleware, verifyRole('team_lead', 'admin'), preventDemoEdits, deleteTask);

router.put("/:id", authMiddleware, verifyRole("team_lead", "admin", "team_member"), preventDemoEdits, updateTask);

export default router;
