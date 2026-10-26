import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import type { InstallationReport } from "./Services/types";
import {
  createInstallationReport,
  updateInstallationReport,
} from "./Services/InstallationReportService";
import ReportDetailsTab from "./Tabs/ReportDetailsTab";
import { buttonStyles } from "../../../../Components/Common/buttonStyles";

interface WizardProps {
  editData: InstallationReport | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const TABS = ["Report Details"];

const initialData: InstallationReport = {
  id: 0,
  companyId: 0,
  customerId: 0,
  companyName: "",
  customerName: "",
  installationDate: new Date().toISOString().slice(0, 10),
  productInformation: "",
  inspectionSummary: "",
  customerNotes: "",
  place: "",
  createdOn: "",
  customerAddress: "",
  // contacts: [{ id: 0, name: "", designation: "" }],
  contacts: [], 
};

const InstallationReportWizard: React.FC<WizardProps> = ({
  editData,
  onSuccess,
  onCancel,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [data, setData] = useState<InstallationReport>(initialData);

  useEffect(() => {
    setData(
      editData
        ? {
            ...editData,
            // contacts:
            //   editData.contacts?.length > 0
            //     ? editData.contacts
            //     : initialData.contacts,
            contacts: editData.contacts ?? [],
          }
        : initialData,
    );
  }, [editData]);

  const handleSubmit = async () => {
    // Basic Validation
    if (
      !data.companyId ||
      !data.customerId ||
      !data.place ||
      !data.productInformation ||
      !data.inspectionSummary
    ) {
      toast.error(
        "Please fill all required fields in the 'Report Details' tab.",
      );
      setActiveTab(0); // Switch to the first tab
      return;
    }

    const promiseAction = async (): Promise<void> => {
      if (data.id) {
        await updateInstallationReport(data.id, data);
      } else {
        await createInstallationReport(data);
      }
    };

    try {
      // Execute the function to get the promise
      const promise = promiseAction();

      toast.promise(promise, {
        loading: "Saving report...",
        success: `Report ${data.id ? "updated" : "created"} successfully!`,
        error: (err) =>
          `Failed to save: ${err.message || "An unknown error occurred."}`,
      });

      await promise;
      onSuccess();
    } catch (error) {
      // The toast will show the error from the promise handler, but this catch is for safety
      console.error("An error occurred during submission:", error);
    }
  };


  return (
    <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 p-4 flex justify-start items-center border-b">
        <h2 className="text-lg font-bold text-[#154068]">
          {editData
            ? "Edit Installation Report"
            : "Create New Installation Report"}
        </h2>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-4 border-b">
        <div className="flex gap-6">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`pb-3 text-sm font-bold transition-colors ${activeTab === i ? "text-[#154068] border-b-2 border-[#154068]" : "text-gray-500 hover:text-gray-700"}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 bg-gray-50/50">
        <ReportDetailsTab data={data} setData={setData} />
      </div>

      <div className="bg-gray-50 p-4 flex justify-end items-center border-b">
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className={buttonStyles.cancel + " flex items-center gap-2"}
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className={buttonStyles.save + " flex items-center gap-2"}
          >
            Save Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallationReportWizard;
