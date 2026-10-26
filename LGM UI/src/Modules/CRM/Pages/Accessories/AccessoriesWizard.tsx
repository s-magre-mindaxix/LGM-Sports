

import { useState } from "react";
import { toast } from "sonner";
import { useProductDropdowns } from "../Product/Hooks/useProductDropdowns";
import { saveAccessory } from "./Services/AccessoriesService";
import AccessoriesInfoTab from "./Tabs/AccessoriesInfoTab";
import BriefInfoTab from "./Tabs/BriefInfoTab";
import OtherInfoTab from "./Tabs/OtherInfoTab";
import RateTab from "./Tabs/RateTab";

// Reuse Master Modals from HRMS
import CategoryForm from "../../../HRMS/Pages/Masters/Category/CategoryForm";
import ProductGroupForm from "../../../HRMS/Pages/Masters/ProductGroup/ProductGroupForm";
import ProductTypeForm from "../../../HRMS/Pages/Masters/ProductTypes/ProductTypeForm";
import ProductVariantForm from "../../../HRMS/Pages/Masters/ProductVariant/ProductVariantForm";
import ProductVersionForm from "../../../HRMS/Pages/Masters/ProductVersion/ProductVersionForm";
import CurrencyForm from "../Currency/CurrencyForm";
import PartConditionForm from "../../../HRMS/Pages/Masters/PartCondition/PartConditionForm";

interface ValidationErrors {
  [key: string]: string[];
}

