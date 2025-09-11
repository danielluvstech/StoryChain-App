const express = require("express");
const { registerUser, loginUser, me } = require("../controllers/auth.controller");
const { authGuard } = require("../middleware/auth.middleware");

const router = express.Router();

// POST /api/auth/register
router.post("/register", registerUser);

// POST /api/auth/login
router.post("/login", loginUser);

// GET /api/auth/me  (protected)
router.get("/me", authGuard, me);

module.exports = router;
