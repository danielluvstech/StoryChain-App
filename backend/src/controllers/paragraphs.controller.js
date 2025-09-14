const { Stories, Participants, Paragraphs } = require("../models");

function parseId(param) {
  const id = Number(param);
  return Number.isInteger(id) && id > 0 ? id : null;
}

exports.listParagraphs = async (req, res) => {
  try {
    const storyId = parseId(req.params.id);
    if (!storyId) return res.status(400).json({ message: "invalid story id" });

    const story = await Stories.findById(storyId);
    if (!story) return res.status(404).json({ message: "story not found" });

    const rows = await Paragraphs.listByStoryOrdered(storyId);
    res.json(rows);
  } catch (e) {
    console.error("listParagraphs", e);
    res.status(500).json({ message: "server error" });
  }
};

exports.addParagraph = async (req, res) => {
  try {
    const userId = req.user.id;
    const storyId = parseId(req.params.id);
    const text = (req.body?.text || "").trim();

    if (!storyId) return res.status(400).json({ message: "invalid story id" });
    if (text.length < 1 || text.length > 2000) {
      return res.status(400).json({ message: "text 1-2000 chars required" });
    }

    const story = await Stories.findById(storyId);
    if (!story) return res.status(404).json({ message: "story not found" });
    if (story.status === "finished") {
      return res.status(403).json({ message: "story is finished" });
    }

    const isPart = await Participants.isParticipant({ story_id: storyId, user_id: userId });
    if (!isPart) return res.status(403).json({ message: "not a participant" });

    const participants = await Participants.listByStory(storyId);
    const N = participants.length;
    if (N === 0) return res.status(500).json({ message: "no participants for story" });

    const userJoin = await Participants.getJoinOrder({ story_id: storyId, user_id: userId });
    if (!userJoin) return res.status(403).json({ message: "not a participant" });

    const last = await Paragraphs.lastParagraph(storyId);
    const expected = last ? ((last.order_index % N) + 1) : 1;

    if (userJoin !== expected) {
      return res.status(403).json({ message: "not your turn", expectedJoinOrder: expected });
    }

    const created = await Paragraphs.addParagraph({ story_id: storyId, user_id: userId, text });
    res.status(201).json(created);
  } catch (e) {
    console.error("addParagraph", e);
    res.status(500).json({ message: "server error" });
  }
};