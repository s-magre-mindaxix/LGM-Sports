import React, {
  useMemo,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Camera } from "lucide-react";
import type { EmployeeFormData } from "../EmployeeWizard";
import type {
  CompanyItem,
  DepartmentItem,
  DesignationItem,
  Role,
} from "../../../../HRMS/Services/MasterDataService";
import Select from "react-select";

export interface Level {
  id: number;
  levelName: string;
  levelOrder: number;
}

interface EmployeeDetailsTabProps {
  formData: EmployeeFormData;
  setFormData: React.Dispatch<React.SetStateAction<EmployeeFormData>>;
  photoFile: File | null;
  setPhotoFile: (file: File | null) => void;
  companies: CompanyItem[];
  departments: DepartmentItem[];
  designations: DesignationItem[];
  roles: Role[];
   levels: Level[];
  errors?: { [key: string]: string[] };
}

export interface EmployeeDetailsTabRef {
  validate: () => boolean;
}

const EmployeeDetailsTab = forwardRef<
  EmployeeDetailsTabRef,
  EmployeeDetailsTabProps
>(
  (
    {
      formData,
      setFormData,
      setPhotoFile,
      companies,
      departments,
      designations,
      roles,
      levels,
      errors = {},
    },
    ref,
  ) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const docInputRef = useRef<HTMLInputElement>(null);

    const validate = (): boolean => {
      // This is now handled by parent, but keep for ref
      return true;
    };

    useImperativeHandle(ref, () => ({ validate }));

    const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setPhotoFile(file);
        setPreview(URL.createObjectURL(file));
      }
    };

    const handleAttachments = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const filesArray = Array.from(e.target.files);
        setFormData((prev) => ({ ...prev, attachments: filesArray }));
      }
    };

    const companyOptions = useMemo(
      () =>
        companies.map((c) => ({ value: c.companyId, label: c.companyName })),
      [companies],
    );
    const departmentOptions = useMemo(
      () => departments.map((c) => ({ value: c.id, label: c.departmentName })),
      [departments],
    );
    const designationOptions = useMemo(
      () =>
        designations.map((c) => ({ value: c.id, label: c.designationName })),
      [designations],
    );

     const levelOptions = useMemo(
      () =>
        levels.map((l) => ({
          value: l.id,
          label: `${l.levelOrder} (${l.levelName})`,
        })),
      [levels],
    );

    const selectedCompanyValue =
      companyOptions.find(
        (c) => String(c.value) === String(formData.companyId),
      ) || null;
    const selectedDepartmentValue =
      departmentOptions.find(
        (c) => String(c.value) === String(formData.departmentID),
      ) || null;
    const selectedDesignationValue =
      designationOptions.find(
        (c) => String(c.value) === String(formData.designationID),
      ) || null;

      const selectedLevelValue =
      levelOptions.find((l) => String(l.value) === String(formData.levelID)) ||
      null;

    const getInputBorderClass = (field: string) =>
      errors[field]
        ? "border-red-500 shadow-sm shadow-red-200"
        : "border-gray-300";
    const baseInputStyle =
      "w-full rounded-lg px-4 py-2.5 outline-none border bg-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition";
    const labelStyle =
      "text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest";
    const RequiredAst = () => <span className="text-red-500 ml-1">*</span>;
    const selectStyles = (hasError: boolean) => ({
      control: (base: any) => ({
        ...base,
        minHeight: 46,
        borderRadius: "0.5rem",
        borderColor: hasError ? "#ef4444" : "#d1d5db",
        boxShadow: hasError ? "0 1px 2px 0 rgb(255 192 203 / 0.5)" : "none",
      }),
    });

    return (
      <div className="flex flex-col md:flex-row gap-12 items-start">
        {/* Left: Photo Upload */}
        <div className="flex flex-col items-center gap-4 px-4">
          <div className="relative group">
            <div
              className={`w-32 h-32 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden bg-white shadow-inner ${errors.photoFile ? "border-red-500" : "border-green-300"}`}
            >
              {preview ? (
                <img
                  src={preview}
                  className="w-full h-full object-cover"
                  alt="User"
                />
              ) : (
                <Camera size={40} className="text-gray-300" />
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-1 right-1 bg-[#f07837] text-white p-2.5 rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer"
            >
              <Camera size={16} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handlePhoto}
              accept="image/*"
            />
          </div>
          {errors.photoFile && (
            <p className="text-xs text-red-500 mt-1">{errors.photoFile[0]}</p>
          )}
        </div>

        {/* Right: Fields */}
        <div className="grow grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-7">
          <div className="relative">
            <label className={labelStyle}>
              Employee Code
              <RequiredAst />
            </label>
            <input
              placeholder="Enter Employee Code"
              className={`${baseInputStyle} ${getInputBorderClass("employeeCode")}`}
              value={String(formData.employeeCode ?? "")}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  employeeCode: e.target.value,
                }))
              }
            />
            {errors.employeeCode && (
              <p className="text-xs text-red-500 mt-1">
                {errors.employeeCode[0]}
              </p>
            )}
          </div>

          <div className="relative">
            <label className={labelStyle}>
              Employee Name
              <RequiredAst />
            </label>
            <input
              placeholder="Enter Employee Name"
              className={`${baseInputStyle} ${getInputBorderClass("firstName")}`}
              value={String(formData.firstName ?? "")}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, firstName: e.target.value }))
              }
            />
            {errors.firstName && (
              <p className="text-xs text-red-500 mt-1">{errors.firstName[0]}</p>
            )}
          </div>

          <div>
            <label className={labelStyle}>
              Designation
              <RequiredAst />
            </label>
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
              styles={selectStyles(!!errors.designationID)}
            />
            {errors.designationID && (
              <p className="text-xs text-red-500 mt-1">
                {errors.designationID[0]}
              </p>
            )}
          </div>

          <div>
            <label className={labelStyle}>
              Select Company
              <RequiredAst />
            </label>
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
              styles={selectStyles(!!errors.companyId)}
            />
            {errors.companyId && (
              <p className="text-xs text-red-500 mt-1">{errors.companyId[0]}</p>
            )}
          </div>

          <div>
            <label className={labelStyle}>
              Department
              <RequiredAst />
            </label>
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
              styles={selectStyles(!!errors.departmentID)}
            />
            {errors.departmentID && (
              <p className="text-xs text-red-500 mt-1">
                {errors.departmentID[0]}
              </p>
            )}
          </div>

          <div>
            <label className={labelStyle}>
              Role
              <RequiredAst />
            </label>
            <Select
              options={roles.map((r) => ({ value: r.name, label: r.name }))}
              value={
                roles
                  .map((r) => ({ value: r.name, label: r.name }))
                  .find((r) => r.value === formData.roleId) || null
              }
              onChange={(opt) =>
                setFormData((prev) => ({ ...prev, roleId: opt?.value || "" }))
              }
              isClearable
              isSearchable
              placeholder="Select Role..."
              styles={selectStyles(!!errors.roleId)}
            />
            {errors.roleId && (
              <p className="text-xs text-red-500 mt-1">{errors.roleId[0]}</p>
            )}
          </div>

              <div>
            <label className={labelStyle}>
              Level
              <RequiredAst />
            </label>
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
              styles={selectStyles(!!errors.levelID)}
            />
            {errors.levelID && (
              <p className="text-xs text-red-500 mt-1">{errors.levelID[0]}</p>
            )}
          </div>

          <div className="relative">
            <label className={labelStyle}>
              PAN No.
              <RequiredAst />
            </label>
            <input
              placeholder="Enter PAN Number"
              className={`${baseInputStyle} ${getInputBorderClass("panNumber")}`}
              value={String(formData.panNumber ?? "")}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, panNumber: e.target.value }))
              }
            />
            {errors.panNumber && (
              <p className="text-xs text-red-500 mt-1">{errors.panNumber[0]}</p>
            )}
          </div>

          <div className="relative">
            <label className={labelStyle}>
              Aadhar No.
              <RequiredAst />
            </label>
            <input
              placeholder="Enter Aadhaar Number"
              className={`${baseInputStyle} ${getInputBorderClass("aadhaarNumber")}`}
              value={String(formData.aadhaarNumber ?? "")}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  aadhaarNumber: e.target.value,
                }))
              }
            />
            {errors.aadhaarNumber && (
              <p className="text-xs text-red-500 mt-1">
                {errors.aadhaarNumber[0]}
              </p>
            )}
          </div>

          <div className="relative">
            <label className={labelStyle}>Passport No.</label>
            <input
              placeholder="Enter Passport Number"
              className={`${baseInputStyle} ${getInputBorderClass("passportNumber")}`}
              value={String(formData.passportNumber ?? "")}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  passportNumber: e.target.value,
                }))
              }
            />
          </div>

          <div className="relative">
            <label className={labelStyle}>
              Docs Attachments
              <RequiredAst />
            </label>
            <div className="flex border border-gray-300 rounded-2xl overflow-hidden bg-white">
              <div
                className="grow px-4 py-2.5 text-gray-700 text-xs italic truncate"
                title={
                  Array.isArray(formData.attachments)
                    ? formData.attachments.map((f: File) => f.name).join(", ")
                    : ""
                }
              >
                {Array.isArray(formData.attachments) &&
                formData.attachments.length > 0
                  ? formData.attachments.map((f: File) => f.name).join(", ")
                  : "Choose files..."}
              </div>
              <input
                type="file"
                ref={docInputRef}
                multiple
                className="hidden"
                onChange={handleAttachments}
              />
              <button
                type="button"
                onClick={() => docInputRef.current?.click()}
                className="bg-[#f07837] text-white px-6 font-bold text-sm hover:bg-[#0d3357] transition-colors"
              >
                Browse
              </button>
            </div>
            {errors.attachments && (
              <p className="text-xs text-red-500 mt-1">
                {errors.attachments[0]}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  },
);

export default EmployeeDetailsTab;
