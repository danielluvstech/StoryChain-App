import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchStories, createStory, finishStory, deleteStory, _markDeleting, _markFinishing, _unmarkDeleting, _unmarkFinishing } from "../features/stories/storiesSlice";

export default function StoriesList() {
  const dispatch = useAppDispatch();
  const { items, loading, error, creating, finishingIds, deletingIds } = useAppSelector(s => s.stories);
  const user = useAppSelector(s => s.auth.user);
  const [title, setTitle] = useState("");

  useEffect(() => { dispatch(fetchStories()); }, [dispatch]);

  async function onCreate() {
    if (!title.trim()) return;
    await dispatch(createStory(title.trim()));
    setTitle("");
  }

  async function onFinish(id: number) {
    dispatch(_markFinishing(id));
    await dispatch(finishStory(id));
    dispatch(_unmarkFinishing(id));
  }

  async function onDelete(id: number) {
    dispatch(_markDeleting(id));
    await dispatch(deleteStory(id));
    dispatch(_unmarkDeleting(id));
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <h2>Stories</h2>
      {error && <div style={{ color: "crimson" }}>{error}</div>}

      <div style={{ display: "flex", gap: 8 }}>
        <input placeholder="New story title" value={title} onChange={(e) => setTitle(e.target.value)} disabled={creating}/>
        <button onClick={onCreate} disabled={!title.trim() || creating}>{creating ? "Creating..." : "Create"}</button>
        <button onClick={() => dispatch(fetchStories())} disabled={loading}>{loading ? "Refreshing..." : "Refresh"}</button>
      </div>

      <ul style={{ display: "grid", gap: 8, padding: 0 }}>
        {items.map((s) => {
          const isOwner = s.created_by === user?.id;
          const finishing = finishingIds.includes(s.id);
          const deleting = deletingIds.includes(s.id);
          return (
            <li key={s.id} style={{ listStyle: "none", display: "flex", alignItems: "center", gap: 10 }}>
              <Link to={`/stories/${s.id}`}>{s.title}</Link>
              <span style={{ padding: "2px 6px", border: "1px solid #ccc", borderRadius: 6, fontSize: 12 }}>
                {s.status}
              </span>
              {isOwner && s.status === "ongoing" && (
                <>
                  <button onClick={() => onFinish(s.id)} disabled={finishing || deleting}>
                    {finishing ? "Finishing..." : "Finish"}
                  </button>
                  <button onClick={() => onDelete(s.id)} disabled={finishing || deleting}>
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                </>
              )}
              {isOwner && s.status === "finished" && (
                <button onClick={() => onDelete(s.id)} disabled={deleting}>
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}