import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import verifyRole from "../middleware/verifyRole.js";
import verifyTeamAccess from "../middleware/verifyTeamAccess.js"; 
import { preventDemoEdits } from "../middleware/preventDemoEdits.js";
import {
  createProject,
  getProject,
  getProjectById,
  editProject
} from "../controller/projectController.js";
const router = express.Router();
router.post("/", authMiddleware, verifyRole("team_lead","admin"), createProject);
router.get("/", authMiddleware, verifyRole("team_lead", "team_member","team_member"), getProject);
router.get("/:id",
  authMiddleware,
  verifyRole("team_lead", "admin"),
  verifyTeamAccess, 
  getProjectById
);
router.put("/", authMiddleware, verifyRole("team_lead", "admin"), preventDemoEdits, editProject);

export default router;
