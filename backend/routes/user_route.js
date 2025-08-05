import express from "express";
import {
  registerUser,
  loginUser,
  googleAuth,
  googleCallback,
  logoutUser,
  getAllUsers
} from "../controller/authController.js";

import passport from "passport";
import authMiddleware from "../middleware/authMiddleware.js";
import verifyRole from "../middleware/verifyRole.js";

const router = express.Router();

router.get("/auth/google", googleAuth);
router.get("/auth/google/callback", passport.authenticate("google", { session: false }), googleCallback);

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);

router.get("/", authMiddleware, verifyRole("admin", "team_lead"), getAllUsers);

export default router;
