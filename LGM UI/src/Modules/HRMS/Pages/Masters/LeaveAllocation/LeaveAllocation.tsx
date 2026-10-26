// import React, { useState, useMemo, useEffect, useRef } from "react";
// import { CalendarPlus, Loader2, Search, ChevronLeft, ChevronRight, ChevronDown, Check } from "lucide-react";
// import { toast } from "sonner";
// import { allocateLeavesToAll, getAllocatedLeavesForYear,getEmployeeSelectionList, type AllocatedLeave, type LeaveAllocationPayload,type EmployeeSelection  } from "./Services/LeaveAllocationService";
// import { getAllLeaveTypes, type LeaveType } from "../LeaveType/Services/LeaveTypeService"; // LeaveType service import kela
// import YearPicker from "../../../../../Components/Common/YearPicker";

// const LeaveAllocation: React.FC = () => {
//   const currentYear = new Date().getFullYear();

//   // State for Allocation Form
//   const [allocationYear, setAllocationYear] = useState<string>(String(currentYear));
//   const [leaveTypeId, setLeaveTypeId] = useState<string>(""); // Navin state
//   const [allocatedDays, setAllocatedDays] = useState<string>(""); // Navin state
//   const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]); // Navin state
//   const [isAllocating, setIsAllocating] = useState(false);
//   const [employees, setEmployees] = useState<EmployeeSelection[]>([]);
//   const [employeeId, setEmployeeId] = useState<string>("");

//    const [isLeaveTypeDropdownOpen, setLeaveTypeDropdownOpen] = useState(false);
//   const [isEmployeeDropdownOpen, setEmployeeDropdownOpen] = useState(false);
//     const [employeeSearchQuery, setEmployeeSearchQuery] = useState("");

//   // NEW: Refs to detect clicks outside the dropdowns
//   const leaveTypeDropdownRef = useRef<HTMLDivElement>(null);
//   const employeeDropdownRef = useRef<HTMLDivElement>(null);

//   // State for Viewing and Filtering
//   const [viewYear, setViewYear] = useState<string>(String(currentYear));
//   const [allFetchedLeaves, setAllFetchedLeaves] = useState<AllocatedLeave[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [hasSearched, setHasSearched] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [filterLeaveType, setFilterLeaveType] = useState("All");

//   // Pagination State
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(10);

//   // Component load hotana Leave Types fetch karnya sathi
//      useEffect(() => {
//     // Load Leave Types first, as they are always needed.
//     const fetchLeaveTypes = async () => {
//       try {
//         const leaveTypeData = await getAllLeaveTypes();
//         setLeaveTypes(leaveTypeData);
//       } catch {
//         toast.error("Critical error: Failed to fetch leave types.");
//       }
//     };

//     // Load employees separately.
//     const fetchEmployees = async () => {
//       try {
//         const employeeData = await getEmployeeSelectionList();
//         setEmployees(employeeData);
//       } catch {
//         // This error is less critical and only affects Earned Leave.
//         toast.warning("Could not fetch employee list. 'Earned Leave' allocation by employee is unavailable.");
//       }
//     };

