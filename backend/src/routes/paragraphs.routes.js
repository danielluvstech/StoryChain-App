const express = require("express");
const ctrl = require("../controllers/paragraphs.controller");

const router = express.Router({ mergeParams: true });

// GET /api/stories/:id/paragraphs → list paragraphs ordered
router.get("/", ctrl.listParagraphs);

// POST /api/stories/:id/paragraphs → add new paragraph (turn-enforced)
router.post("/", ctrl.addParagraph);

module.exports = router;