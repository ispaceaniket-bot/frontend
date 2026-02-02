import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import CreateCase from "./components/CreateCase";
import AdminDashboard from "./components/AdminDashboard";
import GPSDashboard from "./components/GPSDashboard";
import QADashboard from "./components/QADashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Claimant Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["claimant"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-case"
          element={
            <ProtectedRoute allowedRoles={["claimant"]}>
              <CreateCase />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* GPS Routes */}
        <Route
          path="/gps-dashboard"
          element={
            <ProtectedRoute allowedRoles={["gp"]}>
              <GPSDashboard />
            </ProtectedRoute>
          }
        />

        {/* QA Routes */}
        <Route
          path="/qa-dashboard"
          element={
            <ProtectedRoute allowedRoles={["qa"]}>
              <QADashboard />
            </ProtectedRoute>
          }
        />


      </Routes>
    </BrowserRouter>
  );
}

export default App;
