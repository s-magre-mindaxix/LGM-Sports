import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";

export interface Level {
  id: number;
  levelName: string;
  levelOrder: number;
}

export const getLevels = async (): Promise<Level[]> => {
  const res = await apiClient.get(API_ENDPOINTS.Levels);
  return res.data;
};