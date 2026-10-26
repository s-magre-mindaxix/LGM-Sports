import React from "react";
import {
  Archive,
  FileText,
  Users,
  Search,
  Download,
  Eye,
  History,
  Upload,
} from "lucide-react";

type EmployeeStatus = "Active" | "Resigned";

interface EmployeeRecord {
  employeeName: string;
  employeeId: string;
  department: string;
  joiningDate: string;
  serviceYears: string;
  lastUpdated: string;
  status: EmployeeStatus;
  documentCount: number;
}

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}
interface CategoryItemProps {
  name: string;
  count: number;
  tag: string;
}
interface ActionItemProps {
  label: string;
  icon: React.ReactNode;
  isPrimary?: boolean;
}

const mockEmployeeRecords: EmployeeRecord[] = [
  {
    employeeName: "John Doe",
    employeeId: "EMP001",
    department: "Production",
    joiningDate: "Jan 15, 2019",
    serviceYears: "5.2 years",
    lastUpdated: "Mar 01, 2024",
    status: "Active",
    documentCount: 12,
  },
  {
    employeeName: "Jane Smith",
    employeeId: "EMP002",
    department: "Quality",
    joiningDate: "Mar 10, 2020",
    serviceYears: "4.0 years",
    lastUpdated: "Feb 28, 2024",
    status: "Active",
    documentCount: 8,
  },
  {
    employeeName: "Mike Johnson",
    employeeId: "EMP003",
    department: "Maintenance",
    joiningDate: "Jul 22, 2018",
    serviceYears: "5.8 years",
    lastUpdated: "Mar 05, 2024",
    status: "Active",
    documentCount: 15,
  },
  {
    employeeName: "Sarah Wilson",
    employeeId: "EMP004",
    department: "HR",
    joiningDate: "Dec 01, 2021",
    serviceYears: "-",
    lastUpdated: "Jan 15, 2024",
    status: "Resigned",
    documentCount: 6,
  },
];

const mockRecordCategories = [
  { name: "Personal Records", count: 245, tag: "100%" },
  { name: "Employment History", count: 373, tag: "All changes" },
  { name: "Salary Revisions", count: 456, tag: "Historical" },
  { name: "Training Records", count: 189, tag: "Certifications" },
];

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon,
}) => (
  <div className="bg-white p-5 rounded-lg shadow-sm border">
    <div className="flex justify-between items-start">
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <div className="text-gray-400">{icon}</div>
    </div>
    <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
    <p className="text-xs text-gray-500">{description}</p>
  </div>
);

const CategoryItem: React.FC<CategoryItemProps> = ({ name, count, tag }) => (
  <div className="flex justify-between items-center py-2 border-b last:border-b-0">
    <span className="font-medium text-gray-700">{name}</span>
    <div className="flex items-center gap-4">
      <span className="text-sm font-semibold text-gray-800">
        {count} Records
      </span>
      <span className="text-xs font-semibold bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md">
        {tag}
      </span>
    </div>
  </div>
);

const ActionItem: React.FC<ActionItemProps> = ({
  label,
  icon,
  isPrimary = false,
}) => (
  <button
    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
      isPrimary
        ? "bg-blue-600 text-white hover:bg-blue-700"
        : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
    }`}
  >
    {icon}
    <span className="font-semibold">{label}</span>
  </button>
);

const Records: React.FC = () => {
  const getStatusBadgeClass = (status: EmployeeStatus) => {
    return status === "Active"
      ? "bg-blue-600 text-white"
      : "bg-gray-100 text-gray-700 border";
  };

  return (
    <div className="p-4 md:p-4 bg-gray-50 min-h-full space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Records</h1>
          <p className="text-gray-600 mt-1">
            Employee records, documents, and historical data
          </p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700">
          <Archive size={18} /> Archive Records
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Records"
          value="2,456"
          description="All employee records"
          icon={<FileText size={20} />}
        />
        <StatCard
          title="Active Employees"
          value="245"
          description="Current workforce"
          icon={<Users size={20} />}
        />
        <StatCard
          title="Archived"
          value="128"
          description="Past employees"
          icon={<Archive size={20} />}
        />
        <StatCard
          title="Documents"
          value="1,892"
          description="Stored files"
          icon={<FileText size={20} />}
        />
      </div>

      {/* Record Categories and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <h2 className="text-xl font-semibold text-gray-800">
            Record Categories
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Distribution of employee records
          </p>
          <div className="space-y-2">
            {mockRecordCategories.map((item) => (
              <CategoryItem key={item.name} {...item} />
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <h2 className="text-xl font-semibold text-gray-800">Quick Actions</h2>
          <p className="text-sm text-gray-500 mb-4">
            Record management operations
          </p>
          <div className="space-y-3">
            <ActionItem
              label="Generate Service Records"
              icon={<FileText size={20} />}
              isPrimary
            />
            <ActionItem
              label="Export Employee Data"
              icon={<Upload size={20} />}
            />
            <ActionItem
              label="Archive Inactive Records"
              icon={<Archive size={20} />}
            />
            <ActionItem
              label="View Historical Changes"
              icon={<History size={20} />}
            />
          </div>
        </div>
      </div>

      {/* Employee Records Table */}
      <div className="bg-white rounded-lg shadow-sm p-6 border">
        <h2 className="text-xl font-semibold text-gray-800">
          Employee Records
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Complete employee record management
        </p>
        <div className="relative w-full max-w-xs mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search records..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                {[
                  "Employee",
                  "Department",
                  "Joining Date",
                  "Service Years",
                  "Last Updated",
                  "Status",
                  "Documents",
                  "Actions",
                ].map((head) => (
                  <th
                    key={head}
                    scope="col"
                    className="px-6 py-3 font-medium whitespace-nowrap"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {mockEmployeeRecords.map((rec) => (
                <tr key={rec.employeeId} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-800">
                      {rec.employeeName}
                    </div>
                    <div className="text-xs text-gray-500">
                      ({rec.employeeId})
                    </div>
                  </td>
                  <td className="px-6 py-4">{rec.department}</td>
                  <td className="px-6 py-4">{rec.joiningDate}</td>
                  <td className="px-6 py-4">{rec.serviceYears}</td>
                  <td className="px-6 py-4">{rec.lastUpdated}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(
                        rec.status
                      )}`}
                    >
                      {rec.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 font-semibold bg-blue-50 px-3 py-1 rounded-md text-xs hover:bg-blue-100">
                      {rec.documentCount} Files
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4 text-gray-500">
                      <button className="hover:text-blue-600">
                        <Eye size={18} />
                      </button>
                      <button className="hover:text-blue-600">
                        <Download size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Records;
