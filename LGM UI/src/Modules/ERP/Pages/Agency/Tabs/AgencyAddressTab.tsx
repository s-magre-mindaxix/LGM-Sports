import React, { useState, useEffect, useMemo } from "react";
import type { AgencyTabProps, AgencyAddress } from "../Services/types";
import { FaTrashAlt } from "react-icons/fa";
import Select from "react-select";
import { getAllCountries } from "../../../../HRMS/Pages/Masters/Country/Services/CountryService";
import { getAllStates } from "../../../../HRMS/Pages/Masters/State/Services/StateService";

// --- CHANGE: Added a proper TypeScript interface for the AddressForm props ---
interface AddressFormProps {
  address: AgencyAddress;
  index: number;
  updateAddress: (index: number, field: keyof AgencyAddress, value: any) => void;
  removeAddress: (index: number) => void;
  countryOptions: { value: number; label: string }[];
  states: any[];
  canBeDeleted: boolean;
}

// --- CHILD COMPONENT TO RENDER A SINGLE ADDRESS FORM ---
// By moving the form logic here, we can safely use hooks like useMemo at the top level.
const AddressForm: React.FC<AddressFormProps> = ({ address, index, updateAddress, removeAddress, countryOptions, states, canBeDeleted }) => {
    const inputStyle = "w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm";
    const labelStyle = "text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest";

    // This useMemo hook is now at the top level of the AddressForm component, which is valid.
    const stateOptions = useMemo(() => {
        if (!address?.countryId) return [];
        return states
            .filter((s) => Number(s.countryId ?? s.CountryId) === Number(address.countryId))
            .map((s) => ({
                value: s.id,
                label: s.stateName,
            }));
    }, [states, address?.countryId]);
    
    const selectedCountryValue = countryOptions.find((c) => c.value === address.countryId) || null;
    const selectedStateValue = stateOptions.find((s) => s.value === address.stateId) || null;

    return (
        <div className="relative border p-6 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 shadow-sm">
            {canBeDeleted && (
                <button onClick={() => removeAddress(index)} className="absolute top-3 right-3 text-gray-400 hover:text-red-600 transition" title="Remove Address">
                    <FaTrashAlt />
                </button>
            )}
            
            <div className="flex flex-col"><label className={labelStyle}>Address Type</label><input className={inputStyle} value={address.addressType || ""} onChange={(e) => updateAddress(index, "addressType", e.target.value)} /></div>
            <div className="flex flex-col"><label className={labelStyle}>Flat/Block No</label><input className={inputStyle} value={address.flatBlockNo || ""} onChange={(e) => updateAddress(index, "flatBlockNo", e.target.value)} /></div>
            <div className="flex flex-col"><label className={labelStyle}>Premises</label><input className={inputStyle} value={address.premises || ""} onChange={(e) => updateAddress(index, "premises", e.target.value)} /></div>
            <div className="flex flex-col"><label className={labelStyle}>Road/Street/Lane</label><input className={inputStyle} value={address.roadStreetLane || ""} onChange={(e) => updateAddress(index, "roadStreetLane", e.target.value)} /></div>
            <div className="flex flex-col"><label className={labelStyle}>Area</label><input className={inputStyle} value={address.area || ""} onChange={(e) => updateAddress(index, "area", e.target.value)} /></div>
            <div className="flex flex-col"><label className={labelStyle}>Town/City</label><input className={inputStyle} value={address.townCity || ""} onChange={(e) => updateAddress(index, "townCity", e.target.value)} /></div>
            <div className="flex flex-col"><label className={labelStyle}>Pincode</label><input className={inputStyle} value={address.pincode || ""} onChange={(e) => updateAddress(index, "pincode", e.target.value)} /></div>
            
            <div className="flex flex-col">
                <label className={labelStyle}>Country</label>
                <Select
                    options={countryOptions}
                    value={selectedCountryValue}
                    onChange={(opt) => {
                        updateAddress(index, "countryId", opt?.value || null);
                        updateAddress(index, "stateId", null); // Reset state
                    }}
                    isClearable
                    isSearchable
                    placeholder="Select Country..."
                    styles={{ control: (base) => ({ ...base, minHeight: 43.5, borderRadius: '0.5rem' }) }}
                />
            </div>

            <div className="flex flex-col">
                <label className={labelStyle}>State</label>
                <Select
                    options={stateOptions}
                    value={selectedStateValue}
                    onChange={(opt) => updateAddress(index, "stateId", opt?.value || null)}
                    isClearable
                    isSearchable
                    isDisabled={!address.countryId}
                    placeholder="Select State..."
                    styles={{ control: (base) => ({ ...base, minHeight: 43.5, borderRadius: '0.5rem' }) }}
                />
            </div>
            
            <div className="flex flex-col"><label className={labelStyle}>Mobile No</label><input className={inputStyle} value={address.mobileNo || ""} onChange={(e) => updateAddress(index, "mobileNo", e.target.value)} /></div>
            <div className="flex flex-col"><label className={labelStyle}>Alt Mobile No</label><input className={inputStyle} value={address.alternateMobileNo || ""} onChange={(e) => updateAddress(index, "alternateMobileNo", e.target.value)} /></div>
            <div className="flex flex-col"><label className={labelStyle}>Email</label><input type="email" className={inputStyle} value={address.emailAddress || ""} onChange={(e) => updateAddress(index, "emailAddress", e.target.value)} /></div>
            <div className="flex flex-col"><label className={labelStyle}>Alt Email</label><input type="email" className={inputStyle} value={address.alternateEmailAddress || ""} onChange={(e) => updateAddress(index, "alternateEmailAddress", e.target.value)} /></div>
        </div>
    );
};


