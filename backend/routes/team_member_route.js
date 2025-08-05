import express from "express";
import {
  getAllTeamMembers,
  getSingleTeamMember,
  updateTeamMemberRole,
  getMyTeams,
  removeUserFromTeam,
  addUserToTeam
} from "../controller/teamMemberController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import verifyRole from "../middleware/verifyRole.js";
import { preventDemoEdits } from "../middleware/preventDemoEdits.js";

const router = express.Router();

router.get("/my-teams", authMiddleware, getMyTeams);

router.get("/:teamId", authMiddleware, verifyRole("admin", "team_lead"), getAllTeamMembers);

router.get("/:teamId/:userId", authMiddleware, verifyRole("admin", "team_lead"), getSingleTeamMember);


router.delete("/:teamId/members/:userId", authMiddleware, verifyRole("admin", "team_lead"), preventDemoEdits, removeUserFromTeam);
router.post("/:teamId/members", authMiddleware, verifyRole("admin", "team_lead"), preventDemoEdits, addUserToTeam);
router.patch("/:teamId/:userId/role", authMiddleware, verifyRole("admin", "team_lead"), preventDemoEdits, updateTeamMemberRole);

export default router;
