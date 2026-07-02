import api from "./api";

export interface Report {
  id: number;
  filename: string;
  format: string;
  created_at: string;
}

export interface ReportSummary {
  summary: string;
}

export const getReportHistory = async (): Promise<Report[]> => {
  const response = await api.get("/reports/history");
  return response.data;
};

export const getReportSummary = async (): Promise<ReportSummary> => {
  const response = await api.get("/reports/summary");
  return response.data;
};
