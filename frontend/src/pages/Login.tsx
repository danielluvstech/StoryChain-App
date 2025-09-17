import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { loginThunk } from "../features/auth/authSlice";

export default function Login() {
  const dispatch = useAppDispatch();
  const nav = useNavigate();
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const { loading, error } = useAppSelector((s) => s.auth);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const action = await dispatch(loginThunk({ username, password }));
    if (loginThunk.fulfilled.match(action)) {
      nav("/stories");
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 8, maxWidth: 360 }}>
      <h2>Login</h2>
      {error && <div style={{ color: "crimson" }}>{error}</div>}
      <input placeholder="username" value={username} onChange={(e) => setU(e.target.value)} />
      <input placeholder="password" type="password" value={password} onChange={(e) => setP(e.target.value)} />
      <button type="submit" disabled={loading}>{loading ? "..." : "Login"}</button>
    </form>
  );
}