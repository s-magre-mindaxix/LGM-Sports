import { useSelector, useDispatch } from "react-redux";
import {
  loginSuccess,
  logout as logoutAction,
} from "../features/User/authSlice";
import { useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../store";
import { loginUser } from "../Modules/HRMS/Pages/Auth/AuthService";

export const useAuth = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, user, token } = useSelector(
    (state: RootState) => state.auth
  );

  const login = async (email: string, password: string) => {
    try {
      const response = await loginUser({ email, password });

      const { token, ...userData } = response;

      dispatch(loginSuccess({ user: userData, token }));

      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = () => {
    dispatch(logoutAction());
    navigate("/login");
  };

  return {
    isAuthenticated,
    user,
    token,
    login,
    logout,
  };
};
