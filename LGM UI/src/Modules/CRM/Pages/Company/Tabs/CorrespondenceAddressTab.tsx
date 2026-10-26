import React from "react";
import type { TabProps } from "../Services/types";
import { useAddress } from "./AddressHelper";
import Select from "react-select";
import { useAddressDropdowns } from "./useAddressDropdowns";

interface ExtendedTabProps extends TabProps {
  errors?: { [key: string]: string[] };
}

const CorrespondenceAddressTab: React.FC<ExtendedTabProps> = ({
  data,
  setData,
  errors = {},
}) => {
  const { address, handleChange } = useAddress(data, setData, "Correspondence");
  const inputStyle = (hasError: boolean) =>
    `w-full border ${hasError ? "border-red-500 bg-red-50" : "border-gray-300"} rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm`;
  const labelStyle =
    "text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest";

  const {
    countryOptions,
    stateOptions,
    selectedCountryValue,
    selectedStateValue,
    handleCountryChange,
    handleStateChange,
  } = useAddressDropdowns(address, handleChange);

  const getError = (field: string) => {
    return errors[`addresses.0.${field}`];
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
        <span className="text-2xl">✉️</span> Correspondence Address
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className={labelStyle}>Flat/Dr/Block No.</label>
          <input
            className={inputStyle(false)}
            value={address.flatBlock || ""}
            onChange={(e) => handleChange("flatBlock", e.target.value)}
          />
        </div>
        <div>
          <label className={labelStyle}>Premises Name</label>
          <input
            className={inputStyle(false)}
            value={address.premises || ""}
            onChange={(e) => handleChange("premises", e.target.value)}
          />
        </div>
        <div>
          <label className={labelStyle}>Road /Strt/Lane</label>
          <input
            className={inputStyle(false)}
            value={address.road || ""}
            onChange={(e) => handleChange("road", e.target.value)}
          />
        </div>
        <div>
          <label className={labelStyle}>Area/locality</label>
          <input
            className={inputStyle(false)}
            value={address.area || ""}
            onChange={(e) => handleChange("area", e.target.value)}
          />
        </div>
        <div>
          <label className={labelStyle}>Town/District</label>
          <input
            className={inputStyle(false)}
            value={address.town || ""}
            onChange={(e) => handleChange("town", e.target.value)}
          />
        </div>
        <div>
          <label className={labelStyle}>Pin No</label>
          <input
            className={inputStyle(false)}
            value={address.pinCode || ""}
            onChange={(e) => handleChange("pinCode", e.target.value)}
          />
        </div>
        <div>
          <label className={labelStyle}>Country</label>
          <Select
            options={countryOptions}
            value={selectedCountryValue}
            onChange={handleCountryChange}
            isClearable
            isSearchable
            placeholder="Select a country..."
            styles={{
              control: (base) => ({
                ...base,
                minHeight: 46,
                borderRadius: "0.5rem",
                borderColor: getError("country") ? "#ef4444" : base.borderColor,
              }),
            }}
          />
        </div>
        <div>
          <label className={labelStyle}>State</label>
          <Select
            options={stateOptions}
            value={selectedStateValue}
            onChange={handleStateChange}
            isClearable
            isSearchable
            isDisabled={!address.country}
            placeholder="Select a state..."
            styles={{
              control: (base) => ({
                ...base,
                minHeight: 46,
                borderRadius: "0.5rem",
              }),
            }}
          />
        </div>
        <div>
          <label className={labelStyle}>
            Mobile No <span className="text-red-500 ">*</span>
          </label>
          <input
            className={inputStyle(!!getError("mobileNo"))}
            value={address.mobileNo || ""}
            onChange={(e) => handleChange("mobileNo", e.target.value)}
            maxLength={10}
          />
          {getError("mobileNo") && (
            <p className="mt-1 text-sm text-red-500">
              {getError("mobileNo")[0]}
            </p>
          )}
        </div>
        <div>
          <label className={labelStyle}>Alt Mobile No</label>
          <input
            className={inputStyle(false)}
            value={address.altMobileNo || ""}
            onChange={(e) => handleChange("altMobileNo", e.target.value)}
            maxLength={10}
          />
        </div>
        <div>
          <label className={labelStyle}>
            Email Address <span className="text-red-500 ">*</span>
          </label>
          <input
            type="email"
            className={inputStyle(!!getError("email"))}
            value={address.email || ""}
            onChange={(e) => handleChange("email", e.target.value)}
          />
          {getError("email") && (
            <p className="mt-1 text-sm text-red-500">{getError("email")[0]}</p>
          )}
        </div>
        <div>
          <label className={labelStyle}>Alt Email Address</label>
          <input
            type="email"
            className={inputStyle(false)}
            value={address.altEmail || ""}
            onChange={(e) => handleChange("altEmail", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default CorrespondenceAddressTab;
