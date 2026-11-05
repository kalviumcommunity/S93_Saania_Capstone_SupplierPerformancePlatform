import { useState } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import Dashboard from "./components/Dashboard";
import "./index.css";

const API_URL = "http://localhost:5000/api/auth/google";

function AppContent() {
  const [token, setToken] = useState(
    () => localStorage.getItem("token") || ""
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGoogleSuccess(response) {
    try {
      setLoading(true);
      setError("");

      const result = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credential: response.credential,
        }),
      });

      const data = await result.json();

      if (!result.ok) {
        throw new Error(data.message || "Google login failed");
      }

      localStorage.setItem("token", data.token);
      setToken(data.token);
    } catch (err) {
      setError(err.message || "Unable to sign in");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setToken("");
  }

  if (token) {
    return <Dashboard token={token} onLogout={handleLogout} />;
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">SP</div>

        <p className="login-label">SUPPLIER INTELLIGENCE</p>

        <h1>
          Supplier Performance
          <span>Dashboard</span>
        </h1>

        <p className="login-description">
          Manage suppliers. Track performance.
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="google-login-area">
          {loading ? (
            <p className="loading-text">Signing in...</p>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Google login failed. Try again.")}
              theme="filled_black"
              shape="pill"
              size="large"
              text="signin_with"
              width="300"
            />
          )}
        </div>

        <p className="login-footer">Secure Google Sign-In</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AppContent />
    </GoogleOAuthProvider>
  );
}

export default App;