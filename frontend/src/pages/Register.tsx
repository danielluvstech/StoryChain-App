import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { registerThunk } from "../features/auth/authSlice";
import { Button, Input } from "../components/ui";
import type { FormEvent } from "react";

export default function Register() {
  const dispatch = useAppDispatch();
  const nav = useNavigate();
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const { loading, error } = useAppSelector((s) => s.auth);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const action = await dispatch(registerThunk({ username, password }));
    if (registerThunk.fulfilled.match(action)) nav("/stories");
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md bg-white rounded-xl shadow p-6 space-y-4"
      >
        <h2 className="text-2xl font-extrabold text-center">
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Create account
          </span>
        </h2>

        {error && <div className="text-red-600">{error}</div>}

        <Input
          placeholder="Username"
          value={username}
          onChange={(e) => setU(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setP(e.target.value)}
        />

        <Button className="w-full mt-2" disabled={loading}>
          {loading ? "..." : "Register"}
        </Button>
      </form>
    </div>
  );
}