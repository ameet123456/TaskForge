  import express from "express";
import {
  createOrganization,
  getAllOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization
} from "../controller/orgController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import verifyRole from "../middleware/verifyRole.js";

const router = express.Router();

router.post("/", authMiddleware, verifyRole("admin"), createOrganization);
router.get("/:id", authMiddleware, verifyRole("admin", "team_lead"), getOrganizationById);
router.patch("/:id", authMiddleware, verifyRole("admin"), updateOrganization);
router.delete("/:id", authMiddleware, verifyRole("admin"), deleteOrganization);

export default router;
