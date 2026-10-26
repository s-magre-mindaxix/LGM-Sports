import React, { useEffect, useState } from "react";
import {
  Users,
  CheckCircle2,
  Banknote,
  Clock,
  LineChart,
  History,
  FileText,
  LayoutGrid,
  Dot,
  ArrowUpRight,
} from "lucide-react";
import { getPendingApprovals } from "../LeaveManagement/LeaveService";
import { API_ENDPOINTS } from "../../../../API/apiConfig";
import apiClient from "../../../../API/apiClient";
import LogoLoader from "../../../../Components/Common/LogoLoader";

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  change: React.ReactNode | string;
  bgColor: string;
}

interface PlantCardData {
  name: string;
  employees: number;
  attendance: number;
}
interface EmployeeData {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  workLocationName?: string;
}
interface AttendanceData {
  employeeId: string;
  status: string;
}
interface PlantAccumulator {
  [key: string]: {
    name: string;
    count: number;
    present: number;
  };
}

type ComplianceStatus = "up-to-date" | "pending" | "overdue";

interface ComplianceItemProps {
  title: string;
  dueDate: string;
  status: ComplianceStatus;
}

interface ActionCardProps {
  title: string;
  description: string;
}

interface ActivityItemProps {
  text: string;
  time: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  title,
  value,
  change,
  bgColor,
}) => (
  <div
    className={`${bgColor} p-5 rounded-xl text-white flex items-center justify-between transition-all duration-300 transform hover:scale-105 hover:shadow-lg`}
  >
    <div>
      <p className="text-sm opacity-90">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
      <div className="text-xs opacity-80 mt-1">{change}</div>
    </div>
    <div className="bg-white/20 p-3 rounded-full">{icon}</div>
  </div>
);

const PlantCard: React.FC<PlantCardData> = ({
  name,
  employees,
  attendance,
}) => (
  <div className="bg-gray-50 p-4 rounded-lg">
    <div className="flex justify-between items-start">
      <div>
        <p className="font-semibold text-gray-800">{name}</p>
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
          <span className="flex items-center gap-1.5">
            <Users size={14} /> {employees} employees
          </span>
        </div>
      </div>
      <div className="text-right">
        <p className="text-2xl font-bold text-green-600">{attendance}%</p>
        <p className="text-xs text-gray-500">Attendance</p>
      </div>
    </div>
    <div className="mt-3 bg-gray-200 rounded-full h-1.5">
      <div
        className="bg-blue-600 h-1.5 rounded-full"
        style={{ width: `${attendance}%` }}
      ></div>
    </div>
  </div>
);

