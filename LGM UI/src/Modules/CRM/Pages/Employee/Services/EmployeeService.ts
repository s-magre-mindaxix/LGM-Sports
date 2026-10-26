import { AxiosError } from "axios";
import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import type { EmployeeSelectItem } from "../../../../HRMS/Services/MasterDataService";

export interface Employee {
  id: number;
  employeeCode: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  emailAddress: string;
  mobileNumber: string;
  isActive: boolean;
  workLocationName: string;
  departmentName: string;
  designationName: string;
  panNumber: string;
  aadhaarNumber: string;
  companyName: string;
}

export interface NewEmployeePayload {
  employeeCode: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  mobileNumber: string;
  presentAddress: string;
  dateOfJoining: string;
  workLocationID: number;
  departmentID: number;
  designationID: number;
  reportingTo?: number | null;
  biometricID?: string;
  aadhaarNumber: string;
  panNumber: string;
  uanNo?: string;
  pfNo?: string;
  esiNo?: string;
  email: string;
  password: string;
  role: string;
}

export interface UpdateEmployeePayload {
  employeeCode: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  mobileNumber: string;
  presentAddress: string;
  workLocationID: number;
  departmentID: number;
  designationID: number;
  reportingTo?: number | null;
  isActive: boolean;
  role?: string;
}

export interface EmployeeDetail extends Employee {
  dateOfBirth?: string;
  dateOfJoining?: string;
  gender?: string;
  presentAddress?: string;
  workLocationID?: number;
  departmentID?: number;
  designationID?: number;
  reportingTo?: number;
  role?: string;
}

export interface ViewDocument {
  id: number;
  documentName: string;
  filePath: string;
  uploadedDate: string;
}

export interface ViewBankDetails {
  accountHolderName: string;
  bankAddress: string;
  sortCode: string;
  swiftCode: string;
  ibanNo: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
}

export interface ViewStatutoryDetails {
  aadhaarNumber: string;
  passportNumber: string;
  panNumber: string;
  uanNo?: string;
  pfNo?: string;
  esiNo?: string;
}

export interface ViewPFDetails {
  pfDeductionPercentage: number;
  isCappedAt15k: boolean;
}

export interface ViewTDSDetails {
  tdsAmount: number;
}

export interface Qualification {
  degree: string;
  university: string;
  passingYear: string;
  percentage: string;
}

export interface Experience {
  companyName: string;
  designation: string;
  fromDate: string;
  toDate: string;
  location: string;
}

export interface EmployeeFullDetail {
  id: number;
  role: string;
  googleCalendarId?: string;
  employeeCode: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  emailAddress: string;
  curMobileNo?: string;
  curEmail?: string;
  mobileNumber: string;
  dateOfBirth?: string;
  dateOfJoining?: string;
  gender?: string;
  workLocationName: string;
  departmentName: string;
  designationName: string;
  reportingToName: string;
  isActive: boolean;
  photoPath?: string;
  companyName?: string;
  curFlatNo?: string;
  curPremisesName?: string;
  curRoadName?: string;
  curLocality?: string;
  curTownDistrict?: string;
  curPinNo?: string;
  curCountryName?: string;
  curStateName?: string;
  statutoryDetails: ViewStatutoryDetails | null;
  bankDetails: ViewBankDetails | null;
  documents: ViewDocument[];
  pfDetails: ViewPFDetails | null;
  tdsDetails: ViewTDSDetails | null;
  qualifications: Qualification[];
  experiences: Experience[];
}

export const getAllEmployees = async (): Promise<Employee[]> => {
  try {
    const response = await apiClient.get<Employee[]>(API_ENDPOINTS.Employees);
    return response.data;
  } catch (error: unknown) {
    console.error("Failed to fetch employees:", error);
    throw new Error("Could not fetch employee data.");
  }
};

export const addEmployee = async (
  payload: NewEmployeePayload | FormData,
): Promise<{ message: string }> => {
  try {
    const response = await apiClient.post<{ message: string }>(
      API_ENDPOINTS.Register,
      payload,
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Failed to add employee:", error);

    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    throw new Error("An unexpected error occurred while adding the employee.");
  }
};

export const getEmployeeById = async (id: number): Promise<EmployeeDetail> => {
  try {
    const response = await apiClient.get<EmployeeDetail>(
      `${API_ENDPOINTS.Employees}/${id}`,
    );
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch employee with id ${id}:`, error);
    throw new Error("Could not fetch employee details.");
  }
};

export const getEmployeeFullDetails = async (
  id: number,
): Promise<EmployeeFullDetail> => {
  try {
    const response = await apiClient.get<EmployeeFullDetail>(
      `${API_ENDPOINTS.Employees}/${id}/full-details`,
    );
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch full details for employee ${id}:`, error);
    throw new Error("Could not fetch employee's full details.");
  }
};

export const updateEmployee = async (
  id: number,
  payload: UpdateEmployeePayload,
): Promise<EmployeeDetail> => {
  try {
    const response = await apiClient.put<EmployeeDetail>(
      `${API_ENDPOINTS.Employees}/${id}`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error(`Failed to update employee with id ${id}:`, error);
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error(
      "An unexpected error occurred while updating employee details.",
    );
  }
};

export const deleteEmployee = async (
  id: number,
): Promise<{ message: string }> => {
  try {
    const response = await apiClient.delete<{ message: string }>(
      `${API_ENDPOINTS.Employees}/${id}`,
    );
    return response.data;
  } catch (error: unknown) {
    console.error(`Failed to delete employee with id ${id}:`, error);
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error(
      "An unexpected error occurred while deleting the employee.",
    );
  }
};

export const getEmployeesByRoleAndDepartment = async (
  role: string,
  departmentId: number,
): Promise<EmployeeSelectItem[]> => {
  const response = await apiClient.get<EmployeeSelectItem[]>(
    API_ENDPOINTS.EmployeesByRoleAndDepartment,
    { params: { role, departmentId } },
  );
  return response.data;
};

export const updateEmployeeStatus = async (id: number, isActive: boolean) => {
  const token = sessionStorage.getItem("token");
  await apiClient.patch(
    `${API_ENDPOINTS.Employees}/${id}/status`,
    { isActive },
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
};