//     fetchLeaveTypes();
//     fetchEmployees();
//   }, []);

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (leaveTypeDropdownRef.current && !leaveTypeDropdownRef.current.contains(event.target as Node)) {
//         setLeaveTypeDropdownOpen(false);
//       }
//       if (employeeDropdownRef.current && !employeeDropdownRef.current.contains(event.target as Node)) {
//         setEmployeeDropdownOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//    const isEarnedLeaveSelected = useMemo(() => {
//     if (!leaveTypeId) return false;
//     const selectedType = leaveTypes.find(lt => lt.id === parseInt(leaveTypeId, 10));
//     // Making the check case-insensitive for robustness
//     return selectedType?.leaveTypeName.toLowerCase().trim() === "earned leave";
//   }, [leaveTypeId, leaveTypes]);

//    const filteredEmployees = useMemo(() => {
//     if (!employeeSearchQuery) {
//       return employees;
//     }
//     return employees.filter(emp =>
//       emp.fullName.toLowerCase().includes(employeeSearchQuery.toLowerCase())
//     );
//   }, [employees, employeeSearchQuery]);

//   // handleAllocate function purnpane navin banavla ahe
//   const handleAllocate = async (e: React.FormEvent) => {
//     e.preventDefault();

//     // Validation
//     if (!leaveTypeId) {
//       toast.error("Please select a leave type.");
//       return;
//     }
//     const days = parseFloat(allocatedDays);
//     if (isNaN(days) || days <= 0) {
//       toast.error("Please enter a valid number of days.");
//       return;
//     }
//     const year = parseInt(allocationYear, 10);
//     if (isNaN(year) || allocationYear.length !== 4) {
//       toast.error("Please provide a valid 4-digit year.");
//       return;
//     }

//     const payload: LeaveAllocationPayload = {
//       leaveTypeID: parseInt(leaveTypeId, 10),
//       allocatedDays: days,
//       financialYear: year,
//     };

//      if (isEarnedLeaveSelected) {
//       if (!employeeId) {
//         toast.error("Please select an employee for Earned Leave allocation.");
//         return;
//       }
//       payload.employeeID = parseInt(employeeId, 10);
//     }

//     setIsAllocating(true);
//     try {
//       const result = await allocateLeavesToAll(payload);
//       toast.success(result.message);
//       // Form reset kara
//       setLeaveTypeId("");
//       setAllocatedDays("");
//       setEmployeeId("");
//     } catch (error: unknown) {
//       const message = error instanceof Error ? error.message : "Allocation failed.";
//       toast.error(message);
//     } finally {
//       setIsAllocating(false);
//     }
//   };

//   const handleView = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const year = parseInt(viewYear, 10);
//     if (isNaN(year) || viewYear.length !== 4) {
//       toast.error("Please provide a valid 4-digit year to view allocations.");
//       return;
//     }
//     setIsLoading(true);
//     setHasSearched(true);
//     setAllFetchedLeaves([]);
//     try {
//       const data = await getAllocatedLeavesForYear(year);
//       setAllFetchedLeaves(data);
//     } catch {
//       toast.error(`Failed to fetch allocations for ${year}.`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Baki cha code (filtering, pagination) jasha cha tasa राहील.
//   const uniqueLeaveTypes = useMemo(() => {
//     if (!allFetchedLeaves || allFetchedLeaves.length === 0) return [];
//     const typeNames = new Set(allFetchedLeaves.map((al) => al.leaveTypeName));
//     return Array.from(typeNames);
//   }, [allFetchedLeaves]);

//   const filteredAllocations = useMemo(() => {
//     return allFetchedLeaves
//       .filter((al) => al.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) || al.leaveTypeName.toLowerCase().includes(searchQuery.toLowerCase()))
//       .filter((al) => filterLeaveType === "All" || al.leaveTypeName === filterLeaveType);
//   }, [allFetchedLeaves, searchQuery, filterLeaveType]);

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [searchQuery, itemsPerPage, filterLeaveType]);

//   const totalPages = Math.ceil(filteredAllocations.length / itemsPerPage);

//   const paginatedAllocations = useMemo(() => {
//     const startIndex = (currentPage - 1) * itemsPerPage;
//     return filteredAllocations.slice(startIndex, startIndex + itemsPerPage);
//   }, [filteredAllocations, currentPage, itemsPerPage]);

//   return (
//     <div className="p-4 md:p-4 bg-gray-50 min-h-full">
//       {/* Allocate Leaves Card - Purnpane navin design */}
//       <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
//         <h2 className="text-xl font-semibold text-gray-800 mb-4">
//           Allocate Leaves to All Employees
//         </h2>
//         <form onSubmit={handleAllocate} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">

//           {/* Leave Type Dropdown */}
//            <div className="md:col-span-1" ref={leaveTypeDropdownRef}>
//             <label htmlFor="leaveType" className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
//             <div className="relative">
//                 <button
//                     type="button"
//                     onClick={() => setLeaveTypeDropdownOpen(!isLeaveTypeDropdownOpen)}
//                     className="w-full pl-3 pr-8 py-2 text-left border border-gray-300 rounded-lg text-sm text-gray-700 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 h-[42px] flex items-center justify-between"
//                 >
//                     <span className="truncate">
//                         {leaveTypes.find(lt => lt.id === parseInt(leaveTypeId))?.leaveTypeName || "Select a type..."}
//                     </span>
//                     <ChevronDown size={16} className={`transition-transform ${isLeaveTypeDropdownOpen ? 'rotate-180' : ''}`} />
//                 </button>
//                 {isLeaveTypeDropdownOpen && (
//                     <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
//                         {leaveTypes.map((lt) => (
//                             <div
//                                 key={lt.id}
//                                 onClick={() => {
//                                     setLeaveTypeId(String(lt.id));
//                                     setLeaveTypeDropdownOpen(false);
//                                 }}
//                                 className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
//                             >
//                                 {lt.leaveTypeName}
//                                 {String(lt.id) === leaveTypeId && <Check size={16} className="text-blue-600" />}
//                             </div>
//                         ))}
//                     </div>
//                 )}
//             </div>
//           </div>

//           {/* ====== NEW: CUSTOM EMPLOYEE DROPDOWN (Conditional) ====== */}
//           {isEarnedLeaveSelected && (
//             <div className="md:col-span-1" ref={employeeDropdownRef}>
//               <label htmlFor="employee" className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
//               <div className="relative">
//                 <button
//                   type="button"
//                   onClick={() => setEmployeeDropdownOpen(!isEmployeeDropdownOpen)}
//                   className="w-full pl-3 pr-8 py-2 text-left border border-gray-300 rounded-lg text-sm text-gray-700 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 h-[42px] flex items-center justify-between"
//                 >
//                   <span className="truncate">
//                     {employees.find(emp => emp.id === parseInt(employeeId))?.fullName || "Select an employee..."}
//                   </span>
//                   <ChevronDown size={16} className={`transition-transform ${isEmployeeDropdownOpen ? 'rotate-180' : ''}`} />
//                 </button>
//                {isEmployeeDropdownOpen && (
//                   <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
//                     {/* NEW: Search Input Field */}
//                     <div className="p-2">
//                       <input
//                         type="text"
//                         placeholder="Search employees..."
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
//                         value={employeeSearchQuery}
//                         onChange={(e) => setEmployeeSearchQuery(e.target.value)}
//                         // Prevents dropdown from closing when clicking the search bar
//                         onClick={(e) => e.stopPropagation()}
//                       />
//                     </div>
//                     {/* NEW: List container with scrolling */}
//                     <div className="max-h-56 overflow-y-auto">
//                       {filteredEmployees.length > 0 ? (
//                         filteredEmployees.map((emp) => (
//                           <div
//                             key={emp.id}
//                             onClick={() => {
//                               setEmployeeId(String(emp.id));
//                               setEmployeeDropdownOpen(false);
//                               setEmployeeSearchQuery(""); // Reset search on selection
//                             }}
//                             className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
//                           >
//                             {emp.fullName}
//                             {String(emp.id) === employeeId && <Check size={16} className="text-blue-600" />}
//                           </div>
//                         ))
//                       ) : (
//                         <div className="px-3 py-2 text-sm text-gray-500 text-center">No employees found.</div>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Allocated Days Input */}
//           <div className="md:col-span-1">
//              <label htmlFor="allocatedDays" className="block text-sm font-medium text-gray-700 mb-1">Allocated Days</label>
//              <input
//                 id="allocatedDays"
//                 type="number"
//                 step="0.5"
//                 min="0"
//                 placeholder="e.g., 12"
//                 value={allocatedDays}
//                 onChange={(e) => setAllocatedDays(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm h-[42px]"
//               />
//           </div>

//           {/* Year Picker */}
//           <div className="md:col-span-1">
//              <YearPicker label="Financial Year" value={allocationYear} onChange={setAllocationYear} />
//           </div>