// --- MAIN PARENT COMPONENT ---
const AgencyAddressTab: React.FC<AgencyTabProps> = ({ data, setData }) => {
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);

  useEffect(() => {
    const loadMasters = async () => {
      try {
        const countryList = await getAllCountries();
        const stateList = await getAllStates();
        setCountries(Array.isArray(countryList) ? countryList : (countryList as any).data || []);
        setStates(Array.isArray(stateList) ? stateList : (stateList as any).data || []);
      } catch (error) {
        console.error("Failed to load countries and states", error);
      }
    };
    loadMasters();
  }, []);

  useEffect(() => {
    if (!data.addresses || data.addresses.length === 0) {
      setData(prev => ({
        ...prev,
        addresses: [{
          id: 0, addressType: "", flatBlockNo: "", premises: "", roadStreetLane: "",
          area: "", townCity: "", pincode: "", countryId: 0, stateId: 0,
          mobileNo: "", alternateMobileNo: "", emailAddress: "", alternateEmailAddress: ""
        }]
      }));
    }
  }, [data.addresses, setData]);

  const countryOptions = useMemo(() =>
    countries.map((c) => ({
      value: c.id,
      label: c.countryName,
    })),
    [countries]
  );

  const updateAddress = (index: number, field: keyof AgencyAddress, value: any) => {
    setData(prev => {
        const updatedAddresses = [...(prev.addresses || [])];
        if (updatedAddresses[index]) {
            updatedAddresses[index] = { ...updatedAddresses[index], [field]: value };
        }
        return { ...prev, addresses: updatedAddresses };
    });
  };

  const removeAddress = (index: number) => {
    setData({ ...data, addresses: data.addresses.filter((_, i) => i !== index) });
  };

  const addresses = data.addresses || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
        <div className="flex items-center gap-3 border-b pb-3">
            <span className="text-2xl text-[#0b2c52]">✉️</span>
            <h3 className="text-lg font-bold text-[#0b2c52] uppercase tracking-tight">Addresses</h3>
        </div>
        
        {addresses.map((address, index) => (
            <AddressForm
                key={index}
                address={address}
                index={index}
                updateAddress={updateAddress}
                removeAddress={removeAddress}
                countryOptions={countryOptions}
                states={states}
                canBeDeleted={data.addresses?.length > 1}
            />
        ))}
    </div>
  );
};

export default AgencyAddressTab;