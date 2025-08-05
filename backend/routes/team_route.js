import express from "express";
import {
  createTeam,
  getAllTeams,
  updateTeam,
  getTeamById,
  addUserToTeam,
  deleteTeam,
  removeUserFromTeam,

 
} from "../controller/teamController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import verifyRole from "../middleware/verifyRole.js";
import { preventDemoEdits } from "../middleware/preventDemoEdits.js";

const router = express.Router();

router.post("/", authMiddleware, verifyRole("admin"), createTeam);
router.get("/", authMiddleware, verifyRole("admin", "team_lead"), getAllTeams);
router.get("/:id", authMiddleware, verifyRole("admin", "team_lead", "team_member"), getTeamById);

router.post("/:id/members", authMiddleware, verifyRole("admin", "team_lead"), addUserToTeam);
router.delete("/:id/members/:userId", authMiddleware, verifyRole("admin", "team_lead"), preventDemoEdits, removeUserFromTeam);

router.patch("/:id", authMiddleware, verifyRole("admin", "team_lead"), preventDemoEdits, updateTeam);
router.delete("/:id", authMiddleware, verifyRole("admin"), preventDemoEdits, deleteTeam);

export default router;