//           {/* Submit Button */}
//           <div className="md:col-span-1">
//             <button
//               type="submit"
//               disabled={isAllocating}
//               className="w-full flex items-center justify-center gap-2 bg-[#2eacb3]  text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-green-400 h-[42px]"
//             >
//               {isAllocating ? <Loader2 className="animate-spin" size={18} /> : <CalendarPlus size={18} />}
//               {isAllocating ? "Allocating..." : "Run Allocation"}
//             </button>
//           </div>
//         </form>
//          <p className="text-xs text-gray-500 mt-2">
//            {isEarnedLeaveSelected
//               ? "This action will assign the specified leave days to the selected employee."
//               : "This action will assign the specified leave type and days to ALL active employees for the selected financial year."
//            }
//         </p>
//       </div>

//       {/* View Allocations Card - Hya madhe kahi badal nahi */}
//       <div className="bg-white rounded-lg shadow-sm p-6">
//         <h2 className="text-xl font-semibold text-gray-800 mb-4">
//           View Leave Allocations
//         </h2>
//         {/* View form ani table jasha cha tasa राहील */}
//          <form onSubmit={handleView} className="flex flex-col md:flex-row items-end gap-4 mb-4">
//           <YearPicker label="Financial Year" value={viewYear} onChange={setViewYear} />
//           <div className="w-full md:w-1/3">
//             <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 bg-[#2eacb3] hover:bg-teal-800 text-white font-semibold px-4 py-2 rounded-lg  disabled:bg-blue-400 h-[42px]">
//               {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
//               View
//             </button>
//           </div>
//         </form>

//         {hasSearched && (
//           <>
//             <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
//               <div className="relative w-full md:max-w-xs">
//                 <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                 <input type="text" placeholder="Search by employee or leave..." className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} disabled={!allFetchedLeaves.length}/>
//               </div>
//               <div className="relative w-full md:w-auto md:max-w-xs">
//                 <select className="w-full pl-3 pr-8 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white cursor-pointer hover:bg-gray-50 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500" value={filterLeaveType} onChange={(e) => setFilterLeaveType(e.target.value)} disabled={uniqueLeaveTypes.length === 0}>
//                   <option value="All">All Leave Types</option>
//                   {uniqueLeaveTypes.map((lt) => (<option key={lt} value={lt}>{lt}</option>))}
//                 </select>
//                 <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"/>
//               </div>
//             </div>

//             <div className="overflow-x-auto">
//               <table className="w-full text-sm text-left text-gray-600">
//                 <thead className="bg-gray-50 text-xs uppercase text-gray-700">
//                   <tr>
//                     <th scope="col" className="px-6 py-3">Employee Name</th>
//                     <th scope="col" className="px-6 py-3">Leave Type</th>
//                     <th scope="col" className="px-6 py-3">Allocated Days</th>
//                     <th scope="col" className="px-6 py-3">Financial Year</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {isLoading ? (
//                     <tr><td colSpan={4} className="text-center py-8"><div className="flex justify-center items-center gap-2 text-gray-500"><Loader2 className="animate-spin" size={20} /><span>Loading Allocations...</span></div></td></tr>
//                   ) : paginatedAllocations.length === 0 ? (
//                     <tr><td colSpan={4} className="text-center py-8 text-gray-500">{allFetchedLeaves.length > 0 ? "No allocations match your search/filter." : `No leave allocations found for the year ${viewYear}.`}</td></tr>
//                   ) : (
//                     paginatedAllocations.map((al) => (
//                       <tr key={al.assignLeaveTypeID} className="bg-white border-b hover:bg-gray-50">
//                         <td className="px-6 py-4 font-medium text-gray-900">{al.employeeName}</td>
//                         <td className="px-6 py-4">{al.leaveTypeName}</td>
//                         <td className="px-6 py-4">{al.allocatedDays}</td>
//                         <td className="px-6 py-4">{al.financialYear}</td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             </div>

