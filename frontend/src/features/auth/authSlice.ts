import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { api, setAuthToken } from "../../lib/api";

type User = { id: number; username?: string } | null;

type AuthState = {
  token: string | null;
  user: User;
  loading: boolean;
  error: string | null;
};

const saved = localStorage.getItem("token");
if (saved) setAuthToken(saved);

const initialState: AuthState = {
  token: saved || null,
  user: saved ? { id: 0 } : null, // optionally hydrate with /me later
  loading: false,
  error: null,
};

export const loginThunk = createAsyncThunk(
  "auth/login",
  async (payload: { username: string; password: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/auth/login", payload);
      return data as { accessToken: string; user: { id: number; username: string } };
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || "Login failed");
    }
  }
);

export const registerThunk = createAsyncThunk(
  "auth/register",
  async (payload: { username: string; password: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/auth/register", payload);
      return data as { accessToken: string; user: { id: number; username: string } };
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || "Register failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      localStorage.removeItem("token");
      setAuthToken(null);
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(loginThunk.fulfilled, (s, { payload }) => {
        s.loading = false;
        s.token = payload.accessToken;
        s.user = payload.user;
        localStorage.setItem("token", payload.accessToken);
        setAuthToken(payload.accessToken);
      })
      .addCase(loginThunk.rejected, (s, { payload }) => {
        s.loading = false;
        s.error = String(payload);
      })
      .addCase(registerThunk.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(registerThunk.fulfilled, (s, { payload }) => {
        s.loading = false;
        s.token = payload.accessToken;
        s.user = payload.user;
        localStorage.setItem("token", payload.accessToken);
        setAuthToken(payload.accessToken);
      })
      .addCase(registerThunk.rejected, (s, { payload }) => {
        s.loading = false;
        s.error = String(payload);
      });
  },
});

export const { logout, setUser } = authSlice.actions;
export default authSlice.reducer;