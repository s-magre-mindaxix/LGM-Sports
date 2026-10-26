// src/Features/BasicMasters/BasicMastersPage.tsx
import React, { useState } from "react";
import { Building, Briefcase, UserCog } from "lucide-react";
import Department from "../Department/Departments";
import Designation from "../Designation/Designation";
import Role from "../Role/Role";


type ActiveTab = "departments" | "designations" | "roles";

const BasicMastersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("departments");

  const renderContent = () => {
    switch (activeTab) {
      case "departments":
        return <Department />;
      case "designations":
        return <Designation />;
      case "roles":
        return <Role />;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 md:p-4 bg-gray-50 min-h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Basic Masters</h1>
        <p className="text-gray-600 mt-1">
          Manage core organizational data like departments, designations, and roles.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px" aria-label="Tabs">
            <TabButton
              icon={<Building size={16} color="#2563EB"/>}
              label="Departments"
              isActive={activeTab === "departments"}
              onClick={() => setActiveTab("departments")}
            />
            <TabButton
              icon={<Briefcase size={16} color="#0D9488"/>}
              label="Designations"
              isActive={activeTab === "designations"}
              onClick={() => setActiveTab("designations")}
            />
            <TabButton
              icon={<UserCog size={16} color="#7C3AED" />}
              label="Roles"
              isActive={activeTab === "roles"}
              onClick={() => setActiveTab("roles")}
            />
          </nav>
        </div>
        <div>{renderContent()}</div>
      </div>
    </div>
  );
};

interface TabButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
      isActive
        ? "border-blue-600 text-blue-600"
        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default BasicMastersPage;