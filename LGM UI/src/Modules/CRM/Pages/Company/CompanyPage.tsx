// // import React, { useEffect, useState } from "react";
// // import {
// //   getCompanies,
// //   deleteCompany,
// //   getCompanyById,
// // } from "./Services/CompanyService";
// // import type { Company, CompanyListItem } from "./Services/types";
// // import CompanyWizard from "./CompanyWizard";
// // import { type TableColumn } from "react-data-table-component";
// // import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
// // import CompanyViewModal from "./CompanyViewModal";
// // import ListingLayout from "../../../../Components/Common/ListingLayout";
// // import { actionButtonStyles } from "../../../../Components/Common/buttonStyles";
// // import { usePermissions } from "../../../../hooks/usePermissions";

// // const CompanyPage: React.FC = () => {
// //   const [companies, setCompanies] = useState<CompanyListItem[]>([]);
// //   const [showWizard, setShowWizard] = useState<boolean>(false);
// //   const [editData, setEditData] = useState<Company | null>(null);
// //   const [isLoading, setIsLoading] = useState<boolean>(false);
// //   const [filterText, setFilterText] = useState("");
// //   const [viewData, setViewData] = useState<Company | null>(null);

// //   const { hasPermission } = usePermissions();
// //   const canAdd = hasPermission("Company", "CanAdd");
// //   const canEdit = hasPermission("Company", "CanEdit");
// //   const canDelete = hasPermission("Company", "CanDelete");

// //   const loadCompanies = async () => {
// //     try {
// //       setIsLoading(true);
// //       const data = await getCompanies();
// //       setCompanies(data);
// //     } catch (error) {
// //       console.error("Failed to load companies:", error);
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     loadCompanies();
// //     const handleRefresh = () => {
// //       loadCompanies();
// //     };

// //     window.addEventListener("app-refresh", handleRefresh);

// //     return () => {
// //       window.removeEventListener("app-refresh", handleRefresh);
// //     };
// //   }, []);

// //   const handleCreateNew = () => {
// //     setEditData(null);
// //     setShowWizard(true);
// //     window.scrollTo({ top: 0, behavior: "smooth" });
// //   };

