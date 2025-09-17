import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchStories,
  createStory as createStoryThunk,
  finishStory as finishStoryThunk,
  deleteStory as deleteStoryThunk,
  _markDeleting,
  _markFinishing,
  _unmarkDeleting,
  _unmarkFinishing,
} from "../features/stories/storiesSlice";
import { Button, Input, Badge } from "../components/ui";

export default function StoriesList() {
  const dispatch = useAppDispatch();
  const { items, loading, error, creating, finishingIds, deletingIds } =
    useAppSelector((s) => s.stories);
  const user = useAppSelector((s) => s.auth.user);

  const [title, setTitle] = useState("");

  useEffect(() => {
    dispatch(fetchStories());
  }, [dispatch]);

  async function onCreate() {
    if (!title.trim()) return;
    await dispatch(createStoryThunk(title.trim()));
    setTitle("");
  }

  async function onFinish(id: number) {
    dispatch(_markFinishing(id));
    await dispatch(finishStoryThunk(id));
    dispatch(_unmarkFinishing(id));
  }

  async function onDelete(id: number) {
    dispatch(_markDeleting(id));
    await dispatch(deleteStoryThunk(id));
    dispatch(_unmarkDeleting(id));
  }

  return (
    <div className="grid gap-5">
      <h2 className="text-3xl font-extrabold text-center">
        <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Stories
        </span>
      </h2>

      {error && (
        <div className="text-red-600 text-center">{error}</div>
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1">
          <Input
            placeholder="New story title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={creating}
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={onCreate} disabled={!title.trim() || creating}>
            {creating ? "Creating..." : "Create"}
          </Button>
          <Button
            variant="ghost"
            onClick={() => dispatch(fetchStories())}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      <ul className="grid gap-3 p-0">
        {items.map((s) => {
          const isOwner = s.created_by === user?.id;
          const finishing = finishingIds.includes(s.id);
          const deleting = deletingIds.includes(s.id);
          return (
            <li
              key={s.id}
              className="list-none flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border bg-white/80 backdrop-blur px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <Link
                  to={`/stories/${s.id}`}
                  className="font-semibold hover:underline"
                >
                  {s.title}
                </Link>
                <Badge tone={s.status === "finished" ? "green" : "yellow"}>
                  {s.status}
                </Badge>
              </div>

              <div className="sm:ml-auto flex items-center gap-2">
                {isOwner && s.status === "ongoing" && (
                  <>
                    <Button
                      onClick={() => onFinish(s.id)}
                      disabled={finishing || deleting}
                    >
                      {finishing ? "Finishing..." : "Finish"}
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => onDelete(s.id)}
                      disabled={finishing || deleting}
                    >
                      {deleting ? "Deleting..." : "Delete"}
                    </Button>
                  </>
                )}
                {isOwner && s.status === "finished" && (
                  <Button
                    variant="danger"
                    onClick={() => onDelete(s.id)}
                    disabled={deleting}
                  >
                    {deleting ? "Deleting..." : "Delete"}
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}