import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../api";

export default function Navbar() {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userRole, setUserRole] = useState("Claimant");
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("user@example.com");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const fetchUserDetails = async () => {
    try {
      const user = await getCurrentUser();
      setUserRole(user.role || "Claimant");
      setUserName(user.username || user.email || "User");
      setUserEmail(user.email || "user@example.com");
    } catch (err) {
      console.error("Failed to fetch user details:", err);
      // Keep default values on error
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role) => {
    const roleIcons = {
      claimant: "📋",
      gps: "👥",
      qa: "✓",
      admin: "🛡️",
    };
    return roleIcons[role.toLowerCase()] || "👤";
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setDropdownOpen(false);
    navigate("/");
  };

  return (
    <div className="navbar">
      <span className="brand">👤 User Portal</span>
      <div className="navbar-right">
        <span className="role-badge">{getRoleIcon(userRole)} {userRole}</span>
        <div className="avatar-container">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)} 
            className="avatar"
          >
            {userName.charAt(0).toUpperCase()}
          </button>
          {dropdownOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-header">
                <div className="user-info">
                  <p className="user-name">{userName}</p>
                  <p className="user-email">{userEmail}</p>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                👤 Profile
              </button>
              <button className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                ⚙️ Settings
              </button>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item logout" onClick={handleLogout}>
                🚪 Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
