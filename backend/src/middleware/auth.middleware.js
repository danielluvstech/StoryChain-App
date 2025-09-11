const jwt = require("jsonwebtoken");

// When we switch to DB later, we'll fetch the user from DB.
// For now, we'll decode and return a minimal user object.
module.exports.authGuard = (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: "missing token" });

    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev");
    // Attach a minimal user object; later we'll query DB for full user
    req.user = { id: payload.id };
    next();
  } catch (err) {
    return res.status(401).json({ message: "invalid or expired token" });
  }
};
