import api from "./api";

export interface Report {
  id: number;
  filename: string;
  format: string;
  created_at: string;
}

export interface ReportSummary {
  total_parks?: number;
  good?: number;
  fair?: number;
  poor?: number;
  organizations?: number;
  average_survey_score?: number;
  summary: string;
}

export interface ReportStats {
  total_reports: number;
  pdf_reports: number;
  excel_reports: number;
  geojson_reports: number;
}

/* --------------------------------
   Fetch Report History
-------------------------------- */

export const getReportHistory = async (): Promise<Report[]> => {
  const response = await api.get("/reports/history");
  return response.data;
};

/* --------------------------------
   Fetch Spatial Summary
-------------------------------- */

export const getReportSummary = async (): Promise<ReportSummary> => {
  const response = await api.get("/reports/summary");
  return response.data;
};

/* --------------------------------
   Fetch Report Statistics
-------------------------------- */

export const getReportStats = async (): Promise<ReportStats> => {
  const response = await api.get("/reports/stats");
  return response.data;
};

/* --------------------------------
   Helper: Download Blob
-------------------------------- */

const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();

  link.remove();
  window.URL.revokeObjectURL(url);
};

/* --------------------------------
   Generate PDF
-------------------------------- */

export const generatePDF = async () => {
  const response = await api.post("/reports/pdf", null, {
    responseType: "blob",
  });

  downloadBlob(response.data, "UrbanIQ_Report.pdf");
};

/* --------------------------------
   Generate Excel
-------------------------------- */

export const generateExcel = async () => {
  const response = await api.post("/reports/excel", null, {
    responseType: "blob",
  });

  downloadBlob(response.data, "UrbanIQ_Parks.xlsx");
};

/* --------------------------------
   Generate GeoJSON
-------------------------------- */

export const generateGeoJSON = async () => {
  const response = await api.post("/reports/geojson", null, {
    responseType: "blob",
  });

  downloadBlob(response.data, "UrbanIQ_Parks.geojson");
};

/* --------------------------------
   Download Existing Report
-------------------------------- */

export const downloadReport = async (filename: string) => {
  const response = await api.get(`/reports/download/${filename}`, {
    responseType: "blob",
  });

  downloadBlob(response.data, filename);
};

/* --------------------------------
   Delete Report
-------------------------------- */

export const deleteReport = async (reportId: number) => {
  const response = await api.delete(`/reports/${reportId}`);
  return response.data;
};
