import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Calculator,
  IndianRupee,
  AlertTriangle,
  CheckCircle,
  Award,
  Calendar,
  UserX,
  UserCheck
} from "lucide-react";
import { API_ENDPOINTS } from "../../../../API/apiConfig";
import apiClient from "../../../../API/apiClient";
import { usePermissions } from "../../../../hooks/usePermissions";
import { useSelector } from "react-redux";
import { type RootState } from "../../../../store";
import LogoLoader from "../../../../Components/Common/LogoLoader";

// --- TYPE DEFINITIONS ---
interface GratuityData {
  employeeName: string;
  employeeCode: string;
  designation: string;
  yearsOfService: number;
  lastDrawnBasicSalary: number;
  gratuityAmount: number;
  calculationDate: string;
  status: string;
  // New fields for HR Clarity
  dateOfJoining: string;
  dateOfLeaving: string | null;
  isActive: boolean;
}

interface GratuityApiResponse {
  allRecords: GratuityData[];
  myRecord: GratuityData | null;
}

// --- HELPER FUNCTIONS ---
const formatCurrency = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;

const formatDate = (dateString: string | null) => {
    if (!dateString) return "Present";
    return new Date(dateString).toLocaleDateString("en-IN", {
        day: '2-digit', month: 'short', year: 'numeric'
    });
};

// --- COMPONENTS ---

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  bgColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description, icon, bgColor }) => (
  <div className={`${bgColor} p-5 rounded-xl text-white flex items-center justify-between transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex-1`}>
    <div>
      <p className="text-sm opacity-90">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-xs opacity-80">{description}</p>
    </div>
    <div className="bg-white/20 p-3 rounded-full">
      {icon}
    </div>
  </div>
);

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
  confirmText?: string;
  showCancel?: boolean;
  type?: 'confirmation' | 'success' | 'error';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onConfirm, title, children, confirmText = "Confirm", showCancel = true, type = 'confirmation' }) => {
    if (!isOpen) return null;
    const icon = {
        success: <CheckCircle size={32} className="text-green-500" />,
        error: <AlertTriangle size={32} className="text-red-500" />,
        confirmation: <AlertTriangle size={32} className="text-blue-500" />
    }[type];

    return (
        <div className="fixed inset-0 bg-transparent backdrop-brightness-70 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                <div className="flex flex-col items-center text-center">
                    <div className="mb-4">{icon}</div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>
                    <div className="text-gray-600 mb-6">{children}</div>
                </div>
                <div className="flex justify-center gap-4">
                    {showCancel && <button onClick={onClose} className="bg-gray-500 text-white px-8 py-2 rounded-lg font-semibold">Cancel</button>}
                    <button onClick={onConfirm} className="bg-green-700 text-white px-8 py-2 rounded-lg font-semibold hover:bg-green-800 disabled:bg-gray-400">{confirmText}</button>
                </div>
            </div>
        </div>
    );
};

const InfoRow: React.FC<{ label: string; value: string | number | React.ReactNode }> = ({ label, value }) => (
  <div className="flex justify-between items-center py-3 border-b last:border-0">
    <span className="text-gray-600">{label}</span>
    <span className="font-semibold text-gray-800 text-right">{value}</span>
  </div>
);

