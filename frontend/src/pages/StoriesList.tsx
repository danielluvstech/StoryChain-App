import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../auth/AuthContext";

type Story = {
  id: number;
  title: string;
  status: "ongoing" | "finished";
  created_by: number; // comes from backend list
};

export default function StoriesList() {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [title, setTitle] = useState("");
  const [err, setErr] = useState("");
  const [loadingList, setLoadingList] = useState(false);
  const [creating, setCreating] = useState(false);
  const [finishingIds, setFinishingIds] = useState<Set<number>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());

  async function loadStories() {
    setLoadingList(true);
    setErr("");
    try {
      const { data } = await api.get<Story[]>("/api/stories?limit=50&offset=0");
      setStories(data);
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Failed to load stories");
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    loadStories();
  }, []);

  async function createStory() {
    if (!title.trim()) return;
    setCreating(true);
    setErr("");
    try {
      const { data } = await api.post<Story>("/api/stories", { title: title.trim() });
      setStories((s) => [data, ...s]);
      setTitle("");
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Create failed");
    } finally {
      setCreating(false);
    }
  }

  async function finishStory(id: number) {
    setErr("");
    setFinishingIds((prev) => new Set(prev).add(id));
    try {
      await api.patch(`/api/stories/${id}/finish`);
      setStories((s) => s.map((st) => (st.id === id ? { ...st, status: "finished" } : st)));
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Finish failed");
    } finally {
      setFinishingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  async function deleteStory(id: number) {
    setErr("");
    setDeletingIds((prev) => new Set(prev).add(id));
    try {
      await api.delete(`/api/stories/${id}`);
      setStories((s) => s.filter((st) => st.id !== id));
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Delete failed");
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <h2>Stories</h2>

      {err && <div style={{ color: "crimson" }}>{err}</div>}

      <div style={{ display: "flex", gap: 8 }}>
        <input
          placeholder="New story title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={creating}
        />
        <button onClick={createStory} disabled={!title.trim() || creating}>
          {creating ? "Creating..." : "Create"}
        </button>
        <button onClick={loadStories} disabled={loadingList}>
          {loadingList ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <ul style={{ display: "grid", gap: 8, padding: 0 }}>
        {stories.map((s) => {
          const isOwner = s.created_by === user?.id;
          const finishing = finishingIds.has(s.id);
          const deleting = deletingIds.has(s.id);
          return (
            <li
              key={s.id}
              style={{
                listStyle: "none",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <Link to={`/stories/${s.id}`}>{s.title}</Link>
              <span
                style={{
                  padding: "2px 6px",
                  border: "1px solid #ccc",
                  borderRadius: 6,
                  fontSize: 12,
                }}
              >
                {s.status}
              </span>

              {/* Owner-only actions */}
              {isOwner && s.status === "ongoing" && (
                <>
                  <button onClick={() => finishStory(s.id)} disabled={finishing || deleting}>
                    {finishing ? "Finishing..." : "Finish"}
                  </button>
                  <button onClick={() => deleteStory(s.id)} disabled={finishing || deleting}>
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                </>
              )}

              {/* Allow delete even if finished, owner only */}
              {isOwner && s.status === "finished" && (
                <button onClick={() => deleteStory(s.id)} disabled={deleting}>
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