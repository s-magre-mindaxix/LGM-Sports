import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { toast } from "sonner";
import {
  User,
  Landmark,
  FileUp,
  Loader2,
  MapPin,
  GraduationCap,
  Camera,
  Building,
  Briefcase,
  Check,
  Paperclip,
  Trash2,
} from "lucide-react";
import axios from "axios";

// Service Imports
import { getEmployeeFullDetails } from "../../../CRM/Pages/Employee/Services/EmployeeService";
import {
  getDesignationsList,
  getRoles,
  getWorkLocations,
  getCountries,
  getStates,
  getCompanies,
  getDepartmentsList,
  type MasterDataItem,
  type Role,
  type CountryItem,
  type StateItem,
  type CompanyItem,
  type DepartmentItem,
  type DesignationItem,
} from "../../../HRMS/Services/MasterDataService";

import {
  getLevels,
  type Level,
} from "../../../HRMS/Pages/Hierarchy/Services/LevelService";

import { API_ENDPOINTS } from "../../../../API/apiConfig";
import type { EmployeeFormData } from "./EmployeeWizard";
import type { EmployeeDocument } from "./Services/EmployeeDocumentService";
import Select from "react-select";
import { buttonStyles } from "../../../../Components/Common/buttonStyles";

interface EditEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employeeId: number | null;
}

// 5 Tabs (Unified Addresses + Payroll)
type TabIndex = 0 | 1 | 2 | 3 | 4 | 5;

