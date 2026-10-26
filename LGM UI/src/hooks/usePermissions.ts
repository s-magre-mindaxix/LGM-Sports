import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { type RootState } from "../store";

type Action = "CanView" | "CanAdd" | "CanEdit" | "CanDelete";

export const usePermissions = () => {
  const { permissions, user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  const systemName = location.pathname.startsWith("/crm")
    ? "CRM"
    : location.pathname.startsWith("/erp")
      ? "ERP"
      : "HRMS";

  const hasPermission = (formName: string, action: Action): boolean => {
    // Admin bypass
    if (user?.role === "Admin") return true;

    // const permission = permissions.find(
    //   (p) =>
    //     p.formName === formName &&
    //     p.systemName === systemName
    // );
    const permission = permissions.find(
      (p) =>
        p.formName.toLowerCase() === formName.toLowerCase() &&
        p.systemName.toLowerCase() === systemName.toLowerCase(),
    );

    if (!permission) return false;

    const key = (action.charAt(0).toLowerCase() +
      action.slice(1)) as keyof typeof permission;
    return permission[key] === true;
  };

  return { hasPermission };
};
