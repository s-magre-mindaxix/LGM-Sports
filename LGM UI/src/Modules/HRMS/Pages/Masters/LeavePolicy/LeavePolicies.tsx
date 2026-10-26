// src/Features/LeaveManagement/LeavePolicies.tsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Loader2,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  BookUser, // Icon for Leave Type
  Building2, // Icon for Designation
} from "lucide-react";
import { toast } from "sonner";
import {
  getAllLeavePolicies,
  createLeavePolicy,
  type LeavePolicy,
  type LeavePolicyCreatePayload,
} from "./Services/LeavePolicyService";
import {
  getDesignations,
  type MasterDataItem,
} from "../../../Services/MasterDataService";
import {
  getAllLeaveTypes,
  type LeaveType,
} from "../LeaveType/Services/LeaveTypeService";


const LeavePolicies: React.FC = () => {
  const [policies, setPolicies] = useState<LeavePolicy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [designations, setDesignations] = useState<MasterDataItem[]>([]);
  const [selectedLeaveTypeId, setSelectedLeaveTypeId] = useState<string>("");
  const [selectedDesignationId, setSelectedDesignationId] = useState<string>("");
  const [allocatedDays, setAllocatedDays] = useState<string>("");

  const [searchQuery, setSearchQuery] = useState("");
  const [filterLeaveType, setFilterLeaveType] = useState("All");
  const [filterDesignation, setFilterDesignation] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // New state for rows per page

  const fetchPolicies = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAllLeavePolicies();
      setPolicies(data);
    } catch {
      toast.error("Failed to fetch leave policies.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPolicies();
    const fetchDropdownData = async () => {
      try {
        const [types, desigs] = await Promise.all([
          getAllLeaveTypes(),
          getDesignations(),
        ]);
        setLeaveTypes(types);
        setDesignations(desigs);
      } catch {
        toast.error("Failed to load data for creating policies.");
      }
    };
    fetchDropdownData();
  }, [fetchPolicies]);

  const filteredPolicies = useMemo(() => {
    return policies
      .filter((policy) => {
        const searchLower = searchQuery.toLowerCase();
        return (
          policy.leaveTypeName.toLowerCase().includes(searchLower) ||
          policy.designationName.toLowerCase().includes(searchLower)
        );
      })
      .filter((policy) => {
        return (
          filterLeaveType === "All" ||
          policy.leaveTypeID === parseInt(filterLeaveType)
        );
      })
      .filter((policy) => {
        return (
          filterDesignation === "All" ||
          policy.designationID === parseInt(filterDesignation)
        );
      });
  }, [policies, searchQuery, filterLeaveType, filterDesignation]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterLeaveType, filterDesignation, itemsPerPage]);

  const totalPages = Math.ceil(filteredPolicies.length / itemsPerPage);

  const paginatedPolicies = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPolicies.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPolicies, currentPage, itemsPerPage]);

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!selectedLeaveTypeId || !selectedDesignationId || !allocatedDays) {
  //     toast.error("Please fill all fields to create a policy.");
  //     return;
  //   }
  //   const days = parseInt(allocatedDays, 10);
  //   if (isNaN(days) || days <= 0) {
  //     toast.error("Allocated days must be a positive number.");
  //     return;
  //   }

  //   setIsSaving(true);
  //   try {
  //     const payload: LeavePolicyCreatePayload = {
  //       leaveTypeID: parseInt(selectedLeaveTypeId, 10),
  //       designationID: parseInt(selectedDesignationId, 10),
  //       allocatedDays: days,
  //     };
  //     await createLeavePolicy(payload);
  //     toast.success("Leave policy created successfully!");
  //     setSelectedLeaveTypeId("");
  //     setSelectedDesignationId("");
  //     setAllocatedDays("");
  //     fetchPolicies();
  //   } catch (error: unknown) {
  //     const message =
  //       error instanceof Error ? error.message : "Failed to create policy.";
  //     toast.error(message);
  //   } finally {
  //     setIsSaving(false);
  //   }
  // };

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeaveTypeId || !selectedDesignationId || !allocatedDays) {
      toast.error("Please fill all fields to create a policy.");
      return;
    }
    const days = parseInt(allocatedDays, 10);
    if (isNaN(days) || days <= 0) {
      toast.error("Allocated days must be a positive number.");
      return;
    }

    setIsSaving(true);

    const payload: LeavePolicyCreatePayload = {
      leaveTypeID: parseInt(selectedLeaveTypeId, 10),
      designationID: parseInt(selectedDesignationId, 10),
      allocatedDays: days,
    };
    
    const response = await createLeavePolicy(payload);

    if (response.status === 201 || response.status === 200) { 
      toast.success("Leave policy created successfully!");
      setSelectedLeaveTypeId("");
      setSelectedDesignationId("");
      setAllocatedDays("");
      fetchPolicies();
    } else if (response.status === 409) {
      toast.error("A policy for this Leave Type and Designation already exists.");
    } else {
      toast.error("Failed to create policy. Or Allready Assign");
    }
    
    setIsSaving(false);
  };

  return (
    <div className="p-4 md:p-4 bg-gray-50 min-h-full">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Create New Leave Policy
        </h2>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
        >
          <div className="md:col-span-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Leave Type
            </label>
            <div className="relative">
              <BookUser className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
              <select
                value={selectedLeaveTypeId}
                onChange={(e) => setSelectedLeaveTypeId(e.target.value)}
                className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
              >
                <option value="">Select Leave Type</option>
                {leaveTypes.map((lt) => (
                  <option key={lt.id} value={lt.id}>
                    {lt.leaveTypeName}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"/>
            </div>
          </div>

          <div className="md:col-span-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Designation
            </label>
             <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
              <select
                value={selectedDesignationId}
                onChange={(e) => setSelectedDesignationId(e.target.value)}
                className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
              >
                <option value="">Select Designation</option>
                {designations.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
               <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"/>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Allocated Days
            </label>
            <input
              type="number"
              value={allocatedDays}
              onChange={(e) => setAllocatedDays(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g., 12"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
            >
              {isSaving ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Plus size={10} />
              )}
              {isSaving ? "Saving..." : "Add Policy"}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Existing Leave Policies
        </h2>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by leave type or designation..."
              className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto">
            <div className="relative w-full">
              <select
                className="pl-3 pr-8 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white cursor-pointer hover:bg-gray-50 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filterLeaveType}
                onChange={(e) => setFilterLeaveType(e.target.value)}
              >
                <option value="All">All Leave Types</option>
                {leaveTypes.map((lt) => (
                  <option key={lt.id} value={lt.id}>
                    {lt.leaveTypeName}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
              />
            </div>
            <div className="relative w-full">
              <select
                className="pl-3 pr-8 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white cursor-pointer hover:bg-gray-50 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filterDesignation}
                onChange={(e) => setFilterDesignation(e.target.value)}
              >
                <option value="All">All Designations</option>
                {designations.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3">Leave Type</th>
                <th scope="col" className="px-6 py-3">Designation</th>
                <th scope="col" className="px-6 py-3">Allocated Days</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="text-center py-8">
                    <div className="flex justify-center items-center gap-2 text-gray-500">
                      <Loader2 className="animate-spin" size={20} />
                      <span>Loading Policies...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedPolicies.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-8 text-gray-500">
                    No policies found matching your criteria.
                  </td>
                </tr>
              ) : (
                paginatedPolicies.map((p) => (
                  <tr key={p.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{p.leaveTypeName}</td>
                    <td className="px-6 py-4">{p.designationName}</td>
                    <td className="px-6 py-4">{p.allocatedDays}</td>
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
      </div>
    </div>
  );
};

export default LeavePolicies;