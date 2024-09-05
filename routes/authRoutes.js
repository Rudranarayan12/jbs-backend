import express from "express";
import {
  login,
  mobileLogin,
  register,
  sendOtp,
  subAdminLogin,
  userRegistration,
  validateOtp,
} from "../controllers/authControllers.js";

const router = express.Router();

router.post("/login", login);
router.post("/subadmin-login", subAdminLogin);
router.post("/register", register);
router.post("/create-or-update-user", userRegistration);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", validateOtp);
router.post("/mobile-login", mobileLogin);
export default router;
