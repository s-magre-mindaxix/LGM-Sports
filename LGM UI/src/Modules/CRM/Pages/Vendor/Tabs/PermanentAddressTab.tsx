import React, { useEffect, useMemo, useState,forwardRef, useImperativeHandle } from "react";
import { useAddress } from "../Tabs/VendorAddressHelper";
import type { VendorTabProps } from "../Services/types";
import { getAllCountries } from "../../../../HRMS/Pages/Masters/Country/Services/CountryService";
import { getAllStates } from "../../../../HRMS/Pages/Masters/State/Services/StateService";
import Select from "react-select";

const PermanentAddressTab = forwardRef<any, VendorTabProps>(({
  data,
  setData,
}, ref) => {
  const { address, handleChange } = useAddress(data, setData, "Permanent");
  const inputStyle =
    "w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm";
  const labelStyle =
    "text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest";

  const [errors, setErrors] = useState<Record<string, string | boolean>>({});
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);

  useEffect(() => {
    const loadMasters = async () => {
      try {
        const countryList = await getAllCountries();
        const stateList = await getAllStates();
        setCountries(
          Array.isArray(countryList)
            ? countryList
            : (countryList as any).data || [],
        );
        setStates(
          Array.isArray(stateList) ? stateList : (stateList as any).data || [],
        );
      } catch (error) {
        console.error("Failed to load masters", error);
      }
    };
    loadMasters();
  }, []);

  useImperativeHandle(ref, () => ({
  validate: () => {
    const newErrors: Record<string, boolean> = {};
    let isValid = true;

  if (!address.area?.trim()) { newErrors.area = true; isValid = false; }
if (!address.town?.trim()) { newErrors.town = true; isValid = false; }
if (!address.pinNo?.trim()) { newErrors.pinNo = true; isValid = false; }
if (!address.countryId) { newErrors.countryId = true; isValid = false; }
if (!address.stateId) { newErrors.stateId = true; isValid = false; }
if (!address.mobileNo?.trim()) { newErrors.mobileNo = true; isValid = false; }

if (!address.emailAddress?.trim() || 
   !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.emailAddress)) {
  newErrors.emailAddress = true;
  isValid = false;
}
    setErrors(newErrors);
    return isValid;
  },
}));

  const validate = (name: string, value: string) => {
    let errorMsg = "";

    if (value && value.trim() !== "") {
      if (
        name.includes("emailAddress") &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      ) {
        errorMsg = "Invalid email format.";
      }
    }

    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  const handleInputChange = (field: string, value: string) => {
    handleChange(field as any, value);
    validate(field, value);
  };

  const handleSameAsAbove = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const corr = data.addresses.find(
        (a) => a.addressType === "Correspondence",
      );
      if (corr) {
        const updated = data.addresses.filter(
          (a) => a.addressType !== "Permanent",
        );
        setData({
          ...data,
          addresses: [...updated, { ...corr, addressType: "Permanent", id: 0 }],
        });
      }
    }
  };

  const countryOptions = useMemo(
    () =>
      countries.map((c) => ({
        value: c.id,
        label: c.countryName,
      })),
    [countries],
  );

  const stateOptions = useMemo(() => {
    if (!address?.countryId) return [];

    return states
      .filter(
        (s) => Number(s.countryId ?? s.CountryId) === Number(address.countryId),
      )
      .map((s) => ({
        value: s.id,
        label: s.stateName,
      }));
  }, [states, address?.countryId]);

  const selectedCountryValue =
    countryOptions.find((c) => c.value === address.countryId) || null;

  const selectedStateValue =
    stateOptions.find((s) => s.value === address.stateId) || null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl text-[#0b2c52]">🏠</span>
          <h3 className="text-lg font-bold text-[#0b2c52] uppercase tracking-tight">
            Permanent Address
          </h3>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="sameAsAbove"
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            onChange={handleSameAsAbove}
          />
          <label
            htmlFor="sameAsAbove"
             className="ml-2 block text-sm text-gray-900"
          >
            Same as Correspondence
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col">
          <label className={labelStyle}>Flat/Dr/Block No</label>
          <input
            className={inputStyle}
            value={address.flatBlockNo || ""}
            onChange={(e) => handleChange("flatBlockNo", e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label className={labelStyle}>Premises</label>
          <input
            className={inputStyle}
            value={address.premises || ""}
            onChange={(e) => handleChange("premises", e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label className={labelStyle}>Road /Strt/Lane</label>
          <input
            className={inputStyle}
            value={address.roadStrLane || ""}
            onChange={(e) => handleChange("roadStrLane", e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label className={labelStyle}>
  Area /Locality <span className="text-red-500">*</span>
</label>
         <input
  className={`${inputStyle} ${errors.area ? "border-red-500" : ""}`}
  value={address.area || ""}
  onChange={(e) => handleChange("area", e.target.value)}
/>
        </div>
        <div className="flex flex-col">
          <label className={labelStyle}>Town/District <span className="text-red-500">*</span></label>
          <input
  className={`${inputStyle} ${errors.town ? "border-red-500" : ""}`}
  value={address.town || ""}
  onChange={(e) => handleChange("town", e.target.value)}
/>
        </div>

        <div className="flex flex-col">
          <label className={labelStyle}>Pin No <span className="text-red-500">*</span></label>
          <input
            className={`${inputStyle} ${errors.pinNo ? "border-red-500" : ""}`}
            value={address.pinNo || ""}
            onChange={(e) => handleInputChange("pinNo", e.target.value)}
          />
          {errors.pinNo && (
            <p className="text-red-500 text-[10px] mt-1 font-bold">
              {errors.pinNo}
            </p>
          )}
        </div>

        <div className="flex flex-col">
          <label className={labelStyle}>Country <span className="text-red-500">*</span></label>
          <Select
            options={countryOptions}
            value={selectedCountryValue}
            onChange={(opt) => {
              handleChange("countryId", opt?.value || "");
              handleChange("stateId", ""); // reset state
            }}
            isClearable
            isSearchable
            placeholder="Select Country..."
           styles={{
  control: (base) => ({
    ...base,
    minHeight: 43,
    borderRadius: "0.5rem",
    borderColor: errors.countryId ? "red" : base.borderColor,
    boxShadow: errors.countryId ? "0 0 0  red" : base.boxShadow,
    "&:hover": {
      borderColor: errors.countryId ? "red" : base.borderColor,
    },
  }),
}}
          />
        </div>

        <div className="flex flex-col">
          <label className={labelStyle}>State <span className="text-red-500">*</span></label>
          <Select
            options={stateOptions}
            value={selectedStateValue}
            onChange={(opt) => handleChange("stateId", opt?.value || "")}
            isClearable
            isSearchable
            isDisabled={!address.countryId}
            placeholder="Select State..."
           styles={{
  control: (base) => ({
    ...base,
    minHeight: 43,
    borderRadius: "0.5rem",
    borderColor: errors.stateId ? "red" : base.borderColor,
    boxShadow: errors.stateId ? "0 0 0  red" : base.boxShadow,
    "&:hover": {
      borderColor: errors.stateId ? "red" : base.borderColor,
    },
  }),
}}
          />
        </div>

        <div className="flex flex-col">
          <label className={labelStyle}>Mobile No <span className="text-red-500">*</span></label>
          <input
            className={`${inputStyle} ${errors.mobileNo ? "border-red-500" : ""}`}
            value={address.mobileNo || ""}
            onChange={(e) => handleInputChange("mobileNo", e.target.value)}
          />
          {errors.mobileNo && (
            <p className="text-red-500 text-[10px] mt-1 font-bold">
              {errors.mobileNo}
            </p>
          )}
        </div>

        <div className="flex flex-col">
          <label className={labelStyle}>Alt Mobile No</label>
          <input
            className={`${inputStyle} ${errors.altMobileNo ? "border-red-500" : ""}`}
            value={address.altMobileNo || ""}
            onChange={(e) => handleInputChange("altMobileNo", e.target.value)}
          />
          {errors.altMobileNo && (
            <p className="text-red-500 text-[10px] mt-1 font-bold">
              {errors.altMobileNo}
            </p>
          )}
        </div>

        <div className="flex flex-col">
          <label className={labelStyle}>Email Address <span className="text-red-500">*</span></label>
          <input
            className={`${inputStyle} ${errors.emailAddress ? "border-red-500" : ""}`}
            value={address.emailAddress || ""}
            onChange={(e) => handleInputChange("emailAddress", e.target.value)}
          />
          {errors.emailAddress && (
            <p className="text-red-500 text-[10px] mt-1 font-bold">
              {errors.emailAddress}
            </p>
          )}
        </div>

        <div className="flex flex-col">
          <label className={labelStyle}>Alt Email Address</label>
          <input
            className={`${inputStyle} ${errors.altEmailAddress ? "border-red-500" : ""}`}
            value={address.altEmailAddress || ""}
            onChange={(e) =>
              handleInputChange("altEmailAddress", e.target.value)
            }
          />
          {errors.altEmailAddress && (
            <p className="text-red-500 text-[10px] mt-1 font-bold">
              {errors.altEmailAddress}
            </p>
          )}
        </div>
      </div>
    </div>
  );
});

export default PermanentAddressTab;