//             {totalPages > 0 && (
//               <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
//                 <div className="flex items-center gap-2">
//                   <span>Rows per page:</span>
//                   <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))} className="p-1 border border-gray-300 rounded-md bg-white">
//                     <option value={5}>5</option><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option>
//                   </select>
//                 </div>
//                 <div className="flex items-center gap-4">
//                   <span>Page {currentPage} of {totalPages}</span>
//                   <div className="flex items-center gap-2">
//                     <button onClick={() => setCurrentPage((prev) => prev - 1)} disabled={currentPage === 1} className="p-2 border rounded-md hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed"><ChevronLeft size={16} /></button>
//                     <button onClick={() => setCurrentPage((prev) => prev + 1)} disabled={currentPage === totalPages} className="p-2 border rounded-md hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed"><ChevronRight size={16} /></button>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default LeaveAllocation;

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  CalendarPlus,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  allocateLeavesToAll,
  getAllocatedLeavesForYear,
  getEmployeeSelectionList,
  updateAllocatedLeave,
  type AllocatedLeave,
  type LeaveAllocationPayload,
  type EmployeeSelection,
  type LeaveUpdatePayload,
} from "./Services/LeaveAllocationService";
import {
  getAllLeaveTypes,
  type LeaveType,
} from "../LeaveType/Services/LeaveTypeService"; // LeaveType service import kela
// import YearPicker from "../../../Components/Common/YearPicker";
import YearPicker from "../../../../../Components/Common/YearPicker";
import { FaEdit } from "react-icons/fa";

