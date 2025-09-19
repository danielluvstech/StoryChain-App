import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../lib/api";

type Story = { id: number; title: string; status: "ongoing" | "finished"; created_by?: number };
type Paragraph = { id: number; text: string; order_index: number; user_id: number };
type Participant = { id: number; story_id: number; user_id: number; join_order: number; username: string };

type DetailState = {
  story: Story | null;
  paragraphs: Paragraph[];
  participants: Participant[];
  loading: boolean;
  error: string | null;
};

const initialState: DetailState = {
  story: null,
  paragraphs: [],
  participants: [],
  loading: false,
  error: null,
};

export const fetchStoryWithParagraphs = createAsyncThunk(
  "detail/fetchStory",
  async (storyId: number, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/api/stories/${storyId}?include=paragraphs`);
      return data as { story: Story; paragraphs: Paragraph[] };
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || "Failed to load story");
    }
  }
);

export const fetchParticipants = createAsyncThunk(
  "detail/fetchParticipants",
  async (storyId: number, { rejectWithValue }) => {
    try {
      const { data } = await api.get<Participant[]>(`/api/stories/${storyId}/participants`);
      return data;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || "Failed to load participants");
    }
  }
);

export const joinStory = createAsyncThunk(
  "detail/join",
  async (storyId: number, { rejectWithValue }) => {
    try {
      await api.post(`/api/stories/${storyId}/join`);
      return true;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || "Join failed");
    }
  }
);

export const leaveStory = createAsyncThunk(
  "detail/leave",
  async (storyId: number, { rejectWithValue }) => {
    try {
      await api.delete(`/api/stories/${storyId}/participants/me`);
      return true;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || "Leave failed");
    }
  }
);

export const addParagraph = createAsyncThunk(
  "detail/addParagraph",
  async ({ storyId, text }: { storyId: number; text: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/api/stories/${storyId}/paragraphs`, { text });
      return data as Paragraph;
    } catch (e: any) {
      // bubble up full server payload so UI can show `expectedJoinOrder`
      return rejectWithValue(e?.response?.data || { message: "Add failed" });
    }
  }
);

const slice = createSlice({
  name: "storyDetail",
  initialState,
  reducers: {
    clearDetail() { return initialState; },
  },
  extraReducers: (b) => {
    b.addCase(fetchStoryWithParagraphs.pending, (s) => { s.loading = true; s.error = null; })
     .addCase(fetchStoryWithParagraphs.fulfilled, (s, { payload }) => {
       s.loading = false; s.story = payload.story; s.paragraphs = payload.paragraphs;
     })
     .addCase(fetchStoryWithParagraphs.rejected, (s, { payload }) => {
       s.loading = false; s.error = String(payload);
     })

     .addCase(fetchParticipants.fulfilled, (s, { payload }) => { s.participants = payload; })

     .addCase(addParagraph.fulfilled, (s, { payload }) => {
       s.paragraphs = [...s.paragraphs, payload];
     });
  },
});

export const { clearDetail } = slice.actions;
export default slice.reducer;