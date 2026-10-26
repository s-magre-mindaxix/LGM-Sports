import apiClient from "../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../API/apiConfig";


export interface ExpenseClaimView { 
  id: number;
  employeeID: number;
  employeeName: string;
  employeeCode: string;
  expenseTypeID: number;
  expenseTypeName: string;
  amount: number;
  approvedAmount?: number;
  claimDate: string;
  appliedDate: string;
  description?: string;
  status: "Pending" | "Approved" | "Rejected";
  approverID?: number;
  approverName?: string;
  approvalDate?: string;
  managerRemarks?: string;
  receiptFilePath?: string;
}

export interface UpdateStatusPayload {
  status: "Approved" | "Rejected";
  managerRemarks?: string;
  approvedAmount?: number;
}

export interface ExpenseCategoryStat {
  categoryName: string;
  claimCount: number;
  totalAmount: number;
}

export interface DashboardStats {
  pendingClaims: number;
  approvedAmount: number;
  processedClaims: number;
  rejectedClaims: number;
  expenseCategories: ExpenseCategoryStat[];
}

export const createExpenseClaim = async (
  formData: FormData
): Promise<ExpenseClaimView> => {
  const response = await apiClient.post<ExpenseClaimView>(
    API_ENDPOINTS.ExpenseClaims,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

export const getMyClaims = async (): Promise<ExpenseClaimView[]> => {
  const response = await apiClient.get<ExpenseClaimView[]>(
    API_ENDPOINTS.MyExpenseClaims
  );
  return response.data;
};

export const getPendingApprovals = async (): Promise<ExpenseClaimView[]> => {
  const response = await apiClient.get<ExpenseClaimView[]>(
    API_ENDPOINTS.PendingExpenseApprovals
  );
  return response.data;
};

export const updateClaimStatus = async (
  claimId: number,
  data: UpdateStatusPayload
): Promise<ExpenseClaimView> => {
  const url = `${API_ENDPOINTS.ExpenseClaims}/${claimId}/status`;
  const response = await apiClient.put<ExpenseClaimView>(url, data);
  return response.data;
};

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await apiClient.get<DashboardStats>(
    API_ENDPOINTS.ExpenseDashboardStats
  );
  return response.data;
};

export const getClaimHistory = async (): Promise<ExpenseClaimView[]> => {
  const response = await apiClient.get<ExpenseClaimView[]>(
    API_ENDPOINTS.ClaimHistory
  );
  return response.data;
};

export const generateExpenseReport = async (
  startDate: string,
  endDate: string
): Promise<void> => {
  const response = await apiClient.post(
    API_ENDPOINTS.GenerateExpenseReport,
    { startDate, endDate },
    {
      responseType: "blob",
    }
  );

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;

  const fileName = `ExpenseReport_${
    new Date().toISOString().split("T")[0]
  }.csv`;
  link.setAttribute("download", fileName);

  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
};

export const bulkApproveClaims = async (
  claimIds: number[]
): Promise<{ message: string }> => {
  const response = await apiClient.put(API_ENDPOINTS.BulkApproveClaims, {
    claimIds,
  });
  return response.data;
};
