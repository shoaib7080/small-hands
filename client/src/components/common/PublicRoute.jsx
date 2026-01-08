// client/src/components/common/PublicRoute.jsx
import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (user) {
    // Redirect to appropriate dashboard based on role
    if (user.role === "reporter")
      return <Navigate to="/dashboard/reporter" replace />;
    if (user.role === "ngo") return <Navigate to="/dashboard/ngo" replace />;
    if (user.role === "admin" || user.role === "super_admin")
      return <Navigate to="/admin" replace />;
  }

  return children;
};

export default PublicRoute;
