import apiClient from "../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../API/apiConfig";

export interface AttendanceRecord {
  employeeName: string;
  employeeId: string;
  department: string;
  plant: string;
  inTime?: { time: string; lateInfo?: string };
  outTime?: string;
  totalHours?: string;
  overtime: string;
  status: string;
}

export interface BulkAttendancePayload {
  employeeId: number;
  fromDate: string;
  toDate: string;
  inTime?: string;
  outTime?: string;
  notes?: string;
}

export interface CreateAttendancePayload {
  employeeId: number;
  date: string;
  inTime: string | null;
  outTime: string | null;
  status: number;
  notes?: string;
}

export const getAttendanceByDate = async (
  date: string,
): Promise<AttendanceRecord[]> => {
  const response = await apiClient.get<AttendanceRecord[]>(
    API_ENDPOINTS.GetAttendanceByDate,
    {
      params: { date },
    },
  );
  return response.data;
};

export const addManualAttendance = async (
  payload: CreateAttendancePayload,
): Promise<AttendanceRecord> => {
  const response = await apiClient.post<AttendanceRecord>(
    API_ENDPOINTS.AddManualAttendance,
    payload,
  );
  return response.data;
};

export const getAttendanceByEmployee = async (
  employeeId: number,
  date: string,
): Promise<AttendanceRecord | null> => {
  const response = await apiClient.get<AttendanceRecord | null>(
    API_ENDPOINTS.GetAttendanceByEmployee,
    {
      params: { employeeId, date },
    },
  );
  return response.data;
};

export const addBulkAttendance = async (payload: BulkAttendancePayload) => {
  const response = await apiClient.post(
    `${API_ENDPOINTS.Attendance}/bulk`,
    payload,
  );
  return response.data;
};
