import React, { useState, useEffect, forwardRef, useMemo } from "react";
import type { AgencyTabProps } from "../Services/types";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import { getGeneratedAgencyCode } from "../Services/AgencyService";
// --- CHANGE: Import Select component and the service to get agency types ---
import Select from "react-select";
import { getAgencyTypes } from "../../AgencyType/Services/AgencyTypeService"; // Assuming this service exists

const FILE_BASE_URL = API_ENDPOINTS.BaseUrl.replace("/api", "");

const AgencyDetailsTab = forwardRef<any, AgencyTabProps>(
  ({ data, setData }) => {
    const inputStyle =
      "w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm";
    const labelStyle =
      "text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest";
    const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);

    // --- CHANGE: Add state to hold the list of agency types ---
    const [agencyTypes, setAgencyTypes] = useState<any[]>([]);

    // --- CHANGE: Add useEffect to fetch agency types when the component loads ---
    useEffect(() => {
      const loadAgencyTypes = async () => {
        try {
          const typesData = await getAgencyTypes();
          // Handle cases where the data might be nested
          const types = Array.isArray(typesData)
            ? typesData
            : (typesData as any).data || [];
          setAgencyTypes(types);
        } catch (error) {
          console.error("Failed to load agency types", error);
        }
      };
      loadAgencyTypes();
    }, []);

    // This useEffect handles automatic code generation
    useEffect(() => {
      const generateCode = async () => {
        if (!data.id) {
          try {
            const code = await getGeneratedAgencyCode();
            setData((prev) => ({ ...prev, agencyCode: code }));
          } catch (error) {
            console.error("Error generating agency code", error);
          }
        }
      };
      if (data.agencyName && !data.agencyCode) {
        generateCode();
      }
    }, [data.id, data.agencyName, data.agencyCode, setData]);

    // This useEffect handles the logo preview
    useEffect(() => {
      if (data.logoFile instanceof File) {
        const newUrl = URL.createObjectURL(data.logoFile);
        setLogoPreviewUrl(newUrl);
        return () => URL.revokeObjectURL(newUrl);
      } else if (typeof data.agencyLogo === "string" && data.agencyLogo) {
        setLogoPreviewUrl(
          `${FILE_BASE_URL}${data.agencyLogo.startsWith("/") ? "" : "/"}${data.agencyLogo}`,
        );
      } else {
        setLogoPreviewUrl(null);
      }
    }, [data.agencyLogo, data.logoFile]);

    // --- CHANGE: Prepare agency type options for the Select component ---
    const agencyTypeOptions = useMemo(
      () =>
        agencyTypes.map((type) => ({
          value: type.id,
          label: type.agencyTypeName,
        })),
      [agencyTypes],
    );

    const selectedAgencyType =
      agencyTypeOptions.find((opt) => opt.value === data.agencyTypeId) || null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        setData({ ...data, logoFile: e.target.files[0], agencyLogo: "" });
      }
    };

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
        <div className="flex items-center gap-3 border-b pb-3">
          <span className="text-2xl text-[#154068]">🏢</span>
          <h3 className="text-lg font-bold text-[#154068] uppercase tracking-tight">
            Agency Basic Information
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300 md:col-span-3">
            <div className="w-24 h-24 shrink-0 rounded-lg bg-white border flex items-center justify-center overflow-hidden shadow-sm">
              {logoPreviewUrl ? (
                <img
                  src={logoPreviewUrl}
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-[10px] text-gray-400 font-bold uppercase text-center px-2">
                  No Logo
                </span>
              )}
            </div>
            <div className="flex-1">
              <label className={labelStyle}>Agency Logo</label>
              <input
                type="file"
                id="agency-logo"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              <label
                htmlFor="agency-logo"
                className="inline-block bg-[#f07837] text-white px-4 py-2 rounded-lg text-xs font-bold cursor-pointer hover:bg-[#0d3357] transition shadow-md"
              >
                Browse Files
              </label>
            </div>
          </div>

          <div className="flex flex-col">
            <label className={labelStyle}>Agency Name</label>
            <input
              className={inputStyle}
              value={data.agencyName || ""}
              onChange={(e) => setData({ ...data, agencyName: e.target.value })}
            />
          </div>
          <div className="flex flex-col">
            <label className={labelStyle}>Agency Code</label>
            <input
              className={`${inputStyle} bg-gray-100 cursor-not-allowed`}
              value={data.agencyCode || ""}
              readOnly
            />
          </div>

          {/* --- CHANGE: Replaced text input with Select dropdown for Agency Type --- */}
          <div className="flex flex-col">
            <label className={labelStyle}>Agency Type</label>
            <Select
              options={agencyTypeOptions}
              value={selectedAgencyType}
              onChange={(opt) =>
                setData({ ...data, agencyTypeId: opt?.value || 0 })
              }
              isClearable
              isSearchable
              placeholder="Select Type..."
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: 43.5,
                  borderRadius: "0.5rem",
                }),
              }}
            />
          </div>

          <div className="flex flex-col">
            <label className={labelStyle}>Agency Short Name</label>
            <input
              className={inputStyle}
              value={data.agencyShortName || ""}
              onChange={(e) =>
                setData({ ...data, agencyShortName: e.target.value })
              }
            />
          </div>
          <div className="flex flex-col">
            <label className={labelStyle}>Website</label>
            <input
              className={inputStyle}
              value={data.website || ""}
              onChange={(e) => setData({ ...data, website: e.target.value })}
            />
          </div>
          <div className="flex flex-col">
            <label className={labelStyle}>License No</label>
            <input
              className={inputStyle}
              value={data.licenseNo || ""}
              onChange={(e) => setData({ ...data, licenseNo: e.target.value })}
            />
          </div>
          <div className="flex flex-col">
            <label className={labelStyle}>PAN No</label>
            <input
              className={inputStyle}
              value={data.panNo || ""}
              onChange={(e) => setData({ ...data, panNo: e.target.value })}
            />
          </div>
          <div className="flex flex-col">
            <label className={labelStyle}>TAN No</label>
            <input
              className={inputStyle}
              value={data.tanNo || ""}
              onChange={(e) => setData({ ...data, tanNo: e.target.value })}
            />
          </div>
          <div className="flex flex-col">
            <label className={labelStyle}>GSTIN</label>
            <input
              className={inputStyle}
              value={data.gstin || ""}
              onChange={(e) => setData({ ...data, gstin: e.target.value })}
            />
          </div>
          <div className="flex flex-col">
            <label className={labelStyle}>CIN No</label>
            <input
              className={inputStyle}
              value={data.cinNo || ""}
              onChange={(e) => setData({ ...data, cinNo: e.target.value })}
            />
          </div>
          <div className="flex flex-col">
            <label className={labelStyle}>IATA Code</label>
            <input
              className={inputStyle}
              value={data.iataCode || ""}
              onChange={(e) => setData({ ...data, iataCode: e.target.value })}
            />
          </div>
          <div className="flex flex-col">
            <label className={labelStyle}>FMC Code</label>
            <input
              className={inputStyle}
              value={data.fmcCode || ""}
              onChange={(e) => setData({ ...data, fmcCode: e.target.value })}
            />
          </div>
        </div>
      </div>
    );
  },
);

export default AgencyDetailsTab;
