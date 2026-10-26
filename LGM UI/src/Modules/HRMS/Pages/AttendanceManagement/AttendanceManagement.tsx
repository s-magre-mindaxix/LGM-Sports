import React, { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  Search,
  Calendar,
  CalendarCheck,
} from "lucide-react";
import {
  getAttendanceByDate,
  type AttendanceRecord,
} from "./attendanceService";
import ManualAttendanceForm from "./ManualAttendanceForm";
import { CSVLink } from "react-csv";
import BulkAttendanceForm from "./BulkAttendanceForm";
import { useAuth } from "../../../../hooks/useAuth";
import Modal from "../../../../Components/Common/Modal";
import LogoLoader from "../../../../Components/Common/LogoLoader";

interface StatCardProps {
  title: string;
  value: string;
  percentage: string;
  icon: React.ReactElement;
  bgColor: string;
}

interface ActionCardProps {
  title: string;
  description: string;
  buttonText: string;
  isPrimary?: boolean;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  percentage,
  icon,
  bgColor,
}) => (
  <div
    className={`${bgColor} p-5 rounded-xl text-white flex items-center justify-between transition-all duration-300 transform hover:scale-105 hover:shadow-lg`}
  >
    <div>
      <p className="text-4xl font-bold">{value}</p>
      <p className="text-sm mt-1 opacity-90">{title}</p>
      <p className="text-xs opacity-80">{percentage}</p>
    </div>
    <div className="bg-white/20 p-3 rounded-full">{icon}</div>
  </div>
);

const ActionCard: React.FC<ActionCardProps> = ({
  title,
  description,
  buttonText,
  isPrimary = false,
  onClick,
}) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border text-center flex flex-col items-center">
    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
    <p className="text-sm text-gray-500 mt-2 mb-4 grow">{description}</p>
    <button
      onClick={onClick}
      className={`w-full py-2 rounded-lg font-semibold ${
        isPrimary
          ? "bg-[#f07837] text-white hover:bg-[#0d3357]"
          : "bg-[#f07837] border border-gray-300 text-white hover:bg-[#0d3357]"
      }`}
    >
      {buttonText}
    </button>
  </div>
);

