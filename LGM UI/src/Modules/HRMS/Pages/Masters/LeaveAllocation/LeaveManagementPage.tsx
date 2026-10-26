import React, { useState } from "react";
import { SlidersHorizontal, CalendarPlus } from "lucide-react";
import LeaveTypes from "../LeaveType/LeaveTypes";
import LeaveAllocation from "./LeaveAllocation";

type ActiveTab = "types" | "allocation";

const LeaveManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("types");

  const renderContent = () => {
    switch (activeTab) {
      case "types":
        return <LeaveTypes />;
      case "allocation":
        return <LeaveAllocation />;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 md:p-4 bg-gray-50 min-h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
        <p className="text-gray-600 mt-1">
          Configure leave types and manage yearly allocations.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px" aria-label="Tabs">
            <TabButton
              icon={<SlidersHorizontal size={16} />}
              label="Leave Types"
              isActive={activeTab === "types"}
              onClick={() => setActiveTab("types")}
            />
            {/* Leave Policies cha button ithe kadhun takla ahe. */}
            <TabButton
              icon={<CalendarPlus size={16} />}
              label="Leave Allocation"
              isActive={activeTab === "allocation"}
              onClick={() => setActiveTab("allocation")}
            />
          </nav>
        </div>
        {renderContent()}
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

export default LeaveManagementPage;