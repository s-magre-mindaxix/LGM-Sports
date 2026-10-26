import React, { useEffect, useState } from "react";
import {
  X,
  Calendar,
  Mail,
  Phone,
  Hash,
  Loader2,
  EyeOff,
  Eye,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  addEmployee,
  getEmployeesByRoleAndDepartment,
} from "../../../CRM/Pages/Employee/Services/EmployeeService";
import {
  getDepartments,
  getDesignations,
  getEmployeesByRole,
  getRoles,
  getWorkLocations,
  type EmployeeSelectItem,
  type MasterDataItem,
  type Role,
} from "../../../HRMS/Services/MasterDataService";

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  icon?: React.ReactNode;
  isPasswordVisible?: boolean;
  toggleVisibility?: () => void;
}

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  name: string;
  children: React.ReactNode;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  icon,
  isPasswordVisible,
  toggleVisibility,
  ...rest
}) => (
  <div>
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {label} {rest.required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {icon && (
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
          {icon}
        </span>
      )}
      <input
        id={name}
        name={name}
        className={`w-full ${
          icon ? "pl-10" : "pl-3"
        } pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm 
                   group-[.submitted]:invalid:border-red-500 
                   group-[.submitted]:invalid:focus:ring-red-500 
                   group-[.submitted]:invalid:focus:border-red-500`}
        {...rest}
      />
      {toggleVisibility && (
        <button
          type="button"
          onClick={toggleVisibility}
          className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
        >
          {isPasswordVisible ? (
            <EyeOff className="h-5 w-5 text-gray-400" />
          ) : (
            <Eye className="h-5 w-5 text-gray-400" />
          )}
        </button>
      )}
    </div>
  </div>
);

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  name,
  children,
  ...rest
}) => (
  <div>
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {label} {rest.required && <span className="text-red-500">*</span>}
    </label>
    <select
      id={name}
      name={name}
      className={`w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm 
                  group-[.submitted]:invalid:border-red-500 
                  group-[.submitted]:invalid:focus:ring-red-500 
                  group-[.submitted]:invalid:focus:border-red-500`}
      {...rest}
    >
      {children}
    </select>
  </div>
);

