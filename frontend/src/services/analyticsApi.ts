import api from "./api";

/* ===========================
   Interfaces
=========================== */

export interface ConditionStat {
  condition: string;
  count: number;
}

export interface OrganizationStat {
  organization: string;
  count: number;
}

export interface MonthlySurvey {
  month: string;
  surveys: number;
}

export interface BufferStat {
  inside_buffer: number;
  outside_buffer: number;
}

export interface AnalyticsSummary {
  total_parks: number;
  good: number;
  fair: number;
  poor: number;
  organizations: number;
  average_survey_score: number;
}

/* ===========================
   API Calls
=========================== */

export const getAnalyticsSummary = async (): Promise<AnalyticsSummary> => {
  const response = await api.get("/analytics/summary");
  return response.data;
};

export const getAnalyticsConditions = async (): Promise<ConditionStat[]> => {
  const response = await api.get("/analytics/conditions");
  return response.data;
};

export const getAnalyticsOrganizations = async (): Promise<
  OrganizationStat[]
> => {
  const response = await api.get("/analytics/organizations");
  return response.data;
};

export const getAnalyticsMonthly = async (): Promise<MonthlySurvey[]> => {
  const response = await api.get("/analytics/monthly");
  return response.data;
};

export const getAnalyticsBuffer = async (): Promise<BufferStat> => {
  const response = await api.get("/analytics/buffer");
  return response.data;
};
