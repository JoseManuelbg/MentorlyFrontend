import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { token, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-salviaGreen"></div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

 if (allowedRoles && user) {
  // Check if any of the user's roles match the allowed roles
  const hasPermission = user.roles.some(role => allowedRoles.map(r => r.toLowerCase()).includes(role.toLowerCase())
  );

  if (!hasPermission) {
    return <Navigate to="/" replace />;
  }
}

  return <Outlet />;
};

export default ProtectedRoute;