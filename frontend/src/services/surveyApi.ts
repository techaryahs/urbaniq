import api from "./api";

export type SurveyCondition = "Excellent" | "Good" | "Average" | "Poor" | "Very Poor";

export interface Survey {
  id: number;
  public_space_id: number;
  park_id?: number; // legacy compat
  researcher_id: number;
  condition: SurveyCondition;
  score: number;
  remarks: string | null;
  survey_date: string;
  photos: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface SurveyCreate {
  public_space_id?: number;
  park_id?: number; // legacy compat
  condition: SurveyCondition;
  score: number;
  remarks?: string;
  survey_date: string;
  photos?: string[];
}

export interface SurveyUpdate {
  public_space_id?: number;
  park_id?: number; // legacy compat
  condition?: SurveyCondition;
  score?: number;
  remarks?: string;
  survey_date?: string;
  photos?: string[];
}

export interface SurveyListResponse {
  items: Survey[];
  total: number;
}

export interface SurveyFilters {
  public_space_id?: number;
  park_id?: number; // legacy compat
  researcher_id?: number;
  condition?: SurveyCondition;
  min_score?: number;
  max_score?: number;
  start_date?: string;
  end_date?: string;
  skip?: number;
  limit?: number;
}

export interface ResearcherDashboardSummary {
  total_public_spaces: number;
  total_surveys: number;
  todays_surveys: number;
  completed_surveys: number;
  average_score: number;
  latest_survey: {
    id: number;
    public_space_id: number;
    park_id: number;
    park_name: string;
    public_space_name?: string;
    score: number;
    condition: SurveyCondition;
    survey_date: string;
  } | null;
}

// -----------------------------
// CRUD
// -----------------------------

export const getSurveys = async (filters: SurveyFilters): Promise<SurveyListResponse> => {
  const params = {
    ...filters,
    public_space_id: filters.public_space_id || filters.park_id,
  };
  const response = await api.get<SurveyListResponse>("/surveys/", { params });
  return response.data;
};

export const getSurvey = async (id: number): Promise<Survey> => {
  const response = await api.get<Survey>(`/surveys/${id}`);
  return response.data;
};

export const createSurvey = async (data: SurveyCreate): Promise<Survey> => {
  const payload = {
    ...data,
    public_space_id: data.public_space_id || data.park_id,
  };
  const response = await api.post<Survey>("/surveys/", payload);
  return response.data;
};

export const updateSurvey = async (id: number, data: SurveyUpdate): Promise<Survey> => {
  const payload = {
    ...data,
    public_space_id: data.public_space_id || data.park_id,
  };
  const response = await api.put<Survey>(`/surveys/${id}`, payload);
  return response.data;
};

export const deleteSurvey = async (id: number): Promise<void> => {
  await api.delete(`/surveys/${id}`);
};

export const getSurveysByResearcher = async (researcherId: number): Promise<Survey[]> => {
  const response = await api.get<Survey[]>(`/surveys/researcher/${researcherId}`);
  return response.data;
};

export const getSurveysByPublicSpace = async (publicSpaceId: number): Promise<Survey[]> => {
  const response = await api.get<Survey[]>(`/surveys/public-space/${publicSpaceId}`);
  return response.data;
};

export const getSurveysByPark = async (parkId: number): Promise<Survey[]> => {
  return getSurveysByPublicSpace(parkId);
};

// -----------------------------
// PHOTO UPLOAD
// -----------------------------

export const uploadPhotos = async (files: File[]): Promise<string[]> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });
  const response = await api.post<string[]>("/surveys/upload-photos", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// -----------------------------
// ANALYTICS & DASHBOARD
// -----------------------------

export const getResearcherDashboard = async (): Promise<ResearcherDashboardSummary> => {
  const response = await api.get<ResearcherDashboardSummary>("/analytics/researcher-dashboard");
  return response.data;
};

export const getSurveyTrends = async (): Promise<{ date: string; count: number }[]> => {
  const response = await api.get<{ date: string; count: number }[]>("/analytics/surveys/trends");
  return response.data;
};

export const getSurveyMonthly = async (): Promise<{ month: string; surveys: number }[]> => {
  const response = await api.get<{ month: string; surveys: number }[]>("/analytics/surveys/monthly");
  return response.data;
};

export const getSurveyConditions = async (): Promise<{ condition: SurveyCondition; count: number }[]> => {
  const response = await api.get<{ condition: SurveyCondition; count: number }[]>("/analytics/surveys/conditions");
  return response.data;
};

export const getSurveyProductivity = async (): Promise<{ researcher: string; count: number }[]> => {
  const response = await api.get<{ researcher: string; count: number }[]>("/analytics/surveys/productivity");
  return response.data;
};

export const getSurveyAverageScore = async (): Promise<{ average_score: number }> => {
  const response = await api.get<{ average_score: number }>("/analytics/surveys/average-score");
  return response.data;
};

export const getSurveyParkCounts = async (): Promise<{ park_name: string; count: number }[]> => {
  const response = await api.get<{ park_name: string; count: number }[]>("/analytics/surveys/park-counts");
  return response.data;
};

export const getSurveyPublicSpaceCounts = async (): Promise<{ public_space_name: string; count: number }[]> => {
  const response = await api.get<{ public_space_name: string; count: number }[]>("/analytics/surveys/public-space-counts");
  return response.data;
};

// -----------------------------
// REPORTS
// -----------------------------

export const exportSurveyPdf = async (): Promise<Blob> => {
  const response = await api.post<Blob>("/reports/surveys/pdf", {}, { responseType: "blob" });
  return response.data;
};

export const exportSurveyExcel = async (): Promise<Blob> => {
  const response = await api.post<Blob>("/reports/surveys/excel", {}, { responseType: "blob" });
  return response.data;
};

export const exportSurveyCsv = async (): Promise<Blob> => {
  const response = await api.post<Blob>("/reports/surveys/csv", {}, { responseType: "blob" });
  return response.data;
};
