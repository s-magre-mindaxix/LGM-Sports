import React, { useState, useEffect, useMemo } from 'react';
import { Loader2, X, Calendar } from 'lucide-react';
import apiClient from '../../../../API/apiClient';
import { API_ENDPOINTS } from '../../../../API/apiConfig';
import { toast } from "sonner";

interface EmployeeDetails {
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
interface ReviseModalProps {
  isOpen: boolean;
  employee: { id: number; name: string } | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ReviseStructureModal: React.FC<ReviseModalProps> = ({ isOpen, employee, onClose, onSuccess }) => {
  const [newMonthlySalary, setNewMonthlySalary] = useState('');
  const [newEffectiveDate, setNewEffectiveDate] = useState(new Date().toISOString().split("T")[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false);

  const [employeeDetails, setEmployeeDetails] = useState<EmployeeDetails | null>(null);
  const [existingComponents, setExistingComponents] = useState<ExistingSalaryComponent[]>([]);
  const [componentSettings, setComponentSettings] = useState<SalarySetting[]>([]);
  const [statutorySettings, setStatutorySettings] = useState<StatutorySetting>({});
  const [ptSlabs, setPtSlabs] = useState<ProfessionalTaxSlab[]>([]);
  const [componentAmounts, setComponentAmounts] = useState<Record<string, number>>({});
  
  useEffect(() => {
    if (isOpen && employee) {
      setNewMonthlySalary('');
      setNewEffectiveDate(new Date().toISOString().split("T")[0]);
      setComponentAmounts({});
      
      const fetchRequiredData = async () => {
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

          const currentEmployeeDetails = employeesRes.data.find((e: EmployeeDetails) => e.id === employee.id);
          if (currentEmployeeDetails) {
            setEmployeeDetails(currentEmployeeDetails);
          }

          setExistingComponents(componentsRes.data);
          setComponentSettings(compSettingsRes.data);
          setPtSlabs(ptSlabsRes.data);

          const statutoryDict = statutoryRes.data.reduce((acc: StatutorySetting, setting: { settingName: string, settingValue: string }) => {
              acc[setting.settingName] = setting.settingValue;
              return acc;
          }, {});
          setStatutorySettings(statutoryDict);

        } catch (err) {
          toast.error("Failed to load settings needed for salary calculation.");
          console.error("Data fetching error:", err);
        } finally {
          setIsFetchingData(false);
        }
      };
      
      fetchRequiredData();
    }
  }, [isOpen, employee]);

  const salaryBreakdown = useMemo(() => {
    const monthlyGross = parseFloat(newMonthlySalary) || 0;
    if (monthlyGross < 1 || !employeeDetails || Object.keys(statutorySettings).length === 0) {
        return { basic: 0, hra: 0, conveyance: 0, employeePF: 0, employerPF: 0, professionalTax: 0, esic: 0, tds: 0, finalGross: 0, finalDeductions: 0, finalNet: 0 };
    }
    
    const calculateComponent = (name: string, gross: number, basic: number): number => {
        const setting = componentSettings.find(s => s.componentName === name);
        if (!setting) return 0;
        if (setting.calculationBase === 'Gross Salary' && setting.percentage) return gross * (setting.percentage / 100);
        if (setting.calculationBase === 'Basic Salary' && setting.percentage) return basic * (setting.percentage / 100);
        if (setting.calculationBase === 'Fixed Amount' && setting.fixedAmount) return setting.fixedAmount;
        return 0;
    };

    const basic = Math.ceil(calculateComponent("Basic Salary", monthlyGross, 0));
    const hra = Math.ceil(calculateComponent("HRA", monthlyGross, basic));
    const conveyance = Math.ceil(calculateComponent("Conve. Allowance", monthlyGross, basic));

    // const esicThreshold = parseFloat(statutorySettings['ESIC'] || '21000');
    // let esic = 0;
    // if (monthlyGross > 0 && monthlyGross <= esicThreshold) {
    //     esic = Math.ceil(monthlyGross * (0.75 / 100));
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
    //     const pfPercentage = employeeDetails.pfDeductionPercentage || 12;
    //     if (employeeDetails.isCappedAt15k) {
    //         employeePF = Math.ceil(employerFixedContribution);
    //     } else {
    //         employeePF = Math.ceil(monthlyGross * (pfPercentage / 100));
    //     }
    //     employerPF = Math.ceil(employerFixedContribution);
    // }
    
    // let professionalTax = 0;
    // const applicableSlab = ptSlabs.find(s => 
    //     s.state.trim().toLowerCase() === employeeDetails.state.trim().toLowerCase() &&
    //     s.gender.trim().toLowerCase() === employeeDetails.gender.trim().toLowerCase() &&
    //     monthlyGross >= s.minGrossSalary && 
    //     (s.maxGrossSalary == null || monthlyGross <= s.maxGrossSalary)
    // );
    // professionalTax = applicableSlab?.taxAmount || 0;

    // const monthlyTDS = employeeDetails.tdsAmount || 0;

      const esic = 0;
    const employeePF = 0;
    const employerPF = 0;
    const professionalTax = 0;
    const monthlyTDS = 0;
    
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
   // const finalDeductions = employeePF + professionalTax + esic + monthlyTDS + manualDeductions;
     const finalDeductions = 0;
    const finalNet = finalGross - finalDeductions;

    return { basic, hra, conveyance, employeePF, employerPF, professionalTax, esic, tds: monthlyTDS, finalGross, finalDeductions, finalNet };

  }, [newMonthlySalary, employeeDetails, componentAmounts, existingComponents, componentSettings, statutorySettings, ptSlabs]);

  const handleAmountChange = (id: number | string, value: string) => {
    const amount = parseFloat(value) || 0;
    setComponentAmounts((prev) => ({ ...prev, [id]: amount }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee || !newMonthlySalary || !newEffectiveDate) {
      toast.error('All fields are required.');
      return;
    }

    setIsSubmitting(true);
    
    const autoCalculatedNames = ["Basic Salary", "HRA", "Conve. Allowance", "P. F.", "P. T.", "ESIC", "TDS"];
      const manualPayloadComponents = existingComponents
      .filter((comp) => !autoCalculatedNames.includes(comp.componentName))
      .map((comp) => ({
        SalaryComponentID: comp.id, 
        Amount: componentAmounts[comp.id] || 0, 
      }))
      .filter((comp) => comp.Amount > 0);

    try {
      const payload = {
        newMonthlySalary: parseFloat(newMonthlySalary),
        newEffectiveDate: newEffectiveDate,
        components: manualPayloadComponents,
      };
      
      await apiClient.post(`${API_ENDPOINTS.SalaryStructures}/${employee.id}/revise`, payload);
      toast.success(`Salary for ${employee.name} revised successfully.`);
      onSuccess();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to revise structure.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 bg-transparent backdrop-brightness-70 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center border-b p-4 shrink-0">
          <h2 className="text-xl font-semibold text-gray-800">Revise Salary for {employee.name}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>
        
        {isFetchingData ? (
          <div className="flex justify-center items-center p-10"><Loader2 className="animate-spin mr-3" /> Loading Settings...</div>
        ) : (
          <form onSubmit={handleSubmit} className="overflow-y-auto">
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              {/* Main Inputs */}
              <div>
                <label htmlFor="newMonthlySalary" className="block text-sm font-medium text-gray-700 mb-1">New Monthly Gross Salary (₹)</label>
                <input type="number" id="newMonthlySalary" value={newMonthlySalary} onChange={(e) => setNewMonthlySalary(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label htmlFor="newEffectiveDate" className="block text-sm font-medium text-gray-700 mb-1">New Effective Date</label>
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"><Calendar size={18}/></span>
                    <input type="date" id="newEffectiveDate" value={newEffectiveDate} onChange={(e) => setNewEffectiveDate(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
              </div>

              {/* Breakdown Section */}
              <div className="md:col-span-2 border-t pt-5">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Salary & Component Breakdown (Monthly)</h3>
                <div className="space-y-3">
                    {/* Render auto-calculated and manual components dynamically */}
                    {Object.keys(salaryBreakdown).length > 0 && existingComponents .filter(comp => comp.componentType.toLowerCase() !== 'deduction').map((comp) => {
                        let valueToShow: number | string = "";
                        let isDisabled = false;

                        switch (comp.componentName) {
                            case "Basic Salary": valueToShow = salaryBreakdown.basic.toFixed(0); isDisabled = true; break;
                            case "HRA": valueToShow = salaryBreakdown.hra.toFixed(0); isDisabled = true; break;
                            case "Conve. Allowance": valueToShow = salaryBreakdown.conveyance.toFixed(0); isDisabled = true; break;
                            // case "P. F.": valueToShow = salaryBreakdown.employeePF.toFixed(0); isDisabled = true; break;
                            // case "P. T.": valueToShow = salaryBreakdown.professionalTax.toFixed(0); isDisabled = true; break;
                            // case "ESIC": valueToShow = salaryBreakdown.esic.toFixed(0); isDisabled = true; break;
                            // case "TDS": valueToShow = salaryBreakdown.tds.toFixed(0); isDisabled = true; break;
                            default: valueToShow = componentAmounts[comp.id] || ""; isDisabled = false;
                        }

                        if (isDisabled && parseFloat(valueToShow.toString()) <= 0) return null;

                        return (
                          <div key={comp.id} className="grid grid-cols-2 items-center gap-4">
                            <label className={`text-sm ${isDisabled ? 'text-gray-500' : 'text-gray-600'}`}>{comp.componentName}</label>
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₹</span>
                              <input type="number" step="0.01" value={valueToShow} onChange={(e) => !isDisabled && handleAmountChange(comp.id, e.target.value)} placeholder="0.00" disabled={isDisabled} className="w-full pl-7 pr-4 py-2 border rounded-md text-sm disabled:bg-gray-100"/>
                            </div>
                          </div>
                        );
                    })}

                    {/* {parseFloat(newMonthlySalary) > 0 && (
                      <div className="grid grid-cols-2 items-center gap-4">
                        <label className="text-sm text-gray-500">Employer P.F.</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₹</span>
                          <input type="number" value={salaryBreakdown.employerPF.toFixed(0)} readOnly disabled className="w-full pl-7 pr-4 py-2 border rounded-md text-sm disabled:bg-gray-100"/>
                        </div>
                      </div>
                    )} */}
                </div>
              </div>

              {/* Totals Section */}
              <div className="md:col-span-2 border-t pt-5 space-y-2 text-right font-medium">
                <div className="flex justify-between items-center text-gray-600"><span>Gross Salary:</span><span>₹{salaryBreakdown.finalGross.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                {/* <div className="flex justify-between items-center text-gray-600"><span>Total Deductions:</span><span>₹{salaryBreakdown.finalDeductions.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div> */}
                <div className="flex justify-between items-center text-lg text-gray-800 pt-2 border-t mt-2"><span>Net Salary:</span><span>₹{salaryBreakdown.finalNet.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
              </div>
            </div>

            <div className="flex justify-end items-center gap-3 border-t p-4 shrink-0 bg-gray-50 rounded-b-lg">
              <button type="button" onClick={onClose} disabled={isSubmitting}  className="bg-gray-500 text-white px-8 py-2 rounded-lg font-semibold">Cancel</button>
              <button type="submit" disabled={isSubmitting}  className="bg-green-700 text-white px-8 py-2 rounded-lg font-semibold hover:bg-green-800 disabled:bg-gray-400">
                {isSubmitting && (<Loader2 className="animate-spin" size={16} />)}
                {isSubmitting ? "Saving..." : "Confirm & Revise"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReviseStructureModal;