import React, { useState, useEffect, useMemo } from "react";
import Select from "react-select";
import { X, LoaderCircle, Calendar } from "lucide-react";
import { toast } from "sonner";
import { API_ENDPOINTS } from "../../../../API/apiConfig";
import apiClient from "../../../../API/apiClient";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  icon?: React.ReactNode;
}
interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  name: string;
  children: React.ReactNode;
}
interface EmployeeSelection {
  id: number;
  fullName: string;
  gender: string;
  pfDeductionPercentage: number;
  state: string; 
  isCappedAt15k: boolean;
   tdsAmount: number;
}
interface ExistingSalaryComponent {
  id: number;
  componentName: string;
  componentType: string;
  isTaxable: boolean;
}
interface SalarySetting {
    componentName: string;
    percentage?: number | null;
    fixedAmount?: number | null;
    calculationBase: string;
}
interface StatutorySetting {
    [key: string]: string; 
}
interface ProfessionalTaxSlab {
    state: string;
    minGrossSalary: number;
    maxGrossSalary?: number | null;
    taxAmount: number;
    gender: string;
}
interface CreateStructureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateStructureModal: React.FC<CreateStructureModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [employees, setEmployees] = useState<EmployeeSelection[]>([]);
  const [existingComponents, setExistingComponents] = useState<ExistingSalaryComponent[]>([]);
  
  const [componentSettings, setComponentSettings] = useState<SalarySetting[]>([]);
  const [statutorySettings, setStatutorySettings] = useState<StatutorySetting>({});
  const [ptSlabs, setPtSlabs] = useState<ProfessionalTaxSlab[]>([]);

  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split("T")[0]);
  const [status, setStatus] = useState("Active");
  const [componentAmounts, setComponentAmounts] = useState<Record<string, number>>({});
  const [monthlySalary, setMonthlySalary] = useState<number | string>("");
  
  const [selectedEmployeeInfo, setSelectedEmployeeInfo] = useState<{gender: string | null; pfPercentage: number | null; state: string | null;  isCappedAt15k: boolean; tdsAmount: number;}>({gender: null, pfPercentage: 12, state: null,  isCappedAt15k: false,  tdsAmount: 0});
  
  const [isFetchingData, setIsFetchingData] = useState(false); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedEmployee("");
      setEffectiveDate(new Date().toISOString().split("T")[0]);
      setStatus("Active");
      setComponentAmounts({});
      setMonthlySalary("");
      setIsSubmitted(false);

      const fetchFormData = async () => {
        setIsFetchingData(true);
        try {
          const [
            employeesRes, 
            componentsRes, 
            compSettingsRes, 
            statutoryRes, 
            ptSlabsRes
          ] = await Promise.all([
            apiClient.get(API_ENDPOINTS.EmployeeSelectionList),
            apiClient.get(API_ENDPOINTS.GetMainComponent),
            apiClient.get(API_ENDPOINTS.SalarySettingPercentage), 
            apiClient.get(API_ENDPOINTS.StatutorySettings),   
            apiClient.get(API_ENDPOINTS.ProfessionalTaxSlabs) 
          ]);

          setEmployees(employeesRes.data);
          setExistingComponents(componentsRes.data);
          setComponentSettings(compSettingsRes.data);
          setPtSlabs(ptSlabsRes.data);

          const statutoryDict = statutoryRes.data.reduce((acc: StatutorySetting, setting: { settingName: string, settingValue: string }) => {
              acc[setting.settingName] = setting.settingValue;
              return acc;
          }, {});
          setStatutorySettings(statutoryDict);

        } catch (err) {
          toast.error("Failed to load required settings for salary calculation.");
          console.error("Data fetching error:", err);
        } finally {
          setIsFetchingData(false);
        }
      };
      fetchFormData();
    }
  }, [isOpen]);

  const salaryBreakdown = useMemo(() => {
    const monthlyGross = parseFloat(monthlySalary.toString()) || 0;
    if (monthlyGross < 1 || Object.keys(statutorySettings).length === 0) {
        return { basic: 0, hra: 0, conveyance: 0, employeePF: 0, employerPF: 0, professionalTax: 0, esic: 0, tds: 0, finalGross: 0, finalDeductions: 0, finalNet: 0 };
    }

    const calculateComponent = (name: string, gross: number, basic: number): number => {
        const setting = componentSettings.find(s => s.componentName === name);
        if (!setting) return 0;

        if (setting.calculationBase === 'Gross Salary' && setting.percentage) {
            return gross * (setting.percentage / 100);
        }
        if (setting.calculationBase === 'Basic Salary' && setting.percentage) {
            return basic * (setting.percentage / 100);
        }
        if (setting.calculationBase === 'Fixed Amount' && setting.fixedAmount) {
            return setting.fixedAmount;
        }
        return 0;
    };

   const basic = Math.ceil(calculateComponent("Basic Salary", monthlyGross, 0));
const hra = Math.ceil(calculateComponent("HRA", monthlyGross, basic));
const conveyance = Math.ceil(calculateComponent("Conve. Allowance", monthlyGross, basic));

// const esicThreshold = parseFloat(statutorySettings['ESIC'] || '21000');
// const esicRate = 0.75; 
// let esic = 0;
// if (monthlyGross > 0 && monthlyGross <= esicThreshold) {
//     esic = Math.ceil(monthlyGross * (esicRate / 100));
// }

// const pfThreshold = parseFloat(statutorySettings['PF_Threshold'] || '15000');
// const rateBelowThreshold = parseFloat(statutorySettings['PF_Rate_Below_Threshold'] || '12');
// const employerFixedContribution = parseFloat(statutorySettings['PF_Employer_Contribution_Fixed'] || '1800');
// let employeePF = 0;
// let employerPF = 0;
// if (monthlyGross <= pfThreshold) {
//     employeePF = Math.ceil(monthlyGross * (rateBelowThreshold / 100));
//     employerPF = employeePF; 
// } else {
//     const pfPercentage = selectedEmployeeInfo.pfPercentage || 12;
//     const isCapped = selectedEmployeeInfo.isCappedAt15k; 

//     if (isCapped) {
//         employeePF = Math.ceil(employerFixedContribution);
//     } 
//     else {
//         employeePF = Math.ceil(basic * (pfPercentage / 100));
//     }
    
//     employerPF = Math.ceil(employerFixedContribution);
// }

//         let professionalTax = 0;
//     const employeeState = selectedEmployeeInfo.state;
//     const employeeGender = selectedEmployeeInfo.gender;

//     console.log("--- P.T. DEBUG ---", { 
//     gross: monthlyGross,
//     state: employeeState, 
//     gender: employeeGender,
//     slabsAvailable: ptSlabs.length 
// });

//   if (employeeState && employeeGender) { 
//     const applicableSlab = ptSlabs
//         .filter(s => 
//             s.state.trim().toLowerCase() === employeeState.trim().toLowerCase() &&
//             s.gender.trim().toLowerCase() === employeeGender.trim().toLowerCase()
//         )
//         .sort((a, b) => a.minGrossSalary - b.minGrossSalary)
//         .find(s => 
//             monthlyGross >= s.minGrossSalary && 
//             (s.maxGrossSalary == null || monthlyGross <= s.maxGrossSalary)
//         );
    
//     console.log("Found applicable slab:", applicableSlab);

//     professionalTax = applicableSlab?.taxAmount || 0;
// }
// const monthlyTDS = selectedEmployeeInfo.tdsAmount || 0;

 const esic = 0;
    const employeePF = 0;
    const professionalTax = 0;
    const monthlyTDS = 0;

    const pfThreshold = parseFloat(statutorySettings['PF Threshold'] || '15000');
    const rateBelowThreshold = parseFloat(statutorySettings['PF Rate Below Threshold'] || '12');
    const employerFixedContribution = parseFloat(statutorySettings['PF Employer Contribution Fixed'] || '1800');
    let employerPF = 0;

    if (monthlyGross > 0) {
        if (monthlyGross <= pfThreshold) {
            employerPF = Math.ceil(monthlyGross * (rateBelowThreshold / 100));
        } else {
            employerPF = Math.ceil(employerFixedContribution);
        }
    }

    let manualEarnings = 0;
    //let manualDeductions = 0;
    const autoCalculatedNames = ["Basic Salary", "HRA", "Conve. Allowance", "P. F.", "P. T.", "ESIC", "TDS"];
    existingComponents.forEach((comp) => {
      if (!autoCalculatedNames.includes(comp.componentName)) {
        const amount = componentAmounts[comp.id] || 0;
        if (comp.componentType.toLowerCase() === "earning") manualEarnings += amount;
        //else manualDeductions += amount;
      }
    });

    const finalGross = basic + hra + conveyance + manualEarnings;
    //const finalDeductions = employeePF + professionalTax + esic + monthlyTDS + manualDeductions;
     const finalDeductions = 0;
    const finalNet = finalGross - finalDeductions;

    return { basic, hra, conveyance, employeePF, employerPF, professionalTax, esic, tds: monthlyTDS, finalGross, finalDeductions, finalNet };
  }, [monthlySalary, componentAmounts, existingComponents, selectedEmployeeInfo, componentSettings, statutorySettings, ptSlabs]);

  const handleAmountChange = (id: number | string, value: string) => {
    const amount = parseFloat(value) || 0;
    setComponentAmounts((prev) => ({ ...prev, [id]: amount }));
  };

  const employeeOptions = useMemo(() => employees.map((emp) => ({
    value: emp.id.toString(),
    label: emp.fullName,
    gender: emp.gender,
    pfDeductionPercentage: emp.pfDeductionPercentage,
    state: emp.state, 
    isCappedAt15k: emp.isCappedAt15k,
    tdsAmount: emp.tdsAmount, 
  })), [employees]);

  type SelectOption = { value: string; label: string; gender: string; pfDeductionPercentage: number; state: string; isCappedAt15k: boolean; tdsAmount: number;  } | null;

  const handleEmployeeChange = async (selectedOption: SelectOption) => {
    const employeeId = selectedOption ? selectedOption.value : "";
    setSelectedEmployee(employeeId);
    setSelectedEmployeeInfo({
        gender: selectedOption?.gender || null,
        pfPercentage: selectedOption?.pfDeductionPercentage || 12,
        state: selectedOption?.state || null,
          isCappedAt15k: selectedOption?.isCappedAt15k || false,
           tdsAmount: selectedOption?.tdsAmount || 0, 
    });

    if (!employeeId) return;

    try {
      await apiClient.get(`${API_ENDPOINTS.SalaryStructures}/${employeeId}`);
      toast.warning("This employee already has an active salary structure.");
      setSelectedEmployee("");
    } catch (error) { /* Expected 404 is okay, means no structure exists */ }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitted(true);
    if (!e.currentTarget.checkValidity() || !selectedEmployee) {
      toast.error("Please fill out all required fields, including selecting an employee.");
      return;
    }
    const monthlySal = parseFloat(monthlySalary.toString());
    if (!monthlySal || monthlySal <= 0) {
      toast.error("Please enter a valid Monthly Gross Salary.");
      return;
    }
    const autoCalculatedNames = ["Basic Salary", "HRA", "Conve. Allowance", "P. F.", "P. T.", "ESIC", "TDS"];
    const manualPayloadComponents = existingComponents
      .filter((comp) => !autoCalculatedNames.includes(comp.componentName))
      .map((comp) => ({
        salaryComponentID: comp.id,
        amount: componentAmounts[comp.id] || 0,
      }))
      .filter((comp) => comp.amount > 0);

    const payload = {
      employeeID: parseInt(selectedEmployee, 10),
      effectiveDate,
      status,
      monthlySalary: monthlySal,
      components: manualPayloadComponents,
    };

    setIsSubmitting(true);
    try {
      await apiClient.post(API_ENDPOINTS.SalaryStructures, payload);
      toast.success("Salary structure created successfully!");
      onSuccess();
      onClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to create salary structure.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  
  return (
    <div className="fixed inset-0 bg-transparent backdrop-brightness-70 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b p-4 shrink-0">
          <h2 className="text-xl font-semibold text-gray-800">
            Create New Salary Structure
          </h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>
       
          <form
            onSubmit={handleSubmit}
            className={`group ${isSubmitted ? "submitted" : ""} overflow-y-auto`}
            noValidate
          >
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              {/* Employee Selection, Date, and Status fields remain the same */}
              <div className="md:col-span-2">
                <label htmlFor="employee-select" className="block text-sm font-medium text-gray-700 mb-1">
                  Employee <span className="text-red-500">*</span>
                </label>
                <Select
                  id="employee-select"
                  name="employee"
                  options={employeeOptions}
                  value={employeeOptions.find((option) => option.value === selectedEmployee) || null}
                  onChange={handleEmployeeChange}
                  placeholder="Search and select an employee..."
                  isClearable
                  isLoading={isFetchingData}
                  styles={{
                    control: (base, state) => ({...base, borderColor: state.isFocused ? "#3b82f6" : "#d1d5db", boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none", "&:hover": { borderColor: "#9ca3af" },}),
                  }}
                />
                <input type="text" value={selectedEmployee} onChange={() => {}} required className="absolute opacity-0 w-0 h-0" tabIndex={-1}/>
              </div>

              <InputField label="Effective Date" name="effectiveDate" type="text" onFocus={(e) => (e.target.type = "date")} onBlur={(e) => (e.target.type = "text")} placeholder="Pick a date" icon={<Calendar size={18} />} value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} required />
              <SelectField label="Status" name="status" value={status} onChange={(e) => setStatus(e.target.value)} required>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
              </SelectField>

              <div className="md:col-span-2 border-t pt-5">
                 <InputField label="Enter Monthly Gross Salary" name="monthlySalary" type="number" step="0.01" placeholder="e.g., 50000" value={monthlySalary} onChange={(e) => setMonthlySalary(e.target.value)} required/>
              </div>

              <div className="md:col-span-2">
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  Salary & Component Breakdown (Monthly)
                </h3>
                <div className="space-y-3">
                  
                  {/* --- SECTION 1: AUTO-CALCULATED COMPONENTS --- */}
                  {/* We now explicitly render each auto-calculated component. This guarantees they appear. */}
                  
                  {/* Basic Salary */}
                  {salaryBreakdown.basic > 0 && (
                    <div className="grid grid-cols-2 items-center gap-4">
                      <label className="text-sm text-gray-500">Basic Salary</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₹</span>
                        <input type="number" value={salaryBreakdown.basic.toFixed(0)} readOnly disabled className="w-full pl-7 pr-4 py-2 border rounded-md text-sm disabled:bg-gray-100"/>
                      </div>
                    </div>
                  )}

                  {/* HRA */}
                  {salaryBreakdown.hra > 0 && (
                    <div className="grid grid-cols-2 items-center gap-4">
                      <label className="text-sm text-gray-500">HRA</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₹</span>
                        <input type="number" value={salaryBreakdown.hra.toFixed(0)} readOnly disabled className="w-full pl-7 pr-4 py-2 border rounded-md text-sm disabled:bg-gray-100"/>
                      </div>
                    </div>
                  )}

                  {/* Conveyance Allowance */}
                  {salaryBreakdown.conveyance > 0 && (
                    <div className="grid grid-cols-2 items-center gap-4">
                      <label className="text-sm text-gray-500">Conve. Allowance</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₹</span>
                        <input type="number" value={salaryBreakdown.conveyance.toFixed(0)} readOnly disabled className="w-full pl-7 pr-4 py-2 border rounded-md text-sm disabled:bg-gray-100"/>
                      </div>
                    </div>
                  )}

                  {/* Employee P.F. */}
                  {/* {salaryBreakdown.employeePF > 0 && (
                     <div className="grid grid-cols-2 items-center gap-4">
                      <label className="text-sm text-gray-500">P. F.</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₹</span>
                        <input type="number" value={salaryBreakdown.employeePF.toFixed(0)} readOnly disabled className="w-full pl-7 pr-4 py-2 border rounded-md text-sm disabled:bg-gray-100"/>
                      </div>
                    </div>
                  )}

                  {/* Professional Tax (P.T.) - THIS IS THE KEY FIX */}
                  {/* {salaryBreakdown.professionalTax > 0 && (
                     <div className="grid grid-cols-2 items-center gap-4">
                      <label className="text-sm text-gray-500">P. T.</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₹</span>
                        <input type="number" value={salaryBreakdown.professionalTax.toFixed(0)} readOnly disabled className="w-full pl-7 pr-4 py-2 border rounded-md text-sm disabled:bg-gray-100"/>
                      </div>
                    </div>
                  )} */}
                  
                  {/* ESIC */}
                   {/* {salaryBreakdown.esic > 0 && (
                     <div className="grid grid-cols-2 items-center gap-4">
                      <label className="text-sm text-gray-500">ESIC</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₹</span>
                        <input type="number" value={salaryBreakdown.esic.toFixed(0)} readOnly disabled className="w-full pl-7 pr-4 py-2 border rounded-md text-sm disabled:bg-gray-100"/>
                      </div>
                    </div>
                  )} */}

                  {/* TDS */}
                  {/* {salaryBreakdown.tds > 0 && (
                     <div className="grid grid-cols-2 items-center gap-4">
                      <label className="text-sm text-gray-500">TDS</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₹</span>
                        <input type="number" value={salaryBreakdown.tds.toFixed(0)} readOnly disabled className="w-full pl-7 pr-4 py-2 border rounded-md text-sm disabled:bg-gray-100"/>
                      </div>
                    </div>
                  )}  */}

                  {/* --- SECTION 2: MANUAL/ADDITIONAL COMPONENTS --- */}
                  {/* Now we map only the components that are NOT auto-calculated */}
                  {existingComponents
                    .filter(comp => 
                        !["Basic Salary", "HRA", "Conve. Allowance", "P. F.", "P. T.", "ESIC", "TDS"].includes(comp.componentName)
                    )
                    .map((comp) => (
                      <div key={comp.id} className="grid grid-cols-2 items-center gap-4">
                        <label className="text-sm text-gray-600">{comp.componentName}</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₹</span>
                          <input
                            type="number"
                            step="0.01"
                            value={componentAmounts[comp.id] || ""}
                            onChange={(e) => handleAmountChange(comp.id, e.target.value)}
                            placeholder="0.00"
                            className="w-full pl-7 pr-4 py-2 border rounded-md text-sm"
                          />
                        </div>
                      </div>
                  ))}

                  {/* Employer P.F. is still displayed conditionally at the end */}
                    {salaryBreakdown.employerPF > 0 && (
                    <div className="grid grid-cols-2 items-center gap-4">
                      <label className="text-sm text-gray-500 font-medium">Employer P.F.</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₹</span>
                        <input type="number" value={salaryBreakdown.employerPF.toFixed(0)} readOnly disabled className="w-full pl-7 pr-4 py-2 border rounded-md text-sm disabled:bg-gray-100"/>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="md:col-span-2 border-t pt-5 space-y-2 text-right font-medium">
                <div className="flex justify-between items-center text-gray-600">
                  <span>Gross Salary:</span>
                  <span>₹{salaryBreakdown.finalGross.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                {/* <div className="flex justify-between items-center text-gray-600">
                  <span>Total Deductions:</span>
                  <span>₹{salaryBreakdown.finalDeductions.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div> */}
                <div className="flex justify-between items-center text-lg text-gray-800 pt-2 border-t mt-2">
                  <span>Net Salary:</span>
                  <span>₹{salaryBreakdown.finalNet.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end items-center gap-3 border-t p-4 shrink-0 bg-gray-50 rounded-b-lg">
              <button type="button" onClick={onClose} disabled={isSubmitting}    className="bg-gray-500 text-white px-8 py-2 rounded-lg font-semibold">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="bg-green-700 text-white px-8 py-2 rounded-lg font-semibold hover:bg-green-800 disabled:bg-gray-400">
                {isSubmitting && (<LoaderCircle className="animate-spin" size={16} />)}
                {isSubmitting ? "Saving..." : "Create Structure"}
              </button>
            </div>
          </form>
      </div>
    </div>
  );
};

const InputField: React.FC<InputFieldProps> = ({ label, name, icon, ...rest }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label} {rest.required && <span className="text-red-500">*</span>}</label>
        <div className="relative">
            {icon && <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">{icon}</span>}
            <input id={name} name={name} className={`w-full ${icon ? "pl-10" : "pl-3"} pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm group-[.submitted]:invalid:border-red-500 group-[.submitted]:invalid:focus:ring-red-500 group-[.submitted]:invalid:focus:border-red-500`} {...rest} />
        </div>
    </div>
);
const SelectField: React.FC<SelectFieldProps> = ({ label, name, children, ...rest }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label} {rest.required && <span className="text-red-500">*</span>}</label>
        <select id={name} name={name} className={`w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm group-[.submitted]:invalid:border-red-500 group-[.submitted]:invalid:focus:ring-red-500 group-[.submitted]:invalid:focus:border-red-500`} {...rest}>
            {children}
        </select>
    </div>
);

export default CreateStructureModal;