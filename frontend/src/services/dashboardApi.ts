import api from "./api";

export interface DashboardStats {
  total_parks: number;
  good_condition: number;
  fair_condition: number;
  poor_condition: number;
  organizations: number;
  recent_surveys: number;
}

export interface Activity {
  id: number;
  action: string;
  details: string;
  timestamp: string;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get("/dashboard/stats");
  return response.data;
};

export const getRecentActivity = async (): Promise<Activity[]> => {
  const response = await api.get("/dashboard/activity");
  return response.data;
};