const AttendanceManagement: React.FC = () => {
  const { user } = useAuth();
  const canManageAttendance = user?.role === "Admin" || user?.role === "HR" || user?.role === "Account";
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [isLoading, setIsLoading] = useState(false);
  // const [isModalOpen, setIsModalOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlant, setSelectedPlant] = useState("All Plants");
  const [selectedStatus, setSelectedStatus] = useState("All Status");

  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);
  const [modalType, setModalType] = useState<"NONE" | "MANUAL" | "BULK">(
    "NONE",
  );

  const handleCloseModal = () => {
    setModalType("NONE");
  };

  const fetchAttendance = async (date: string) => {
    setIsLoading(true);
    try {
      const data = await getAttendanceByDate(date);
      setAttendanceData(data);
    } catch (error) {
      console.error("Failed to fetch attendance:", error);
      setAttendanceData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance(selectedDate);
    const handleRefresh = () => {
      fetchAttendance(selectedDate);
    };

    window.addEventListener("app-refresh", handleRefresh);

    return () => {
      window.removeEventListener("app-refresh", handleRefresh);
    };
  }, [selectedDate]);

  const handleFormSuccess = () => {
    handleCloseModal();
    fetchAttendance(selectedDate);
  };

  const dailyStats = useMemo(() => {
    const totalRecords = attendanceData.length;
    if (totalRecords === 0) {
      return {
        present: { count: 0, percentage: "0.0%" },
        onLeave: { count: 0, percentage: "0.0%" },
        late: { count: 0, percentage: "0.0%" },
        overtime: { count: 0, percentage: "0.0%" },
      };
    }

    const presentCount = attendanceData.filter(
      (r) =>
        r.status === "Present" ||
        r.status === "Half Day" ||
        r.status === "Checked-In",
    ).length;

    const onLeaveCount = attendanceData.filter(
      (r) => r.status === "OnLeave",
    ).length;

    const lateCount = attendanceData.filter((r) => r.inTime?.lateInfo).length;

    const overtimeCount = attendanceData.filter(
      (r) => r.overtime && r.overtime !== "0:00",
    ).length;

    const calculatePercentage = (count: number) =>
      `${((count / totalRecords) * 100).toFixed(1)}%`;

    return {
      present: {
        count: presentCount,
        percentage: calculatePercentage(presentCount),
      },
      onLeave: {
        count: onLeaveCount,
        percentage: calculatePercentage(onLeaveCount),
      },
      late: { count: lateCount, percentage: calculatePercentage(lateCount) },
      overtime: {
        count: overtimeCount,
        percentage: calculatePercentage(overtimeCount),
      },
    };
  }, [attendanceData]);

  const plantOptions = useMemo(() => {
    const plants = new Set(attendanceData.map((rec) => rec.plant));
    return ["All Plants", ...Array.from(plants)];
  }, [attendanceData]);

  const statusOptions = [
    "All Status",
    "Present",
    "Absent",
    "OnLeave",
    "Outdoor",
    "Half Day",
    "Checked-In",
    "Weekly Off",
  ];

  const filteredData = useMemo(() => {
    setCurrentPage(1);
    return attendanceData.filter((rec) => {
      const searchMatch =
        searchTerm === "" ||
        rec.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.employeeId.toString().includes(searchTerm);

      const plantMatch =
        selectedPlant === "All Plants" || rec.plant === selectedPlant;

      const statusMatch =
        selectedStatus === "All Status" || rec.status === selectedStatus;

      return searchMatch && plantMatch && statusMatch;
    });
  }, [attendanceData, searchTerm, selectedPlant, selectedStatus]);

  const csvHeaders = [
    { label: "Employee ID", key: "employeeId" },
    { label: "Employee Name", key: "employeeName" },
    { label: "Department", key: "department" },
    { label: "Plant", key: "plant" },
    { label: "In Time", key: "inTime" },
    { label: "Late By", key: "lateInfo" },
    { label: "Out Time", key: "outTime" },
    { label: "Total Hours", key: "totalHours" },
    { label: "Overtime", key: "overtime" },
    { label: "Status", key: "status" },
  ];

  const csvData = useMemo(() => {
    return filteredData.map((rec) => ({
      employeeId: rec.employeeId,
      employeeName: rec.employeeName,
      department: rec.department,
      plant: rec.plant,
      inTime: rec.inTime ? rec.inTime.time : "-",
      lateInfo: rec.inTime?.lateInfo || "-",
      outTime: rec.outTime || "-",
      totalHours: rec.totalHours || "-",
      overtime: rec.overtime || "0:00",
      status: rec.status,
    }));
  }, [filteredData]);

  const currentRecords = useMemo(() => {
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    return filteredData.slice(indexOfFirstRecord, indexOfLastRecord);
  }, [filteredData, currentPage, recordsPerPage]);

  const totalPages = Math.ceil(filteredData.length / recordsPerPage);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Present":
        return "bg-green-100 text-green-800";
      case "Absent":
        return "bg-red-100 text-red-800";
      case "OnLeave":
        return "bg-purple-100 text-purple-800";
      case "Half Day":
        return "bg-yellow-100 text-yellow-800";
      case "Checked-In":
        return "bg-blue-100 text-blue-800";
      case "Weekly Off":
        return "bg-gray-200 text-gray-800 font-medium";
      case "Outdoor":
        return "bg-indigo-100 text-indigo-800 border border-indigo-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-4 md:p-4 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Attendance Management
          </h1>
          <p className="text-gray-600 mt-1">
            Track and manage employee attendance across all plants
          </p>
        </div>
        <div className="flex items-center gap-3">
          <CSVLink
            data={csvData}
            headers={csvHeaders}
            filename={`Attendance-Report-${selectedDate}.csv`}
            className={`flex items-center gap-2 bg-[#088c27] text-white font-semibold px-4 py-2 rounded-lg hover:bg-[#04741e] text-sm ${
              csvData.length === 0 ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={(_event, done) => {
              if (csvData.length === 0) {
                alert("No data available to export for the selected filters.");
                done(false);
              } else {
                done(true);
              }
            }}
          >
            <Download size={16} /> Export Report
          </CSVLink>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Present"
          value={dailyStats.present.count.toString()}
          percentage={dailyStats.present.percentage}
          bgColor="bg-[#2eacb3]"
          icon={<CheckCircle2 className="h-7 w-7 text-blue-600" />}
        />
        <StatCard
          title="On Leave"
          value={dailyStats.onLeave.count.toString()}
          percentage={dailyStats.onLeave.percentage}
          bgColor="bg-[#f7c343]"
          icon={<CalendarCheck className="h-7 w-7 text-green-600" />}
        />
        <StatCard
          title="Late Arrivals"
          value={dailyStats.late.count.toString()}
          percentage={dailyStats.late.percentage}
          bgColor="bg-[#386487]"
          icon={<AlertTriangle className="h-7 w-7 text-red-600" />}
        />
        <StatCard
          title="Overtime"
          value={dailyStats.overtime.count.toString()}
          percentage={dailyStats.overtime.percentage}
          bgColor="bg-[#87b6a7]"
          icon={<Clock className="h-7 w-7 text-purple-600" />}
        />
      </div>

      {/* Daily Attendance Report */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-4">
          <Clock size={22} className="text-blue-600" />
          Daily Attendance Report
        </h2>
        {/* Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or employee ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white"
              />
            </div>
            <select
              value={selectedPlant}
              onChange={(e) => setSelectedPlant(e.target.value)}
              className="w-full md:w-auto px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {plantOptions.map((plant) => (
                <option key={plant} value={plant}>
                  {plant}
                </option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full md:w-auto px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status === "OnLeave" ? "On Leave" : status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="overflow-x-auto border border-gray-300 rounded-t-lg">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="bg-[#f07837] text-xs uppercase text-white">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 font-semibold border-r border-[#2a4a7a]"
                >
                  Employee
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 font-semibold border-r border-[#2a4a7a]"
                >
                  Department
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 font-semibold border-r border-[#2a4a7a]"
                >
                  Plant
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 font-semibold border-r border-[#2a4a7a]"
                >
                  In Time
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 font-semibold border-r border-[#2a4a7a]"
                >
                  Out Time
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 font-semibold border-r border-[#2a4a7a]"
                >
                  Total Hours
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 font-semibold border-r border-[#2a4a7a]"
                >
                  Overtime
                </th>
                <th scope="col" className="px-6 py-3">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-0">
                    {<LogoLoader />}
                  </td>
                </tr>
              ) : currentRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-gray-500">
                    {attendanceData.length > 0
                      ? "No records match your filters."
                      : "No attendance records found for this date."}
                  </td>
                </tr>
              ) : (
                currentRecords.map((rec) => (
                  <tr
                    key={rec.employeeId}
                    className="bg-white border-b hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800">
                        {rec.employeeName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {rec.employeeId}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {rec.department}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{rec.plant}</td>
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      {rec.inTime ? (
                        <div>
                          {rec.inTime.time}
                          {rec.inTime.lateInfo && (
                            <div className="text-xs font-normal text-orange-500">
                              {rec.inTime.lateInfo}
                            </div>
                          )}
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {rec.outTime || "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {rec.totalHours || "-"}
                    </td>
                    <td
                      className={`px-6 py-4 font-semibold ${
                        rec.overtime !== "0:00"
                          ? "text-blue-600"
                          : "text-gray-600"
                      }`}
                    >
                      {rec.overtime}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                          rec.status,
                        )}`}
                      >
                        {rec.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filteredData.length > 0 && (
          <div className="flex flex-col md:flex-row justify-between items-center pt-4 border-t mt-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2 md:mb-0">
              <span>Rows per page:</span>
              <select
                value={recordsPerPage}
                onChange={(e) => {
                  setRecordsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="p-1 border border-gray-300 rounded-md"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
            <div className="text-sm text-gray-600 mb-2 md:mb-0">
              Showing{" "}
              {Math.min(
                (currentPage - 1) * recordsPerPage + 1,
                filteredData.length,
              )}
              -{Math.min(currentPage * recordsPerPage, filteredData.length)} of{" "}
              {filteredData.length}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-800 font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Cards */}
      {canManageAttendance && (
        <div className="flex justify-center mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
            <ActionCard
              title="Manual Entry"
              description="Add manual attendance for a single day"
              buttonText="Single Entry"
              isPrimary={false}
              onClick={() => setModalType("MANUAL")}
            />
            <ActionCard
              title="Bulk Entry (Outdoor)"
              description="Apply time range for specific employee (OD)"
              buttonText="Bulk Entry"
              isPrimary={true}
              onClick={() => setModalType("BULK")}
            />
          </div>
        </div>
      )}
      <Modal
        isOpen={modalType !== "NONE"}
        onClose={handleCloseModal}
        title={
          modalType === "MANUAL"
            ? "Manual Attendance Entry"
            : "Bulk Attendance Entry"
        }
      >
        {modalType === "MANUAL" && (
          <ManualAttendanceForm
            onSuccess={handleFormSuccess}
            onClose={handleCloseModal}
          />
        )}
        {modalType === "BULK" && (
          <BulkAttendanceForm
            onSuccess={handleFormSuccess}
            onClose={handleCloseModal}
          />
        )}
      </Modal>
    </div>
  );
};

export default AttendanceManagement;
