const express = require("express");
const { registerUser, loginUser, me } = require("../controllers/auth.controller");
const { authGuard } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", authGuard, me);

module.exports = router;