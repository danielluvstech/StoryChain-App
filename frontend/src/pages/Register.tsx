import { FormEvent, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await register(username, password);
      nav("/stories");
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Register failed");
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 8, maxWidth: 360 }}>
      <h2>Register</h2>
      {err && <div style={{ color: "crimson" }}>{err}</div>}
      <input placeholder="username" value={username} onChange={(e) => setU(e.target.value)} />
      <input placeholder="password" type="password" value={password} onChange={(e) => setP(e.target.value)} />
      <button type="submit">Create account</button>
    </form>
  );
}