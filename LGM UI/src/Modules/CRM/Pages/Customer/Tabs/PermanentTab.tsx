

import React, { useEffect, useState, useMemo } from "react";
import { useCustomerAddress } from "./CustomerAddressHelper";
import type { CustomerTabProps } from "../Services/types";
import { getAllCountries } from "../../../../HRMS/Pages/Masters/Country/Services/CountryService";
import { getAllStates } from "../../../../HRMS/Pages/Masters/State/Services/StateService";
import Select from "react-select";

interface ExtendedTabProps extends CustomerTabProps {
  errors?: { [key: string]: string[] };
}

const PermanentTab: React.FC<ExtendedTabProps> = ({ data, setData }) => {
  const { address, handleChange } = useCustomerAddress(
    data,
    setData,
    "Permanent",
  );
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  
  const inputStyle = (hasError: boolean) =>
    `w-full border ${hasError ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm`;
  const labelStyle =
    "text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest";

  useEffect(() => {
    const load = async () => {
      try {
        const [c, s] = await Promise.all([getAllCountries(), getAllStates()]);
        setCountries(Array.isArray(c) ? c : (c as any).data || []);
        setStates(Array.isArray(s) ? s : (s as any).data || []);
      } catch (error) {
        console.error("Error loading countries/states", error);
      }
    };
    load();
  }, []);

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
            id="sameAsCustomer"
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            onChange={handleSameAsAbove}
          />
          <label
            htmlFor="sameAsCustomer"
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
            className={inputStyle(false)}
            value={address.flatBlockNo || ""}
            onChange={(e) => handleChange("flatBlockNo", e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label className={labelStyle}>Premises Name</label>
          <input
            className={inputStyle(false)}
            value={address.premisesName || ""}
            onChange={(e) => handleChange("premisesName", e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label className={labelStyle}>Road/Str/Lane</label>
          <input
            className={inputStyle(false)}
            value={address.road || ""}
            onChange={(e) => handleChange("road", e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label className={labelStyle}>Area /Locality</label>
          <input
            className={inputStyle(false)}
            value={address.area || ""}
            onChange={(e) => handleChange("area", e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label className={labelStyle}>Town/District</label>
          <input
            className={inputStyle(false)}
            value={address.town || ""}
            onChange={(e) => handleChange("town", e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label className={labelStyle}>Pin No</label>
          <input
            className={inputStyle(false)}
            value={address.pinNo || ""}
            onChange={(e) => handleChange("pinNo", e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label className={labelStyle}>Country</label>
          <Select
            options={countryOptions}
            value={selectedCountryValue}
            onChange={(opt) => {
              handleChange("countryId", opt?.value || "");
              handleChange("stateId", "");
            }}
            isClearable
            isSearchable
            placeholder="Select Country..."
            styles={{
              control: (base) => ({
                ...base,
                minHeight: 43,
                borderRadius: "0.5rem",
              }),
            }}
          />
        </div>
        <div className="flex flex-col">
          <label className={labelStyle}>State</label>
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
              }),
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PermanentTab;