// components/routing/PublicRoute.tsx
import { Navigate } from "react-router-dom";
import type React from "react";

interface PublicRouteProps {
  children: React.ReactNode;
}
export default function PublicRoute({ children }: PublicRouteProps) {
  const userEmail = localStorage.getItem("userEmail");

  if (userEmail) {
    return <Navigate to="/" replace />;
  }

  return children;
}
