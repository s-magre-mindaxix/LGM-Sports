import React, { useState } from "react";
import { Layers, GitBranch } from "lucide-react";
import LevelList from "./LevelList";
import ReportingToForm from "./ReportingToForm";

type ActiveTab = "level" | "reporting";

const LevelMaster: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("level");

  const renderContent = () => {
    switch (activeTab) {
      case "level":
        return <LevelList />;
      case "reporting":
        return <ReportingToForm />;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 bg-[#f5f6fa] min-h-screen space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Hierarchy Management
        </h1>
        <p className="text-gray-600 mt-1">
          Manage organization hierarchy levels and reporting structure.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <TabButton
              icon={<Layers size={16} color="#2563EB" />}
              label="Levels"
              isActive={activeTab === "level"}
              onClick={() => setActiveTab("level")}
            />
            <TabButton
              icon={<GitBranch size={16} color="#7C3AED" />}
              label="Reporting To"
              isActive={activeTab === "reporting"}
              onClick={() => setActiveTab("reporting")}
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

const TabButton: React.FC<TabButtonProps> = ({
  icon,
  label,
  isActive,
  onClick,
}) => (
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

export default LevelMaster;
