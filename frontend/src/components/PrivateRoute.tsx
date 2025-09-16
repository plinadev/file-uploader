import { Navigate } from "react-router-dom";
interface PrivateRouteProps {
  children: React.ReactNode;
}
export default function PrivateRoute({ children }: PrivateRouteProps) {
  const userEmail = localStorage.getItem("userEmail");

  if (!userEmail) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
