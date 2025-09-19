import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../lib/api";
import type { RootState } from "../../store";

export type Story = {
  id: number;
  title: string;
  status: "ongoing" | "finished";
  created_by: number;
};

type StoriesState = {
  items: Story[];
  loading: boolean;
  error: string | null;
  creating: boolean;
  finishingIds: number[];
  deletingIds: number[];
};

const initialState: StoriesState = {
  items: [],
  loading: false,
  error: null,
  creating: false,
  finishingIds: [],
  deletingIds: [],
};

export const fetchStories = createAsyncThunk("stories/fetch", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get<Story[]>("/api/stories?limit=50&offset=0");
    return data;
  } catch (e: any) {
    return rejectWithValue(e?.response?.data?.message || "Failed to load stories");
  }
});

export const createStory = createAsyncThunk("stories/create", async (title: string, { rejectWithValue }) => {
  try {
    const { data } = await api.post<Story>("/api/stories", { title });
    return data;
  } catch (e: any) {
    return rejectWithValue(e?.response?.data?.message || "Create failed");
  }
});

export const finishStory = createAsyncThunk("stories/finish", async (id: number, { rejectWithValue }) => {
  try {
    await api.patch(`/api/stories/${id}/finish`);
    return id;
  } catch (e: any) {
    return rejectWithValue(e?.response?.data?.message || "Finish failed");
  }
});

export const deleteStory = createAsyncThunk("stories/delete", async (id: number, { rejectWithValue }) => {
  try {
    await api.delete(`/api/stories/${id}`);
    return id;
  } catch (e: any) {
    return rejectWithValue(e?.response?.data?.message || "Delete failed");
  }
});

const slice = createSlice({
  name: "stories",
  initialState,
  reducers: {
    _markFinishing(state, { payload }: { payload: number }) {
      if (!state.finishingIds.includes(payload)) state.finishingIds.push(payload);
    },
    _unmarkFinishing(state, { payload }: { payload: number }) {
      state.finishingIds = state.finishingIds.filter((id) => id !== payload);
    },
    _markDeleting(state, { payload }: { payload: number }) {
      if (!state.deletingIds.includes(payload)) state.deletingIds.push(payload);
    },
    _unmarkDeleting(state, { payload }: { payload: number }) {
      state.deletingIds = state.deletingIds.filter((id) => id !== payload);
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchStories.pending, (s) => { s.loading = true; s.error = null; })
     .addCase(fetchStories.fulfilled, (s, { payload }) => { s.loading = false; s.items = payload; })
     .addCase(fetchStories.rejected, (s, { payload }) => { s.loading = false; s.error = String(payload); })

     .addCase(createStory.pending, (s) => { s.creating = true; s.error = null; })
     .addCase(createStory.fulfilled, (s, { payload }) => { s.creating = false; s.items = [payload, ...s.items]; })
     .addCase(createStory.rejected, (s, { payload }) => { s.creating = false; s.error = String(payload); })

     .addCase(finishStory.fulfilled, (s, { payload }) => {
        s.items = s.items.map((st) => (st.id === payload ? { ...st, status: "finished" } : st));
     })

     .addCase(deleteStory.fulfilled, (s, { payload }) => {
        s.items = s.items.filter((st) => st.id !== payload);
     });
  },
});

export const { _markFinishing, _unmarkFinishing, _markDeleting, _unmarkDeleting } = slice.actions;
export const selectStories = (state: RootState) => state.stories;
export default slice.reducer;