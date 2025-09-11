const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Temporary in-memory user store (replaced by DB in feature/db-schema)
const users = []; // { id, username, passwordHash }

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || "dev", { expiresIn: "1h" });
}

module.exports.registerUser = async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ message: "username and password required" });
    }

    const exists = users.find(u => u.username === username);
    if (exists) {
      return res.status(409).json({ message: "username already taken" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = { id: users.length + 1, username, passwordHash };
    users.push(newUser);

    const accessToken = signToken(newUser.id);
    return res.status(201).json({
      user: { id: newUser.id, username: newUser.username },
      accessToken
    });
  } catch (err) {
    console.error("register error:", err);
    return res.status(500).json({ message: "server error" });
  }
};

module.exports.loginUser = async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ message: "username and password required" });
    }

    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(400).json({ message: "invalid password" });
    }

    const accessToken = signToken(user.id);
    return res.json({
      user: { id: user.id, username: user.username },
      accessToken
    });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ message: "server error" });
  }
};

module.exports.me = async (req, res) => {
  // req.user is set by authGuard
  return res.json({ user: req.user });
};