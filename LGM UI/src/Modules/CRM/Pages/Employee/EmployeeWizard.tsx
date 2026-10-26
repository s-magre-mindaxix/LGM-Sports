import { useState, useEffect, useRef } from "react";
import {
  Building,
  MapPin,
  Globe,
  CreditCard,
  GraduationCap,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import EmployeeDetailsTab from "./Tabs/EmployeeDetailsTab";
import type { EmployeeDetailsTabRef } from "./Tabs/EmployeeDetailsTab";
import BankDetailsTab from "./Tabs/BankDetailsTab";
import EmployeeAddressTab from "./Tabs/EmployeeAddressTab";
import { type Employee } from "../../../CRM/Pages/Employee/Services/EmployeeService";
import {
  getCompanies,
  getCountries,
  getDepartmentsList,
  getDesignationsList,
  getRoles,
  getStates,
  type CompanyItem,
  type CountryItem,
  type DepartmentItem,
  type DesignationItem,
  type Role,
  type StateItem,
} from "../../../HRMS/Services/MasterDataService";
import {
  getLevels,
  type Level,
} from "../../../HRMS/Pages/Hierarchy/Services/LevelService";
import { API_ENDPOINTS } from "../../../../API/apiConfig";
import axios, { AxiosError } from "axios";
import ExpQualTab from "./Tabs/ExpQualTab";
import { buttonStyles } from "../../../../Components/Common/buttonStyles";

type FormValue =
  | string
  | number
  | boolean
  | File[]
  | Qualification[]
  | Experience[]
  | null
  | undefined;
interface ApiErrorResponse {
  message?: string;
}

export interface Qualification {
  degree: string;
  university: string;
  passingYear: string;
  percentage: string;
}
export interface Experience {
  companyName: string;
  designation: string;
  fromDate: string;
  toDate: string;
  location: string;
}

export interface EmployeeFormData {
  employeeCode: string;
  firstName: string;
  lastName: string;
  companyId: string | number;
  designationID: string | number;
  designationName: string;
  departmentID: string | number;
  levelID: string | number;
  panNumber: string;
  aadhaarNumber: string;
  passportNumber: string;
  email: string;
  password: string;
  roleId?: string;
  // Address Fields
  curFlatNo: string;
  curPremisesName: string;
  curRoadName: string;
  curLocality: string;
  curTownDistrict: string;
  curPinNo: string;
  curCountryId: string | number;
  curStateId: string | number;
  curMobileNo: string;
  curAltMobileNo: string;
  curEmail: string;
  curAltEmail: string;
  permFlatNo: string;
  permPremisesName: string;
  permRoadName: string;
  permLocality: string;
  permTownDistrict: string;
  permPinNo: string;
  permCountryId: string | number;
  permStateId: string | number;
  permMobileNo: string;
  permAltMobileNo: string;
  permEmail: string;
  permAltEmail: string;
  // Bank Fields
  bankName: string;
  bankAddress: string;
  sortCode: string;
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  swiftCode: string;
  ibanNo: string;
  attachments?: File[];
  qualifications: Qualification[];
  experiences: Experience[];
  [key: string]:
    | string
    | number
    | boolean
    | File[]
    | Qualification[]
    | Experience[]
    | null
    | undefined;

  pfDeductionPercentage?: number;
  isCappedAt15k?: boolean;
}

interface EmployeeWizardProps {
  editData?: Employee | null;
  onSuccess: () => void;
  onCancel: () => void;
}

interface ValidationErrors {
  [key: string]: string[];
}

const EmployeeWizard: React.FC<EmployeeWizardProps> = ({
  editData = null,
  onSuccess,
  onCancel,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [countries, setCountries] = useState<CountryItem[]>([]);
  const [states, setStates] = useState<StateItem[]>([]);
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [designations, setDesignations] = useState<DesignationItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const initialFormState: EmployeeFormData = {
    employeeCode: "",
    firstName: "",
    lastName: "",
    companyId: "",
    designationID: "",
    designationName: "",
    departmentID: "",
    levelID: "",
    panNumber: "",
    aadhaarNumber: "",
    passportNumber: "",
    email: "",
    password: "Password@123",
    curFlatNo: "",
    curPremisesName: "",
    curRoadName: "",
    curLocality: "",
    curTownDistrict: "",
    curPinNo: "",
    curMobileNo: "",
    curCountryId: "",
    curStateId: "",
    curAltMobileNo: "",
    curAltEmail: "",
    curEmail: "",
    permFlatNo: "",
    permPremisesName: "",
    permRoadName: "",
    permLocality: "",
    permTownDistrict: "",
    permPinNo: "",
    permCountryId: "",
    permStateId: "",
    permMobileNo: "",
    permAltMobileNo: "",
    permEmail: "",
    permAltEmail: "",
    bankName: "",
    bankAddress: "",
    sortCode: "",
    accountNumber: "",
    ifscCode: "",
    accountHolderName: "",
    swiftCode: "",
    ibanNo: "",
    attachments: [],
    qualifications: [
      { degree: "", university: "", passingYear: "", percentage: "" },
    ],
    experiences: [
      {
        companyName: "",
        designation: "",
        fromDate: "",
        toDate: "",
        location: "",
      },
    ],
  };

  const [formData, setFormData] = useState<EmployeeFormData>(initialFormState);
  const employeeDetailsRef = useRef<EmployeeDetailsTabRef>(null);

  useEffect(() => {
    if (editData)
      setFormData((prev) => ({ ...prev, ...editData }) as EmployeeFormData);
  }, [editData]);

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [
          countryRes,
          stateRes,
          compRes,
          deptRes,
          designationRes,
          roleRes,
          levelRes,
        ] = await Promise.all([
          getCountries(),
          getStates(),
          getCompanies(),
          getDepartmentsList(),
          getDesignationsList(),
          getRoles(),
          getLevels(),
        ]);
        setCountries(countryRes);
        setStates(stateRes);
        setCompanies(compRes);
        setDepartments(deptRes);
        setDesignations(designationRes);
        setRoles(roleRes);
        setLevels(levelRes);
      } catch {
        toast.error("Failed to load master data");
      }
    };
    fetchMasterData();
  }, []);

  // --- Validation functions for each tab ---
  const validateEmployeeDetails = (): boolean => {
    const newErrors: ValidationErrors = { ...errors };
    let hasErrors = false;

    if (!formData.employeeCode?.trim()) {
      newErrors.employeeCode = ["Employee Code is required"];
      hasErrors = true;
    } else delete newErrors.employeeCode;
    if (!formData.firstName?.trim()) {
      newErrors.firstName = ["Employee Name is required"];
      hasErrors = true;
    } else delete newErrors.firstName;
    if (!formData.designationID) {
      newErrors.designationID = ["Designation is required"];
      hasErrors = true;
    } else delete newErrors.designationID;
    if (!formData.companyId) {
      newErrors.companyId = ["Company is required"];
      hasErrors = true;
    } else delete newErrors.companyId;
    if (!formData.departmentID) {
      newErrors.departmentID = ["Department is required"];
      hasErrors = true;
    } else delete newErrors.departmentID;
    if (!formData.levelID) {
      newErrors.levelID = ["Level is required"];
      hasErrors = true;
    } else delete newErrors.levelID;
    if (!formData.roleId) {
      newErrors.roleId = ["Role is required"];
      hasErrors = true;
    } else delete newErrors.roleId;
    if (!formData.panNumber?.trim()) {
      newErrors.panNumber = ["PAN Number is required"];
      hasErrors = true;
    } else delete newErrors.panNumber;
    if (!formData.aadhaarNumber?.trim()) {
      newErrors.aadhaarNumber = ["Aadhaar Number is required"];
      hasErrors = true;
    } else delete newErrors.aadhaarNumber;
    if (!photoFile) {
      newErrors.photoFile = ["Photo is required"];
      hasErrors = true;
    } else delete newErrors.photoFile;
    if (!formData.attachments || formData.attachments.length === 0) {
      newErrors.attachments = ["At least one document is required"];
      hasErrors = true;
    } else delete newErrors.attachments;

    setErrors(newErrors);
    return !hasErrors;
  };

  const validateCurrentAddress = (): boolean => {
    const newErrors: ValidationErrors = { ...errors };
    let hasErrors = false;
    if (!formData.curEmail?.trim()) {
      newErrors.curEmail = ["Email Address is required"];
      hasErrors = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.curEmail)) {
      newErrors.curEmail = ["Invalid email format"];
      hasErrors = true;
    } else delete newErrors.curEmail;
    setErrors(newErrors);
    return !hasErrors;
  };

  const validatePermanentAddress = (): boolean => {
    const newErrors: ValidationErrors = { ...errors };
    let hasErrors = false;
    if (!formData.permEmail?.trim()) {
      newErrors.permEmail = ["Email Address is required"];
      hasErrors = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.permEmail)) {
      newErrors.permEmail = ["Invalid email format"];
      hasErrors = true;
    } else delete newErrors.permEmail;
    setErrors(newErrors);
    return !hasErrors;
  };

  const validateBankDetails = (): boolean => {
    return true;
  };

  const validateExpQual = (): boolean => true; // No mandatory fields

  const validateCurrentTab = (): boolean => {
    switch (activeTab) {
      case 0:
        return validateEmployeeDetails();
      case 1:
        return validateCurrentAddress();
      case 2:
        return validatePermanentAddress();
      case 3:
        return validateBankDetails();
      case 4:
        return validateExpQual();
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
    const isValid =
      validateEmployeeDetails() &&
      validateCurrentAddress() &&
      validatePermanentAddress() &&
      validateBankDetails();
    if (!isValid) {
      if (!validateEmployeeDetails()) setActiveTab(0);
      else if (!validateCurrentAddress()) setActiveTab(1);
      else if (!validatePermanentAddress()) setActiveTab(2);
      else if (!validateBankDetails()) setActiveTab(3);
      toast.error("Please fill all required fields");
      return;
    }

    const data = new FormData();
    const nameParts = formData.firstName.trim().split(/\s+/);
    const fName = nameParts[0] || "";
    const lName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : ".";
    data.append("EmployeeCode", String(formData.employeeCode ?? ""));
    data.append("FirstName", fName);
    data.append("LastName", lName);
    data.append("Email", formData.curEmail);
    data.append("Password", formData.password);

    const appendIfValid = (key: string, value: FormValue): void => {
      if (
        value !== null &&
        value !== undefined &&
        value !== "" &&
        value !== "0" &&
        value !== 0 &&
        typeof value !== "object"
      ) {
        data.append(key, String(value));
      }
    };
    appendIfValid("CompanyId", formData.companyId);
    data.append("Role", String(formData.roleId ?? ""));
    appendIfValid("DepartmentID", formData.departmentID);
    appendIfValid("DesignationID", formData.designationID);
    appendIfValid("LevelID", formData.levelID);
    data.append("PANNumber", formData.panNumber);
    data.append("AadhaarNumber", formData.aadhaarNumber);
    data.append("PassportNumber", formData.passportNumber);

    data.append("CurFlatNo", formData.curFlatNo);
    data.append("CurPremisesName", formData.curPremisesName);
    data.append("CurRoadName", formData.curRoadName);
    data.append("CurLocality", formData.curLocality);
    data.append("CurTownDistrict", formData.curTownDistrict);
    data.append("CurPinNo", formData.curPinNo);
    data.append("CurMobileNo", formData.curMobileNo);
    data.append("CurEmail", formData.curEmail);
    appendIfValid("CurCountryId", formData.curCountryId);
    appendIfValid("CurStateId", formData.curStateId);

    data.append("PermFlatNo", formData.permFlatNo);
    data.append("PermPremisesName", formData.permPremisesName);
    data.append("PermRoadName", formData.permRoadName);
    data.append("PermLocality", formData.permLocality);
    data.append("PermTownDistrict", formData.permTownDistrict);
    data.append("PermPinNo", formData.permPinNo);
    data.append("PermMobileNo", formData.permMobileNo);
    data.append("PermEmail", formData.permEmail);
    appendIfValid("PermCountryId", formData.permCountryId);
    appendIfValid("PermStateId", formData.permStateId);

    data.append("BankName", formData.bankName);
    data.append("BankAddress", formData.bankAddress || "");
    data.append("SortCode", formData.sortCode || "");
    data.append("AccountNumber", formData.accountNumber);
    data.append("IFSCCode", formData.ifscCode);
    data.append("AccountHolderName", formData.accountHolderName);
    data.append("SwiftCode", formData.swiftCode || "");
    data.append("IBANNo", formData.ibanNo || "");

    if (photoFile) data.append("Photo", photoFile);
    if (Array.isArray(formData.attachments))
      formData.attachments.forEach((file) => data.append("Attachments", file));
    data.append("QualificationsJson", JSON.stringify(formData.qualifications));
    data.append("ExperiencesJson", JSON.stringify(formData.experiences));

    const token = sessionStorage.getItem("token");
    setIsSaving(true);
    try {
      toast.loading("Registering employee...", { id: "save-emp" });
      await axios.post(API_ENDPOINTS.Register, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Employee saved successfully!", { id: "save-emp" });
      onSuccess();
    } catch (err: unknown) {
      const error = err as AxiosError<ApiErrorResponse>;
      console.error("Error details:", error.response?.data);
      toast.error(error.response?.data?.message || "Error saving employee", {
        id: "save-emp",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const hasErrorsInTab = (tabIndex: number): boolean => {
    switch (tabIndex) {
      case 0:
        return !!(
          errors.employeeCode ||
          errors.firstName ||
          errors.designationID ||
          errors.companyId ||
          errors.departmentID ||
          errors.levelID ||
          errors.roleId ||
          errors.panNumber ||
          errors.aadhaarNumber ||
          errors.photoFile ||
          errors.attachments
        );
      case 1:
        return !!(errors.curMobileNo || errors.curEmail);
      case 2:
        return !!(errors.permMobileNo || errors.permEmail);
      case 3:
        return false;
      default:
        return false;
    }
  };

  const tabs = [
    { label: "Employee Details", icon: <Building size={16} /> },
    { label: "Current Address", icon: <MapPin size={16} /> },
    { label: "Permanent Address", icon: <Globe size={16} /> },
    { label: "Bank Details", icon: <CreditCard size={16} /> },
    { label: "Exp / Qual", icon: <GraduationCap size={16} /> },
  ];

  return (
    <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden mb-8 animate-in slide-in-from-top-4 duration-500">
      <div className="flex bg-[#f07837] p-1.5 gap-1">
        {tabs.map((tab, index) => (
          <button
            key={tab.label}
            type="button"
            onClick={() => handleTabChange(index)}
            className={`flex-1 py-3 text-[11px] font-extrabold uppercase tracking-widest rounded-md transition-all duration-300 flex items-center justify-center gap-2 relative ${
              activeTab === index
                ? "bg-white text-[#154068] shadow-lg scale-[1.02]"
                : "text-white hover:bg-white/10"
            }`}
          >
            {tab.icon} {tab.label}
            {hasErrorsInTab(index) && activeTab !== index && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
            )}
          </button>
        ))}
      </div>

      <div className="p-8 bg-white min-h-[450px]">
        {activeTab === 0 && (
          <EmployeeDetailsTab
            ref={employeeDetailsRef}
            formData={formData}
            setFormData={setFormData}
            photoFile={photoFile}
            setPhotoFile={setPhotoFile}
            companies={companies}
            departments={departments}
            designations={designations}
            roles={roles}
            levels={levels}
            errors={errors}
          />
        )}
        {activeTab === 1 && (
          <EmployeeAddressTab
            type="cur"
            formData={formData}
            setFormData={setFormData}
            countries={countries}
            states={states}
            errors={errors}
          />
        )}
        {activeTab === 2 && (
          <EmployeeAddressTab
            type="perm"
            formData={formData}
            setFormData={setFormData}
            countries={countries}
            states={states}
            errors={errors}
          />
        )}
        {activeTab === 3 && (
          <BankDetailsTab formData={formData} setFormData={setFormData} />
        )}
        {activeTab === 4 && (
          <ExpQualTab formData={formData} setFormData={setFormData} />
        )}
      </div>

      <div className="p-5 bg-gray-50 flex justify-end gap-3 border-t">
        <button
          type="button"
          onClick={onCancel}
          className={buttonStyles.cancel}
        >
          Cancel
        </button>
        {activeTab > 0 && (
          <button
            type="button"
            onClick={() => setActiveTab(activeTab - 1)}
            className={buttonStyles.back}
          >
            Back
          </button>
        )}
        {activeTab < tabs.length - 1 ? (
          <button
            type="button"
            onClick={() => handleTabChange(activeTab + 1)}
            className={buttonStyles.next}
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className={buttonStyles.save}
          >
            {isSaving ? (
              <>
                <Loader2 className="animate-spin" size={16} /> Saving...
              </>
            ) : (
              "Save"
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default EmployeeWizard;