// --- MAIN PAGE ---
const GratuityPage: React.FC = () => {
  const { hasPermission } = usePermissions();
  const userRole = useSelector((state: RootState) => state.auth.user?.role);

  const [gratuityRecords, setGratuityRecords] = useState<GratuityData[]>([]);
  const [myGratuityRecord, setMyGratuityRecord] = useState<GratuityData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  const [modalState, setModalState] = useState({
      isOpen: false, title: "", message: "", onConfirm: () => {}, confirmText: "Confirm", showCancel: true, type: 'confirmation' as 'confirmation' | 'success' | 'error',
  });

  const gratuityStats = useMemo(() => {
    // Only sum up eligible amounts
    const totalAmountPayable = gratuityRecords
        .filter(r => r.status === 'Eligible')
        .reduce((acc, curr) => acc + curr.gratuityAmount, 0);
    
    // Count active eligible vs resigned eligible
    const eligibleActive = gratuityRecords.filter(rec => rec.status === 'Eligible' && rec.isActive).length;
    const eligibleResigned = gratuityRecords.filter(rec => rec.status === 'Eligible' && !rec.isActive).length;

    return { totalAmountPayable, eligibleActive, eligibleResigned };
  }, [gratuityRecords]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<GratuityApiResponse>(API_ENDPOINTS.Gratuity);
      setGratuityRecords(response.data.allRecords || []);
      setMyGratuityRecord(response.data.myRecord || null);
    } catch (err) {
      console.error("Failed to fetch gratuity data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const canViewAll = hasPermission("Gratuity", "CanView");

  useEffect(() => {
    if (userRole) fetchData();
  }, [userRole, fetchData]);

  const proceedWithProcessing = async () => {
    setModalState(prev => ({...prev, isOpen: false}));
    setIsProcessing(true);
    try {
      const response = await apiClient.post<{ message: string }>(API_ENDPOINTS.ProcessGratuity);
      await fetchData(); 
      setModalState({
          isOpen: true, title: "Success", message: response.data.message, onConfirm: () => setModalState(prev => ({ ...prev, isOpen: false })), confirmText: "OK", showCancel: false, type: 'success',
      });
    } catch (err: any) {
       setModalState({
          isOpen: true, title: "Processing Failed", message: err.response?.data?.message || "Error", onConfirm: () => setModalState(prev => ({ ...prev, isOpen: false })), confirmText: "Close", showCancel: false, type: 'error',
      });
    } finally {
        setIsProcessing(false);
    }
  };

  const handleProcessGratuity = () => {
    setModalState({
        isOpen: true, title: "Confirm Processing", message: `This will calculate gratuity for all employees (Active & Resigned).`, onConfirm: proceedWithProcessing, confirmText: "Process", showCancel: true, type: 'confirmation',
    });
  };

  const renderAdminView = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Liability"
            value={formatCurrency(gratuityStats.totalAmountPayable)}
            description="Total Payable Amount"
            bgColor="bg-[#2eacb3]"
            icon={<IndianRupee size={20} />}
          />
          <StatCard
            title="Eligible (Active)"
            value={gratuityStats.eligibleActive.toString()}
            description="Working employees > 1 Years"
            bgColor="bg-blue-500"
            icon={<UserCheck size={20} />}
          />
           <StatCard
            title="Eligible (Resigned)"
            value={gratuityStats.eligibleResigned.toString()}
            description="Ex-employees awaiting settlement"
            bgColor="bg-[#f7c343]"
            icon={<UserX size={20} />}
          />
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 border mt-6">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <div>
                <h2 className="text-xl font-semibold text-gray-800">Gratuity Register</h2>
                <p className="text-sm text-gray-500">Manage gratuity for active and resigned staff.</p>
            </div>
            {hasPermission("Gratuity", "CanAdd") && (
                <button onClick={handleProcessGratuity} disabled={isProcessing} className="flex items-center justify-center gap-2 bg-[#f07837] text-white font-semibold py-2 px-4 rounded-lg">
                    <Calculator size={18} />
                    {isProcessing ? "Processing..." : `Run Calculation`}
                </button>
            )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
                       <thead className="bg-[#f07837] text-white uppercase text-xs">

              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Tenure (Join - Leave)</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Yrs Svc</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Last Basic</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Gratuity</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan={6} className="text-center p-2">{<LogoLoader />}</td></tr>
              ) : gratuityRecords.length > 0 ? (
                gratuityRecords.map((record, index) => (
                  <tr key={index} className={!record.isActive ? "bg-red-50" : ""}>
                    <td className="px-6 py-4">
                        <div className="flex items-center">
                             <div>
                                <div className="text-sm font-medium text-gray-900">{record.employeeName}</div>
                                <div className="text-xs text-gray-500">{record.employeeCode} | {record.designation}</div>
                                {!record.isActive && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 mt-1">
                                        Resigned
                                    </span>
                                )}
                             </div>
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex flex-col">
                            <span className="flex items-center gap-1"><Calendar size={12}/> {formatDate(record.dateOfJoining)}</span>
                            <span className="flex items-center gap-1 font-semibold text-gray-700">to {formatDate(record.dateOfLeaving)}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">{record.yearsOfService.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatCurrency(record.lastDrawnBasicSalary)}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-800">{formatCurrency(record.gratuityAmount)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        record.status === 'Eligible' 
                            ? (record.isActive ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800') 
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                 <tr><td colSpan={6} className="text-center p-4">No records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  const renderEmployeeView = () => (
    <div className="bg-white rounded-lg shadow-sm p-6 border max-w-2xl mx-auto">
        <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-teal-100">
                <Award className="h-6 w-6 text-teal-600" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-800">My Gratuity Status</h2>
        </div>
        <div className="mt-6">
            {isLoading ? (<p className="text-center text-gray-500">Loading...</p>)
            : myGratuityRecord ? (
                <div className="space-y-2">
                    <InfoRow label="Joining Date" value={formatDate(myGratuityRecord.dateOfJoining)} />
                    <InfoRow label="Total Years of Service" value={myGratuityRecord.yearsOfService.toFixed(2)} />
                    <InfoRow label="Last Basic Salary" value={formatCurrency(myGratuityRecord.lastDrawnBasicSalary)} />
                    <InfoRow label="Eligible Amount" value={<span className="text-xl font-bold text-teal-600">{formatCurrency(myGratuityRecord.gratuityAmount)}</span>} />
                    <InfoRow label="Status" value={
                        <span className={`px-2 py-1 rounded text-xs ${myGratuityRecord.status === 'Eligible' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                            {myGratuityRecord.status}
                        </span>
                    } />
                </div>
            ) : <p className="text-center text-gray-600">No records found.</p>}
        </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-full space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Gratuity Management</h1>
      {userRole === 'Employee' ? renderEmployeeView() : (canViewAll ? renderAdminView() : renderEmployeeView())}
      <Modal isOpen={modalState.isOpen} onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))} onConfirm={modalState.onConfirm} title={modalState.title} confirmText={modalState.confirmText} showCancel={modalState.showCancel} type={modalState.type}>
        <p>{modalState.message}</p>
      </Modal>
    </div>
  );
};

export default GratuityPage;