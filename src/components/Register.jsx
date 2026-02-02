import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register, login, getCurrentUser } from "../api";

export default function Register() {
  const navigateToRole = (role) => {
    if (role === "admin") navigate("/admin-dashboard");
    else if (role === "gp") navigate("/gps-dashboard");
    else if (role === "qa") navigate("/qa-dashboard");
    else navigate("/dashboard");
  };

  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("claimant");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const roles = [
    {
      id: "claimant",
      icon: "📋",
      title: "Claimant",
      description: "Create and manage insurance/legal claims",
      color: "#0ea5e9",
    },
    {
      id: "gp",
      icon: "👥",
      title: "GPs",
      description: "General Physician Services",
      color: "#8b5cf6",
    },
    {
      id: "qa",
      icon: "✓",
      title: "QA",
      description: "Quality Assurance & Compliance",
      color: "#22c55e",
    },
    {
      id: "admin",
      icon: "🛡️",
      title: "Admin",
      description: "Full system administration",
      color: "#ef4444",
    },
  ];

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  if (!username || !email || !password) {
    setError("All fields are required.");
    setLoading(false);
    return;
  }

  try {
      // 1️⃣ Register
      await register({
        username,
        email,
        password,
        role: selectedRole,
      });

      // 2️⃣ Login
      const loginRes = await login(email, password);

      // 3️⃣ Store token
      localStorage.setItem("token", loginRes.access_token);

      // Fetch current user and navigate (do not store role locally)
      const user = await getCurrentUser();
      const role = (user.role || "").toLowerCase();
      if (role === "admin") navigate("/admin-dashboard");
      else if (role === "gp") navigate("/gps-dashboard");
      else if (role === "qa") navigate("/qa-dashboard");
      else navigate("/dashboard");
  } catch (err) {
    setError(err.message || "Registration failed");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="logo">👤</div>
        <h2>Create an account</h2>
        <p className="subtitle">Sign up to get started with your account</p>

        {success && <p className="success">✅ Signup successful!</p>}
        {error && <p className="error" style={{color: "red", marginBottom: "1rem"}}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <label>Username</label>
          <input
            placeholder="johndoe"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <label>Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label>Select your role</label>
          <div className="roles-container">
            {roles.map((role) => (
              <div
                key={role.id}
                className={`role-box ${selectedRole === role.id ? "selected" : ""}`}
                onClick={() => setSelectedRole(role.id)}
              >
                <div className="role-icon">{role.icon}</div>
                <div className="role-content">
                  <strong>{role.title}</strong>
                  <span>{role.description}</span>
                </div>
              </div>
            ))}
          </div>

          <button className="primary-btn" disabled={loading}>
            {loading ? "Creating account..." : "Sign up"}
          </button>

          <p className="low-title text-muted-foreground text-sm">Already have an account?
            <a className="text-primary hover:underline font-medium" href="/">Login</a>
          </p>
        </form>
      </div>
    </div>
  );
}
