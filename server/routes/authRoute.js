import express from "express";
import {
  googleSignIn,
  signin,
  signup,
  changePassword,
} from "../controllers/authController.js";
import verifyJWT from "../Middleware/verifyJWT.js";

const router = express.Router();

// POST /api/auth/signup - Register a new user
router.post("/signup", signup);

// POST /api/auth/signin - Authenticate an existing user
router.post("/signin", signin);

// POST /api/auth/google-signin - Authenticate for google user
router.post("/google-signin", googleSignIn);

// POST /api/auth/change-password - change password
router.post("/change-password", verifyJWT, changePassword);

export default router;
