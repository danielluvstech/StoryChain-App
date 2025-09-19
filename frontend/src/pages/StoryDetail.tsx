import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { addParagraph, fetchParticipants, fetchStoryWithParagraphs, joinStory, leaveStory } from "../features/storyDetail/storyDetailSlice";

export default function StoryDetail() {
  const { id } = useParams();
  const storyId = Number(id);
  const dispatch = useAppDispatch();

  const { story, paragraphs, participants, loading, error } = useAppSelector(s => s.storyDetail);
  const user = useAppSelector(s => s.auth.user);

  const [text, setText] = useState("");
  const [err, setErr] = useState("");

  const isParticipant = useMemo(
    () => participants.some((p) => p.user_id === user?.id),
    [participants, user]
  );

  useEffect(() => {
    if (!Number.isFinite(storyId)) return;
    dispatch(fetchStoryWithParagraphs(storyId));
    dispatch(fetchParticipants(storyId));
  }, [dispatch, storyId]);

  async function onAddParagraph() {
    setErr("");
    const action = await dispatch(addParagraph({ storyId, text }));
    if (addParagraph.fulfilled.match(action)) {
      setText("");
    } else {
      const payload: any = action.payload;
      const msg = payload?.message || "Add failed";
      const expected = payload?.expectedJoinOrder;
      setErr(expected ? `${msg}. Expected turn order: ${expected}` : msg);
    }
  }

  async function onJoin() {
    setErr("");
    const a = await dispatch(joinStory(storyId));
    if (joinStory.fulfilled.match(a)) dispatch(fetchParticipants(storyId));
    else setErr(String(a.payload || "Join failed"));
  }

  async function onLeave() {
    setErr("");
    const a = await dispatch(leaveStory(storyId));
    if (leaveStory.fulfilled.match(a)) dispatch(fetchParticipants(storyId));
    else setErr(String(a.payload || "Leave failed"));
  }

  if (loading && !story) return <div>Loading...</div>;
  if (!story) return <div>Not found</div>;

  const canContribute = story.status === "ongoing" && isParticipant;

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>{story.title}</h2>
        <span style={{ padding: "2px 6px", border: "1px solid #ccc", borderRadius: 6 }}>{story.status}</span>
      </div>

      {(error || err) && <div style={{ color: "crimson" }}>{error || err}</div>}

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
              <button onClick={onJoin}>Join story</button>
            ) : (
              <button onClick={onLeave}>Leave story</button>
            )}
          </div>
        )}
      </section>

      <section>
        <h3>Story</h3>
        <ol>
          {paragraphs.map((p) => (
            <li key={p.id} style={{ marginBottom: 8 }}>
              <div><strong>#{p.order_index}</strong> (user {p.user_id})</div>
              <div>{p.text}</div>
            </li>
          ))}
        </ol>
      </section>

      {canContribute && (
        <div style={{ display: "flex", gap: 8 }}>
          <input placeholder="Add your paragraph…" value={text} onChange={(e) => setText(e.target.value)} />
          <button onClick={onAddParagraph} disabled={!text.trim()}>Add</button>
        </div>
      )}

      {!isParticipant && story.status === "ongoing" && (
        <div style={{ color: "#555" }}>Join the story to contribute your next paragraph.</div>
      )}
    </div>
  );
}