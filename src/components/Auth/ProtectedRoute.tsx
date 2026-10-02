import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import useAuthStore, { User } from "./AuthStore";
import Loading from "@/pages/Dashboard/shared/components/Loading";

type ProtectedRouteProps = {
  allowedRoles?: User["role"][];
};

const ProtectedRoutes: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
}) => {
  const {
    isAuthenticated,
    user,
    checkAuth,
  } = useAuthStore();

  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let mounted = true;

    const verifyAuthentication = async () => {
      await checkAuth();

      if (mounted) {
        setAuthChecked(true);
      }
    };

    verifyAuthentication();

    return () => {
      mounted = false;
    };
  }, [checkAuth]);

  // Wait until the server authentication has been checked
  if (!authChecked) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles?.includes(user?.role || "")) {
    return <Navigate to="/not-authorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoutes;