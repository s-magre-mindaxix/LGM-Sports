// import React, { useEffect, useState } from "react";
// import type { TabProps } from "../Services/types";
// import { API_ENDPOINTS } from "../../../../../API/apiConfig";

// interface ExtendedTabProps extends TabProps {
//   errors?: { [key: string]: string[] };
// }

// const CompanyDetailsTab: React.FC<ExtendedTabProps> = ({
//   data,
//   setData,
//   errors = {},
// }) => {
//   const inputStyle = (hasError: boolean) =>
//     `w-full border ${hasError ? "border-red-500 bg-red-50" : "border-gray-300"} rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm`;
//   const labelStyle =
//     "text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest";

//   const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);

//   useEffect(() => {
//     if (data.companyLogo && typeof data.companyLogo !== "string") {
//       const newUrl = URL.createObjectURL(data.companyLogo);
//       setLogoPreviewUrl(newUrl);
//       return () => URL.revokeObjectURL(newUrl);
//     }
//   }, [data.companyLogo]);

//   useEffect(() => {
//     const shortName = (data.companyShortName || "").trim().toUpperCase();
//     if (!shortName) {
//       if (data.companyCode) {
//         setData((prev) => ({ ...prev, companyCode: "" }));
//       }
//       return;
//     }

//     const expectedPrefix = `${shortName}-`;
//     if (!data.companyId && !data.companyCode?.startsWith(expectedPrefix)) {
//       const randomNumber = Math.floor(100 + Math.random() * 900);
//       setData((prev) => ({
//         ...prev,
//         companyCode: `${expectedPrefix}${randomNumber}`,
//       }));
//     }
//   }, [data.companyShortName, data.companyCode, data.companyId, setData]);

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       setData({ ...data, companyLogo: e.target.files[0] });
//     }
//   };

//   const SERVER_URL = API_ENDPOINTS.BaseUrl.replace("/api", "");
//   const displayUrl =
//     logoPreviewUrl || (data.logoPath ? `${SERVER_URL}${data.logoPath}` : null);

//   return (
//     <div>
//       <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
//         <span className="text-2xl">🏢</span> Company Details
//       </h3>
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <div className="flex items-center gap-4">
//           <div className="w-24 h-24 shrink-0 border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-100 overflow-hidden">
//             {displayUrl ? (
//               <img
//                 src={displayUrl}
//                 alt="Logo"
//                 className="w-full h-full object-cover"
//                 onError={(e) => {
//                   e.currentTarget.src = "";
//                 }}
//               />
//             ) : (
//               <span className="text-xs text-gray-500 text-center">No Logo</span>
//             )}
//           </div>

//           <div className="grow">
//             <label className={labelStyle}>Company logo</label>
//             <input
//               type="file"
//               accept="image/*"
//               className="hidden"
//               id="logo-upload"
//               onChange={handleFileChange}
//             />
//             <label
//               htmlFor="logo-upload"
//               className="w-full text-center block bg-[#f07837] text-white px-4 py-2 rounded-lg cursor-pointer text-sm hover:bg-[#0d3357] transition"
//             >
//               Browse...
//             </label>
//             {data.companyLogo && typeof data.companyLogo !== "string" && (
//               <p
//                 className="text-xs text-gray-600 mt-1 truncate"
//                 title={data.companyLogo.name}
//               >
//                 File: {data.companyLogo.name}
//               </p>
//             )}
//           </div>
//         </div>
//         <div>
//           <label className={labelStyle}>Company Code</label>
//           <input
//             className={`w-full border border-gray-300 rounded-lg px-4 py-2 outline-none bg-gray-50 font-mono font-bold text-blue-700`}
//             value={data.companyCode || "Waiting for Name..."}
//             readOnly
//           />
//           <p className="text-[10px] text-gray-400 mt-1 italic">
//             * Generated based on Company Name
//           </p>
//         </div>
//         <div>
//           <label className={labelStyle}>
//             Company Name <span className="text-red-500 ">*</span>
//           </label>
//           <input
//             className={inputStyle(!!errors.companyName)}
//             value={data.companyName || ""}
//             onChange={(e) => setData({ ...data, companyName: e.target.value })}
//             onBlur={(e) =>
//               setData({ ...data, companyName: e.target.value.trim() })
//             }
//           />
//           {errors.companyName && (
//             <p className="mt-1 text-sm text-red-500">{errors.companyName[0]}</p>
//           )}
//         </div>
//         <div>
//           <label className={labelStyle}>
//             Company Short Name <span className="text-red-500 ">*</span>
//           </label>
//           <input
//             className={inputStyle(!!errors.companyShortName)}
//             value={data.companyShortName || ""}
//             onChange={(e) =>
//               setData({ ...data, companyShortName: e.target.value })
//             }
//             onBlur={(e) =>
//               setData({ ...data, companyShortName: e.target.value.trim() })
//             }
//           />
//           {errors.companyShortName && (
//             <p className="mt-1 text-sm text-red-500">
//               {errors.companyShortName[0]}
//             </p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CompanyDetailsTab;


