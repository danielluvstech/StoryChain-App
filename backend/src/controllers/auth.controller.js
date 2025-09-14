const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Users = require("../models/users.model");

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || "dev", { expiresIn: "1h" });
}

module.exports.registerUser = async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ message: "username and password required" });

    const exists = await Users.findByUsername(username);
    if (exists) return res.status(409).json({ message: "username already taken" });

    const password_hash = await bcrypt.hash(password, 10);
    const user = await Users.createUser({ username, password_hash });

    const accessToken = signToken(user.id);
    res.status(201).json({ user: { id: user.id, username: user.username }, accessToken });
  } catch (err) {
    console.error("register error:", err);
    res.status(500).json({ message: "server error" });
  }
};

module.exports.loginUser = async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ message: "username and password required" });

    const user = await Users.findByUsername(username);
    if (!user) return res.status(400).json({ message: "user not found" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(400).json({ message: "invalid password" });

    const accessToken = signToken(user.id);
    res.json({ user: { id: user.id, username: user.username }, accessToken });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ message: "server error" });
  }
};

module.exports.me = async (req, res) => {
  res.json({ user: { id: req.user.id } });
};