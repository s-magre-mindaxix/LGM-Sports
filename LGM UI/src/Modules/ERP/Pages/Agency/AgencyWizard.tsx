import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import type { Agency } from "./Services/types";
import { createAgency, updateAgency } from "./Services/AgencyService";
import AgencyDetailsTab from "./Tabs/AgencyDetailsTab";
import AgencyAddressTab from "./Tabs/AgencyAddressTab";
import AgencyContactTab from "./Tabs/AgencyContactTab";
import AgencyBankDetailsTab from "./Tabs/AgencyBankDetailsTab";
import { buttonStyles } from "../../../../Components/Common/buttonStyles";

interface WizardProps {
  editData: Agency | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const AgencyWizard: React.FC<WizardProps> = ({ editData, onSuccess, onCancel }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  
  // --- CHANGE: Ref for validation removed ---
  // const detailsTabRef = useRef<any>(null);

  const initialAgencyState: Agency = {
    id: 0, agencyName: "", agencyCode: "", agencyTypeId: 0,
    agencyShortName: "", panNo: "", tanNo: "", gstin: "",
    cinNo: "", iataCode: "", fmcCode: "", licenseNo: "", website: "",
    addresses: [], contacts: [], bankDetails: [],
  };

  const [data, setData] = useState<Agency>(editData || initialAgencyState);

  useEffect(() => {
    setData(editData || initialAgencyState);
  }, [editData]);

  const tabs = ["Agency Details", "Addresses", "Contacts", "Bank Details"];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (data.id > 0) {
        await updateAgency(data);
        toast.success("Agency updated successfully!");
      } else {
        await createAgency(data);
        toast.success("Agency created successfully!");
      }
      onSuccess();
    } catch (err) {
      toast.error("Error saving agency data");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // --- CHANGE: Validation logic removed from this function ---
  const handleNext = () => {
    // Simply go to the next tab without any checks
    setActiveTab(activeTab + 1);
  }

  return (
    <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden mb-8 animate-in slide-in-from-top-4 duration-500">
      <div className="flex bg-[#f07837] p-1.5 gap-1 overflow-x-auto no-scrollbar">
        {tabs.map((tab, i) => (
          <button key={i} onClick={() => setActiveTab(i)} className={`flex-1 py-3 text-[11px] font-extrabold uppercase tracking-widest rounded-md transition-all whitespace-nowrap ${activeTab === i ? "bg-white text-[#154068] shadow-lg" : "text-white hover:bg-white/10"}`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="p-8 bg-white min-h-[450px]">
        {/* --- CHANGE: 'ref' prop removed from AgencyDetailsTab --- */}
        {activeTab === 0 && <AgencyDetailsTab data={data} setData={setData} />}
        {activeTab === 1 && <AgencyAddressTab data={data} setData={setData} />}
        {activeTab === 2 && <AgencyContactTab data={data} setData={setData} />}
        {activeTab === 3 && <AgencyBankDetailsTab data={data} setData={setData} />}
      </div>

      <div className="p-5 bg-gray-50 flex justify-end gap-3 border-t">
        <button onClick={onCancel} className={buttonStyles.cancel}>Cancel</button>
        {activeTab > 0 && <button onClick={() => setActiveTab(activeTab - 1)} className={buttonStyles.back}>Back</button>}
        {activeTab < tabs.length - 1 ? (
          <button onClick={handleNext} className={buttonStyles.next}>Next</button>
        ) : (
          <button disabled={isSaving} onClick={handleSave} className={buttonStyles.save}>
            {isSaving ? "Saving..." : data.id > 0 ? "Update" : "Save"}
          </button>
        )}
      </div>
    </div>
  );
};

export default AgencyWizard;