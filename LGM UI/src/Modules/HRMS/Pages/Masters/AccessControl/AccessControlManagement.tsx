import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { getRoles, type Role } from "../../../Services/MasterDataService";
import {
  getPermissionsByRole,
  updatePermissions,
  type Permission,
} from "./AccessControlService";

const AccessControlManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState<string>("");

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const allRoles = await getRoles();
        setRoles(allRoles.filter((role) => role.name !== "Admin"));
      } catch {
        toast.error("Failed to fetch roles.");
      }
    };
    fetchRoles();
  }, []);

  const fetchPermissions = useCallback(
    async (roleId: string, systemName: string) => {
      if (!roleId || !systemName) {
        setPermissions([]);
        return;
      }

      setIsLoading(true);
      try {
        const data = await getPermissionsByRole(roleId, systemName);
        setPermissions(data);
      } catch {
        toast.error("Failed to fetch permissions.");
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchPermissions(selectedRole, selectedSystem);
  }, [selectedRole, selectedSystem, fetchPermissions]);

  const handlePermissionChange = (
    formName: string,
    permissionType: keyof Permission,
    value: boolean,
  ) => {
    setPermissions((prev) =>
      prev.map((p) =>
        p.formName === formName ? { ...p, [permissionType]: value } : p,
      ),
    );
  };

  const handleSelectAll = (formName: string, isChecked: boolean) => {
    setPermissions((prev) =>
      prev.map((p) =>
        p.formName === formName
          ? {
              ...p,
              canView: isChecked,
              canAdd: isChecked,
              canEdit: isChecked,
              canDelete: isChecked,
            }
          : p,
      ),
    );
  };

  const handleSaveChanges = async () => {
    if (!selectedRole) {
      toast.warning("Please select a role first.");
      return;
    }

    const payloadPermissions = permissions.map((p) => ({
      ...p,
      roleId: selectedRole, 
      systemName: selectedSystem, 
    }));

    setIsSaving(true);
    try {
      await updatePermissions(selectedRole, selectedSystem, payloadPermissions);
      toast.success("Permissions updated successfully!");
    } catch {
      toast.error("Failed to save permissions.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        Access Control Management
      </h1>
      <p className="text-gray-600 mb-6">
        Set module-wise permissions for different user roles.
      </p>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="w-full sm:w-64">
            <label
              htmlFor="role-select"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Select Role to Manage
            </label>
            <select
              id="role-select"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select a Role --</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleSaveChanges}
            disabled={isSaving || !selectedRole}
            className="flex items-center justify-center gap-2 bg-[#f07837] text-white font-semibold px-4 py-2 rounded-lg hover:bg-[#0d3357] transition-colors disabled:bg-[#f07837] disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        <div className="w-full sm:w-64">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select System
          </label>
          <select
            value={selectedSystem}
            onChange={(e) => setSelectedSystem(e.target.value)}
            className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">-- Select System --</option>
            <option value="CRM">CRM</option>
            <option value="HRMS">HRMS</option>
            <option value="ERP">ERP</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#f07837] text-left text-white">
              <tr>
                <th className="px-4 py-3 font-medium">Form Name</th>
                <th className="px-4 py-3 font-medium text-center">Can View</th>
                <th className="px-4 py-3 font-medium text-center">Can Add</th>
                <th className="px-4 py-3 font-medium text-center">Can Edit</th>
                <th className="px-4 py-3 font-medium text-center">
                  Can Delete
                </th>
                <th className="px-4 py-3 font-medium text-center">All</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin inline-block" />
                  </td>
                </tr>
              ) : permissions.length > 0 ? (
                permissions.map((p) => {
                  const allChecked =
                    p.canView && p.canAdd && p.canEdit && p.canDelete;
                  return (
                    <tr key={p.formName} className="border-b">
                      <td className="px-4 py-3 font-semibold text-gray-800">
                        {p.formName}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={p.canView}
                          onChange={(e) =>
                            handlePermissionChange(
                              p.formName,
                              "canView",
                              e.target.checked,
                            )
                          }
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={p.canAdd}
                          onChange={(e) =>
                            handlePermissionChange(
                              p.formName,
                              "canAdd",
                              e.target.checked,
                            )
                          }
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={p.canEdit}
                          onChange={(e) =>
                            handlePermissionChange(
                              p.formName,
                              "canEdit",
                              e.target.checked,
                            )
                          }
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={p.canDelete}
                          onChange={(e) =>
                            handlePermissionChange(
                              p.formName,
                              "canDelete",
                              e.target.checked,
                            )
                          }
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={allChecked}
                          onChange={(e) =>
                            handleSelectAll(p.formName, e.target.checked)
                          }
                        />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    {selectedRole
                      ? "No permissions found."
                      : "Please select a role to see permissions."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AccessControlManagement;
