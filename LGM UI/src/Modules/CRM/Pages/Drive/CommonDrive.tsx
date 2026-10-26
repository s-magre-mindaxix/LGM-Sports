import React, { useState, useEffect, useRef } from "react";
import {
  Folder,
  Upload,
  Loader2,
  ChevronRight,
  X,
  FileText,
  Search,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { API_ENDPOINTS } from "../../../../API/apiConfig";
import apiClient from "../../../../API/apiClient";
import axios from "axios";
import DeleteConfirmationModal from "./Modals/DeleteConfirmationModal";

interface Dept {
  id: number;
  departmentName: string;
}
interface CommonFile {
  id: number;
  fileName: string;
  filePath: string;
  fileType: string;
  uploadedBy: string;
  uploadedAt: string;
}

const CommonDrive: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [departments, setDepartments] = useState<Dept[]>([]);
  const [selectedDept, setSelectedDept] = useState<Dept | null>(null);
  // const [file, setFile] = useState<File | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [expandedDept, setExpandedDept] = useState<number | null>(null);
  const [deptFiles, setDeptFiles] = useState<CommonFile[]>([]);
  const [deleteConfig, setDeleteConfig] = useState<{
    id: number;
    name: string;
  } | null>(null);

  // const API_BASE_URL = API_ENDPOINTS.BaseUrl.replace("/api", "");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredDepartments = departments.filter((d) =>
    d.departmentName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleDeptSelect = (dept: Dept) => {
    setSelectedDept(dept);
    setIsDropdownOpen(false);
    setSearchTerm("");
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    const res = await apiClient.get(API_ENDPOINTS.Departments);
    setDepartments(res.data);
  };

  // const handleUpload = async () => {
  //  if (!selectedDept || files.length === 0) return toast.error("Select department & file");

  //   const formData = new FormData();
  //   formData.append("file", file);
  //   formData.append("departmentId", selectedDept.id.toString());

  //   const token = sessionStorage.getItem("token");

  //   try {
  //     toast.loading("Uploading...", { id: "common" });

  //     await axios.post(API_ENDPOINTS.CommonDriveUpload, formData, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });

  //     if (fileInputRef.current) {
  //       fileInputRef.current.value = "";
  //     }

  //     const uploadedDeptId = selectedDept.id;
  //     setFile(null);
  //     setSelectedDept(null);

  //     toast.success("File shared successfully", { id: "common" });

  //     if (expandedDept === uploadedDeptId) {
  //       fetchFiles(uploadedDeptId);
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     toast.error("Upload failed", { id: "common" });
  //   }
  // };

  const handleUpload = async () => {
  if (!selectedDept || files.length === 0) {
    return toast.error("Select department & file");
  }

  const token = sessionStorage.getItem("token");

  try {
    toast.loading("Uploading...", { id: "common" });

    for (const file of files) {
      const formData = new FormData();

      formData.append("file", file);
      formData.append("departmentId", selectedDept.id.toString());

      await axios.post(API_ENDPOINTS.CommonDriveUpload, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    const uploadedDeptId = selectedDept.id;

    setFiles([]);
    setSelectedDept(null);

    toast.success("Files shared successfully", { id: "common" });

    if (expandedDept === uploadedDeptId) {
      fetchFiles(uploadedDeptId);
    }
  } catch (error) {
    console.error(error);
    toast.error("Upload failed", { id: "common" });
  }
};

  const fetchFiles = async (deptId: number) => {
    setLoading(true);
    try {
      const res = await apiClient.get(
        `${API_ENDPOINTS.CommonDriveFiles}/${deptId}`,
      );
      setDeptFiles(res.data);
      setExpandedDept(deptId);
    } catch {
      toast.error("Failed to load files");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfig) return;

    const token = sessionStorage.getItem("token");

    try {
      await axios.delete(
        `${API_ENDPOINTS.BaseUrl}/CommonDrive/${deleteConfig.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      toast.success("File removed from common drive");
      setDeleteConfig(null);

      if (expandedDept) fetchFiles(expandedDept);
    } catch {
      toast.error("Failed to delete file");
    }
  };

  const handleDownload = async (fileId: number, fileName: string) => {
  try {
    const token = sessionStorage.getItem("token");

    const response = await axios.get(
      `${API_ENDPOINTS.BaseUrl}/CommonDrive/download/${fileId}`,
      {
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);

    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error(error);
    toast.error("Failed to download file");
  }
};

  const getFileIconLarge = (fileName: string, filePath: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    const fullUrl = `${API_ENDPOINTS.BaseUrl.replace("/api", "")}${filePath}`;

    // Image Preview
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "")) {
      return (
        <div className="w-24 h-18 rounded border border-gray-100 overflow-hidden bg-white flex items-center justify-center">
          <img
            src={fullUrl}
            alt="preview"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      );
    }

    // Document Icons
    if (ext === "pdf") {
      return (
        <div className="flex flex-col items-center">
          <FileText size={50} className="text-red-500" strokeWidth={1.5} />
          <span className="text-[10px] font-bold text-red-600 mt-[-15px] bg-white px-1">
            PDF
          </span>
        </div>
      );
    }

    if (["xlsx", "xls", "csv"].includes(ext || "")) {
      return (
        <div className="flex flex-col items-center">
          <FileText size={50} className="text-green-600" strokeWidth={1.5} />
          <span className="text-[10px] font-bold text-green-700 mt-[-15px] bg-white px-1">
            XLS
          </span>
        </div>
      );
    }

    // Default Icon
    return <FileText size={50} className="text-gray-400" strokeWidth={1.5} />;
  };

  return (
    <div className="p-0 bg-[#f0f2f9] min-h-screen">
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        {/* --- UPLOAD SECTION (Matches Image) --- */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-[#154068] mb-6">Upload File</h2>
          <div className="flex flex-wrap items-end gap-4 mb-6">
            {/* --- SEARCHABLE DROPDOWN SECTION --- */}
            <div className="w-72 relative" ref={dropdownRef}>
              <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1 tracking-wider">
                Select Department
              </label>

              {/* Trigger Button */}
              <div
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-between w-full h-10 border border-gray-300 rounded-lg px-3 bg-white cursor-pointer hover:border-blue-400 transition-all shadow-sm"
              >
                <span
                  className={`text-sm ${selectedDept ? "text-gray-800 font-medium" : "text-gray-400"}`}
                >
                  {selectedDept ? selectedDept.departmentName : "Select..."}
                </span>
                <ChevronDown
                  size={18}
                  className={`text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </div>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute z-100 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                  {/* Search Input inside Dropdown */}
                  <div className="p-2 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                    <Search size={14} className="text-gray-400" />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Search department..."
                      className="w-full bg-transparent text-sm outline-none text-gray-700"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {/* Options List */}
                  <div className="max-h-60 overflow-y-auto">
                    {filteredDepartments.length > 0 ? (
                      filteredDepartments.map((dept) => (
                        <div
                          key={dept.id}
                          onClick={() => handleDeptSelect(dept)}
                          className={`px-4 py-2 text-sm cursor-pointer transition-colors flex items-center justify-between
                ${selectedDept?.id === dept.id ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"}
              `}
                        >
                          {dept.departmentName}
                          {selectedDept?.id === dept.id && (
                            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-xs text-gray-400 italic text-center">
                        No results found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* <div className="flex items-center h-10 border border-gray-300 rounded-lg px-2 bg-gray-50">
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="text-sm text-gray-600"
              />
            </div> */}

            <div className="flex flex-col">
              <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1 tracking-wider">
                Select Document
              </label>
              <div className="w-[368px] h-[38px] flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm focus-within:border-blue-400 transition-all">
                {/* <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                /> */}

                <input
                  type="file"
                  multiple
                  ref={fileInputRef}
                  onChange={(e) => setFiles(Array.from(e.target.files || []))}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-full px-4 bg-gray-50 border-r border-gray-200 text-[13px] text-gray-700 font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap"
                >
                  Choose Files
                </button>

                {/* <div className="px-3 text-[13px] text-gray-500 truncate grow">
                  {file ? file.name : "No file chosen"}
                </div> */}

                <div className="px-3 text-[13px] text-gray-500 truncate grow">
                  {files.length > 0
                    ? `${files.length} file(s) selected`
                    : "No file chosen"}
                </div>

                {/* Clear button if file is selected */}
                {files.length > 0 && (
                  <button
                    onClick={() => {
                     setFiles([]);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="p-2 text-gray-400 hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            <button
              onClick={handleUpload}
              className="h-[38px] bg-[#f07837] text-white px-8 rounded-lg font-bold hover:bg-[#0d3357] transition-all flex items-center gap-2 shadow-md active:scale-95"
            >
              <Upload size={18} /> Upload
            </button>
          </div>
        </div>

        {/* --- FOLDER LIST SECTION (Matches Image) --- */}
        <div className="p-6">
          <h2 className="text-xl font-bold text-[#154068] mb-4 border-b pb-2">
            Uploaded Files
          </h2>

          <div className="space-y-3">
            {departments.map((dept) => (
              <div key={dept.id} className="w-full">
                {/* Department Bar */}
                <button
                  onClick={() =>
                    expandedDept === dept.id
                      ? setExpandedDept(null)
                      : fetchFiles(dept.id)
                  }
                  className="w-full bg-[#f07837] hover:bg-[#1a467e] text-white p-3 rounded-lg flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Folder size={20} className="fill-white" />
                    <span className="font-bold tracking-wide">
                      {dept.departmentName}
                    </span>
                  </div>
                  <ChevronRight
                    size={20}
                    className={`transition-transform ${expandedDept === dept.id ? "rotate-90" : ""}`}
                  />
                </button>

                {/* Expanded File List */}
                {expandedDept === dept.id && (
                  <div className="mt-2 p-4 bg-white border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                    {loading ? (
                      <div className="flex justify-center p-10">
                        <Loader2
                          className="animate-spin text-blue-600"
                          size={32}
                        />
                      </div>
                    ) : deptFiles.length > 0 ? (
                      /* --- GRID START --- */
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                        {deptFiles.map((file) => (
                          <div
                            key={file.id}
                            className="group relative border border-gray-200 rounded-lg p-3 bg-[#fdfdfd] flex flex-col items-center justify-between hover:shadow-md hover:border-blue-300 transition-all h-40"
                          >
                            {/* 1. Large File Icon */}
                            <div className="grow flex items-center justify-center mb-2">
                              {getFileIconLarge(file.fileName, file.filePath)}
                            </div>

                           <button
                            type="button"
                            onClick={() => handleDownload(file.id, file.fileName)}
                            className="text-blue-600 underline text-[13px] font-bold leading-tight text-center break-all line-clamp-3 w-full hover:text-blue-800"
                          >
                            {file.fileName}
                          </button>
                            <div className="mt-0 w-full border-t border-gray-50 pt-1">
                              <p className="text-[9px] text-gray-400 text-center font-semibold tracking-tighter">
                                Uploaded By
                              </p>
                              <p className="text-[10px] text-gray-600 text-center truncate px-1 font-medium italic">
                                {file.uploadedBy || "System"}
                              </p>

                               {/* Upload Date & Time */}
                                <p className="text-[9px] text-gray-400 text-center mt-1 font-semibold">
                                  {/* Uploaded On */}
                                </p>

                              <p className="text-[10px] text-gray-600 text-center px-1">
                              {file.uploadedAt
                                ? (() => {
                                    // Convert UTC to IST manually
                                    const utcDate = new Date(file.uploadedAt);

                                    const istDate = new Date(
                                      utcDate.getTime() + 5.5 * 60 * 60 * 1000,
                                    );

                                    const formattedDate = istDate.toLocaleDateString("en-GB", {
                                      day: "2-digit",
                                      month: "numeric",
                                      year: "numeric",
                                    });

                                    const formattedTime = istDate.toLocaleTimeString("en-IN", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: true,
                                    });

                                    return (
                                      <>
                                        {formattedDate},
                                        {formattedTime.toLowerCase()}
                                      </>
                                    );
                                  })()
                                : "-"}
                            </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                setDeleteConfig({
                                  id: file.id,
                                  name: file.fileName,
                                });
                              }}
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-red-500 bg-red-200 rounded-full p-1 transition-opacity"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* --- GRID END --- */
                      <p className="text-sm text-gray-400 italic text-center py-10">
                        No files uploaded in this department.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <DeleteConfirmationModal
        isOpen={deleteConfig !== null}
        onClose={() => setDeleteConfig(null)}
        onConfirm={handleConfirmDelete}
        itemName={deleteConfig?.name || ""}
      />
    </div>
  );
};

export default CommonDrive;
