import apiClient from "../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../API/apiConfig";


export const accrueYearlyEarnLeave = async (
  yearToCredit: number
): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>(

    API_ENDPOINTS.AccrueYearlyEarnLeave, 
    null, 
    {
      params: { yearToCredit }, 
    }
  );
  return response.data;
};