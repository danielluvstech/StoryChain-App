const { Stories, Participants, Paragraphs } = require("../models");

// helpers
function parseLimitOffset(req) {
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
  const offset = Math.max(0, Number(req.query.offset) || 0);
  return { limit, offset };
}
function parseId(param) {
  const id = Number(param);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// -------- Stories --------
exports.createStory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title } = req.body || {};
    if (!title || title.trim().length < 1 || title.length > 120) {
      return res.status(400).json({ message: "title 1-120 chars required" });
    }
    const story = await Stories.createStory({ title: title.trim(), created_by: userId });
    // auto-join creator as participant with join_order = 1
    await Participants.addParticipant({ story_id: story.id, user_id: userId, join_order: 1 });
    res.status(201).json(story);
  } catch (e) {
    console.error("createStory", e);
    res.status(500).json({ message: "server error" });
  }
};

exports.listOngoing = async (req, res) => {
  try {
    const { limit, offset } = parseLimitOffset(req);
    const rows = await Stories.listOngoing({ limit, offset });
    res.json(rows);
  } catch (e) {
    console.error("listOngoing", e);
    res.status(500).json({ message: "server error" });
  }
};

exports.listFinished = async (req, res) => {
  try {
    const { limit, offset } = parseLimitOffset(req);
    const rows = await Stories.listFinished({ limit, offset });
    res.json(rows);
  } catch (e) {
    console.error("listFinished", e);
    res.status(500).json({ message: "server error" });
  }
};

exports.getStory = async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: "invalid id" });

    const story = await Stories.findById(id);
    if (!story) return res.status(404).json({ message: "story not found" });

    if (req.query.include === "paragraphs") {
      const paragraphs = await Paragraphs.listByStoryOrdered(id);
      return res.json({ story, paragraphs });
    }
    res.json(story);
  } catch (e) {
    console.error("getStory", e);
    res.status(500).json({ message: "server error" });
  }
};

exports.finishStory = async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: "invalid id" });

    const story = await Stories.findById(id);
    if (!story) return res.status(404).json({ message: "story not found" });
    if (story.created_by !== req.user.id) {
      return res.status(403).json({ message: "only owner can finish" });
    }

    const updated = await Stories.finishStory(id);
    res.json(updated || { message: "already finished" });
  } catch (e) {
    console.error("finishStory", e);
    res.status(500).json({ message: "server error" });
  }
};

exports.deleteStory = async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: "invalid id" });

    const story = await Stories.findById(id);
    if (!story) return res.status(404).json({ message: "story not found" });
    if (story.created_by !== req.user.id) {
      return res.status(403).json({ message: "only owner can delete" });
    }

    await Stories.deleteStory(id);
    res.status(204).end();
  } catch (e) {
    console.error("deleteStory", e);
    res.status(500).json({ message: "server error" });
  }
};

// -------- Participants --------
exports.getParticipants = async (req, res) => {
  try {
    const storyId = parseId(req.params.id);
    if (!storyId) return res.status(400).json({ message: "invalid id" });

    const story = await Stories.findById(storyId);
    if (!story) return res.status(404).json({ message: "story not found" });

    const rows = await Participants.listWithUsersByStory(storyId);
    res.json(rows);
  } catch (e) {
    console.error("getParticipants", e);
    res.status(500).json({ message: "server error" });
  }
};

exports.joinStory = async (req, res) => {
  try {
    const storyId = parseId(req.params.id);
    const userId = req.user.id;
    if (!storyId) return res.status(400).json({ message: "invalid id" });

    const story = await Stories.findById(storyId);
    if (!story) return res.status(404).json({ message: "story not found" });
    if (story.status === "finished") {
      return res.status(403).json({ message: "story is finished" });
    }

    const already = await Participants.isParticipant({ story_id: storyId, user_id: userId });
    if (already) return res.status(409).json({ message: "already a participant" });

    const join_order = await Participants.nextJoinOrder(storyId);
    const added = await Participants.addParticipant({ story_id: storyId, user_id: userId, join_order });
    res.status(201).json(added);
  } catch (e) {
    console.error("joinStory", e);
    res.status(500).json({ message: "server error" });
  }
};

exports.leaveStory = async (req, res) => {
  try {
    const storyId = parseId(req.params.id);
    const userId = req.user.id;
    if (!storyId) return res.status(400).json({ message: "invalid id" });

    const story = await Stories.findById(storyId);
    if (!story) return res.status(404).json({ message: "story not found" });

    const isPart = await Participants.isParticipant({ story_id: storyId, user_id: userId });
    if (!isPart) return res.status(404).json({ message: "not a participant" });

    await Participants.removeParticipant({ story_id: storyId, user_id: userId });
    res.status(204).end();
  } catch (e) {
    console.error("leaveStory", e);
    res.status(500).json({ message: "server error" });
  }
};