import { Routes, Route, Navigate, Link } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StoriesList from "./pages/StoriesList";
import StoryDetail from "./pages/StoryDetail";
import { useAppSelector, useAppDispatch } from "./store/hooks";
import { logout } from "./features/auth/authSlice";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAppSelector((s) => s.auth.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function Layout({ children }: { children: React.ReactNode }) {
  const token = useAppSelector((s) => s.auth.token);
  const dispatch = useAppDispatch();
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <header style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <Link to="/stories">Stories</Link>
        {!token ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        ) : (
          <button onClick={() => dispatch(logout())}>Logout</button>
        )}
      </header>
      {children}
    </div>
  );
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/stories" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/stories"
          element={
            <ProtectedRoute>
              <StoriesList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stories/:id"
          element={
            <ProtectedRoute>
              <StoryDetail />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<div>Not found</div>} />
      </Routes>
    </Layout>
  );
}