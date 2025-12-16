import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  // 1. Check if Logged In
  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  // 2. Check Role (if specific roles are required)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If a Reporter tries to access NGO Dashboard -> Redirect to their own dashboard
    if (user.role === "reporter")
      return <Navigate to="/dashboard/reporter" replace />;
    if (user.role === "ngo") return <Navigate to="/dashboard/ngo" replace />;
    if (user.role === "admin") return <Navigate to="/admin" replace />;

    return <Navigate to="/login" replace />; // Fallback
  }

  // 3. Authorized! Render the child route
  return <Outlet />;
};

export default ProtectedRoute;
