import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Link } from "react-router-dom";

type Story = { id: number; title: string; status: "ongoing" | "finished" };

export default function StoriesList() {
  const [stories, setStories] = useState<Story[]>([]);
  const [title, setTitle] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    api.get<Story[]>("/api/stories").then(res => setStories(res.data));
  }, []);

  async function createStory() {
    try {
      const { data } = await api.post<Story>("/api/stories", { title });
      setStories((s) => [data, ...s]);
      setTitle("");
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Create failed");
    }
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <h2>Stories</h2>
      {err && <div style={{ color: "crimson" }}>{err}</div>}

      <div style={{ display: "flex", gap: 8 }}>
        <input placeholder="New story title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <button onClick={createStory} disabled={!title.trim()}>Create</button>
      </div>

      <ul style={{ display: "grid", gap: 6, padding: 0 }}>
        {stories.map((s) => (
          <li key={s.id} style={{ listStyle: "none" }}>
            <Link to={`/stories/${s.id}`}>{s.title}</Link> {s.status === "finished" && "🏁"}
          </li>
        ))}
      </ul>
    </div>
  );
}