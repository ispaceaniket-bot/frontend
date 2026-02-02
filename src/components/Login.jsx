import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, getCurrentUser } from "../api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

    try {
      const loginRes = await login(email, password);
      // Store token for authenticated requests
      localStorage.setItem("token", loginRes.access_token);

      // Fetch current user from backend and navigate based on role
      const user = await getCurrentUser();
      const role = (user.role || "").toLowerCase();
      if (role === "admin") navigate("/admin-dashboard");
      else if (role === "gp") navigate("/gps-dashboard");
      else if (role === "qa") navigate("/qa-dashboard");
      else navigate("/dashboard");

  } catch (err) {
    console.error("Login error:", err);
    setError(err.message || "Login failed");
  } finally {
    setLoading(false);
  }
};





  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="logo">👤</div>
        <h2 className="title">User Portal</h2>
        <p className="subtitle">Enter your credentials to access the portal</p>

        {error && <p className="error" style={{color: "red", marginBottom: "1rem"}}>{error}</p>}

        <form onSubmit={handleLogin}>
          <div>
          <label>Email</label>
          <input
            placeholder="you@example.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          </div>
          <div>
          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          </div>
          <button className="primary-btn" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
        </form>

        <p className="low-title text-muted-foreground text-sm">
          Don't have an account?
          <a className="text-primary hover:underline font-medium" href="/register">Signup</a>
        </p>
      </div>
    </div>
  );
}