const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  employeeId,
}) => {
  const [activeTab, setActiveTab] = useState<TabIndex>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [master, setMaster] = useState({
    locations: [] as MasterDataItem[],
    departments: [] as DepartmentItem[],
    designations: [] as DesignationItem[],
    roles: [] as Role[],
    countries: [] as CountryItem[],
    states: [] as StateItem[],
    companies: [] as CompanyItem[],
    levels: [] as Level[],
  });

  const [formData, setFormData] = useState<EmployeeFormData>({
    role: "",
    firstName: "",
    lastName: "",
    googleCalendarId: "",
    employeeCode: "",
    companyId: "",
    designationID: "",
    designationName: "",
    departmentID: "",
    levelID: "",
    panNumber: "",
    aadhaarNumber: "",
    passportNumber: "",
    email: "",
    password: "",
    curFlatNo: "",
    curPremisesName: "",
    curRoadName: "",
    curLocality: "",
    curTownDistrict: "",
    curPinNo: "",
    curCountryId: "",
    curStateId: "",
    curMobileNo: "",
    curAltMobileNo: "",
    curEmail: "",
    curAltEmail: "",
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
    qualifications: [],
    experiences: [],
    pfDeductionPercentage: 12,
    isCappedAt15k: false,
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [newDocumentName, setNewDocumentName] = useState("");
  const [newDocumentFile, setNewDocumentFile] = useState<File | null>(null);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const FILE_BASE_URL = API_ENDPOINTS.BaseUrl.replace("/api", "");

  const fetchAllData = useCallback(async () => {
    if (!employeeId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const [
        full,
        locs,
        depts,
        desigs,
        roles,
        countries,
        states,
        companies,
        levels,
      ] = await Promise.all([
        getEmployeeFullDetails(employeeId),
        getWorkLocations(),
        getDepartmentsList(),
        getDesignationsList(),
        getRoles(),
        getCountries(),
        getStates(),
        getCompanies(),
        getLevels(),
      ]);

      setMaster({
        locations: locs,
        departments: depts,
        designations: desigs,
        roles,
        countries,
        states,
        companies,
        levels,
      });

      const fullName = [full.firstName, full.middleName, full.lastName]
        .filter((part) => part && part !== "null" && part.trim() !== "")
        .join(" ");
      setFormData({
        ...full,
        firstName: fullName,
        role: full.role ?? "",
         googleCalendarId: full.googleCalendarId || "",
        // 1. Flatten Statutory Details
        curMobileNo: full.curMobileNo || full.mobileNumber || "",
        curEmail: full.curEmail || full.emailAddress || "",
        panNumber: full.statutoryDetails?.panNumber || "",
        aadhaarNumber: full.statutoryDetails?.aadhaarNumber || "",
        passportNumber: full.statutoryDetails?.passportNumber || "",

        // 2. Flatten Bank Details
        bankName: full.bankDetails?.bankName || "",
        accountNumber: full.bankDetails?.accountNumber || "",
        ifscCode: full.bankDetails?.ifscCode || "",
        accountHolderName: full.bankDetails?.accountHolderName || "",
        swiftCode: full.bankDetails?.swiftCode || "",
        ibanNo: full.bankDetails?.ibanNo || "",
        bankAddress: full.bankDetails?.bankAddress || "",
        sortCode: full.bankDetails?.sortCode || "",

        // 3. Format dates for HTML date inputs (YYYY-MM-DD)
        dateOfBirth: full.dateOfBirth?.substring(0, 10) || "",
        dateOfJoining: full.dateOfJoining?.substring(0, 10) || "",

        // 4. Map Qualifications and Experience
        qualifications: full.qualifications || [],
        experiences: (full.experiences || []).map((ex) => ({
          ...ex,
          fromDate: ex.fromDate?.substring(0, 10) || "", // Ensure dates work in inputs
          toDate: ex.toDate?.substring(0, 10) || "",
        })),

        pfDeductionPercentage: full.pfDetails?.pfDeductionPercentage ?? 12,
        isCappedAt15k: full.pfDetails?.isCappedAt15k ?? false,
      } as unknown as EmployeeFormData);

      setDocuments(
        (full.documents || []).map((doc) => ({
          ...doc,
          employeeID: employeeId,
        })),
      );
      if (full.photoPath) setPhotoPreview(`${FILE_BASE_URL}${full.photoPath}`);
    } catch {
      toast.error("Failed to load employee data.");
      onClose();
    } finally {
      setIsLoading(false);
    }
  }, [employeeId, onClose, FILE_BASE_URL]);

  useEffect(() => {
    if (isOpen && employeeId) fetchAllData();
  }, [isOpen, employeeId, fetchAllData]);

  const handleGlobalChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    const val =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleSaveAll = async () => {
    if (!employeeId) return;
    setIsSaving(true);
    const data = new FormData();
    const nameParts = formData.firstName.trim().split(/\s+/);
    data.append("FirstName", nameParts[0] || "");
    data.append(
      "LastName",
      nameParts.length > 1 ? nameParts.slice(1).join(" ") : ".",
    );

    Object.keys(formData).forEach((key) => {
      const val = formData[key];
      if (
        ![
          "qualifications",
          "experiences",
          "firstName",
          "lastName",
          "attachments",
          "documents",
          "statutoryDetails",
          "bankDetails",
          "pfDetails",
        ].includes(key)
      ) {
        if (val !== null && val !== undefined && typeof val !== "object") {
          data.append(key.charAt(0).toUpperCase() + key.slice(1), String(val));
        }
      }
    });

    data.append("QualificationsJson", JSON.stringify(formData.qualifications));
    data.append("ExperiencesJson", JSON.stringify(formData.experiences));
    if (photoFile) data.append("Photo", photoFile);

    try {
      const token = sessionStorage.getItem("token");
      await axios.put(
        // `${API_ENDPOINTS.Employees}/${employeeId}/full-update`,
        `${API_ENDPOINTS.Employees}/${employeeId}`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success("Employee updated successfully");
      onSuccess();
      onClose();
    } catch {
      toast.error("Update failed");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadDocument = async () => {
    if (!newDocumentFile || !newDocumentName)
      return toast.warning("Provide name and file");
    const data = new FormData();
    data.append("employeeID", String(employeeId));
    data.append("documentName", newDocumentName);
    data.append("file", newDocumentFile);
    try {
      setIsSaving(true);
      await axios.post(
        `${API_ENDPOINTS.BaseUrl}/employee-documents/upload`,
        data,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        },
      );
      toast.success("Document uploaded");
      setNewDocumentName("");
      setNewDocumentFile(null);
      fetchAllData();
    } catch {
      toast.error("Upload failed");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteDocument = async (id: number) => {
    if (!window.confirm("Delete document?")) return;
    try {
      await axios.delete(`${API_ENDPOINTS.BaseUrl}/employee-documents/${id}`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      });
      toast.success("Deleted");
      fetchAllData();
    } catch {
      toast.error("Failed");
    }
  };

  const tabs = [
    { label: "Employee Details", icon: <Building size={16} /> },
    { label: "Addresses", icon: <MapPin size={16} /> },
    { label: "Bank Details", icon: <Landmark size={16} /> },
    { label: "Exp / Qual", icon: <GraduationCap size={16} /> },
    { label: "Documents", icon: <FileUp size={16} /> },
    { label: "Payroll", icon: <Check size={16} /> },
  ];

  const genderOptions = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "Other", label: "Other" }, // optional
  ];

  const companyOptions = useMemo(
    () =>
      master.companies.map((c) => ({
        value: c.companyId,
        label: c.companyName,
      })),
    [master.companies],
  );

  const departmentOptions = useMemo(
    () =>
      master.departments.map((d) => ({
        value: d.id,
        label: d.departmentName,
      })),
    [master.departments],
  );

  const designationOptions = useMemo(
    () =>
      master.designations.map((d) => ({
        value: d.id,
        label: d.designationName,
      })),
    [master.designations],
  );

  const countryOptions = useMemo(
    () =>
      master.countries.map((c) => ({
        value: c.id,
        label: c.countryName,
      })),
    [master.countries],
  );

  const roleOptions = useMemo(
    () =>
      master.roles.map((r) => ({
        value: r.name,
        label: r.name,
      })),
    [master.roles],
  );

  const levelOptions = useMemo(
    () =>
      master.levels.map((l) => ({
        value: l.id,
        label: `${l.levelOrder} (${l.levelName})`,
      })),
    [master.levels],
  );

  if (!isOpen) return null;

  const getStateOptions = (type: "cur" | "perm") => {
    return master.states
      .filter(
        (s) =>
          String(s.countryId) ===
          String(formData[`${type}CountryId` as keyof EmployeeFormData]),
      )
      .map((s) => ({
        value: s.id,
        label: s.stateName,
      }));
  };

  const selectedCompanyValue =
    companyOptions.find(
      (c) => String(c.value) === String(formData.companyId),
    ) || null;

  const selectedDepartmentValue =
    departmentOptions.find(
      (d) => String(d.value) === String(formData.departmentID),
    ) || null;

  const selectedDesignationValue =
    designationOptions.find(
      (d) => String(d.value) === String(formData.designationID),
    ) || null;

  const selectedRoleValue =
    roleOptions.find((r) => r.value === formData.role) || null;

  const selectedLevelValue =
    levelOptions.find((l) => String(l.value) === String(formData.levelID)) ||
    null;

  const getSelectedCountryValue = (type: "cur" | "perm") =>
    countryOptions.find(
      (c) =>
        String(c.value) ===
        String(formData[`${type}CountryId` as keyof EmployeeFormData]),
    ) || null;

  const getSelectedStateValue = (type: "cur" | "perm") => {
    const options = getStateOptions(type);
    return (
      options.find(
        (s) =>
          String(s.value) ===
          String(formData[`${type}StateId` as keyof EmployeeFormData]),
      ) || null
    );
  };

  const inputStyle =
    "w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm";
  const labelStyle =
    "text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest";

  const renderTabContent = () => {
    if (isLoading)
      return (
        <div className="flex justify-center p-20">
          <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
      );

    switch (activeTab) {
      case 0: // PERSONAL + STATUTORY
        return (
          <div className="p-8 space-y-8 animate-in fade-in duration-300">
            <div className="flex items-center gap-10">
              <div className="relative group">
                <div className="w-32 h-32 rounded-4xl border-2 border-dashed border-green-400 flex items-center justify-center overflow-hidden bg-gray-50 shadow-inner">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={48} className="text-gray-300" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 bg-[#133561] text-white p-2.5 rounded-2xl shadow-lg hover:scale-110 transition-transform"
                >
                  <Camera size={18} />
                </button>
                <input
                  type="file"
                  ref={photoInputRef}
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setPhotoFile(f);
                      setPhotoPreview(URL.createObjectURL(f));
                    }
                  }}
                />
              </div>
              <div className="grow grid grid-cols-2 gap-6">
                <div className="relative">
                  <label className={labelStyle}>Employee Code</label>
                  <input
                    className={inputStyle}
                    value={formData.employeeCode}
                    disabled
                  />
                </div>
                <div className="relative">
                  <label className={labelStyle}>Employee Name</label>
                  <input
                    name="firstName"
                    className={inputStyle}
                    value={formData.firstName}
                    onChange={handleGlobalChange}
                  />
                </div>
                <div>
                  <label className={labelStyle}>Select Company</label>
                  <Select
                    options={companyOptions}
                    value={selectedCompanyValue}
                    onChange={(opt) =>
                      setFormData((prev) => ({
                        ...prev,
                        companyId: opt?.value || "",
                      }))
                    }
                    isClearable
                    isSearchable
                    placeholder="Select Company..."
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: 46,
                        borderRadius: "0.5rem",
                      }),
                    }}
                  />
                </div>
                <div>
                  <label className={labelStyle}>Department</label>
                  <Select
                    options={departmentOptions}
                    value={selectedDepartmentValue}
                    onChange={(opt) =>
                      setFormData((prev) => ({
                        ...prev,
                        departmentID: opt?.value || "",
                      }))
                    }
                    isClearable
                    isSearchable
                    placeholder="Select Department..."
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: 46,
                        borderRadius: "0.5rem",
                      }),
                    }}
                  />
                </div>

                <div>
                  <label className={labelStyle}>Role</label>

                  <Select
                    options={roleOptions}
                    value={selectedRoleValue}
                    onChange={(opt) =>
                      setFormData((prev) => ({
                        ...prev,
                        role: opt?.value || "",
                      }))
                    }
                    isClearable
                    isSearchable
                    placeholder="Select Role..."
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: 46,
                        borderRadius: "0.5rem",
                      }),
                    }}
                  />
                </div>

                <div>
                  <label className={labelStyle}>Level</label>
                  <Select
                    options={levelOptions}
                    value={selectedLevelValue}
                    onChange={(opt) =>
                      setFormData((prev) => ({
                        ...prev,
                        levelID: opt?.value || "",
                      }))
                    }
                    isClearable
                    isSearchable
                    placeholder="Select Level..."
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: 46,
                        borderRadius: "0.5rem",
                      }),
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className={labelStyle}>Designation</label>
                <Select
                  options={designationOptions}
                  value={selectedDesignationValue}
                  onChange={(opt) =>
                    setFormData((prev) => ({
                      ...prev,
                      designationID: opt?.value || "",
                    }))
                  }
                  isClearable
                  isSearchable
                  placeholder="Select Designation..."
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: 46,
                      borderRadius: "0.5rem",
                    }),
                  }}
                />
              </div>
              <div className="relative">
                <label className={labelStyle}>PAN Number</label>
                <input
                  name="panNumber"
                  className={inputStyle}
                  value={String(formData.panNumber ?? "")}
                  onChange={handleGlobalChange}
                />
              </div>
              <div className="relative">
                <label className={labelStyle}>Aadhaar Number</label>
                <input
                  name="aadhaarNumber"
                  className={inputStyle}
                  value={String(formData.aadhaarNumber ?? "")}
                  onChange={handleGlobalChange}
                />
              </div>
               {/* ADD THIS NEW FIELD BELOW */}
  <div className="relative">
    <label className={labelStyle}>Google Calendar ID</label>
    <input
      name="googleCalendarId"
      className={inputStyle}
      placeholder="e.g. email@gmail.com"
      value={String(formData.googleCalendarId ?? "")}
      onChange={handleGlobalChange}
    />
    <p className="text-[10px] text-gray-400 mt-1 italic">
      Must be the same email used in Google Calendar settings.
    </p>
  </div>
  
              <div className="relative">
                <label className={labelStyle}>Passport No.</label>
                <input
                  name="passportNumber"
                  className={inputStyle}
                  value={String(formData.passportNumber ?? "")}
                  onChange={handleGlobalChange}
                />
              </div>
              <div className="relative">
                <label className={labelStyle}>DOB</label>
                <input
                  name="dateOfBirth"
                  type="date"
                  className={inputStyle}
                  value={String(formData.dateOfBirth ?? "")}
                  onChange={handleGlobalChange}
                />
              </div>
              <div>
                <label className={labelStyle}>Gender</label>
                <Select
                  options={genderOptions}
                  value={
                    genderOptions.find(
                      (g) => String(g.value) === String(formData.gender),
                    ) || null
                  }
                  onChange={(opt) =>
                    setFormData((prev) => ({
                      ...prev,
                      gender: opt?.value || "",
                    }))
                  }
                  isClearable
                  isSearchable={false}
                  placeholder="Select Gender..."
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: 46,
                      borderRadius: "0.5rem",
                    }),
                  }}
                />
              </div>
            </div>
          </div>
        );

      case 1: // COMBINED ADDRESSES
        return (
          <div className="p-8 space-y-10 overflow-y-auto max-h-[550px] animate-in fade-in duration-300">
            {(["cur", "perm"] as const).map((type) => (
              <div key={type} className="space-y-6">
                <h3 className="text-sm font-black text-[#133561] uppercase border-b pb-2 flex items-center gap-2">
                  <MapPin size={16} />{" "}
                  {type === "cur" ? "Current Address" : "Permanent Address"}
                </h3>
                <div className="grid grid-cols-3 gap-6 pt-2">
                  {[
                    "FlatNo",
                    "PremisesName",
                    "RoadName",
                    "Locality",
                    "TownDistrict",
                    "PinNo",
                    "MobileNo",
                    "Email",
                  ].map((field) => (
                    <div key={field} className="relative">
                      <label className={labelStyle}>
                        {field.replace(/([A-Z])/g, " $1")}
                      </label>
                      <input
                        name={`${type}${field}`}
                        value={String(formData[`${type}${field}`] || "")}
                        onChange={handleGlobalChange}
                        className={inputStyle}
                      />
                    </div>
                  ))}
                  <div>
                    <label className={labelStyle}>Country</label>
                    <Select
                      options={countryOptions}
                      value={getSelectedCountryValue(type)}
                      onChange={(opt) =>
                        setFormData((prev) => ({
                          ...prev,
                          [`${type}CountryId`]: opt?.value || "",
                          [`${type}StateId`]: "", // reset state when country changes
                        }))
                      }
                      isClearable
                      isSearchable
                      placeholder="Select Country..."
                    />
                  </div>

                  <div>
                    <label className={labelStyle}>State</label>
                    <Select
                      options={getStateOptions(type)}
                      value={getSelectedStateValue(type)}
                      onChange={(opt) =>
                        setFormData((prev) => ({
                          ...prev,
                          [`${type}StateId`]: opt?.value || "",
                        }))
                      }
                      isClearable
                      isSearchable
                      isDisabled={!formData[`${type}CountryId`]}
                      placeholder="Select State..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 2: // BANK DETAILS
        return (
          <div className="p-8 grid grid-cols-3 gap-6 animate-in fade-in duration-300">
            {[
              "bankName",
              "accountNumber",
              "ifscCode",
              "accountHolderName",
              "swiftCode",
              "ibanNo",
              "bankAddress",
              "sortCode",
            ].map((f) => (
              <div key={f} className="relative">
                <label className={labelStyle}>
                  {f.replace(/([A-Z])/g, " $1")}
                </label>
                <input
                  name={f}
                  value={String(formData[f] || "")}
                  onChange={handleGlobalChange}
                  className={inputStyle}
                />
              </div>
            ))}
          </div>
        );

      case 3: // EXP / QUAL + DOCUMENTS
        return (
          <div className="p-8 space-y-10 overflow-y-auto max-h-[550px] animate-in fade-in duration-300">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2 text-[#133561]">
                  <GraduationCap size={18} /> Qualifications
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      qualifications: [
                        ...formData.qualifications,
                        {
                          degree: "",
                          university: "",
                          passingYear: "",
                          percentage: "",
                        },
                      ],
                    })
                  }
                  className="text-blue-600 text-xs font-bold underline"
                >
                  + Add More
                </button>
              </div>
              {formData.qualifications.map((q, i) => (
                <div
                  key={i}
                  className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-2xl border relative"
                >
                  <input
                    className={inputStyle}
                    value={q.degree}
                    placeholder="Degree"
                    onChange={(e) => {
                      const updated = [...formData.qualifications];
                      updated[i].degree = e.target.value;
                      setFormData({ ...formData, qualifications: updated });
                    }}
                  />
                  <input
                    className={inputStyle}
                    value={q.university}
                    placeholder="University"
                    onChange={(e) => {
                      const updated = [...formData.qualifications];
                      updated[i].university = e.target.value;
                      setFormData({ ...formData, qualifications: updated });
                    }}
                  />
                  <input
                    className={inputStyle}
                    value={q.passingYear}
                    placeholder="Year"
                    onChange={(e) => {
                      const updated = [...formData.qualifications];
                      updated[i].passingYear = e.target.value;
                      setFormData({ ...formData, qualifications: updated });
                    }}
                  />
                  <div className="flex gap-2">
                    <input
                      className={inputStyle}
                      value={q.percentage}
                      placeholder="%"
                      onChange={(e) => {
                        const updated = [...formData.qualifications];
                        updated[i].percentage = e.target.value;
                        setFormData({ ...formData, qualifications: updated });
                      }}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          qualifications: formData.qualifications.filter(
                            (_, idx) => idx !== i,
                          ),
                        })
                      }
                      className="text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2 text-[#133561]">
                  <Briefcase size={18} /> Experience
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      experiences: [
                        ...formData.experiences,
                        {
                          companyName: "",
                          designation: "",
                          fromDate: "",
                          toDate: "",
                          location: "",
                        },
                      ],
                    })
                  }
                  className="text-blue-600 text-xs font-bold underline"
                >
                  + Add More
                </button>
              </div>
              {formData.experiences.map((ex, i) => (
                <div
                  key={i}
                  className="grid grid-cols-5 gap-4 p-4 bg-gray-50 rounded-2xl border relative"
                >
                  <input
                    className={inputStyle}
                    value={ex.companyName}
                    placeholder="Company"
                    onChange={(e) => {
                      const updated = [...formData.experiences];
                      updated[i].companyName = e.target.value;
                      setFormData({ ...formData, experiences: updated });
                    }}
                  />
                  <input
                    className={inputStyle}
                    value={ex.designation}
                    placeholder="Role"
                    onChange={(e) => {
                      const updated = [...formData.experiences];
                      updated[i].designation = e.target.value;
                      setFormData({ ...formData, experiences: updated });
                    }}
                  />
                  <input
                    type="date"
                    className={inputStyle}
                    value={ex.fromDate}
                    onChange={(e) => {
                      const updated = [...formData.experiences];
                      updated[i].fromDate = e.target.value;
                      setFormData({ ...formData, experiences: updated });
                    }}
                  />
                  <input
                    type="date"
                    className={inputStyle}
                    value={ex.toDate}
                    onChange={(e) => {
                      const updated = [...formData.experiences];
                      updated[i].toDate = e.target.value;
                      setFormData({ ...formData, experiences: updated });
                    }}
                  />
                  <div className="flex gap-2">
                    <input
                      className={inputStyle}
                      value={ex.location}
                      placeholder="Loc"
                      onChange={(e) => {
                        const updated = [...formData.experiences];
                        updated[i].location = e.target.value;
                        setFormData({ ...formData, experiences: updated });
                      }}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          experiences: formData.experiences.filter(
                            (_, idx) => idx !== i,
                          ),
                        })
                      }
                      className="text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 4: // DOCUMENTS TAB
        return (
          <div className="p-8 animate-in zoom-in duration-300">
            <div className="p-8 bg-white rounded-3xl border border-gray-200 shadow-sm">
              <h3 className="text-sm font-black text-[#133561] uppercase mb-6 flex items-center gap-2">
                <FileUp size={18} /> HR DOCUMENTS
              </h3>
              <div className="flex items-center gap-4 mb-8">
                <input
                  className="grow h-[42px] border border-gray-200 rounded-2xl px-5 outline-none focus:border-blue-400 text-sm italic"
                  placeholder="Doc Name"
                  value={newDocumentName}
                  onChange={(e) => setNewDocumentName(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => docInputRef.current?.click()}
                  className="h-[42px] bg-white border border-gray-900 px-8 rounded-2xl text-sm font-bold hover:bg-gray-50"
                >
                  Choose File
                </button>
                <input
                  type="file"
                  ref={docInputRef}
                  className="hidden"
                  onChange={(e) =>
                    setNewDocumentFile(e.target.files?.[0] || null)
                  }
                />
                <button
                  type="button"
                  onClick={handleUploadDocument}
                  disabled={isSaving}
                  className={buttonStyles.save}
                >
                  {isSaving ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    "Upload"
                  )}
                </button>
              </div>

              {/* LIST OF UPLOADED DOCUMENTS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between h-[42px] px-4 border border-black rounded-2xl bg-white group hover:border-[#133561] transition-all"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <Paperclip size={16} className="text-blue-500 shrink-0" />
                      <span className="text-[13px] font-black text-black truncate">
                        {doc.documentName}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="text-red-500 hover:scale-110 transition-transform"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 5: // PAYROLL
        return (
          <div className="p-8 animate-in zoom-in duration-300">
            <div className="p-10 bg-blue-50 rounded-4xl border border-blue-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[#133561] text-lg">
                  Payroll PF Settings
                </h3>
                <p className="text-sm text-blue-600">
                  Manage deduction percentages and wage ceilings
                </p>
              </div>
              <div className="flex items-center gap-12">
                <div className="relative w-40">
                  <label className={labelStyle}>PF Deduction %</label>
                  <input
                    name="pfDeductionPercentage"
                    type="number"
                    className={inputStyle}
                    value={formData.pfDeductionPercentage ?? ""}
                    onChange={handleGlobalChange}
                  />
                </div>
                <label className="flex items-center gap-3 text-sm font-bold text-gray-700 cursor-pointer">
                  <input
                    name="isCappedAt15k"
                    type="checkbox"
                    checked={Boolean(formData.isCappedAt15k)}
                    onChange={handleGlobalChange}
                    className="w-6 h-6 rounded border-gray-300"
                  />
                  Limit to ₹15,000 ceiling
                </label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden mb-8 animate-in slide-in-from-top-4 duration-500">
      {/* --- TAB HEADER BAR (Matching Company/Create Design) --- */}
      <div className="flex bg-[#f07837] p-1.5 gap-1">
        {tabs.map((tab, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActiveTab(i as TabIndex)}
            className={`flex-1 py-3 text-[11px] font-extrabold uppercase tracking-widest rounded-md transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === i
                ? "bg-white text-[#0b2c52] shadow-lg scale-[1.02]"
                : "text-white hover:bg-white/10"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="p-8 bg-white min-h-[450px]">
        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center h-64">
              <Loader2 className="animate-spin text-blue-600 mb-2" size={48} />
              <p className="text-gray-400 font-bold">Loading Data...</p>
            </div>
          ) : (
            // Replace with your switch statement here
            renderTabContent()
          )}
        </div>
      </div>

      {/* --- FOOTER ACTIONS (Matching Company/Create Design) --- */}
      <div className="p-5 bg-gray-50 flex justify-end gap-3 border-t">
        <button type="button" onClick={onClose} className={buttonStyles.cancel}>
          Cancel
        </button>

        {activeTab > 0 && (
          <button
            type="button"
            onClick={() => setActiveTab((prev) => (prev - 1) as TabIndex)}
            className={buttonStyles.back}
          >
            Back
          </button>
        )}

        {activeTab < tabs.length - 1 ? (
          <button
            type="button"
            onClick={() => setActiveTab((prev) => (prev + 1) as TabIndex)}
            className={buttonStyles.next}
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSaveAll}
            className={buttonStyles.save}
          >
            Update
          </button>
        )}
      </div>
    </div>
  );
};

export default EditEmployeeModal;
