const jwt = require("jsonwebtoken");

module.exports.authGuard = (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: "missing token" });

    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev");
    req.user = { id: payload.id };
    next();
  } catch {
    return res.status(401).json({ message: "invalid or expired token" });
  }
};