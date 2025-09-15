const express = require("express");
const ctrl = require("../controllers/stories.controller");
const router = express.Router();

router.post("/", ctrl.createStory);
router.get("/", ctrl.listOngoing);
router.get("/finished", ctrl.listFinished);
router.get("/:id", ctrl.getStory);
router.patch("/:id/finish", ctrl.finishStory);
router.delete("/:id", ctrl.deleteStory);
// Participants endpoints
router.get("/:id/participants", ctrl.getParticipants);            // list participants (join_order asc)
router.post("/:id/join", ctrl.joinStory);                         // current user joins
router.delete("/:id/participants/me", ctrl.leaveStory);           // current user leaves

module.exports = router;