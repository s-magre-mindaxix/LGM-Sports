import React, { useState, useEffect,useRef } from "react";
import { toast } from "sonner";
import type { Vendor } from "./Services/types";
import { createVendor, updateVendor } from "./Services/VendorService";
import VendorDetailsTab from "./Tabs/VendorDetailsTab";
import CorrespondenceAddressTab from "./Tabs/CorrespondenceAddressTab";
import PermanentAddressTab from "./Tabs/PermanentAddressTab";
import OtherInformationTab from "./Tabs/OtherInformationTab";
import BankDetailsTab from "./Tabs/BankDetailsTab";
import { buttonStyles } from "../../../../Components/Common/buttonStyles";

interface WizardProps {
  editData: Vendor | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const VendorWizard: React.FC<WizardProps> = ({
  editData,
  onSuccess,
  onCancel,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const vendorDetailsRef = useRef<any>(null);
  const correspondenceAddressRef = useRef<any>(null);
  const permanentAddressRef = useRef<any>(null);

  const initialVendorState: Vendor = {
    id: 0,
    vendorName: "",
    vendorCode: "",
    vendorShortName: "",
    vendorDivision: "",
    vendorPAN: "",
    vendorTAN: "",
    vatNo: "",
    msmeNo: "",
    gstin: "",
    cin: "",
    addresses: [],
    principalContacts: [],
    bankDetails: [],
  };

  const [data, setData] = useState<Vendor>(editData || initialVendorState);

  useEffect(() => {
    if (editData) {
      setData(editData);
    } else {
      setData(initialVendorState);
    }
  }, [editData]);

  const tabs = [
    "Vendor Details",
    "Correspondence Address",
    "Permanent Address",
    "Other Information",
    "Bank Details",
  ];

  const handleSave = async () => {
    if (!data.vendorName) return toast.error("Vendor Name is required");

    setIsSaving(true);
    try {
      if (data.id > 0) {
        await updateVendor(data.id, data);
        toast.success("Vendor updated successfully!");
      } else {
        await createVendor(data);
        toast.success("Vendor created successfully!");
      }
      onSuccess();
    } catch (err) {
      toast.error("Error saving vendor data");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden mb-8 animate-in slide-in-from-top-4 duration-500">
      <div className="flex bg-[#f07837] p-1.5 gap-1 overflow-x-auto no-scrollbar">
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={`flex-1 py-3 text-[11px] font-extrabold uppercase tracking-widest rounded-md transition-all whitespace-nowrap ${activeTab === i ? "bg-white text-[#154068] shadow-lg" : "text-white hover:bg-white/10"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-8 bg-white min-h-[450px]">
        {activeTab === 0 && <VendorDetailsTab ref={vendorDetailsRef} data={data} setData={setData} />}
      {activeTab === 1 && (
     <CorrespondenceAddressTab ref={correspondenceAddressRef} data={data} setData={setData} />
    )}
    {activeTab === 2 && (
      <PermanentAddressTab ref={permanentAddressRef} data={data} setData={setData} />
    )}
        {activeTab === 3 && (
          <OtherInformationTab data={data} setData={setData} />
        )}
        {activeTab === 4 && <BankDetailsTab data={data} setData={setData} />}
      </div>

      <div className="p-5 bg-gray-50 flex justify-end gap-3 border-t">
        <button onClick={onCancel} className={buttonStyles.cancel}>
          Cancel
        </button>
        {activeTab > 0 && (
          <button
            onClick={() => setActiveTab(activeTab - 1)}
            className={buttonStyles.back}
          >
            Back
          </button>
        )}
        {activeTab < tabs.length - 1 ? (
          <button
       onClick={() => {
  let isValid = true;
  if (activeTab === 0) {
    isValid = vendorDetailsRef.current?.validate();
  }
  // Check validation for Correspondence Address tab
  if (activeTab === 1) {
    isValid = correspondenceAddressRef.current?.validate();
  }
  // Check validation for Permanent Address tab
  if (activeTab === 2) {
    isValid = permanentAddressRef.current?.validate();
  }

  if (!isValid) {
    toast.error("Please fill all required fields");
    return; // Stop if validation fails
  }

  setActiveTab(activeTab + 1);
}}
            className={buttonStyles.next}
          >
            Next
          </button>
        ) : (
          <button
            disabled={isSaving}
            onClick={handleSave}
            className={buttonStyles.save}
          >
            {isSaving ? "Saving..." : data.id > 0 ? "Update " : "Save "}
          </button>
        )}
      </div>
    </div>
  );
};

export default VendorWizard;