// //   const handleView = async (companyId: number) => {
// //     try {
// //       setIsLoading(true);
// //       const fullCompanyData = await getCompanyById(companyId);
// //       setViewData(fullCompanyData);
// //     } catch {
// //       alert("Could not load details.");
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   const handleEdit = async (companyId: number) => {
// //     try {
// //       setIsLoading(true);
// //       const fullCompanyData = await getCompanyById(companyId);
// //       setEditData(fullCompanyData);
// //       setShowWizard(true);
// //       window.scrollTo({ top: 0, behavior: "smooth" });
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   const handleDelete = async (companyId: number) => {
// //     if (window.confirm("Are you sure?")) {
// //       await deleteCompany(companyId);
// //       await loadCompanies();
// //     }
// //   };

// //   const handleSuccess = () => {
// //     setShowWizard(false);
// //     setEditData(null);
// //     loadCompanies();
// //   };

// //   const columns: TableColumn<CompanyListItem>[] = [
// //     { name: "Sr. No.", cell: (_row, index) => (index ?? 0) + 1, width: "60px" },
// //     {
// //       name: "Company Name",
// //       selector: (row) => row.companyName,
// //       sortable: true,
// //       wrap: true,
// //       grow: 2.5,
// //     },
// //     {
// //       name: "Res Person Name",
// //       selector: (row) => row.directorName || "N/A",
// //       grow: 2,
// //       sortable: true,
// //     },
// //     {
// //       name: "Designation",
// //       selector: (row) => row.designation || "N/A",
// //       grow: 2,
// //     },
// //     { name: "Mobile No.", selector: (row) => row.mobileNo || "N/A", grow: 2 },
// //     {
// //       name: "Email Address",
// //       selector: (row) => row.email || "N/A",
// //       wrap: true,
// //       grow: 2,
// //       width: "180px",
// //     },
// //     {
// //       name: "Actions",
// //       cell: (row) => (
// //         <div className="flex justify-center gap-4">
// //           <button
// //             onClick={() => handleView(row.companyId)}
// //             className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}
// //             title="View"
// //           >
// //             <FaEye size={16} />
// //           </button>
// //           {canEdit && (
// //             <button
// //               onClick={() => handleEdit(row.companyId)}
// //               className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}
// //               title="Edit"
// //             >
// //               <FaEdit size={16} />
// //             </button>
// //           )}
// //           {canDelete && (
// //             <button
// //               onClick={() => handleDelete(row.companyId)}
// //               className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`}
// //               title="Delete"
// //             >
// //               <FaTrash size={16} />
// //             </button>
// //           )}
// //         </div>
// //       ),
// //       grow: 2,
// //       width: "150px",
// //     },
// //   ];

// //   const filteredItems = companies.filter((item) =>
// //     JSON.stringify(item).toLowerCase().includes(filterText.toLowerCase()),
// //   );

// //   return (
// //     <div className="p-4 bg-[#f5f6fa] min-h-screen space-y-6">
// //       {/* FORM AT THE TOP */}
// //       {showWizard && (
// //         <CompanyWizard
// //           editData={editData}
// //           onSuccess={handleSuccess}
// //           onCancel={() => setShowWizard(false)}
// //         />
// //       )}

// //       {/* VIEW MODAL OVERLAY */}
// //       {viewData && (
// //         <CompanyViewModal
// //           company={viewData}
// //           onClose={() => setViewData(null)}
// //         />
// //       )}

// //       {/* LISTING BOX */}
// //       <ListingLayout
// //         title="Listing of Companies"
// //         columns={columns}
// //         data={filteredItems}
// //         isLoading={isLoading}
// //         filterText={filterText}
// //         onFilterChange={setFilterText}
// //         onCreate={canAdd ? handleCreateNew : undefined}
// //       />
// //     </div>
// //   );
// // };

// // export default CompanyPage;



// import React, { useEffect, useState } from "react";
// import {
//   getCompanies,
//   deleteCompany,
//   getCompanyById,
// } from "./Services/CompanyService";
// import type { Company, CompanyListItem } from "./Services/types";
// import { API_ENDPOINTS } from "../../../../API/apiConfig";
// import CompanyWizard from "./CompanyWizard";
// import { type TableColumn } from "react-data-table-component";
// import { FaEdit, FaTrash, FaEye, FaBuilding } from "react-icons/fa";
// import CompanyViewModal from "./CompanyViewModal";
// import ListingLayout from "../../../../Components/Common/ListingLayout";
// import { actionButtonStyles } from "../../../../Components/Common/buttonStyles";
// import { usePermissions } from "../../../../hooks/usePermissions";


// const getCompanyLogoUrl = (row: CompanyListItem): string | null => {
//   const item = row as any;
//   const path = item.logoPath ?? item.LogoPath ?? item.companyLogoPath ?? item.CompanyLogoPath ?? item.companyLogoUrl ?? item.CompanyLogoUrl ?? item.logoUrl ?? item.companyLogo ?? item.CompanyLogo;

//   if (!path) return null;
//   if (/^(https?:|data:|blob:)/i.test(path)) return path;

//   const baseUrl = API_ENDPOINTS.BaseUrl.replace(/\/api(?:\/.*)?$/i, "").replace(/\/$/, "");
//   const normalizedPath = path.replace(/\\/g, "/").replace(/^\/+/, "");
//   return `${baseUrl}/${normalizedPath}`;
// };
// const CompanyPage: React.FC = () => {
//   const [companies, setCompanies] = useState<CompanyListItem[]>([]);
//   const [showWizard, setShowWizard] = useState<boolean>(false);
//   const [editData, setEditData] = useState<Company | null>(null);
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [filterText, setFilterText] = useState("");
//   const [viewData, setViewData] = useState<Company | null>(null);

//   const { hasPermission } = usePermissions();
//   const canAdd = hasPermission("Company", "CanAdd");
//   const canEdit = hasPermission("Company", "CanEdit");
//   const canDelete = hasPermission("Company", "CanDelete");

//   const loadCompanies = async () => {
//     try {
//       setIsLoading(true);
//       const data = await getCompanies();
//       setCompanies(data);
//     } catch (error) {
//       console.error("Failed to load companies:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadCompanies();
//     const handleRefresh = () => {
//       loadCompanies();
//     };

//     window.addEventListener("app-refresh", handleRefresh);

//     return () => {
//       window.removeEventListener("app-refresh", handleRefresh);
//     };
//   }, []);

//   const handleCreateNew = () => {
//     setEditData(null);
//     setShowWizard(true);
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };

//   const handleView = async (companyId: number) => {
//     try {
//       setIsLoading(true);
//       const fullCompanyData = await getCompanyById(companyId);
//       setViewData(fullCompanyData);
//     } catch {
//       alert("Could not load details.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleEdit = async (companyId: number) => {
//     try {
//       setIsLoading(true);
//       const fullCompanyData = await getCompanyById(companyId);
//       setEditData(fullCompanyData);
//       setShowWizard(true);
//       window.scrollTo({ top: 0, behavior: "smooth" });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleDelete = async (companyId: number) => {
//     if (window.confirm("Are you sure?")) {
//       await deleteCompany(companyId);
//       await loadCompanies();
//     }
//   };

//   const handleSuccess = () => {
//     setShowWizard(false);
//     setEditData(null);
//     loadCompanies();
//   };

//   const columns: TableColumn<CompanyListItem>[] = [
//     {
//       name: "Logo",
//       cell: (row) => {
//         const logoUrl = getCompanyLogoUrl(row);
//         return (
//           <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-white">
//             {logoUrl ? (
//               <>
//                 <img
//                   src={logoUrl}
//                   alt={`${row.companyName} logo`}
//                   className="h-full w-full object-contain"
//                   onError={(event) => {
//                     event.currentTarget.classList.add("hidden");
//                     event.currentTarget.nextElementSibling?.classList.remove("hidden");
//                   }}
//                 />
//                 <FaBuilding className="hidden text-gray-300" aria-hidden="true" />
//               </>
//             ) : (
//               <FaBuilding className="text-gray-300" aria-hidden="true" />
//             )}
//           </div>
//         );
//       },
//       width: "80px",
//       ignoreRowClick: true,
//     },    { name: "Sr. No.", cell: (_row, index) => (index ?? 0) + 1, width: "60px" },
//     {
//       name: "Company Name",
//       selector: (row) => row.companyName,
//       sortable: true,
//       wrap: true,
//       grow: 2.5,
//     },
//     {
//       name: "Res Person Name",
//       selector: (row) => row.directorName || "N/A",
//       grow: 2,
//       sortable: true,
//     },
//     {
//       name: "Designation",
//       selector: (row) => row.designation || "N/A",
//       grow: 2,
//     },
//     { name: "Mobile No.", selector: (row) => row.mobileNo || "N/A", grow: 2 },
//     {
//       name: "Email Address",
//       selector: (row) => row.email || "N/A",
//       wrap: true,
//       grow: 2,
//       width: "180px",
//     },
//     {
//       name: "Actions",
//       cell: (row) => (
//         <div className="flex justify-center gap-4">
//           <button
//             onClick={() => handleView(row.companyId)}
//             className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}
//             title="View"
//           >
//             <FaEye size={16} />
//           </button>
//           {canEdit && (
//             <button
//               onClick={() => handleEdit(row.companyId)}
//               className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}
//               title="Edit"
//             >
//               <FaEdit size={16} />
//             </button>
//           )}
//           {canDelete && (
//             <button
//               onClick={() => handleDelete(row.companyId)}
//               className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`}
//               title="Delete"
//             >
//               <FaTrash size={16} />
//             </button>
//           )}
//         </div>
//       ),
//       grow: 2,
//       width: "150px",
//     },
//   ];

//   const filteredItems = companies.filter((item) =>
//     JSON.stringify(item).toLowerCase().includes(filterText.toLowerCase()),
//   );

//   return (
//     <div className="p-4 bg-[#f5f6fa] min-h-screen space-y-6">
//       {/* FORM AT THE TOP */}
//       {showWizard && (
//         <CompanyWizard
//           editData={editData}
//           onSuccess={handleSuccess}
//           onCancel={() => setShowWizard(false)}
//         />
//       )}

//       {/* VIEW MODAL OVERLAY */}
//       {viewData && (
//         <CompanyViewModal
//           company={viewData}
//           onClose={() => setViewData(null)}
//         />
//       )}

//       {/* LISTING BOX */}
//       <ListingLayout
//         title="Listing of Companies"
//         columns={columns}
//         data={filteredItems}
//         isLoading={isLoading}
//         filterText={filterText}
//         onFilterChange={setFilterText}
//         onCreate={canAdd ? handleCreateNew : undefined}
//       />
//     </div>
//   );
// };

// export default CompanyPage;




import React, { useEffect, useState } from "react";
import {
  getCompanies,
  deleteCompany,
  getCompanyById,
} from "./Services/CompanyService";
import type { Company, CompanyListItem } from "./Services/types";
import { API_ENDPOINTS } from "../../../../API/apiConfig";
import CompanyWizard from "./CompanyWizard";
import { type TableColumn } from "react-data-table-component";
import { FaEdit, FaTrash, FaEye, FaBuilding } from "react-icons/fa";
import CompanyViewModal from "./CompanyViewModal";
import ListingLayout from "../../../../Components/Common/ListingLayout";
import { actionButtonStyles } from "../../../../Components/Common/buttonStyles";
import { usePermissions } from "../../../../hooks/usePermissions";


const getCompanyLogoUrl = (row: CompanyListItem): string | null => {
  const item = row as any;
  const path = item.logoPath ?? item.LogoPath ?? item.companyLogoPath ?? item.CompanyLogoPath ?? item.companyLogoUrl ?? item.CompanyLogoUrl ?? item.logoUrl ?? item.companyLogo ?? item.CompanyLogo;

  if (!path) return null;
  if (/^(https?:|data:|blob:)/i.test(path)) return path;

  const baseUrl = API_ENDPOINTS.BaseUrl.replace(/\/api(?:\/.*)?$/i, "").replace(/\/$/, "");
  const normalizedPath = path.replace(/\\/g, "/").replace(/^\/+/, "");
  return `${baseUrl}/${normalizedPath}`;
};
const CompanyPage: React.FC = () => {
  const [companies, setCompanies] = useState<CompanyListItem[]>([]);
  const [showWizard, setShowWizard] = useState<boolean>(false);
  const [editData, setEditData] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filterText, setFilterText] = useState("");
  const [viewData, setViewData] = useState<Company | null>(null);

  const { hasPermission } = usePermissions();
  const canAdd = hasPermission("Company", "CanAdd");
  const canEdit = hasPermission("Company", "CanEdit");
  const canDelete = hasPermission("Company", "CanDelete");

  const loadCompanies = async () => {
    try {
      setIsLoading(true);
      const data = await getCompanies();
      setCompanies(data);
      const responseData: unknown = await getCompanies();
      const companyRows = Array.isArray(responseData)
        ? responseData as CompanyListItem[]
        : Array.isArray((responseData as { data?: unknown } | null)?.data)
          ? (responseData as { data: CompanyListItem[] }).data
          : [];
      const rowsWithLogoPaths = await Promise.all(
        companyRows.map(async (row) => {
          if (getCompanyLogoUrl(row)) return row;

          try {
            const detailResponse: any = await getCompanyById(row.companyId);
            const companyDetails = detailResponse?.data ?? detailResponse;
            const logoUrl = getCompanyLogoUrl(
              companyDetails as unknown as CompanyListItem,
            );
            return logoUrl ? { ...row, logoPath: logoUrl } : row;
          } catch (error) {
            console.warn("Could not load a company logo:", error);
            return row;
          }
        }),
      );
      setCompanies(rowsWithLogoPaths);
    } catch (error) {
      console.error("Failed to load companies:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
    const handleRefresh = () => {
      loadCompanies();
    };

    window.addEventListener("app-refresh", handleRefresh);

    return () => {
      window.removeEventListener("app-refresh", handleRefresh);
    };
  }, []);

  const handleCreateNew = () => {
    setEditData(null);
    setShowWizard(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleView = async (companyId: number) => {
    try {
      setIsLoading(true);
      const fullCompanyData = await getCompanyById(companyId);
      setViewData(fullCompanyData);
    } catch {
      alert("Could not load details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (companyId: number) => {
    try {
      setIsLoading(true);
      const fullCompanyData = await getCompanyById(companyId);
      setEditData(fullCompanyData);
      setShowWizard(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (companyId: number) => {
    if (window.confirm("Are you sure?")) {
      await deleteCompany(companyId);
      await loadCompanies();
    }
  };

  const handleSuccess = () => {
    setShowWizard(false);
    setEditData(null);
    loadCompanies();
  };

  const columns: TableColumn<CompanyListItem>[] = [
    {
      name: "Logo",
      cell: (row) => {
        const logoUrl = getCompanyLogoUrl(row);
        return (
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-white">
            {logoUrl ? (
              <>
                <img
                  src={logoUrl}
                  alt={`${row.companyName} logo`}
                  className="h-full w-full object-contain"
                  onError={(event) => {
                    event.currentTarget.classList.add("hidden");
                    event.currentTarget.nextElementSibling?.classList.remove("hidden");
                  }}
                />
                <FaBuilding className="hidden text-gray-300" aria-hidden="true" />
              </>
            ) : (
              <FaBuilding className="text-gray-300" aria-hidden="true" />
            )}
          </div>
        );
      },
      width: "80px",
      ignoreRowClick: true,
    },    { name: "Sr. No.", cell: (_row, index) => (index ?? 0) + 1, width: "60px" },
    {
      name: "Company Name",
      selector: (row) => row.companyName,
      sortable: true,
      wrap: true,
      grow: 2.5,
    },
    {
      name: "Res Person Name",
      selector: (row) => row.directorName || "N/A",
      grow: 2,
      sortable: true,
    },
    {
      name: "Designation",
      selector: (row) => row.designation || "N/A",
      grow: 2,
    },
    { name: "Mobile No.", selector: (row) => row.mobileNo || "N/A", grow: 2 },
    {
      name: "Email Address",
      selector: (row) => row.email || "N/A",
      wrap: true,
      grow: 2,
      width: "180px",
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex justify-center gap-4">
          <button
            onClick={() => handleView(row.companyId)}
            className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}
            title="View"
          >
            <FaEye size={16} />
          </button>
          {canEdit && (
            <button
              onClick={() => handleEdit(row.companyId)}
              className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}
              title="Edit"
            >
              <FaEdit size={16} />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => handleDelete(row.companyId)}
              className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`}
              title="Delete"
            >
              <FaTrash size={16} />
            </button>
          )}
        </div>
      ),
      grow: 2,
      width: "150px",
    },
  ];

  const filteredItems = companies.filter((item) =>
    JSON.stringify(item).toLowerCase().includes(filterText.toLowerCase()),
  );

  return (
    <div className="p-4 bg-[#f5f6fa] min-h-screen space-y-6">
      {/* FORM AT THE TOP */}
      {showWizard && (
        <CompanyWizard
          editData={editData}
          onSuccess={handleSuccess}
          onCancel={() => setShowWizard(false)}
        />
      )}

      {/* VIEW MODAL OVERLAY */}
      {viewData && (
        <CompanyViewModal
          company={viewData}
          onClose={() => setViewData(null)}
        />
      )}

      {/* LISTING BOX */}
      <ListingLayout
        title="Listing of Companies"
        columns={columns}
        data={filteredItems}
        isLoading={isLoading}
        filterText={filterText}
        onFilterChange={setFilterText}
        onCreate={canAdd ? handleCreateNew : undefined}
      />
    </div>
  );
};

export default CompanyPage;










