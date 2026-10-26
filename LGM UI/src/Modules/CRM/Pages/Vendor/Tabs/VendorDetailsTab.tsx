import React, { useState, useEffect  } from "react";
import type { VendorTabProps } from "../Services/types";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import { getGeneratedVendorCode } from "../Services/VendorService";
import { useImperativeHandle, forwardRef } from "react";

const FILE_BASE_URL = API_ENDPOINTS.BaseUrl.replace("/api", "");

const VendorDetailsTab = forwardRef<any, VendorTabProps>(({ data, setData }, ref) => {
  const inputStyle =
    "w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm";
  const labelStyle =
    "text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest";
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    const generateCode = async () => {
      if (data.id === 0) {
        try {
          const code = await getGeneratedVendorCode();
          setData((prev) => ({ ...prev, vendorCode: code }));
        } catch (error) {
          console.error("Error generating vendor code", error);
        }
      }
    };

    const timerId = setTimeout(() => {
      generateCode();
    }, 500);

    return () => clearTimeout(timerId);
  }, [data.id, setData]);

  useEffect(() => {
    if (data.vendorLogo && typeof data.vendorLogo !== "string") {
      const newUrl = URL.createObjectURL(data.vendorLogo as File);
      setLogoPreviewUrl(newUrl);
      return () => URL.revokeObjectURL(newUrl);
    } else if (typeof data.vendorLogo === "string" && data.vendorLogo) {
      setLogoPreviewUrl(
        `${FILE_BASE_URL}${data.vendorLogo.startsWith("/") ? "" : "/"}${data.vendorLogo}`,
      );
    } else {
      setLogoPreviewUrl(null);
    }
  }, [data.vendorLogo]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setData({ ...data, vendorLogo: e.target.files[0] });
    }
  };

 const validateFields = () => {
  const newErrors: any = {};

  if (!data.vendorName?.trim()) newErrors.vendorName = true;
  if (!data.vendorDivision?.trim()) newErrors.vendorDivision = true;
  if (!data.vendorShortName?.trim()) newErrors.vendorShortName = true;

  setErrors(newErrors);

  return Object.keys(newErrors).length === 0;
};

useImperativeHandle(ref, () => ({
  validate: validateFields
}));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="flex items-center gap-3 border-b pb-3">
        <span className="text-2xl text-[#154068">🏭</span>
        <h3 className="text-lg font-bold text-[#154068] uppercase tracking-tight">
          Vendor Basic Information
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300">
          <div className="w-24 h-24 shrink-0 rounded-lg bg-white border flex items-center justify-center overflow-hidden shadow-sm">
            {logoPreviewUrl ? (
              <img
                src={logoPreviewUrl}
                alt="Logo"
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-[10px] text-gray-400 font-bold uppercase text-center px-2">
                No Logo Selected
              </span>
            )}
          </div>
          <div className="flex-1">
            <label className={labelStyle}>Vendor Logo</label>
            <input
              type="file"
              id="vendor-logo"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />

            <div>
              <label
                htmlFor="vendor-logo"
                className="inline-block bg-[#f07837] text-white px-4 py-2 rounded-lg text-xs font-bold cursor-pointer hover:bg-[#0d3357] transition shadow-md"
              >
                Browse Files
              </label>
            </div>
          </div>
        </div>

        <div className="flex flex-col">
         <label className={labelStyle}>
              Vendor Name <span className="text-red-500">*</span>
            </label>
            <input
              className={`${inputStyle} ${errors.vendorName ? "border-red-500" : ""}`}
              value={data.vendorName || ""}
              onChange={(e) => setData({ ...data, vendorName: e.target.value })}
            />
        </div>
        <div className="flex flex-col">
          <label className={labelStyle}>Vendor Code</label>
          <input
            className={`${inputStyle} bg-gray-50 font-mono font-bold text-[#154068] cursor-not-allowed`}
            value={data.vendorCode || "Waiting for Name..."}
            readOnly // Make the input read-only
          />
          <p className="text-[9px] text-gray-400 mt-1 italic">
            * Generated based on Vendor Name
          </p>
        </div>
        <div className="flex flex-col">
         <label className={labelStyle}>
            Vendor Division <span className="text-red-500">*</span>
          </label>
          <input
            className={`${inputStyle} ${errors.vendorDivision ? "border-red-500" : ""}`}
            value={data.vendorDivision || ""}
            onChange={(e) =>
              setData({ ...data, vendorDivision: e.target.value })
            }
          />
        </div>
        <div className="flex flex-col">
         <label className={labelStyle}>
            Vendor Short Name <span className="text-red-500">*</span>
          </label>
          <input
            className={`${inputStyle} ${errors.vendorShortName ? "border-red-500" : ""}`}
            value={data.vendorShortName || ""}
            onChange={(e) =>
              setData({ ...data, vendorShortName: e.target.value })
            }
          />
        </div>
      </div>
    </div>
  );
});

export default VendorDetailsTab;
