import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useParams } from "react-router-dom";

type Paragraph = { id: number; text: string; order_index: number; user_id: number };
type Story = { id: number; title: string; status: "ongoing" | "finished" };

export default function StoryDetail() {
  const { id } = useParams();
  const [story, setStory] = useState<Story | null>(null);
  const [paragraphs, setParagraphs] = useState<Paragraph[]>([]);
  const [text, setText] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    api.get(`/api/stories/${id}?include=paragraphs`).then((res) => {
      setStory(res.data.story);
      setParagraphs(res.data.paragraphs);
    });
  }, [id]);

  async function addParagraph() {
    try {
      const { data } = await api.post(`/api/stories/${id}/paragraphs`, { text });
      setParagraphs((p) => [...p, data]);
      setText("");
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Add failed");
    }
  }

  if (!story) return <div>Loading...</div>;

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <h2>{story.title}</h2>
      {err && <div style={{ color: "crimson" }}>{err}</div>}
      <ol>
        {paragraphs.map((p) => (
          <li key={p.id} style={{ marginBottom: 8 }}>
            <div><strong>#{p.order_index}</strong> (user {p.user_id})</div>
            <div>{p.text}</div>
          </li>
        ))}
      </ol>

      {story.status === "ongoing" && (
        <div style={{ display: "flex", gap: 8 }}>
          <input
            placeholder="Add your paragraph…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button onClick={addParagraph} disabled={!text.trim()}>Add</button>
        </div>
      )}
    </div>
  );
}