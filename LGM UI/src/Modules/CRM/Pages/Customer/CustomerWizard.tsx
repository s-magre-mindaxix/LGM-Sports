import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import type { Customer } from "./Services/types";
import { createCustomer, updateCustomer } from "./Services/CustomerService";
import CustomerDetailsTab from "./Tabs/CustomerDetailsTab";
import CorrespondenceTab from "./Tabs/CorrespondenceTab";
import PermanentTab from "./Tabs/PermanentTab";
import OtherInfoTab from "./Tabs/OtherInfoTab";
import CustomerContactsTab from "./Tabs/CustomerContactsTab";
import { buttonStyles } from "../../../../Components/Common/buttonStyles";

interface WizardProps {
  editData: Customer | null;
  onSuccess: () => void;
  onCancel: () => void;
}

interface ValidationErrors {
  [key: string]: string[];
}

const CustomerWizard: React.FC<WizardProps> = ({
  editData,
  onSuccess,
  onCancel,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const initialCustomer = React.useMemo<Customer>(
    () => ({
      id: 0,
      customerName: "",
      customerCode: "",
      customerShortName: "",
      branch: "",
      plantCode: "",
      companyGroupId: 0,
      vendorId: null,
      vendorName: "",
      vendorCode: "",
     foreignVendorCode: "",
      customerPAN: "",
      customerTAN: "",
      gstin: "",
      cin: "",
      msmeNo: "",
      addresses: [],
      contacts: [],
    }),
    [],
  );

  const [data, setData] = useState<Customer>(editData || initialCustomer);

  useEffect(() => {
    setData(editData || initialCustomer);
    setErrors({});
  }, [editData, initialCustomer]);

  const tabs = [
    "Customer Details",
    "Correspondence Address",
    "Permanent Address",
    "Other Information",
    "Contacts",
  ];

  const validateCustomerDetails = (): boolean => {
    const newErrors: ValidationErrors = { ...errors };
    let hasErrors = false;

    // Customer Name validation
    if (!data.customerName?.trim()) {
      newErrors.customerName = ["Customer Name is required"];
      hasErrors = true;
    } else {
      delete newErrors.customerName;
    }

    // Company Group validation
    if (!data.companyGroupId || data.companyGroupId === 0) {
      newErrors.companyGroupId = ["Company Group is required"];
      hasErrors = true;
    } else {
      delete newErrors.companyGroupId;
    }

    // Customer Short Name validation
    if (!data.customerShortName?.trim()) {
      newErrors.customerShortName = ["Customer Short Name is required"];
      hasErrors = true;
    } else {
      delete newErrors.customerShortName;
    }

    // Branch, Plant Code, Vendor are optional - no validation

    setErrors(newErrors);
    return !hasErrors;
  };

  const validateContacts = (): boolean => {
    const newErrors: ValidationErrors = { ...errors };
    let hasErrors = false;

    if (!data.contacts || data.contacts.length === 0) {
      newErrors.contacts = ["At least one contact is required"];
      hasErrors = true;
    } else {
      data.contacts.forEach((contact, index) => {
        if (!contact.resPersonName?.trim()) {
          newErrors[`contacts.${index}.resPersonName`] = [
            "Contact Name is required",
          ];
          hasErrors = true;
        } else {
          delete newErrors[`contacts.${index}.resPersonName`];
        }

        // if (!contact.departmentId || contact.departmentId === 0) {
        //   newErrors[`contacts.${index}.departmentId`] = [
        //     "Department is required",
        //   ];
        //   hasErrors = true;
        // } else {
        //   delete newErrors[`contacts.${index}.departmentId`];
        // }
        if (!contact.departmentName || contact.departmentName.trim() === "") {
          newErrors[`contacts.${index}.departmentName`] = [
            "Department is required",
          ];
          hasErrors = true;
        } else {
          delete newErrors[`contacts.${index}.departmentName`];
        }

        if (!contact.mobileNo?.trim()) {
          newErrors[`contacts.${index}.mobileNo`] = [
            "Mobile Number is required",
          ];
          hasErrors = true;
        } else if (!/^\d{10}$/.test(contact.mobileNo)) {
          newErrors[`contacts.${index}.mobileNo`] = [
            "Mobile Number must be 10 digits",
          ];
          hasErrors = true;
        } else {
          delete newErrors[`contacts.${index}.mobileNo`];
        }

        if (!contact.emailAddress?.trim()) {
          newErrors[`contacts.${index}.emailAddress`] = ["Email is required"];
          hasErrors = true;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.emailAddress)) {
          newErrors[`contacts.${index}.emailAddress`] = [
            "Invalid email format",
          ];
          hasErrors = true;
        } else {
          delete newErrors[`contacts.${index}.emailAddress`];
        }
      });
    }

    setErrors(newErrors);
    return !hasErrors;
  };

  const validateCurrentTab = (): boolean => {
    switch (activeTab) {
      case 0:
        return validateCustomerDetails();
      case 4:
        return validateContacts();
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

  const handleSave = async () => {
    const isValidDetails = validateCustomerDetails();
    const isValidContacts = validateContacts();

    if (!isValidDetails) {
      setActiveTab(0);
      toast.error("Please fill all required fields in Customer Details");
      return;
    }

    if (!isValidContacts) {
      setActiveTab(4);
      toast.error("Please fill all required fields in Contacts");
      return;
    }

    setIsSaving(true);
    try {
      if (data.id > 0) await updateCustomer(data.id, data);
      else await createCustomer(data);
      toast.success(
        `Customer ${data.id > 0 ? "updated" : "created"} successfully!`,
      );
      onSuccess();
    } catch {
      toast.error("Error saving customer data.");
    } finally {
      setIsSaving(false);
    }
  };

  const hasErrorsInTab = (tabIndex: number): boolean => {
    switch (tabIndex) {
      case 0:
        return (
          !!errors.customerName ||
          !!errors.companyGroupId ||
          !!errors.customerShortName
        );
      case 4:
        return (
          !!errors.contacts ||
          Object.keys(errors).some((key) => key.startsWith("contacts."))
        );
      default:
        return false;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden mb-8 animate-in slide-in-from-top-4 duration-500">
      <div className="flex bg-[#f07837] p-1.5 gap-1 overflow-x-auto no-scrollbar">
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => handleTabChange(i)}
            className={`flex-1 py-3 text-[11px] font-extrabold uppercase tracking-widest rounded-md transition-all whitespace-nowrap relative ${
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
          <CustomerDetailsTab data={data} setData={setData} errors={errors} />
        )}
        {activeTab === 1 && (
          <CorrespondenceTab data={data} setData={setData} errors={errors} />
        )}
        {activeTab === 2 && (
          <PermanentTab data={data} setData={setData} errors={errors} />
        )}
        {activeTab === 3 && (
          <OtherInfoTab data={data} setData={setData} errors={errors} />
        )}
        {activeTab === 4 && (
          <CustomerContactsTab
            data={data}
            setData={setData}
            errors={errors}
            setErrors={setErrors}
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
        {activeTab < tabs.length - 1 ? (
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
            {isSaving ? "Saving..." : data.id > 0 ? "Update " : "Save "}
          </button>
        )}
      </div>
    </div>
  );
};

export default CustomerWizard;
