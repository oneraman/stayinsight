
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  redirectTo = "/login"
}) => {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    // You could return a loading spinner here
    return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
