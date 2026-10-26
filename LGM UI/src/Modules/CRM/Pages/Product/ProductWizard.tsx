
import { useState } from "react";
import { toast } from "sonner";
import { useProductDropdowns } from "./Hooks/useProductDropdowns";
import { getGeneratedProductCode, saveProduct } from "./Services/ProductService";
import ProductInfoTab from "./Tabs/ProductInfoTab";
import BriefInfoTab from "./Tabs/BriefInfoTab";
import OtherInfoTab from "./Tabs/OtherInfoTab";
import RateTab from "./Tabs/RateTab";

// Import Master Modals
import CategoryModal from "../../../HRMS/Pages/Masters/Category/CategoryForm";
import ProductGroupModal from "../../../HRMS/Pages/Masters/ProductGroup/ProductGroupForm";
import ProductTypeForm from "../../../HRMS/Pages/Masters/ProductTypes/ProductTypeForm";
import ProductVariantForm from "../../../HRMS/Pages/Masters/ProductVariant/ProductVariantForm";
import ProductVersionForm from "../../../HRMS/Pages/Masters/ProductVersion/ProductVersionForm";
import CurrencyForm from "../Currency/CurrencyForm";
import PartConditionForm from "../../../HRMS/Pages/Masters/PartCondition/PartConditionForm";
import { buttonStyles } from "../../../../Components/Common/buttonStyles";

interface ValidationErrors {
  [key: string]: string[];
}

const ProductWizard = ({ editData, onSuccess, onCancel }: any) => {
  const [activeTab, setActiveTab] = useState(0);
  const { options, refresh } = useProductDropdowns();
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const [data, setData] = useState(
    editData || {
      productId: 0,
      vendorId: 0,
      productName: "",
      productSKU: "",
      productSource: "Local",
      bcd: 0,
      sws: 0,
      igst: 0,
      currencyPrices: [],
      purchasePrice: 0,
      salePrice: 0,
      availableQuantity: 0,
      outOfStockWarning: 5,
      minStock: 0,
      reorderLevel: 0,
      mrp: 0,
      trackStock: true,
      trackSerial: false,
      trackBatch: false,
      isActive: true,
      hasAccessories: "No",
      taxPreference: "Taxable",
      isCalibration: false,
      calibrationFrequency: "",
    },
  );

  const [masterModal, setMasterModal] = useState<{
    type: string | null;
    isOpen: boolean;
  }>({ type: null, isOpen: false });

  const tabs = [
    "Product Information",
    "Product Brief Information",
    "Product Other Information",
    "Product Rate",
  ];

  // Validation for the first tab (Product Information)
  const validateProductInfo = (): boolean => {
    const newErrors: ValidationErrors = { ...errors };
    let hasErrors = false;

    // Vendor validation
    if (!data.vendorId || data.vendorId === 0) {
      newErrors.vendorId = ["Vendor is required"];
      hasErrors = true;
    } else {
      delete newErrors.vendorId;
    }

    // Product Name validation
    if (!data.productName?.trim()) {
      newErrors.productName = ["Product Name is required"];
      hasErrors = true;
    } else {
      delete newErrors.productName;
    }

    if (!data.productSKU?.trim()) {
      newErrors.productSKU = ["Product SKU is required"];
      hasErrors = true;
    } else {
      delete newErrors.productSKU;
    }

    setErrors(newErrors);
    return !hasErrors;
  };

  // Validate current tab before moving
  const validateCurrentTab = (): boolean => {
    switch (activeTab) {
      case 0:
        return validateProductInfo();
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

  const handleAddMaster = (type: string) => {
    setMasterModal({ type, isOpen: true });
  };

  const handleMasterSaveSuccess = () => {
    setMasterModal({ type: null, isOpen: false });
    refresh();
    toast.success("Dropdown list updated");
  };

  const handleSave = async () => {
    // Validate first tab before saving
    if (!validateProductInfo()) {
      setActiveTab(0);
      toast.error("Please fill all required fields in Product Information");
      return;
    }

    setIsSaving(true);
    try {
      let productToSave = data;
      if (!productToSave.productCode?.trim()) {
        const productCode = await getGeneratedProductCode(
          productToSave.vendorId,
          productToSave.productSource || "Local",
        );
        if (!productCode.trim()) {
          throw new Error("The server did not return a product code.");
        }
        productToSave = { ...productToSave, productCode };
        setData(productToSave);
      }

      await saveProduct(productToSave);
      toast.success(
        data.productId > 0
          ? "Product updated successfully"
          : "Product created successfully",
      );
      onSuccess();
    } catch (error) {
      const apiError = error as {
        message?: string;
        response?: { data?: { message?: string; errors?: Record<string, string[]> } | string };
      };
      const responseData = apiError.response?.data;
      const productCodeError =
        typeof responseData === "object" && responseData?.errors?.ProductCode?.[0];
      const errorMessage =
        productCodeError ||
        (typeof responseData === "string" ? responseData : undefined) ||
        (typeof responseData === "object" ? responseData?.message : undefined) ||
        apiError.message ||
        "An error occurred while saving";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Check if first tab has errors (for red dot)
  const hasErrorsInTab = (tabIndex: number): boolean => {
    switch (tabIndex) {
      case 0:
        return !!errors.vendorId || !!errors.productName || !!errors.productSKU;
      default:
        return false;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden mb-8 animate-in slide-in-from-top-4 duration-500">
      <div className="flex bg-[#f07837] p-1.5 gap-1">
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => handleTabChange(i)}
            className={`flex-1 py-3 text-[11px] font-extrabold uppercase tracking-widest rounded-md transition-all relative ${
              activeTab === i
                ? "bg-white text-[#154068] shadow-lg"
                : "text-white hover:bg-white/10"
            }`}
          >
            {tab}
            {hasErrorsInTab(i) && activeTab !== i && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
            )}
          </button>
        ))}
      </div>

      <div className="p-8 bg-white min-h-[450px]">
        {activeTab === 0 && (
          <ProductInfoTab
            data={data}
            setData={setData}
            options={options}
            onAddMaster={handleAddMaster}
            errors={errors}
          />
        )}
        {activeTab === 1 && (
          <BriefInfoTab
            data={data}
            setData={setData}
            options={options}
            onAddMaster={handleAddMaster}
            errors={errors}
          />
        )}
        {activeTab === 2 && (
          <OtherInfoTab
            data={data}
            setData={setData}
            options={options}
            onAddMaster={handleAddMaster}
            errors={errors}
          />
        )}
        {activeTab === 3 && (
          <RateTab
            data={data}
            setData={setData}
            options={options}
            onAddMaster={handleAddMaster}
            errors={errors}
          />
        )}
      </div>

      <div className="p-5 bg-gray-50 flex justify-end gap-3 border-t">
        <button onClick={onCancel} className={buttonStyles.cancel}>
          Cancel
        </button>
        {activeTab > 0 && (
          <button
            onClick={() => handleTabChange(activeTab - 1)}
            className={buttonStyles.back}
          >
            Back
          </button>
        )}
        {activeTab < 3 ? (
          <button
            onClick={() => handleTabChange(activeTab + 1)}
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
            {isSaving ? "Saving..." : data.productId > 0 ? "Update" : "Save"}
          </button>
        )}
      </div>

      {/* Master Modals Popup */}
      {masterModal.isOpen && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden p-2">
            {masterModal.type === "category" && (
              <CategoryModal
                onSave={handleMasterSaveSuccess}
                onCancel={() => setMasterModal({ type: null, isOpen: false })}
                editData={null}
              />
            )}
            {masterModal.type === "group" && (
              <ProductGroupModal
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

export default ProductWizard;
