
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
        headers: {
          "Content-Type": "application/json",
        },
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
      setError(err.message);
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
    <div className="login-container">
      <h1>Supplier Performance Intelligence</h1>
      <h2>Sign in to continue</h2>

      {error && <p role="alert">{error}</p>}

      {loading ? (
        <p>Signing in...</p>
      ) : (
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setError("Google login failed. Please try again.")}
        />
      )}
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
