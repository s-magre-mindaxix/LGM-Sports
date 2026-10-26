import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Folder,
  Upload,
  FolderPlus,
  ArrowLeft,
  Home,
  X,
  HardDrive,
  Loader2,
  FileIcon,
} from "lucide-react";
import { toast } from "sonner";
import apiClient from "../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../API/apiConfig";
import CreateFolderModal from "./Modals/CreateFolderModal";
import UploadFileModal from "./Modals/UploadFileModal";
import DeleteConfirmationModal from "./Modals/DeleteConfirmationModal";

// --- Interfaces ---
interface FolderItem {
  id: number;
  name: string;
  parentFolderId: number | null;
  createdAt: string;
}

interface FileItem {
  id: number;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
}

interface Breadcrumb {
  id: number | null;
  name: string;
}

const MyDrive: React.FC = () => {
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [deleteConfig, setDeleteConfig] = useState<{
    id: number;
    isFolder: boolean;
    name: string;
  } | null>(null);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);

  const [currentFolder, setCurrentFolder] = useState<Breadcrumb>({
    id: null,
    name: "Root",
  });
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([
    { id: null, name: "Root" },
  ]);

  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  // const API_BASE_URL = API_ENDPOINTS.BaseUrl.replace("/api", "");

  const fetchContent = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(
        `${API_ENDPOINTS.DriveContent}?folderId=${currentFolder.id ?? ""}`,
      );
   setFolders(
  [...res.data.folders]
    .map((f) => ({
      ...f,
      createdAt: f.createdAt || f.CreatedAt,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
);

setFiles(
  [...res.data.files]
    .map((f) => ({
      ...f,
      createdAt: f.createdAt || f.CreatedAt,
    }))
    .sort((a, b) => a.fileName.localeCompare(b.fileName))
);

    } catch {
      toast.error("Failed to load drive content");
    } finally {
      setLoading(false);
    }
  }, [currentFolder.id]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const handleCreateFolder = async (name: string) => {
    if (!name || name.trim() === "") return;
    try {
      await apiClient.post(API_ENDPOINTS.DriveCreateFolder, {
        name: name.trim(),
        parentId: currentFolder.id,
      });
      fetchContent();
      toast.success("Folder created successfully");
      setIsFolderModalOpen(false);
      setNewFolderName("");
    } catch {
      toast.error("Error creating folder");
    }
  };

  // const handleUpload = async (file: File) => {
  //   const formData = new FormData();
  //   formData.append("file", file);
  //   if (currentFolder.id)
  //     formData.append("folderId", currentFolder.id.toString());

  //   try {
  //     toast.loading("Uploading file...", { id: "upload" });
  //     await apiClient.post(API_ENDPOINTS.DriveUpload, formData, {
  //       headers: { "Content-Type": "multipart/form-data" },
  //     });
  //     fetchContent();
  //     toast.success("File uploaded successfully", { id: "upload" });
  //     setIsUploadModalOpen(false);
  //   } catch {
  //     toast.error("Upload failed", { id: "upload" });
  //   }
  // };


  const handleUpload = async (selectedFiles: File[]) => {
  if (!selectedFiles || selectedFiles.length === 0) return;

  try {
    toast.loading("Uploading files...", { id: "upload" });

    for (const file of selectedFiles) {
      const formData = new FormData();

      formData.append("file", file);

      if (currentFolder.id) {
        formData.append("folderId", currentFolder.id.toString());
      }

      await apiClient.post(API_ENDPOINTS.DriveUpload, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    }

    fetchContent();

    toast.success("Files uploaded successfully", { id: "upload" });

    setIsUploadModalOpen(false);
  } catch {
    toast.error("Upload failed", { id: "upload" });
  }
};


  const openDeleteModal = (id: number, isFolder: boolean, name: string) => {
    setDeleteConfig({ id, isFolder, name });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfig) return;

    try {
      await apiClient.delete(
        `${API_ENDPOINTS.DriveDelete}?id=${deleteConfig.id}&isFolder=${deleteConfig.isFolder}`,
      );
      fetchContent();
      toast.success("Item deleted successfully");
      setDeleteConfig(null);
    } catch {
      toast.error("Failed to delete item");
    }
  };

  const handleDownload = async (fileId: number, fileName: string) => {
  try {
    const response = await apiClient.get(
      `${API_ENDPOINTS.BaseUrl}/Drive/download/${fileId}`,
      {
        responseType: "blob",
      },
    );

    const url = window.URL.createObjectURL(
      new Blob([response.data]),
    );

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

  const navigateTo = (id: number | null, name: string) => {
    if (id === currentFolder.id && name !== "Root") return;

    if (id === null) {
      setBreadcrumbs([{ id: null, name: "Root" }]);
    } else {
      const index = breadcrumbs.findIndex((b) => b.id === id);
      if (index !== -1) {
        setBreadcrumbs(breadcrumbs.slice(0, index + 1));
      } else {
        setBreadcrumbs([...breadcrumbs, { id, name }]);
      }
    }
    setCurrentFolder({ id, name });
  };

  const goBack = () => {
    if (breadcrumbs.length > 1) {
      const parent = breadcrumbs[breadcrumbs.length - 2];
      navigateTo(parent.id, parent.name);
    }
  };

const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
  e.preventDefault();
  e.stopPropagation();
};

const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
  e.preventDefault();
  e.stopPropagation();

  // only close when leaving main container
  if (e.currentTarget.contains(e.relatedTarget as Node)) {
    return;
  }

  dragCounter.current = 0;
  setIsDragging(false);
};

const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
  e.preventDefault();
  e.stopPropagation();

  dragCounter.current++;

  if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
    setIsDragging(true);
  }
};

const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
  e.preventDefault();
  e.stopPropagation();
  setIsDragging(false);
  dragCounter.current = 0;

  const droppedFiles = e.dataTransfer.files;

  if (!droppedFiles || droppedFiles.length === 0) return;

  await handleUpload(Array.from(droppedFiles));
};

  const getFileIcon = (fileName: string) => {
  const ext = fileName.split(".").pop()?.toLowerCase();

  if (ext === "pdf")
    return (
      <div className="bg-red-500 rounded px-2 py-1 text-white font-bold text-[10px] shadow-sm">
        PDF
      </div>
    );

  if (["xlsx", "xls", "csv"].includes(ext || ""))
    return (
      <div className="bg-green-600 rounded px-2 py-1 text-white font-bold text-[10px] shadow-sm">
        XLS
      </div>
    );

  return <FileIcon size={20} className="text-blue-500" />;
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "-";

  // Convert UTC to Indian Timezone
  const utcDate = new Date(dateString);

  if (isNaN(utcDate.getTime())) return "-";

  return utcDate.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

  return (
      <div className="p-0 bg-[#f0f2f9] min-h-screen font-sans">
      <div className="bg-[#d3d9df] rounded-[20px] p-2 m-2 shadow-md border border-white/60">
        <div className="bg-white rounded-full px-5 py-2 flex flex-wrap justify-between items-center mb-4 shadow-sm border border-gray-100 gap-4">
          {/* Breadcrumbs (Left Side) */}
          <div className="bg-white border border-gray-200 rounded-full px-5 py-2 flex items-center gap-2 shadow-sm">
            {breadcrumbs.map((b, i) => (
              <React.Fragment key={i}>
                <button
                  onClick={() => navigateTo(b.id, b.name)}
                  className={`${
                    i === breadcrumbs.length - 1
                      ? "text-gray-500 cursor-default"
                      : "text-blue-600 hover:underline underline-offset-4"
                  } whitespace-nowrap px-1 transition-colors`}
                >
                  {b.name}
                </button>
                {i < breadcrumbs.length - 1 && (
                  <span className="text-gray-400 font-light">/</span>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Action Buttons (Right Side) */}
          <div className="flex items-center gap-2">
            {currentFolder.id !== null && (
              <>
                <button
                  onClick={goBack}
                  className="flex items-center gap-2 px-4 py-1.5 border border-[#0d6efd] rounded-full text-[#154068] font-bold text-[13px] hover:bg-blue-50 transition-all"
                >
                  <ArrowLeft
                    size={18}
                    strokeWidth={2}
                    className="text-[#0d6efd]"
                  />{" "}
                  Back
                </button>
                <button
                  onClick={() => navigateTo(null, "Root")}
                  className="flex items-center gap-2 px-4 py-1.5 border border-[#0d6efd] rounded-full text-[#154068] font-bold text-[13px] hover:bg-blue-50 transition-all"
                >
                  <Home size={18} strokeWidth={2} className="text-[#0d6efd]" />{" "}
                  Home
                </button>
              </>
            )}

            {/* NEW FOLDER BUTTON (Outline Style) */}
            <button
              onClick={() => setIsFolderModalOpen(true)}
              className="flex items-center gap-2 px-4 py-1.5 border border-[#0d6efd] rounded-full text-[#154068] font-bold text-[13px] hover:bg-blue-50 transition-all"
            >
              <FolderPlus
                size={18}
                strokeWidth={2}
                className="text-[#0d6efd]"
              />{" "}
              New Folder
            </button>

            {/* UPLOAD BUTTON (Solid Style) */}
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2 px-4 py-1.5 border border-[#0d6efd] rounded-full text-[#154068] font-bold text-[13px] hover:bg-blue-50 transition-all"
            >
              <Upload size={16} strokeWidth={2} className="text-[#0d6efd]" />{" "}
              Upload File
            </button>
          </div>
        </div>

      <div
          className={`bg-white rounded-2xl p-6 shadow-inner min-h-[400px] relative transition-all ${
            isDragging
              ? "border-4 border-dashed border-blue-400 bg-blue-50"
              : ""
          }`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isDragging && (
            <div className="absolute inset-0 z-40 flex items-center justify-center rounded-2xl bg-blue-100/80 pointer-events-none">
              <div className="rounded-2xl border-4 border-dashed border-blue-500 bg-white px-10 py-8 shadow-xl">
                <p className="text-2xl font-bold text-blue-700">
                  Drop files here to upload
                </p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col justify-center items-center h-64 text-blue-600">
              <Loader2 className="animate-spin mb-2" size={40} />
              <p className="font-bold">Fetching documents...</p>
            </div>
          ) : (
              <>
            {/* <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
              <p className="text-gray-300 text-sm font-medium tracking-wide">
                Drag & drop files here to upload
              </p>
            </div> */}
            <div className="absolute inset-x-0 bottom-6 flex justify-center pointer-events-none z-10">
              <div
                className={`
                  flex items-center gap-3 px-8 py-4 rounded-full
                  border-2 border-dashed shadow-md
                  transition-all duration-300
                  ${
                    isDragging
                      ? "bg-blue-100 border-blue-500 scale-105"
                      : "bg-white/80 border-gray-300"
                  }
                `}
              >
                <Upload
                  size={18}
                  className={`${
                    isDragging ? "text-blue-600 animate-bounce" : "text-gray-400"
                  }`}
                />

                <p
                  className={`text-sm font-semibold tracking-wide ${
                    isDragging ? "text-blue-700" : "text-gray-400"
                  }`}
                >
                  {isDragging
                    ? "Release to upload files"
                    : "Drag & drop files here"}
                </p>
              </div>
            </div>
           <div className="flex flex-col gap-2">
             {folders.map((f) => (
              <div
                key={f.id}
                onDoubleClick={() => navigateTo(f.id, f.name)}
                className="relative group flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-all cursor-pointer"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openDeleteModal(f.id, true, f.name);
                  }}
                  className="absolute right-3 opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full p-1 transition-all"
                >
                  <X size={12} />
                </button>

                <Folder
                  size={26}
                  className="text-[#facc15] fill-[#facc15]"
                />

               <div className="flex justify-between items-center w-full pr-8">
                  <span className="text-[14px] font-medium text-gray-800 truncate">
                    {f.name}
                  </span>

                  <span className="text-[13px] text-gray-500 whitespace-nowrap">
                    Date : {formatDate(f.createdAt)}
                  </span>
                </div>
              </div>
            ))}

         {files.map((f) => (
            <div
              key={f.id}
              className="relative group flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-all cursor-pointer"
              onClick={() => handleDownload(f.id, f.fileName)}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openDeleteModal(f.id, false, f.fileName);
                }}
                className="absolute right-3 opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full p-1 transition-all z-10"
              >
                <X size={12} />
              </button>

              <div className="shrink-0">
                {getFileIcon(f.fileName)}
              </div>

            <div className="flex justify-between items-center w-full pr-8">
              <span className="text-[14px] font-medium text-gray-800 truncate">
                {f.fileName}
              </span>

              <span className="text-[13px] text-gray-500 whitespace-nowrap">
                Date : {formatDate(f.createdAt)}
              </span>
            </div>
            </div>
          ))}
              {!loading && folders.length === 0 && files.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center h-64 text-gray-400">
                  <HardDrive size={64} strokeWidth={1} className="opacity-20" />

                  <p className="mt-4 font-semibold">This folder is empty</p>

                  {/* ADD THIS NEW TEXT */}
                  <p className="mt-2 text-sm text-gray-300 font-medium">
                    Drag & drop files here to upload
                  </p>
                </div>
              )}
            </div>
            </>
          )}
        </div>

        <div className="mt-4 py-4 text-center border-t border-gray-200">
          <p className="text-gray-500 text-[14px]">
            © 2026 <span className="font-bold">Gaxce Sensors</span>. All rights
            reserved.
          </p>
        </div>
      </div>

      <CreateFolderModal
        isOpen={isFolderModalOpen}
        onClose={() => {
          setIsFolderModalOpen(false);
          setNewFolderName("");
        }}
        onConfirm={handleCreateFolder}
        value={newFolderName}
        onChange={setNewFolderName}
      />
      <UploadFileModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
      />

      <DeleteConfirmationModal
        isOpen={deleteConfig !== null}
        onClose={() => setDeleteConfig(null)}
        onConfirm={handleConfirmDelete}
        itemName={deleteConfig?.name || ""}
      />
    </div>
  );
};

export default MyDrive;