const AccessoriesWizard = ({ editData, onSuccess, onCancel }: any) => {
  const [activeTab, setActiveTab] = useState(0);
  const { options, refresh } = useProductDropdowns();
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const [data, setData] = useState(
    editData || {
      accessoriesId: 0,
      vendorId: 0,
      accessoriesName: "",
      purchasePrice: 0,
      salePrice: 0,
      availableQuantity: 0,
      outOfStockWarning: 5,
      taxPreference: "Taxable",
      productSource: "Local",
      bcd: 0,
      sws: 0,
      igst: 0,
      isCalibration: false,
      calibrationFrequency: "",
      currencyPrices: [],
    },
  );

  const [masterModal, setMasterModal] = useState<{
    type: string | null;
    isOpen: boolean;
  }>({ type: null, isOpen: false });
  const tabs = [
    "Accessories Information",
    "Brief Information",
    "Other Information",
    "Product Rate",
  ];

  // Validation for the first tab (Accessories Information)
  const validateAccessoriesInfo = (): boolean => {
    const newErrors: ValidationErrors = { ...errors };
    let hasErrors = false;

    // Vendor validation
    if (!data.vendorId || data.vendorId === 0) {
      newErrors.vendorId = ["Vendor is required"];
      hasErrors = true;
    } else {
      delete newErrors.vendorId;
    }

    // Accessories Name validation
    if (!data.accessoriesName?.trim()) {
      newErrors.accessoriesName = ["Accessories Name is required"];
      hasErrors = true;
    } else {
      delete newErrors.accessoriesName;
    }

    setErrors(newErrors);
    return !hasErrors;
  };

  // Validate current tab before moving
  const validateCurrentTab = (): boolean => {
    switch (activeTab) {
      case 0:
        return validateAccessoriesInfo();
      default:
        return true;
    }
  };

  const handleTabChange = (index: number) => {
    if (index > activeTab && !validateCurrentTab()) {
      toast.error("Please fill all required fields in current tab");
      return;
    }
    setActiveTab(index);
  };

  const handleMasterSaveSuccess = () => {
    setMasterModal({ type: null, isOpen: false });
    refresh();
    toast.success("Master List Updated");
  };

  const handleSave = async () => {
    // Validate first tab before saving
    if (!validateAccessoriesInfo()) {
      setActiveTab(0);
      toast.error("Please fill all required fields in Accessories Information");
      return;
    }

    setIsSaving(true);
    try {
      await saveAccessory(data);
      toast.success("Accessory Saved!");
      onSuccess();
    } catch (error) {
      toast.error("An error occurred while saving the accessory.");
    } finally {
      setIsSaving(false);
    }
  };

  const hasErrorsInTab = (tabIndex: number): boolean => {
    switch (tabIndex) {
      case 0:
        return !!errors.vendorId || !!errors.accessoriesName;
      default:
        return false;
    }
  };

  return (
    <div className="mb-8 overflow-hidden rounded-3xl border border-black/[.07] bg-white shadow-xl animate-in slide-in-from-top-4 duration-500">
      <div className="border-b border-black/[.06] bg-[#fbfaf8] px-5 py-4 sm:px-7">
        <p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-[#c65b27]">LGM Sports · Product catalog</p>
        <h2 className="mt-1 text-lg font-black text-[#252a2e]">Accessory setup</h2>
      </div>
      <div className="flex gap-1 overflow-x-auto bg-[#252a2e] p-2 sm:p-3">
        {tabs.map((tab, i) => (
          <button
            key={i}
            type="button"
            aria-current={activeTab === i ? "step" : undefined}
            onClick={() => handleTabChange(i)}
            className={`relative min-w-max flex-1 rounded-xl px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider transition-all sm:text-[11px] ${
              activeTab === i
                ? "bg-[#f07837] text-white shadow-lg shadow-black/15"
                : "text-white/65 hover:bg-white/10 hover:text-white"
            }`}
          >
            {tab}
            {hasErrorsInTab(i) && activeTab !== i && (
              <span className="absolute right-1 top-1 h-2 w-2 animate-pulse rounded-full bg-red-400" />
            )}
          </button>
        ))}
      </div>

      <div className="min-h-[450px] bg-white p-5 sm:p-8">
        {activeTab === 0 && (
          <AccessoriesInfoTab
            data={data}
            setData={setData}
            options={options}
            onAddMaster={(t) => setMasterModal({ type: t, isOpen: true })}
            errors={errors}
          />
        )}
        {activeTab === 1 && (
          <BriefInfoTab
            data={data}
            setData={setData}
            options={options}
            onAddMaster={(t) => setMasterModal({ type: t, isOpen: true })}
            errors={errors}
          />
        )}
        {activeTab === 2 && (
          <OtherInfoTab
            data={data}
            setData={setData}
            options={options}
            onAddMaster={(t) => setMasterModal({ type: t, isOpen: true })}
            errors={errors}
          />
        )}
        {activeTab === 3 && (
          <RateTab
            data={data}
            setData={setData}
            options={options}
            onAddMaster={(t) => setMasterModal({ type: t, isOpen: true })}
            errors={errors}
          />
        )}
      </div>

      <div className="flex flex-wrap justify-end gap-2 border-t border-black/[.07] bg-[#fbfaf8] p-4 sm:gap-3 sm:p-5">
        <button type="button" onClick={onCancel} className="rounded-xl bg-[#e8e6e1] px-5 py-2.5 text-sm font-semibold text-[#4f504d] transition hover:bg-[#dddad3]">
          Cancel
        </button>
        {activeTab > 0 && (
          <button
            type="button"
            onClick={() => handleTabChange(activeTab - 1)}
            className="rounded-xl border border-[#f07837]/35 bg-white px-5 py-2.5 text-sm font-semibold text-[#a64a1d] transition hover:bg-[#fff0e7]"
          >
            Back
          </button>
        )}
        {activeTab < 3 ? (
          <button
            type="button"
            onClick={() => handleTabChange(activeTab + 1)}
            className="rounded-xl bg-[#f07837] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#dd6328] focus:outline-none focus:ring-4 focus:ring-[#f07837]/20"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-xl bg-[#f07837] px-7 py-2.5 text-sm font-bold text-white transition hover:bg-[#dd6328] focus:outline-none focus:ring-4 focus:ring-[#f07837]/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save "}
          </button>
        )}
      </div>

      {masterModal.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#17191b]/55 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-black/10 bg-white p-2 shadow-2xl">
            {masterModal.type === "category" && (
              <CategoryForm
                onSave={handleMasterSaveSuccess}
                onCancel={() => setMasterModal({ type: null, isOpen: false })}
                editData={null}
              />
            )}
            {masterModal.type === "group" && (
              <ProductGroupForm
                onSave={handleMasterSaveSuccess}
                onCancel={() => setMasterModal({ type: null, isOpen: false })}
                editData={null}
              />
            )}
            {masterModal.type === "type" && (
              <ProductTypeForm
                onSave={handleMasterSaveSuccess}
                onCancel={() => setMasterModal({ type: null, isOpen: false })}
                editData={null}
              />
            )}
            {masterModal.type === "variant" && (
              <ProductVariantForm
                onSave={handleMasterSaveSuccess}
                onCancel={() => setMasterModal({ type: null, isOpen: false })}
                editData={null}
              />
            )}
            {masterModal.type === "version" && (
              <ProductVersionForm
                onSave={handleMasterSaveSuccess}
                onCancel={() => setMasterModal({ type: null, isOpen: false })}
                editData={null}
              />
            )}
            {masterModal.type === "currency" && (
              <CurrencyForm
                onSave={handleMasterSaveSuccess}
                onCancel={() => setMasterModal({ type: null, isOpen: false })}
                editData={null}
              />
            )}
            {masterModal.type === "condition" && (
              <PartConditionForm
                onSave={handleMasterSaveSuccess}
                onCancel={() => setMasterModal({ type: null, isOpen: false })}
                editData={null}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessoriesWizard;
