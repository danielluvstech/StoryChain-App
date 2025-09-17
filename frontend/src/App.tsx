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
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 text-gray-900">
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link to={token ? "/stories" : "/login"} className="font-semibold">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              StoryChain
            </span>
          </Link>

          <nav className="ml-auto flex items-center gap-4">
            {token ? (
              <>
                <Link
                  to="/stories"
                  className="text-sm text-gray-700 hover:text-gray-900"
                >
                  Stories
                </Link>
                <button
                  onClick={() => dispatch(logout())}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">{children}</main>
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