import React, { useEffect, useState } from "react";
import type { TabProps } from "../Services/types";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";

interface ExtendedTabProps extends TabProps {
  errors?: { [key: string]: string[] };
}

const CompanyDetailsTab: React.FC<ExtendedTabProps> = ({
  data,
  setData,
  errors = {},
}) => {
  const inputStyle = (hasError: boolean) =>
    `w-full border ${
      hasError ? "border-red-500 bg-red-50" : "border-gray-300"
    } rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm`;

  const labelStyle =
    "text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest";

  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!data.companyLogo || typeof data.companyLogo === "string") {
      setLogoPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(data.companyLogo);
    setLogoPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [data.companyLogo]);

  useEffect(() => {
    const shortName = (data.companyShortName || "").trim().toUpperCase();

    if (!shortName) {
      if (data.companyCode) {
        setData((prev) => ({ ...prev, companyCode: "" }));
      }
      return;
    }

    const prefix = `${shortName}-`;

    if (!data.companyId && !data.companyCode?.startsWith(prefix)) {
      const randomNumber = Math.floor(100 + Math.random() * 900);

      setData((prev) => ({
        ...prev,
        companyCode: `${prefix}${randomNumber}`,
      }));
    }
  }, [data.companyShortName, data.companyCode, data.companyId, setData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setData((prev) => ({ ...prev, companyLogo: file }));
    }
  };

  const serverUrl = API_ENDPOINTS.BaseUrl.replace(/\/api\/?$/, "");
  const displayUrl =
    logoPreviewUrl ||
    (data.logoPath
      ? `${serverUrl}${data.logoPath.startsWith("/") ? "" : "/"}${data.logoPath}`
      : null);

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
        <span className="text-2xl">🏢</span> Company Details
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 shrink-0 border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-100 overflow-hidden">
            {displayUrl ? (
              <img
                src={displayUrl}
                alt="Company logo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <span className="text-xs text-gray-500 text-center">No Logo</span>
            )}
          </div>

          <div className="grow">
            <label className={labelStyle}>Company logo</label>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="logo-upload"
              onChange={handleFileChange}
            />
            <label
              htmlFor="logo-upload"
              className="w-full text-center block bg-[#f07837] text-white px-4 py-2 rounded-lg cursor-pointer text-sm hover:bg-[#0d3357] transition"
            >
              Browse...
            </label>
            {data.companyLogo && typeof data.companyLogo !== "string" && (
              <p
                className="text-xs text-gray-600 mt-1 truncate"
                title={data.companyLogo.name}
              >
                File: {data.companyLogo.name}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className={labelStyle}>Company Code</label>
          <input
            className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none bg-gray-50 font-mono font-bold text-blue-700"
            value={data.companyCode || "Waiting for Name..."}
            readOnly
          />
          <p className="text-[10px] text-gray-400 mt-1 italic">
            * Generated based on Company Short Name
          </p>
        </div>

        <div>
          <label className={labelStyle}>
            Company Name <span className="text-red-500">*</span>
          </label>
          <input
            className={inputStyle(!!errors.companyName)}
            value={data.companyName || ""}
            onChange={(e) =>
              setData((prev) => ({ ...prev, companyName: e.target.value }))
            }
            onBlur={(e) =>
              setData((prev) => ({
                ...prev,
                companyName: e.target.value.trim(),
              }))
            }
          />
          {errors.companyName && (
            <p className="mt-1 text-sm text-red-500">{errors.companyName[0]}</p>
          )}
        </div>

        <div>
          <label className={labelStyle}>
            Company Short Name <span className="text-red-500">*</span>
          </label>
          <input
            className={inputStyle(!!errors.companyShortName)}
            value={data.companyShortName || ""}
            onChange={(e) =>
              setData((prev) => ({
                ...prev,
                companyShortName: e.target.value,
              }))
            }
            onBlur={(e) =>
              setData((prev) => ({
                ...prev,
                companyShortName: e.target.value.trim(),
              }))
            }
          />
          {errors.companyShortName && (
            <p className="mt-1 text-sm text-red-500">
              {errors.companyShortName[0]}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyDetailsTab;