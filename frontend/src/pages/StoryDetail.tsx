import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

type Paragraph = { id: number; text: string; order_index: number; user_id: number };
type Story = { id: number; title: string; status: "ongoing" | "finished"; created_by?: number };
type Participant = {
  id: number;
  story_id: number;
  user_id: number;
  join_order: number;
  username: string;
};

export default function StoryDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const storyId = Number(id);

  const [story, setStory] = useState<Story | null>(null);
  const [paragraphs, setParagraphs] = useState<Paragraph[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [text, setText] = useState("");
  const [err, setErr] = useState("");

  const isParticipant = useMemo(
    () => participants.some((p) => p.user_id === user?.id),
    [participants, user]
  );

  async function loadAll() {
    try {
      const [detailRes, partsRes] = await Promise.all([
        api.get(`/api/stories/${storyId}?include=paragraphs`),
        api.get<Participant[]>(`/api/stories/${storyId}/participants`),
      ]);
      setStory(detailRes.data.story);
      setParagraphs(detailRes.data.paragraphs);
      setParticipants(partsRes.data);
    } catch {
      setErr("Failed to load story");
    }
  }

  useEffect(() => {
    if (!Number.isFinite(storyId)) return;
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storyId]);

  async function addParagraph() {
    setErr("");
    try {
      const { data } = await api.post(`/api/stories/${storyId}/paragraphs`, { text });
      setParagraphs((p) => [...p, data]);
      setText("");
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Add failed";
      const expected = e?.response?.data?.expectedJoinOrder;
      setErr(expected ? `${msg}. Expected turn order: ${expected}` : msg);
    }
  }

  async function joinStory() {
    setErr("");
    try {
      await api.post(`/api/stories/${storyId}/join`);
      await loadAll();
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Join failed");
    }
  }

  async function leaveStory() {
    setErr("");
    try {
      await api.delete(`/api/stories/${storyId}/participants/me`);
      await loadAll();
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Leave failed");
    }
  }

  if (!story) return <div>Loading...</div>;

  const canContribute = story.status === "ongoing" && isParticipant;

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>{story.title}</h2>
        <span
          style={{
            padding: "2px 6px",
            border: "1px solid #ccc",
            borderRadius: 6,
          }}
        >
          {story.status}
        </span>
      </div>

      {err && <div style={{ color: "crimson" }}>{err}</div>}

      <section>
        <h3>Participants</h3>
        {participants.length === 0 ? (
          <div>No participants yet</div>
        ) : (
          <ol>
            {participants.map((p) => (
              <li key={p.id}>
                #{p.join_order} — {p.username} {p.user_id === user?.id ? "(you)" : ""}
              </li>
            ))}
          </ol>
        )}

        {story.status === "ongoing" && (
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            {!isParticipant ? (
              <button onClick={joinStory}>Join story</button>
            ) : (
              <button onClick={leaveStory}>Leave story</button>
            )}
          </div>
        )}
      </section>

      <section>
        <h3>Story</h3>
        <ol>
          {paragraphs.map((p) => (
            <li key={p.id} style={{ marginBottom: 8 }}>
              <div>
                <strong>#{p.order_index}</strong> (user {p.user_id})
              </div>
              <div>{p.text}</div>
            </li>
          ))}
        </ol>
      </section>

      {canContribute && (
        <div style={{ display: "flex", gap: 8 }}>
          <input
            placeholder="Add your paragraph…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button onClick={addParagraph} disabled={!text.trim()}>
            Add
          </button>
        </div>
      )}

      {!isParticipant && story.status === "ongoing" && (
        <div style={{ color: "#555" }}>
          Join the story to contribute your next paragraph.
        </div>
      )}
    </div>
  );
}