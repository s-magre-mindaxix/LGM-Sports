import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";

export interface LoanMaster {
  id: number;
  loanTypeName: string;
  description?: string;
  isDeleted: boolean;
}

// export const getLoanMasters = (includeDeleted = false) =>
//   apiClient.get(`${API_ENDPOINTS.LoanMaster}?includeDeleted=${includeDeleted}`);
export const getLoanMasters = (includeDeleted = false) =>
  apiClient.get<LoanMaster[]>(
    `${API_ENDPOINTS.LoanMaster}?includeDeleted=${includeDeleted}`
  );


export const getLoanMaster = (id: number) =>
  apiClient.get(`${API_ENDPOINTS.LoanMaster}/${id}`);

export const createLoanMaster = (payload: { loanTypeName: string; description?: string }) =>
  apiClient.post(API_ENDPOINTS.LoanMaster, payload);

export const updateLoanMaster = (id: number, payload: { loanTypeName: string; description?: string; isDeleted?: boolean }) =>
  apiClient.put(`${API_ENDPOINTS.LoanMaster}/${id}`, payload);

export const deleteLoanMaster = (id: number) =>
  apiClient.delete(`${API_ENDPOINTS.LoanMaster}/${id}`);
