import apiClient from "../../../API/apiClient";
import { API_ENDPOINTS } from "../../../API/apiConfig";

export interface MasterDataItem {
  id: number;
  name: string;
}

export interface EmployeeSelectItem {
  id: number;
  fullName: string;
  employeeCode: string;
  firstName: string;    
  lastName: string;
  designation: string;
}

export interface Role {
  id: string;
  name: string;
}
export interface LeaveTypeItem {
  id: number;
  leaveTypeName: string;
}

interface GenericMasterDataResponse {
  id: number;
  locationName?: string;
  departmentName?: string;
  designationName?: string;
}

export interface ExpenseTypeItem {
  id: number;
  expenseTypeName: string;
}

export interface CountryItem {
  id: number;
  countryName: string;
  countryCode: string;
}

export interface StateItem {
  id: number;
  stateName: string;
  countryId: number;
}

export interface CompanyItem {
  companyId: number;
  companyName: string;
}

export interface DepartmentItem {
  id: number;
  departmentName: string;
}

export interface DesignationItem {
  id: number;
  designationName: string;
}

export interface EmployeeLevelSelectItem {
  id: number;
  fullName: string;
  levelID: number;
  levelName: string;
  empName: string;
  levelOrder: number;
}

const mapToMasterDataItem = (
  item: GenericMasterDataResponse,
): MasterDataItem => {
  return {
    id: item.id,
    name:
      item.locationName || item.departmentName || item.designationName || "",
  };
};

export const getWorkLocations = async (): Promise<MasterDataItem[]> => {
  const response = await apiClient.get<GenericMasterDataResponse[]>(
    API_ENDPOINTS.WorkLocations,
  );
  return response.data.map(mapToMasterDataItem);
};

export const getDepartments = async (): Promise<MasterDataItem[]> => {
  const response = await apiClient.get<GenericMasterDataResponse[]>(
    API_ENDPOINTS.Departments,
  );
  return response.data.map(mapToMasterDataItem);
};

export const getDesignations = async (): Promise<MasterDataItem[]> => {
  const response = await apiClient.get<GenericMasterDataResponse[]>(
    API_ENDPOINTS.Designations,
  );
  return response.data.map(mapToMasterDataItem);
};

export const getRoles = async (): Promise<Role[]> => {
  const response = await apiClient.get<Role[]>(API_ENDPOINTS.Roles);
  return response.data;
};

export const getLeaveTypes = async (): Promise<LeaveTypeItem[]> => {
  const response = await apiClient.get<LeaveTypeItem[]>(
    API_ENDPOINTS.LeaveTypes,
  );
  return response.data;
};

export const getEmployeeSelectionList = async (): Promise<
  EmployeeSelectItem[]
> => {
  const response = await apiClient.get<EmployeeSelectItem[]>(
    API_ENDPOINTS.EmployeeSelectionList,
  );
  return response.data;
};

export const getEmployeesByRole = async (
  role: string,
): Promise<EmployeeSelectItem[]> => {
  const response = await apiClient.get<[EmployeeSelectItem]>(
    `${API_ENDPOINTS.Employees}/by-role/${role}`,
  );
  return response.data;
};

export const getExpenseTypes = async (): Promise<ExpenseTypeItem[]> => {
  const response = await apiClient.get<ExpenseTypeItem[]>(
    API_ENDPOINTS.ExpenseType,
  );
  return response.data;
};

export const getCountries = async (): Promise<CountryItem[]> => {
  const response = await apiClient.get<CountryItem[]>(API_ENDPOINTS.Country);
  return response.data;
};

export const getStates = async (): Promise<StateItem[]> => {
  const response = await apiClient.get<StateItem[]>(API_ENDPOINTS.State);
  return response.data;
};

export const getCompanies = async (): Promise<CompanyItem[]> => {
  const response = await apiClient.get<CompanyItem[]>(API_ENDPOINTS.Company);
  return response.data;
};

export const getDepartmentsList = async (): Promise<DepartmentItem[]> => {
  const response = await apiClient.get<DepartmentItem[]>(
    API_ENDPOINTS.Departments,
  );
  return response.data;
};

export const getDesignationsList = async (): Promise<DesignationItem[]> => {
  const response = await apiClient.get<DesignationItem[]>(
    API_ENDPOINTS.Designations,
  );
  return response.data;
};

export const getEmployeeLevelSelectionList = async (): Promise<
  EmployeeLevelSelectItem[]
> => {
  const response = await apiClient.get<EmployeeLevelSelectItem[]>(
    API_ENDPOINTS.EmployeeSelectionList,
  );
  return response.data;
};

export const setEmployeeReporting = async (
  employeeId: number,
  reportingToId: number,
): Promise<string> => {
  const response = await apiClient.put<string>(
    API_ENDPOINTS.SetEmployeeReporting,
    {
      employeeId,
      reportingToId,
    },
  );

  return response.data;
};

