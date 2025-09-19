import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  addParagraph,
  fetchParticipants,
  fetchStoryWithParagraphs,
  joinStory,
  leaveStory,
} from "../features/storyDetail/storyDetailSlice";
import { Button, Input, Badge } from "../components/ui";

export default function StoryDetail() {
  const { id } = useParams();
  const storyId = Number(id);
  const dispatch = useAppDispatch();

  const { story, paragraphs, participants, loading, error } = useAppSelector(
    (s) => s.storyDetail
  );
  const user = useAppSelector((s) => s.auth.user);

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
    <div className="grid gap-6">
      <div className="flex items-center justify-center gap-3">
        <h2 className="text-3xl font-extrabold text-center">
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {story.title}
          </span>
        </h2>
        <Badge tone={story.status === "finished" ? "green" : "yellow"}>
          {story.status}
        </Badge>
      </div>

      {(error || err) && (
        <div className="text-red-600 text-center">{error || err}</div>
      )}

      <section className="grid gap-2">
        <h3 className="font-semibold text-center">Participants</h3>
        {participants.length === 0 ? (
          <div className="text-gray-700 text-center">No participants yet</div>
        ) : (
          <ol className="list-decimal list-inside grid gap-1 bg-white/80 backdrop-blur rounded-xl border px-4 py-3">
            {participants.map((p) => (
              <li key={p.id} className="flex items-center gap-2">
                <span className="font-mono mr-1">#{p.join_order}</span>
                <span>
                  {p.username} {p.user_id === user?.id ? <em>(you)</em> : null}
                </span>
              </li>
            ))}
          </ol>
        )}

        {story.status === "ongoing" && (
          <div className="flex items-center justify-center gap-2 mt-2">
            {!isParticipant ? (
              <Button onClick={onJoin}>Join story</Button>
            ) : (
              <Button variant="ghost" onClick={onLeave}>
                Leave story
              </Button>
            )}
          </div>
        )}
      </section>

      <section className="grid gap-3">
        <h3 className="font-semibold text-center">Story</h3>
        <ol className="grid gap-3">
          {paragraphs.map((p) => (
            <li
              key={p.id}
              className="list-decimal list-inside bg-white/80 backdrop-blur border rounded-xl px-4 py-3"
            >
              <div className="text-sm text-gray-600">
                <strong>#{p.order_index}</strong> (user {p.user_id})
              </div>
              <div className="mt-1 whitespace-pre-wrap">{p.text}</div>
            </li>
          ))}
        </ol>
      </section>

      {canContribute && (
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Input
              placeholder="Add your paragraph…"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
          <Button onClick={onAddParagraph} disabled={!text.trim()}>
            Add
          </Button>
        </div>
      )}

      {!isParticipant && story.status === "ongoing" && (
        <div className="text-gray-700 text-center">
          Join the story to contribute your next paragraph.
        </div>
      )}
    </div>
  );
}