const LeaveAllocation: React.FC = () => {
  const currentYear = new Date().getFullYear();

  // State for Allocation Form
  const [allocationYear, setAllocationYear] = useState<string>(
    String(currentYear),
  );
  const [leaveTypeId, setLeaveTypeId] = useState<string>(""); // Navin state
  const [allocatedDays, setAllocatedDays] = useState<string>(""); // Navin state
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]); // Navin state
  const [isAllocating, setIsAllocating] = useState(false);
  const [employees, setEmployees] = useState<EmployeeSelection[]>([]);
  const [employeeId, setEmployeeId] = useState<string>("");

  const [isLeaveTypeDropdownOpen, setLeaveTypeDropdownOpen] = useState(false);
  const [isEmployeeDropdownOpen, setEmployeeDropdownOpen] = useState(false);
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState("");

  // NEW: Refs to detect clicks outside the dropdowns
  const leaveTypeDropdownRef = useRef<HTMLDivElement>(null);
  const employeeDropdownRef = useRef<HTMLDivElement>(null);

  // State for Viewing and Filtering
  const [viewYear, setViewYear] = useState<string>(String(currentYear));
  const [allFetchedLeaves, setAllFetchedLeaves] = useState<AllocatedLeave[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLeaveType, setFilterLeaveType] = useState("All");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLeave, setEditingLeave] = useState<AllocatedLeave | null>(null);
  const [updatedAllocatedDays, setUpdatedAllocatedDays] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Component load hotana Leave Types fetch karnya sathi
  useEffect(() => {
    // Load Leave Types first, as they are always needed.
    const fetchLeaveTypes = async () => {
      try {
        const leaveTypeData = await getAllLeaveTypes();
        setLeaveTypes(leaveTypeData);
      } catch {
        toast.error("Critical error: Failed to fetch leave types.");
      }
    };

    // Load employees separately.
    const fetchEmployees = async () => {
      try {
        const employeeData = await getEmployeeSelectionList();
        setEmployees(employeeData);
      } catch {
        // This error is less critical and only affects Earned Leave.
        toast.warning(
          "Could not fetch employee list. 'Earned Leave' allocation by employee is unavailable.",
        );
      }
    };

    fetchLeaveTypes();
    fetchEmployees();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        leaveTypeDropdownRef.current &&
        !leaveTypeDropdownRef.current.contains(event.target as Node)
      ) {
        setLeaveTypeDropdownOpen(false);
      }
      if (
        employeeDropdownRef.current &&
        !employeeDropdownRef.current.contains(event.target as Node)
      ) {
        setEmployeeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isEarnedLeaveSelected = useMemo(() => {
    if (!leaveTypeId) return false;
    const selectedType = leaveTypes.find(
      (lt) => lt.id === parseInt(leaveTypeId, 10),
    );
    // Making the check case-insensitive for robustness
    return selectedType?.leaveTypeName.toLowerCase().trim() === "earned leave";
  }, [leaveTypeId, leaveTypes]);

  const filteredEmployees = useMemo(() => {
    if (!employeeSearchQuery) {
      return employees;
    }
    return employees.filter((emp) =>
      emp.fullName.toLowerCase().includes(employeeSearchQuery.toLowerCase()),
    );
  }, [employees, employeeSearchQuery]);

  // handleAllocate function purnpane navin banavla ahe
  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!leaveTypeId) {
      toast.error("Please select a leave type.");
      return;
    }
    const days = parseFloat(allocatedDays);
    if (isNaN(days) || days <= 0) {
      toast.error("Please enter a valid number of days.");
      return;
    }
    const year = parseInt(allocationYear, 10);
    if (isNaN(year) || allocationYear.length !== 4) {
      toast.error("Please provide a valid 4-digit year.");
      return;
    }

    const payload: LeaveAllocationPayload = {
      leaveTypeID: parseInt(leaveTypeId, 10),
      allocatedDays: days,
      financialYear: year,
    };

    if (isEarnedLeaveSelected) {
      if (!employeeId) {
        toast.error("Please select an employee for Earned Leave allocation.");
        return;
      }
      payload.employeeID = parseInt(employeeId, 10);
    }

    setIsAllocating(true);
    try {
      const result = await allocateLeavesToAll(payload);
      toast.success(result.message);
      // Form reset kara
      setLeaveTypeId("");
      setAllocatedDays("");
      setEmployeeId("");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Allocation failed.";
      toast.error(message);
    } finally {
      setIsAllocating(false);
    }
  };

  const handleView = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    const year = parseInt(viewYear, 10);
    if (isNaN(year) || viewYear.length !== 4) {
      toast.error("Please provide a valid 4-digit year to view allocations.");
      return;
    }
    setIsLoading(true);
    setHasSearched(true);
    setAllFetchedLeaves([]);
    try {
      const data = await getAllocatedLeavesForYear(year);
      setAllFetchedLeaves(data);
    } catch {
      toast.error(`Failed to fetch allocations for ${year}.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (leave: AllocatedLeave) => {
    setEditingLeave(leave);
    setUpdatedAllocatedDays(String(leave.allocatedDays));
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setEditingLeave(null);
    setUpdatedAllocatedDays("");
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLeave) return;

    const days = parseFloat(updatedAllocatedDays);
    if (isNaN(days) || days <= 0) {
      toast.error("Please enter a valid number of days to update.");
      return;
    }

    const payload: LeaveUpdatePayload = { allocatedDays: days };
    setIsUpdating(true);
    try {
      const result = await updateAllocatedLeave(
        editingLeave.assignLeaveTypeID,
        payload,
      );
      toast.success(result.message);
      handleCloseModal();
      await handleView(); // Refresh the data in the table
    } catch (error: unknown) {
      console.error("Update failed:", error); // Log the full error for debugging
      const message =
        error instanceof Error
          ? error.message
          : "An unknown error occurred during the update.";
      toast.error(message);
    } finally {
      setIsUpdating(false);
    }
  };

  // Baki cha code (filtering, pagination) jasha cha tasa राहील.
  const uniqueLeaveTypes = useMemo(() => {
    if (!allFetchedLeaves || allFetchedLeaves.length === 0) return [];
    const typeNames = new Set(allFetchedLeaves.map((al) => al.leaveTypeName));
    return Array.from(typeNames);
  }, [allFetchedLeaves]);

  const filteredAllocations = useMemo(() => {
    return allFetchedLeaves
      .filter(
        (al) =>
          al.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          al.leaveTypeName.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .filter(
        (al) =>
          filterLeaveType === "All" || al.leaveTypeName === filterLeaveType,
      );
  }, [allFetchedLeaves, searchQuery, filterLeaveType]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage, filterLeaveType]);

  const totalPages = Math.ceil(filteredAllocations.length / itemsPerPage);

  const paginatedAllocations = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAllocations.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAllocations, currentPage, itemsPerPage]);

  return (
    <div className="p-4 md:p-4 bg-gray-50 min-h-full">
      {/* Allocate Leaves Card - Purnpane navin design */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Allocate Leaves to All Employees
        </h2>
        <form
          onSubmit={handleAllocate}
          className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end"
        >
          {/* Leave Type Dropdown */}
          <div className="md:col-span-1" ref={leaveTypeDropdownRef}>
            <label
              htmlFor="leaveType"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Leave Type
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setLeaveTypeDropdownOpen(!isLeaveTypeDropdownOpen)
                }
                className="w-full pl-3 pr-8 py-2 text-left border border-gray-300 rounded-lg text-sm text-gray-700 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 h-[42px] flex items-center justify-between"
              >
                <span className="truncate">
                  {leaveTypes.find((lt) => lt.id === parseInt(leaveTypeId))
                    ?.leaveTypeName || "Select a type..."}
                </span>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${isLeaveTypeDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isLeaveTypeDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {leaveTypes.map((lt) => (
                    <div
                      key={lt.id}
                      onClick={() => {
                        setLeaveTypeId(String(lt.id));
                        setLeaveTypeDropdownOpen(false);
                      }}
                      className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                    >
                      {lt.leaveTypeName}
                      {String(lt.id) === leaveTypeId && (
                        <Check size={16} className="text-blue-600" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ====== NEW: CUSTOM EMPLOYEE DROPDOWN (Conditional) ====== */}
          {isEarnedLeaveSelected && (
            <div className="md:col-span-1" ref={employeeDropdownRef}>
              <label
                htmlFor="employee"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Employee
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setEmployeeDropdownOpen(!isEmployeeDropdownOpen)
                  }
                  className="w-full pl-3 pr-8 py-2 text-left border border-gray-300 rounded-lg text-sm text-gray-700 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 h-[42px] flex items-center justify-between"
                >
                  <span className="truncate">
                    {employees.find((emp) => emp.id === parseInt(employeeId))
                      ?.fullName || "Select an employee..."}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${isEmployeeDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isEmployeeDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                    {/* NEW: Search Input Field */}
                    <div className="p-2">
                      <input
                        type="text"
                        placeholder="Search employees..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                        value={employeeSearchQuery}
                        onChange={(e) => setEmployeeSearchQuery(e.target.value)}
                        // Prevents dropdown from closing when clicking the search bar
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    {/* NEW: List container with scrolling */}
                    <div className="max-h-56 overflow-y-auto">
                      {filteredEmployees.length > 0 ? (
                        filteredEmployees.map((emp) => (
                          <div
                            key={emp.id}
                            onClick={() => {
                              setEmployeeId(String(emp.id));
                              setEmployeeDropdownOpen(false);
                              setEmployeeSearchQuery(""); // Reset search on selection
                            }}
                            className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                          >
                            {emp.fullName}
                            {String(emp.id) === employeeId && (
                              <Check size={16} className="text-blue-600" />
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-gray-500 text-center">
                          No employees found.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Allocated Days Input */}
          <div className="md:col-span-1">
            <label
              htmlFor="allocatedDays"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Allocated Days
            </label>
            <input
              id="allocatedDays"
              type="number"
              step="0.5"
              min="0"
              placeholder="e.g., 12"
              value={allocatedDays}
              onChange={(e) => setAllocatedDays(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm h-[42px]"
            />
          </div>

          {/* Year Picker */}
          <div className="md:col-span-1">
            <YearPicker
              label="Financial Year"
              value={allocationYear}
              onChange={setAllocationYear}
            />
          </div>

          {/* Submit Button */}
          <div className="md:col-span-1">
            <button
              type="submit"
              disabled={isAllocating}
              className="w-full flex items-center justify-center gap-2 bg-[#f07837]  text-white font-semibold px-4 py-2 rounded-lg  h-[42px]"
            >
              {isAllocating ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <CalendarPlus size={18} />
              )}
              {isAllocating ? "Allocating..." : "Run Allocation"}
            </button>
          </div>
        </form>
        <p className="text-xs text-gray-500 mt-2">
          {isEarnedLeaveSelected
            ? "This action will assign the specified leave days to the selected employee."
            : "This action will assign the specified leave type and days to ALL active employees for the selected financial year."}
        </p>
      </div>

      {/* View Allocations Card - Hya madhe kahi badal nahi */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          View Leave Allocations
        </h2>
        {/* View form ani table jasha cha tasa राहील */}
        <form
          onSubmit={handleView}
          className="flex flex-col md:flex-row items-end gap-4 mb-4"
        >
          <YearPicker
            label="Financial Year"
            value={viewYear}
            onChange={setViewYear}
          />
          <div className="w-full md:w-1/3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-[#f07837]  text-white font-semibold px-4 py-2 rounded-lg  h-[42px]"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Search size={18} />
              )}
              View
            </button>
          </div>
        </form>

        {hasSearched && (
          <>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
              <div className="relative w-full md:max-w-xs">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by employee or leave..."
                  className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={!allFetchedLeaves.length}
                />
              </div>
              <div className="relative w-full md:w-auto md:max-w-xs">
                <select
                  className="w-full pl-3 pr-8 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white cursor-pointer hover:bg-gray-50 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filterLeaveType}
                  onChange={(e) => setFilterLeaveType(e.target.value)}
                  disabled={uniqueLeaveTypes.length === 0}
                >
                  <option value="All">All Leave Types</option>
                  {uniqueLeaveTypes.map((lt) => (
                    <option key={lt} value={lt}>
                      {lt}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-600">
                <thead className="bg-[#f07837] text-white uppercase text-xs">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Employee Name
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Leave Type
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Allocated Days
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Financial Year
                    </th>
                    <th scope="col" className="px-6 py-3 text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8">
                        <div className="flex justify-center items-center gap-2 text-gray-500">
                          <Loader2 className="animate-spin" size={20} />
                          <span>Loading Allocations...</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedAllocations.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center py-8 text-gray-500"
                      >
                        {allFetchedLeaves.length > 0
                          ? "No allocations match your search/filter."
                          : `No leave allocations found for the year ${viewYear}.`}
                      </td>
                    </tr>
                  ) : (
                    paginatedAllocations.map((al) => (
                      <tr
                        key={al.assignLeaveTypeID}
                        className="bg-white border-b hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {al.employeeName}
                        </td>
                        <td className="px-6 py-4">{al.leaveTypeName}</td>
                        <td className="px-6 py-4">{al.allocatedDays}</td>
                        <td className="px-6 py-4">{al.financialYear}</td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleEditClick(al)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="Edit"
                          >
                            <FaEdit size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 0 && (
              <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span>Rows per page:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="p-1 border border-gray-300 rounded-md bg-white"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                <div className="flex items-center gap-4">
                  <span>
                    Page {currentPage} of {totalPages}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                      disabled={currentPage === 1}
                      className="p-2 border rounded-md hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 border rounded-md hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {isEditModalOpen && editingLeave && (
        <div className="fixed inset-0 bg-transparent backdrop-brightness-70 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4 transform transition-all">
            <div className="flex justify-between items-center mb-4">
              <h3
                className="text-lg font-semibold text-gray-800"
                id="modal-title"
              >
                Edit Leave Allocation
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleUpdateSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Employee
                  </label>
                  <p className="mt-1 text-md text-gray-900 font-semibold">
                    {editingLeave.employeeName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Leave Type
                  </label>
                  <p className="mt-1 text-md text-gray-900">
                    {editingLeave.leaveTypeName}
                  </p>
                </div>
                <div>
                  <label
                    htmlFor="updateAllocatedDays"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Allocated Days
                  </label>
                  <input
                    id="updateAllocatedDays"
                    type="number"
                    step="0.5"
                    min="0"
                    value={updatedAllocatedDays}
                    onChange={(e) => setUpdatedAllocatedDays(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="bg-gray-500 text-white px-8 py-2 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                    className="bg-green-700 text-white px-8 py-2 rounded-lg font-semibold hover:bg-green-800 disabled:bg-gray-400"
                >
                  {isUpdating ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveAllocation;