interface PasswordValidationState {
  minLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

const ValidationItem: React.FC<{ isValid: boolean; text: string }> = ({
  isValid,
  text,
}) => (
  <li
    className={`flex items-center text-xs transition-colors ${
      isValid ? "text-green-600" : "text-gray-500"
    }`}
  >
    {isValid ? (
      <Check size={14} className="mr-2" />
    ) : (
      <X size={14} className="mr-2 text-gray-400" />
    )}
    {text}
  </li>
);

const PasswordValidationInfo: React.FC<{
  validation: PasswordValidationState;
}> = ({ validation }) => (
  <div className="mt-2 p-3 bg-gray-50 rounded-md">
    <p className="text-xs font-medium text-gray-700 mb-2">
      Password must contain:
    </p>
    <ul className="space-y-1">
      <ValidationItem
        isValid={validation.minLength}
        text="At least 8 characters"
      />
      <ValidationItem
        isValid={validation.hasLower}
        text="At least one lowercase letter (a-z)"
      />
      <ValidationItem
        isValid={validation.hasUpper}
        text="At least one uppercase letter (A-Z)"
      />
      <ValidationItem
        isValid={validation.hasNumber}
        text="At least one number (0-9)"
      />
      <ValidationItem
        isValid={validation.hasSpecial}
        text="At least one special character (!@#$...)"
      />
    </ul>
  </div>
);

const INITIAL_FORM_STATE = {
  employeeCode: "",
  firstName: "",
  middleName: "",
  lastName: "",
  dateOfBirth: null as Date | null,
  gender: "",
  mobileNumber: "",
  email: "",
  presentAddress: "",
  dateOfJoining: null as Date | null,
  workLocationID: "",
  departmentID: "",
  designationID: "",
  aadhaarNumber: "",
  panNumber: "",
  password: "",
  confirmPassword: "",
  role: "",
  reportingTo: "",
};

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [workLocations, setWorkLocations] = useState<MasterDataItem[]>([]);
  const [departments, setDepartments] = useState<MasterDataItem[]>([]);
  const [designations, setDesignations] = useState<MasterDataItem[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [reportingManagers, setReportingManagers] = useState<
    EmployeeSelectItem[]
  >([]);
  const [reportingToLabel, setReportingToLabel] = useState("Reporting To");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [passwordValidation, setPasswordValidation] =
    useState<PasswordValidationState>({
      minLength: false,
      hasUpper: false,
      hasLower: false,
      hasNumber: false,
      hasSpecial: false,
    });
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  useEffect(() => {
    if (
      formData.confirmPassword &&
      formData.password !== formData.confirmPassword
    ) {
      setPasswordError("Passwords do not match.");
    } else {
      setPasswordError(null);
    }
  }, [formData.password, formData.confirmPassword]);

  useEffect(() => {
    const password = formData.password;
    setPasswordValidation({
      minLength: password.length >= 8,
      hasLower: /[a-z]/.test(password),
      hasUpper: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  }, [formData.password]);

  useEffect(() => {
    if (isOpen) {
      setFormData(INITIAL_FORM_STATE);
      setIsSubmitted(false);
      setPasswordError(null);
      setReportingManagers([]);
      setReportingToLabel("Reporting To");

      const fetchMasterData = async () => {
        try {
          const [locations, depts, desigs, rolesData] = await Promise.all([
            getWorkLocations(),
            getDepartments(),
            getDesignations(),
            getRoles(),
          ]);
          setWorkLocations(locations);
          setDepartments(depts);
          setDesignations(desigs);
          setRoles(rolesData);
        } catch {
          toast.error("Failed to load required data for the form.");
        }
      };
      fetchMasterData();
    }
  }, [isOpen]);

  useEffect(() => {
    const { role, departmentID } = formData;

    const fetchManagers = async () => {
      if (!role || !departmentID) {
        setReportingManagers([]);
        setReportingToLabel("Reporting To");
        return;
      }

      try {
        let managers: EmployeeSelectItem[] = [];
        if (role === "Employee") {
          setReportingToLabel("Reporting To (HR)");
          managers = await getEmployeesByRoleAndDepartment(
            "HR",
            parseInt(departmentID, 10),
          );
        } else if (role === "HR") {
          setReportingToLabel("Reporting To (Admin)");
          managers = await getEmployeesByRole("Admin");
        } else {
          setReportingToLabel("Reporting To");
        }

        setReportingManagers((currentManagers) => {
          if (JSON.stringify(currentManagers) !== JSON.stringify(managers)) {
            setFormData((prev) => ({ ...prev, reportingTo: "" }));
            return managers;
          }
          return currentManagers;
        });
      } catch (error) {
        console.error("Failed to fetch reporting managers", error);
        toast.error(`Failed to load the list of managers.`);
      }
    };

    fetchManagers();
  }, [formData.role, formData.departmentID, formData]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (
    date: Date | null,
    name: "dateOfBirth" | "dateOfJoining",
  ) => {
    setFormData((prev) => ({ ...prev, [name]: date }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitted(true);
    if (!event.currentTarget.checkValidity()) {
      toast.error("Please fix the errors in the form.");
      return;
    }
    const isPasswordValid = Object.values(passwordValidation).every(Boolean);
    if (!isPasswordValid) {
      toast.error("Please ensure the password meets all requirements.");
      return;
    }

    if (passwordError) {
      toast.error("Please ensure passwords match.");
      return;
    }
    setIsLoading(true);

    try {
      const { ...dataToSend } = formData;

      const toLocalDateString = (date: Date) => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const payload = {
        ...dataToSend,
        middleName: dataToSend.middleName
          ? dataToSend.middleName.trim()
          : undefined,
        workLocationID: parseInt(dataToSend.workLocationID, 10),
        departmentID: parseInt(dataToSend.departmentID, 10),
        designationID: parseInt(dataToSend.designationID, 10),
        reportingTo: dataToSend.reportingTo
          ? parseInt(dataToSend.reportingTo, 10)
          : null,
        dateOfBirth: dataToSend.dateOfBirth
          ? toLocalDateString(dataToSend.dateOfBirth)
          : "",
        dateOfJoining: dataToSend.dateOfJoining
          ? toLocalDateString(dataToSend.dateOfJoining)
          : "",
        isActive: true,
        isDeleted: false,
      };

      await addEmployee(payload);
      toast.success("Employee registered successfully!");
      onSuccess();
      onClose();
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Registration failed due to an unknown error.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-transparent backdrop-brightness-70 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b p-4 shrink-0">
          <h2 className="text-xl font-semibold text-gray-800">
            Add New Employee
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Modal Body with Form */}
        <form
          onSubmit={handleSubmit}
          className={`group ${isSubmitted ? "submitted" : ""} overflow-y-auto`}
          noValidate
        >
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <InputField
              label="Employee Code (Biometric User ID)"
              name="employeeCode"
              placeholder="ex. EMP001, BIO123, etc."
              value={formData.employeeCode}
              onChange={handleChange}
              required
            />
            <InputField
              label="First Name"
              name="firstName"
              placeholder="Enter first name"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
            <InputField
              label="Middle Name"
              name="middleName"
              placeholder="Enter middle name"
              value={formData.middleName}
              onChange={handleChange}
            />
            <InputField
              label="Last Name"
              name="lastName"
              placeholder="Enter last name"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
            <div>
              <label
                htmlFor="dateOfBirth"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none z-10">
                  <Calendar size={18} />
                </span>
                <DatePicker
                  id="dateOfBirth"
                  selected={formData.dateOfBirth}
                  onChange={(date) => handleDateChange(date, "dateOfBirth")}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholderText="dd-mm-yyyy"
                  dateFormat="dd-MM-yyyy"
                  showYearDropdown
                  scrollableYearDropdown
                  yearDropdownItemNumber={80}
                  required
                  autoComplete="off"
                  dropdownMode="select"
                  maxDate={new Date()}
                  wrapperClassName="w-full"
                  strictParsing
                />
              </div>
            </div>
            <SelectField
              label="Gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </SelectField>
            <InputField
              label="Mobile Number"
              name="mobileNumber"
              placeholder="+91 XXXXXXXXXX"
              icon={<Phone size={18} />}
              value={formData.mobileNumber}
              onChange={handleChange}
              required
            />
            <InputField
              label="Email Address"
              name="email"
              type="email"
              placeholder="email@company.com"
              icon={<Mail size={18} />}
              value={formData.email}
              onChange={handleChange}
              required
            />
            <InputField
              label="Aadhaar Number"
              name="aadhaarNumber"
              placeholder="XXXX XXXX XXXX"
              icon={<Hash size={18} />}
              value={formData.aadhaarNumber}
              onChange={handleChange}
              required
            />
            <InputField
              label="PAN Number"
              name="panNumber"
              placeholder="ABCDE1234F"
              icon={<Hash size={18} />}
              value={formData.panNumber}
              onChange={handleChange}
              required
            />
            <SelectField
              label="Work Location"
              name="workLocationID"
              value={formData.workLocationID}
              onChange={handleChange}
              required
            >
              <option value="">Select plant</option>
              {workLocations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </SelectField>
            <SelectField
              label="Department"
              name="departmentID"
              value={formData.departmentID}
              onChange={handleChange}
              required
            >
              <option value="">Select department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </SelectField>
            <SelectField
              label="Designation"
              name="designationID"
              value={formData.designationID}
              onChange={handleChange}
              required
            >
              <option value="">Select designation</option>
              {designations.map((desig) => (
                <option key={desig.id} value={desig.id}>
                  {desig.name}
                </option>
              ))}
            </SelectField>

            <div>
              <label
                htmlFor="dateOfJoining"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Date of Joining <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none z-10">
                  <Calendar size={18} />
                </span>
                <DatePicker
                  id="dateOfJoining"
                  selected={formData.dateOfJoining}
                  onChange={(date) => handleDateChange(date, "dateOfJoining")}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholderText="dd-mm-yyyy"
                  dateFormat="dd-MM-yyyy"
                  showYearDropdown
                  scrollableYearDropdown
                  yearDropdownItemNumber={15}
                  required
                  autoComplete="off"
                  dropdownMode="select"
                  wrapperClassName="w-full"
                  strictParsing
                />
              </div>
            </div>

            <SelectField
              label="Role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="">Select role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.name}>
                  {role.name}
                </option>
              ))}
            </SelectField>

            <SelectField
              label={reportingToLabel}
              name="reportingTo"
              value={formData.reportingTo}
              onChange={handleChange}
              disabled={!formData.role || reportingManagers.length === 0}
            >
              <option value="">Select Reporting Manager</option>
              {reportingManagers.map((manager) => (
                <option key={manager.id} value={manager.id}>
                  {manager.fullName}
                </option>
              ))}
            </SelectField>

            <div>
              <InputField
                label="Password"
                name="password"
                type={isPasswordVisible ? "text" : "password"}
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                required
                isPasswordVisible={isPasswordVisible}
                toggleVisibility={() =>
                  setIsPasswordVisible(!isPasswordVisible)
                }
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
              />
              {isPasswordFocused && (
                <PasswordValidationInfo validation={passwordValidation} />
              )}
            </div>
            <div>
              <InputField
                label="Confirm Password"
                name="confirmPassword"
                type={isPasswordVisible ? "text" : "password"}
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                isPasswordVisible={isPasswordVisible}
                toggleVisibility={() =>
                  setIsPasswordVisible(!isPasswordVisible)
                }
              />
              {passwordError && (
                <p className="text-xs text-red-500 mt-1">{passwordError}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="presentAddress"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Present Address <span className="text-red-500">*</span>
              </label>
              <textarea
                name="presentAddress"
                id="presentAddress"
                rows={2}
                value={formData.presentAddress}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm 
                           group-[.submitted]:invalid:border-red-500 
                           group-[.submitted]:invalid:focus:ring-red-500 
                           group-[.submitted]:invalid:focus:border-red-500"
                placeholder="Enter present address"
              />
            </div>
          </div>

          <div className="flex justify-end items-center gap-3 border-t p-4 shrink-0 bg-gray-50 rounded-b-lg">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 text-sm font-medium text-white bg-[#2eacb3] hover:bg-teal-800 rounded-md  disabled:bg-blue-400 flex items-center gap-2"
            >
              {isLoading && <Loader2 className="animate-spin" size={16} />}
              {isLoading ? "Saving..." : "Save Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployeeModal;
