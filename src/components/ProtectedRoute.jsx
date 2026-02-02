import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/" />;

  if (allowedRoles && token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const role = (payload.role || "").toLowerCase();
      if (!allowedRoles.includes(role)) return <Navigate to="/" replace />;
    } catch (e) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