const ComplianceItem: React.FC<ComplianceItemProps> = ({
  title,
  dueDate,
  status,
}) => {
  const statusStyles: Record<ComplianceStatus, string> = {
    "up-to-date": "bg-green-100 text-green-800",
    pending: "bg-orange-100 text-orange-800",
    overdue: "bg-red-100 text-red-800",
  };
  return (
    <div className="flex justify-between items-center py-2">
      <div>
        <p className="font-medium text-gray-800">{title}</p>
        <p className="text-xs text-gray-500">{dueDate}</p>
      </div>
      <span
        className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${statusStyles[status]}`}
      >
        {status}
      </span>
    </div>
  );
};

const ActivityItem: React.FC<ActivityItemProps> = ({ text, time, color }) => (
  <li className="flex gap-4">
    <div className="relative">
      <div className={`h-full w-0.5 bg-gray-200`}></div>
      <div
        className={`absolute top-1 -left-1.5 h-4 w-4 rounded-full ${color} border-4 border-white`}
      ></div>
    </div>
    <div>
      <p className="text-sm text-gray-800">{text}</p>
      <p className="text-xs text-gray-500 mt-0.5">{time}</p>
    </div>
  </li>
);

const ActionCard: React.FC<ActionCardProps> = ({ title, description }) => (
  <button className="w-full bg-gray-50 hover:bg-gray-100 text-left p-4 rounded-lg transition-colors">
    <p className="font-semibold text-blue-700">{title}</p>
    <p className="text-xs text-gray-500 mt-1">{description}</p>
  </button>
);

const Home: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    pendingLeaves: 0,
    attendanceRate: "0",
  });
  const [plantData, setPlantData] = useState<PlantCardData[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const storedUser = localStorage.getItem("user");
      const userData = storedUser ? JSON.parse(storedUser) : null;

      const currentUserId =
        userData?.employeeId || userData?.EmployeeId || userData?.id;

      if (!currentUserId) {
        console.warn(
          "No valid Employee ID found in localStorage for Yogita Shete.",
        );
      }

      const todayStr = new Date().toISOString().split("T")[0];

      const [empRes, attRes, pendingLeaves] = await Promise.all([
        apiClient.get<EmployeeData[]>(API_ENDPOINTS.Employees),
        apiClient.get<AttendanceData[]>(
          `${API_ENDPOINTS.GetAttendanceByDate}?date=${todayStr}`,
        ),
        currentUserId
          ? getPendingApprovals(currentUserId)
          : Promise.resolve([]),
      ]);

      const employees = empRes.data || [];
      const attendance = attRes.data || [];

      const isWorking = (status: string): boolean =>
        status === "Present" ||
        status === "Half Day" ||
        status === "Checked-In";

      const presentCount = attendance.filter((a: AttendanceData) =>
        isWorking(a.status),
      ).length;

      const rate =
        employees.length > 0
          ? ((presentCount / employees.length) * 100).toFixed(1)
          : "0";

      // 4. Plant Overview Logic
      const plantsMap = employees.reduce<PlantAccumulator>((acc, emp) => {
        const locName = emp.workLocationName || "Unknown";
        if (!acc[locName]) {
          acc[locName] = { name: locName, count: 0, present: 0 };
        }

        acc[locName].count += 1;

        const employeeAttendance = attendance.find(
          (att: AttendanceData) => att.employeeId === emp.employeeCode,
        );

        if (employeeAttendance && isWorking(employeeAttendance.status)) {
          acc[locName].present += 1;
        }

        return acc;
      }, {});

      const processedPlants: PlantCardData[] = Object.values(plantsMap).map(
        (p) => ({
          name: p.name,
          employees: p.count,
          attendance: p.count > 0 ? Math.round((p.present / p.count) * 100) : 0,
        }),
      );

      // 5. Set State
      setStats({
        totalEmployees: employees.length,
        presentToday: presentCount,
        pendingLeaves: pendingLeaves.length, // This will now show "1" for Prasad Gopale
        attendanceRate: rate,
      });
      setPlantData(processedPlants);
    } catch (error: unknown) {
      console.error("Dashboard Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <LogoLoader />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-full p-4">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Real-time payroll and attendance overview.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm border border-gray-300 px-3 py-1.5 rounded-md bg-white">
            {new Date().toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </span>
          <span className="flex items-center gap-2 text-sm bg-green-100 text-green-800 font-medium px-3 py-1.5 rounded-full">
            <Dot
              className="text-green-600"
              strokeWidth={10}
              absoluteStrokeWidth
            />
            Live Data
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          icon={<Users size={22} className="text-blue-600" />}
          title="Total Employees"
          value={stats.totalEmployees.toLocaleString()}
          change="Active in system"
          bgColor="bg-[#2eacb3]"
        />
        <StatCard
          icon={<CheckCircle2 size={22} className="text-green-600" />}
          title="Present Today"
          value={stats.presentToday.toLocaleString()}
          change={`${stats.attendanceRate}% attendance rate`}
          bgColor="bg-[#f7c343]"
        />
        <StatCard
          icon={<Banknote size={22} className="text-red-600" />}
          title="Monthly Payroll"
          value="₹2.4Cr"
          change={
            <span className="flex items-center">
              <ArrowUpRight size={12} className="mr-1" />
              +8.2% from last month
            </span>
          }
          bgColor="bg-[#386487]"
        />
        <StatCard
          icon={<Clock size={22} className="text-purple-600" />}
          title="Pending Approvals"
          value={stats.pendingLeaves.toString()}
          change="Leave requests"
          bgColor="bg-[#87b6a7]"
        />
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Plant Overview */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <LineChart size={20} className="text-blue-600" />
              Plant Overview
            </h2>
            <div className="space-y-4">
              {plantData.length > 0 ? (
                plantData.map((plant, index) => (
                  <PlantCard
                    key={index}
                    name={plant.name}
                    employees={plant.employees}
                    attendance={plant.attendance}
                  />
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-400">
                    No plant data available for this period.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activities */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <History size={20} className="text-blue-600" />
              Recent Activities
            </h2>
            <ul className="space-y-4">
              <ActivityItem
                text="Payroll processed for October 2024"
                time="2 hours ago"
                color="bg-green-500"
              />
              <ActivityItem
                text="PF ECR file generated"
                time="4 hours ago"
                color="bg-gray-400"
              />
              <ActivityItem
                text="5 employees exceeded overtime limit"
                time="6 hours ago"
                color="bg-orange-500"
              />
              <ActivityItem
                text="12 leave applications approved"
                time="1 day ago"
                color="bg-green-500"
              />
              <ActivityItem
                text="System maintenance completed"
                time="2 days ago"
                color="bg-gray-300"
              />
            </ul>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <FileText size={20} className="text-blue-600" />
              Compliance Status
            </h2>
            <div className="space-y-2 divide-y divide-gray-100">
              <ComplianceItem
                title="PF Compliance"
                dueDate="Due: Nov 15, 2024"
                status="up-to-date"
              />
              <ComplianceItem
                title="ESIC Returns"
                dueDate="Due: Nov 10, 2024"
                status="pending"
              />
              <ComplianceItem
                title="TDS Returns"
                dueDate="Due: Dec 7, 2024"
                status="up-to-date"
              />
              <ComplianceItem
                title="Professional Tax"
                dueDate="Due: Nov 5, 2024"
                status="overdue"
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <LayoutGrid size={20} className="text-blue-600" />
              Quick Actions
            </h2>
            <div className="space-y-3">
              <ActionCard
                title="Process Monthly Payroll"
                description="Generate payroll for current period"
              />
              <ActionCard
                title="Generate Reports"
                description="Download monthly compliance reports"
              />
              <ActionCard
                title="Import Attendance"
                description="Upload biometric data"
              />
              <ActionCard
                title="Approve Leaves"
                description="Review pending leave requests"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
