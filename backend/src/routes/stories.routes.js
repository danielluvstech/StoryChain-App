const express = require("express");
const ctrl = require("../controllers/stories.controller");
const router = express.Router();

router.post("/", ctrl.createStory);
router.get("/", ctrl.listOngoing);
router.get("/finished", ctrl.listFinished);
router.get("/:id", ctrl.getStory);
router.patch("/:id/finish", ctrl.finishStory);
router.delete("/:id", ctrl.deleteStory);

module.exports = router;