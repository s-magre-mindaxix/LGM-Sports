import apiClient from "../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../API/apiConfig";




export interface LoanApplication {
  id: number;
  employeeId: number;
  employeeCode:string;
  employeeName: string;
  loanAmount: number;
  tenureInMonths: number;
  monthlyDeduction: number;
  applicationDate: string;
  status: "Pending" | "Approved" | "Rejected";
  loanTypeId: number;
  loanTypeName: string;
  paidInstallments?: number;
  balance?: number;
}

export interface LoanApplicationCreatePayload {
  employeeId: number;
  loanAmount: number;
  tenureInMonths: number;
  loanTypeId: number;
}

export interface UpdateStatusPayload {
  status: "Approved" | "Rejected";
  approvedByUserId: number;
}

export interface LoanTypeSummary {
  loanTypeId: number;
  loanTypeName: string;
  count: number;
  totalAmount: number;
}

export interface LoanDashboard {
  activeLoansCount: number;
  activeLoansTotalAmount: number;
  monthlyRecoveryAmount: number;
  pendingApprovalsCount: number;
  loanTypes: LoanTypeSummary[];
}


export interface LoanRecoveryReportItem {
  loanId: number;
  employeeId: number;
  employeeName: string;
  loanTypeName: string;
  totalLoanAmount: number;
  totalAmountPaid: number;
  balanceAmount: number;
  status: string;
}

export interface OverdueLoan {
  loanId: number;
  employeeId: number;
  employeeName: string;
  loanTypeName: string;
  loanAmount: number;
  monthlyDeduction: number;
  expectedInstallments: number;
  paidInstallments: number;
  overdueAmount: number;
  lastPaymentDate?: string;
}

export const applyForLoan = async (
  payload: LoanApplicationCreatePayload
): Promise<LoanApplication> => {
  const res = await apiClient.post<LoanApplication>(
    API_ENDPOINTS.ApplyLoan,
    payload
  );
  return res.data;
};


export const getLoanHistory = async (
  employeeId: number
): Promise<LoanApplication[]> => {
  const res = await apiClient.get<LoanApplication[]>(
    `${API_ENDPOINTS.LoanHistory}/${employeeId}`
  );
  return res.data;
};


export const getPendingLoanApprovals = async (
  managerId: number
): Promise<LoanApplication[]> => {
  const res = await apiClient.get<LoanApplication[]>(
    `${API_ENDPOINTS.LoanApprovals}/${managerId}`
  );
  return res.data;
};


export const updateLoanStatus = async (
  loanId: number,
  payload: UpdateStatusPayload
): Promise<void> => {
  await apiClient.put(`${API_ENDPOINTS.UpdateLoanStatus}/${loanId}`, payload);
};

export const getDashboard = async (
  managerId?: number
): Promise<LoanDashboard> => {
  const url = managerId
    ? `${API_ENDPOINTS.Dashboard}/manager/${managerId}`
    : API_ENDPOINTS.Dashboard;

  const res = await apiClient.get<LoanDashboard>(url);
  return res.data;
};


export const generateRecoveryReport = async (): Promise<LoanRecoveryReportItem[]> => {
  const res = await apiClient.get<LoanRecoveryReportItem[]>(
    API_ENDPOINTS.GenerateRecoveryReport
  );
  return res.data;
};

export const getOverdueLoans = async (): Promise<OverdueLoan[]> => {
  const res = await apiClient.get<OverdueLoan[]>(API_ENDPOINTS.OverdueLoans);
  return res.data;
};
export const getEmployeeDashboard = async (
  employeeId: number
): Promise<LoanDashboard> => {
  const url = `${API_ENDPOINTS.EmployeeLoanDashboard}/${employeeId}`;
  const res = await apiClient.get<LoanDashboard>(url);
  return res.data;
};
export const getTeamLoanHistory = async (
  managerId: number
): Promise<LoanApplication[]> => {
  const res = await apiClient.get<LoanApplication[]>(
    `${API_ENDPOINTS.TeamLoanHistory}/${managerId}`
  );
  return res.data;
};