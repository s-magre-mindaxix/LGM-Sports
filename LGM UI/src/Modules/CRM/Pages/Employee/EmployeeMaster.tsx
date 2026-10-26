import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ChevronDown, Upload, RefreshCw } from "lucide-react";
import AddEmployeeModal from "./AddEmployeeModal";
import {
  deleteEmployee,
  getAllEmployees,
  updateEmployeeStatus,
  type Employee,
} from "../../../CRM/Pages/Employee/Services/EmployeeService";
import { toast } from "sonner";
import EditEmployeeModal from "./EditEmployeeModal";
import { usePermissions } from "../../../../hooks/usePermissions";
import {
  exportToExcel,
  type ExcelExportData,
} from "../../../../Utils/exportToExcel";
import ConfirmationModal from "../../../../Components/Common/ConfirmationModal";
import ViewEmployeeModal from "./ViewEmployeeModal";
import EmployeeWizard from "./EmployeeWizard";
import { FaEdit, FaEye, FaTrash } from "react-icons/fa";
import DataTable, { type TableColumn } from "react-data-table-component";
import { listingTableStyles } from "../../../../Components/Common/listingTableStyles";
import {
  actionButtonStyles,
  buttonStyles,
} from "../../../../Components/Common/buttonStyles";
import LogoLoader from "../../../../Components/Common/LogoLoader";

const EmployeeMaster: React.FC = () => {
  const pageTopRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [showWizard, setShowWizard] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(
    null,
  );
  const [filterText, setFilterText] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All");

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const { hasPermission } = usePermissions();
  const canAdd = hasPermission("Employee", "CanAdd");
  const canEdit = hasPermission("Employee", "CanEdit");
  const canDelete = hasPermission("Employee", "CanDelete");

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAllEmployees();
      setEmployees(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred while fetching employees.");
      }
      toast.error("Failed to fetch employees.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
    const handleRefresh = () => {
      fetchEmployees();
    };

    window.addEventListener("app-refresh", handleRefresh);

    return () => {
      window.removeEventListener("app-refresh", handleRefresh);
    };
  }, [fetchEmployees]);

  const formatFullName = (
    firstName: string,
    middleName: string | undefined | null,
    lastName: string,
  ) => {
    return [firstName, middleName, lastName]
      .filter((part) => part && part !== "null" && part.trim() !== "")
      .join(" ");
  };

  const uniqueDepartments = useMemo(() => {
    const departments = new Set(
      employees
        .map((e) => e.departmentName)
        .filter(Boolean)
        .map((name) => name.trim()),
    );
    return ["All", ...Array.from(departments)];
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    return employees
      .filter((employee) => {
        const searchLower = filterText.toLowerCase();
        const fullName = formatFullName(
          employee.firstName,
          employee.middleName,
          employee.lastName,
        ).toLowerCase();
        const employeeCode = employee.employeeCode.toLowerCase();
        const company = (employee.companyName ?? "").toLowerCase();
        return (
          fullName.includes(searchLower) ||
          employeeCode.includes(searchLower) ||
          company.includes(searchLower)
        );
      })
      .filter((employee) => {
        return (
          selectedDepartment === "All" ||
          employee.departmentName === selectedDepartment
        );
      });
  }, [employees, filterText, selectedDepartment]);

  const handleEditClick = (id: number) => {
    setShowWizard(false);
    setSelectedEmployeeId(id);
    setShowEditForm(true);

    setTimeout(() => {
      pageTopRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const handleViewClick = (employeeId: number) => {
    setSelectedEmployeeId(employeeId);
    setIsViewModalOpen(true);
  };

  const handleDeleteRequest = (id: number, employee: Employee) => {
    const fullName = formatFullName(
      employee.firstName,
      employee.middleName,
      employee.lastName,
    );
    setEmployeeToDelete({ id, name: fullName });
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!employeeToDelete) return;

    try {
      await deleteEmployee(employeeToDelete.id);
      toast.success(
        `Employee ${employeeToDelete.name} has been deleted successfully.`,
      );
      fetchEmployees();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to delete employee.";
      toast.error(message);
    } finally {
      setEmployeeToDelete(null);
    }
  };

  const handleExportClick = () => {
    if (filteredEmployees.length === 0) {
      toast.warning("There is no data to export.");
      return;
    }

    const dataToExport: ExcelExportData[] = filteredEmployees.map((emp) => ({
      "Employee Code": emp.employeeCode,
      "First Name": emp.firstName,
      "Middle Name":
        emp.middleName && emp.middleName !== "null" ? emp.middleName : "",
      "Last Name": emp.lastName,
      "Email Address": emp.emailAddress,
      "Mobile Number": emp.mobileNumber,
      Department: emp.departmentName,
      Designation: emp.designationName,
      "Work Location": emp.workLocationName,
      Status: emp.isActive ? "Active" : "Inactive",
    }));

    const timestamp = new Date().toISOString().slice(0, 10);
    exportToExcel(dataToExport, `Employee_List_${timestamp}`, "Employees");
  };

  const handleStatusToggle = async (row: Employee) => {
    try {
      const newStatus = !row.isActive;

      await updateEmployeeStatus(row.id, newStatus);

      toast.success(
        `Employee ${row.firstName} is now ${newStatus ? "Active" : "Inactive"}`,
      );

      fetchEmployees(); // refresh list
    } catch {
      toast.error("Failed to update status");
    }
  };

  const columns: TableColumn<Employee>[] = [
    { name: "Sr. No.", cell: (_row, index) => (index ?? 0) + 1, width: "60px" },
    {
      name: "Company Name",
      selector: (row) => row.companyName || "-",
      grow: 2,
      wrap: true,
    },
    {
      name: "Employee Name",
      selector: (row) => {
        const fullName = [row.firstName, row.middleName, row.lastName]
          .filter(Boolean)
          .join(" ");

        return `${fullName} (${row.employeeCode ?? ""})`;
      },
      grow: 2,
      wrap: true,
    },
    {
      name: "Designation",
      selector: (row) => row.designationName || "-",
      grow: 1,
    },
    {
      name: "PAN No.",
      selector: (row) => row.panNumber || "-",
    },
    {
      name: "Aadhar No.",
      selector: (row) => row.aadhaarNumber || "-",
    },

    {
      name: "Status",
      cell: (row) => {
        const isOn = row.isActive;

        return (
          <div className="flex justify-center w-full">
            <label
              className="relative inline-flex items-center cursor-pointer"
              onClick={() => handleStatusToggle(row)}
            >
              <input
                type="checkbox"
                checked={isOn}
                readOnly
                className="sr-only"
              />
              <div
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  isOn ? "bg-[#f07837]" : "bg-gray-300"
                }`}
              >
                <span
                  className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-200 ease-in-out"
                  style={{
                    left: isOn ? "calc(100% - 1.25rem - 0.125rem)" : "0.125rem",
                  }}
                />
              </div>
            </label>
          </div>
        );
      },
      width: "80px",
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex justify-center gap-4">
          <button
            onClick={() => handleViewClick(row.id)}
            className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}
          >
            <FaEye size={16} />
          </button>
          {canEdit && (
            <button
              onClick={() => handleEditClick(row.id)}
              className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}
            >
              <FaEdit size={16} />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => handleDeleteRequest(row.id, row)}
              className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`}
            >
              <FaTrash size={16} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <div ref={pageTopRef} className="p-4 bg-white min-h-screen space-y-6">
        {/* Header - kept as per your request */}
        {!showWizard && !showEditForm ? (
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl font-normal text-gray-900 border-b-2 border-[#143463] pb-1">
                Listing of Employees
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={fetchEmployees} className={buttonStyles.refresh}>
                <RefreshCw
                  size={16}
                  className={isLoading ? "animate-spin" : ""}
                />{" "}
                Refresh
              </button>
              {canAdd && (
                <button
                  onClick={() => {
                    setShowEditForm(false);
                    setShowWizard(true);
                  }}
                  className={buttonStyles.create}
                >
                  + Create New
                </button>
              )}
            </div>
          </div>
        ) : null}

        {/* --- 2. INLINE CREATE FORM --- */}
        {showWizard && (
          <EmployeeWizard
            onCancel={() => setShowWizard(false)}
            onSuccess={() => {
              setShowWizard(false);
              fetchEmployees();
            }}
          />
        )}

        {/* --- 3. INLINE EDIT FORM (Uses your updated EditEmployeeModal file) --- */}
        {showEditForm && selectedEmployeeId && (
          <EditEmployeeModal
            isOpen={true}
            employeeId={selectedEmployeeId}
            onClose={() => {
              setShowEditForm(false);
              setSelectedEmployeeId(null);
            }}
            onSuccess={() => {
              setShowEditForm(false);
              setSelectedEmployeeId(null);
              fetchEmployees();
            }}
          />
        )}

        {/* Employee Directory Card */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-6">
            {/* Filter bar - kept as per your request */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
              {/* Left: Search */}
              <div className="flex items-center w-full md:w-auto">
                <label className="text-gray-600 mr-2">Search:</label>
                <input
                  type="text"
                  className="border border-gray-300 rounded-md px-3 py-2 w-full md:w-72 bg-white"
                  placeholder="Search by name or code..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                />
              </div>

              {/* Right: Dropdown + Export */}
              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                <div className="relative">
                  <select
                    className="pl-3 pr-8 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white cursor-pointer hover:bg-gray-50 appearance-none focus:outline-none"
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                  >
                    {uniqueDepartments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept === "All" ? "All Departments" : dept}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                  />
                </div>

                <button
                  onClick={handleExportClick}
                  className="flex items-center gap-2 border border-[#133561] text-[#133561] px-4 py-2.5 rounded-lg text-sm font-normal bg-white hover:bg-blue-50 transition-colors"
                >
                  <Upload size={16} />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* DESIGNED TABLE */}
            <DataTable
              columns={columns}
              data={filteredEmployees}
              progressComponent={<LogoLoader />}
              pagination
              striped
              highlightOnHover
              progressPending={isLoading}
              customStyles={listingTableStyles}
              persistTableHead
            />
          </div>
        </div>
      </div>

      {/* Modals remain same */}
      <AddEmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchEmployees}
      />
      <EditEmployeeModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={fetchEmployees}
        employeeId={selectedEmployeeId}
      />
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Employee"
        message={`Are you sure you want to permanently delete ${employeeToDelete?.name}?`}
        confirmText="Delete"
        confirmButtonVariant="danger"
      />
      <ViewEmployeeModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        employeeId={selectedEmployeeId}
      />
    </>
  );
};

export default EmployeeMaster;
