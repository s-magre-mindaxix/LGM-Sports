import React, { useState, useEffect, useMemo } from "react";
import type { Company } from "./Services/types";
import CompanyDetailsTab from "./Tabs/CompanyDetailsTab";
import CorrespondenceAddressTab from "./Tabs/CorrespondenceAddressTab";
import PermanentAddressTab from "./Tabs/PermanentAddressTab";
import OtherInformationTab from "./Tabs/OtherInformationTab.tsx";
import BankDetailsTab from "./Tabs/BankDetailsTab";
import { saveCompany } from "./Services/CompanyService";
import { toast } from "sonner";
import { buttonStyles } from "../../../../Components/Common/buttonStyles.ts";

interface WizardProps {
  editData: Company | null;
  onSuccess: () => void;
  onCancel: () => void;
}

interface ValidationErrors {
  [key: string]: string[];
}

const CompanyWizard: React.FC<WizardProps> = ({
  editData,
  onSuccess,
  onCancel,
}) => {
  const tabs = [
    "Company Details",
    "Correspondence Address",
    "Permanent Address",
    "Other Information",
    "Bank Details",
  ];
  const [activeTab, setActiveTab] = useState<number>(0);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const initialData = useMemo<Company>(
    () => ({
      companyId: 0,
      companyCode: "",
      companyName: "",
      companyShortName: "",
      companyLogo: null,
      logoPath: "",
      addresses: [
        {
          addressType: "Correspondence",
          flatBlock: "",
          premises: "",
          road: "",
          area: "",
          town: "",
          pinCode: "",
          country: "",
          state: "",
          mobileNo: "",
          altMobileNo: "",
          email: "",
          altEmail: "",
        },
        {
          addressType: "Permanent",
          flatBlock: "",
          premises: "",
          road: "",
          area: "",
          town: "",
          pinCode: "",
          country: "",
          state: "",
          mobileNo: "",
          altMobileNo: "",
          email: "",
          altEmail: "",
        },
      ],
      directors: [],
      bankDetails: [],
      pan: "",
      tan: "",
      gstin: "",
      cin: "",
    }),
    [],
  );

  const [data, setData] = useState<Company>(initialData);

  useEffect(() => {
    if (editData) {
      setData(editData);
    } else {
      setData(initialData);
    }
    setErrors({});
  }, [editData, initialData]);

  const validateCompanyDetails = (): boolean => {
    const newErrors: ValidationErrors = { ...errors };
    let hasErrors = false;

    if (!data.companyName?.trim()) {
      newErrors.companyName = ["Company Name is required"];
      hasErrors = true;
    } else {
      delete newErrors.companyName;
    }

    if (!data.companyShortName?.trim()) {
      newErrors.companyShortName = ["Company Short Name is required"];
      hasErrors = true;
    } else {
      delete newErrors.companyShortName;
    }

    setErrors(newErrors);
    return !hasErrors;
  };

  const validateCorrespondenceAddress = (): boolean => {
    const newErrors: ValidationErrors = { ...errors };
    let hasErrors = false;
    const address = data.addresses[0];

    if (!address.mobileNo?.trim()) {
      newErrors["addresses.0.mobileNo"] = ["Mobile Number is required"];
      hasErrors = true;
    } else if (!/^\d{10}$/.test(address.mobileNo)) {
      newErrors["addresses.0.mobileNo"] = ["Mobile Number must be 10 digits"];
      hasErrors = true;
    } else {
      delete newErrors["addresses.0.mobileNo"];
    }

    if (!address.email?.trim()) {
      newErrors["addresses.0.email"] = ["Email is required"];
      hasErrors = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email)) {
      newErrors["addresses.0.email"] = ["Invalid email format"];
      hasErrors = true;
    } else {
      delete newErrors["addresses.0.email"];
    }

    setErrors(newErrors);
    return !hasErrors;
  };

  const validatePermanentAddress = (): boolean => {
    const newErrors: ValidationErrors = { ...errors };
    let hasErrors = false;
    const address = data.addresses[1];

    if (!address.mobileNo?.trim()) {
      newErrors["addresses.1.mobileNo"] = ["Mobile Number is required"];
      hasErrors = true;
    } else if (!/^\d{10}$/.test(address.mobileNo)) {
      newErrors["addresses.1.mobileNo"] = ["Mobile Number must be 10 digits"];
      hasErrors = true;
    } else {
      delete newErrors["addresses.1.mobileNo"];
    }

    if (!address.email?.trim()) {
      newErrors["addresses.1.email"] = ["Email is required"];
      hasErrors = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email)) {
      newErrors["addresses.1.email"] = ["Invalid email format"];
      hasErrors = true;
    } else {
      delete newErrors["addresses.1.email"];
    }

    setErrors(newErrors);
    return !hasErrors;
  };

  const validateOtherInformation = (): boolean => {
    const newErrors: ValidationErrors = { ...errors };
    let hasErrors = false;

    // // Validate PAN format if provided
    // if (data.pan?.trim() && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(data.pan)) {
    //   newErrors.pan = ["Invalid PAN format (e.g., ABCDE1234F)"];
    //   hasErrors = true;
    // } else {
    //   delete newErrors.pan;
    // }

    // // Validate GSTIN format if provided
    // if (
    //   data.gstin?.trim() &&
    //   !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
    //     data.gstin,
    //   )
    // ) {
    //   newErrors.gstin = ["Invalid GSTIN format"];
    //   hasErrors = true;
    // } else {
    //   delete newErrors.gstin;
    // }

    // // Validate CIN format if provided
    // if (
    //   data.cin?.trim() &&
    //   !/^[L|U]{1}[0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/.test(data.cin)
    // ) {
    //   newErrors.cin = ["Invalid CIN format"];
    //   hasErrors = true;
    // } else {
    //   delete newErrors.cin;
    // }

    // Validate directors
    if (!data.directors || data.directors.length === 0) {
      newErrors.directors = ["At least one director is required"];
      hasErrors = true;
    } else {
      data.directors.forEach((director, index) => {
        // Validate Director Name
        if (!director.directorName?.trim()) {
          newErrors[`directors.${index}.directorName`] = [
            "Director Name is required",
          ];
          hasErrors = true;
        } else {
          delete newErrors[`directors.${index}.directorName`];
        }

        // Validate Designation
        if (!director.designation?.trim()) {
          newErrors[`directors.${index}.designation`] = [
            "Designation is required",
          ];
          hasErrors = true;
        } else {
          delete newErrors[`directors.${index}.designation`];
        }

        // Validate Mobile No
        if (!director.mobileNo?.trim()) {
          newErrors[`directors.${index}.mobileNo`] = [
            "Mobile Number is required",
          ];
          hasErrors = true;
        } else if (!/^\d{10}$/.test(director.mobileNo)) {
          newErrors[`directors.${index}.mobileNo`] = [
            "Mobile Number must be 10 digits",
          ];
          hasErrors = true;
        } else {
          delete newErrors[`directors.${index}.mobileNo`];
        }

        // Validate Email
        if (!director.email?.trim()) {
          newErrors[`directors.${index}.email`] = ["Email is required"];
          hasErrors = true;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(director.email)) {
          newErrors[`directors.${index}.email`] = ["Invalid email format"];
          hasErrors = true;
        } else {
          delete newErrors[`directors.${index}.email`];
        }
      });
    }

    setErrors(newErrors);
    return !hasErrors;
  };
  const validateBankDetails = (): boolean => {
    const newErrors: ValidationErrors = { ...errors };
    let hasErrors = false;

    if (!data.bankDetails || data.bankDetails.length === 0) {
      newErrors.bankDetails = ["At least one bank detail is required"];
      hasErrors = true;
    } else {
      data.bankDetails.forEach((bank, index) => {
        if (!bank.bankName?.trim()) {
          newErrors[`bankDetails.${index}.bankName`] = [
            "Bank Name is required",
          ];
          hasErrors = true;
        } else {
          delete newErrors[`bankDetails.${index}.bankName`];
        }

        if (!bank.accountNo?.trim()) {
          newErrors[`bankDetails.${index}.accountNo`] = [
            "Account Number is required",
          ];
          hasErrors = true;
        } else {
          delete newErrors[`bankDetails.${index}.accountNo`];
        }

        if (!bank.ifsc?.trim()) {
          newErrors[`bankDetails.${index}.ifsc`] = ["IFSC Code is required"];
          hasErrors = true;
        } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bank.ifsc)) {
          newErrors[`bankDetails.${index}.ifsc`] = ["Invalid IFSC format"];
          hasErrors = true;
        } else {
          delete newErrors[`bankDetails.${index}.ifsc`];
        }

        if (!bank.accountHolderName?.trim()) {
          newErrors[`bankDetails.${index}.accountHolderName`] = [
            "Account Holder Name is required",
          ];
          hasErrors = true;
        } else {
          delete newErrors[`bankDetails.${index}.accountHolderName`];
        }
      });
    }

    setErrors(newErrors);
    return !hasErrors;
  };

  const validateCurrentTab = (): boolean => {
    switch (activeTab) {
      case 0:
        return validateCompanyDetails();
      case 1:
        return validateCorrespondenceAddress();
      case 2:
        return validatePermanentAddress();
      case 3:
        return validateOtherInformation();
      case 4:
        return validateBankDetails();
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
    // Validate all tabs before saving
    const isValidCompanyDetails = validateCompanyDetails();
    const isValidCorrespondence = validateCorrespondenceAddress();
    const isValidPermanent = validatePermanentAddress();
    // const isValidOther = validateOtherInformation();
    const isValidBank = validateBankDetails();

    if (!isValidCompanyDetails) {
      setActiveTab(0);
      toast.error("Please fill all required fields in Company Details");
      return;
    }
    if (!isValidCorrespondence) {
      setActiveTab(1);
      toast.error("Please fill all required fields in Correspondence Address");
      return;
    }
    if (!isValidPermanent) {
      setActiveTab(2);
      toast.error("Please fill all required fields in Permanent Address");
      return;
    }
    if (!isValidBank) {
      setActiveTab(4);
      toast.error("Please fill all required fields in Bank Details");
      return;
    }

    setIsSaving(true);
    try {
      await saveCompany(data);
      toast.success(
        data.companyId > 0
          ? "Company updated successfully! 🎉"
          : "Company created successfully! 🎉",
      );
      onSuccess();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Something went wrong while saving.";

      toast.error(errorMessage);
      console.error("Save Error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <CompanyDetailsTab data={data} setData={setData} errors={errors} />
        );
      case 1:
        return (
          <CorrespondenceAddressTab
            data={data}
            setData={setData}
            errors={errors}
          />
        );
      case 2:
        return (
          <PermanentAddressTab data={data} setData={setData} errors={errors} />
        );
      case 3:
        return (
          <OtherInformationTab
            data={data}
            setData={setData}
            errors={errors}
            setErrors={setErrors}
          />
        );
      case 4:
        return <BankDetailsTab data={data} setData={setData} errors={errors} />;
      default:
        return null;
    }
  };

  const hasErrorsInTab = (tabIndex: number): boolean => {
    switch (tabIndex) {
      case 0:
        return !!errors.companyName || !!errors.companyShortName;
      case 1:
        return (
          !!errors["addresses.0.mobileNo"] || !!errors["addresses.0.email"]
        );
      case 2:
        return (
          !!errors["addresses.1.mobileNo"] || !!errors["addresses.1.email"]
        );
      case 3:
        return (
          !!errors.pan ||
          !!errors.gstin ||
          !!errors.cin ||
          !!errors.directors ||
          Object.keys(errors).some((key) => key.startsWith("directors."))
        );
      case 4:
        return (
          !!errors.bankDetails ||
          Object.keys(errors).some((key) => key.startsWith("bankDetails"))
        );
      default:
        return false;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden mb-8 animate-in slide-in-from-top-4 duration-500">
      {/* Tab Header Bar - Dark Blue Theme */}
      <div className="flex bg-[#f07837] p-1.5 gap-1">
        {tabs.map((tabName, index) => (
          <button
            key={index}
            onClick={() => handleTabChange(index)}
            className={`flex-1 py-3 text-[11px] font-extrabold uppercase tracking-widest rounded-md transition-all duration-300 relative ${
              activeTab === index
                ? "bg-white text-[#154068] shadow-lg scale-[1.02]"
                : "text-white hover:bg-white/10"
            }`}
          >
            {tabName}
            {hasErrorsInTab(index) && activeTab !== index && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
            )}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="p-8 bg-white min-h-[450px]">
        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
          {renderTabContent()}
        </div>
      </div>

      {/* Footer Actions - Matching Product Style */}
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
            {isSaving ? "Saving..." : data.companyId > 0 ? "Update" : "Save"}
          </button>
        )}
      </div>
    </div>
  );
};

export default CompanyWizard;


