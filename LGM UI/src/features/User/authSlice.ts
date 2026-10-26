import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Permission } from "../../Modules/HRMS/Pages/Masters/AccessControl/AccessControlService";

interface UserData {
  name?: string;
  email: string;
  role: string;
  googleCalendarId?: string;
  workLocationID: number;
  employeeId:number;
  departmentID: number;
  designationID: number;
  employeeStatus: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  dateOfJoining?: string;
  permissions: Permission[];
}

interface AuthState {
  user: UserData | null;
  token: string | null;
  isAuthenticated: boolean;
  permissions: Permission[];
}

const loadState = (): AuthState => {
  try {
    const serializedUser = sessionStorage.getItem("user");
    const serializedToken = sessionStorage.getItem("token");
     const serializedPermissions = sessionStorage.getItem("permissions");

    if (serializedUser === null || serializedToken === null || serializedPermissions === null) {
      return { user: null, token: null, isAuthenticated: false, permissions: [] };
    }
    return {
      user: JSON.parse(serializedUser),
      token: serializedToken,
      isAuthenticated: true,
      permissions: JSON.parse(serializedPermissions), // Add this
    };
  } catch {
    return { user: null, token: null, isAuthenticated: false, permissions: [] };
  }
};

const initialState: AuthState = loadState();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess(
      state,
      action: PayloadAction<{ user: UserData; token: string }>
    ) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.permissions = action.payload.user.permissions;

      sessionStorage.setItem("user", JSON.stringify(action.payload.user));
      sessionStorage.setItem("token", action.payload.token);
      sessionStorage.setItem("permissions", JSON.stringify(action.payload.user.permissions));
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.permissions = [];

      sessionStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("permissions"); 
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
