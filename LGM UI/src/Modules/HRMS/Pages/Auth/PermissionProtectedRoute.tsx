import React from "react";
import { Navigate } from "react-router-dom";
import { usePermissions } from "../../../../hooks/usePermissions";

interface Props {
  children: React.ReactNode;
  formName: string;
}

const PermissionProtectedRoute: React.FC<Props> = ({ children, formName }) => {
  const { hasPermission } = usePermissions();

  if (!hasPermission(formName, "CanView")) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default PermissionProtectedRoute;