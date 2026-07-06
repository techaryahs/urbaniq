import api from "./api";

export interface Organization {
  id: number;
  name: string;
  address?: string;
  email?: string;
  phone?: string;
  contact_person?: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationCreate {
  name: string;
  address?: string;
  email?: string;
  phone?: string;
  contact_person?: string;
}

export interface OrganizationUpdate {
  name?: string;
  address?: string;
  email?: string;
  phone?: string;
  contact_person?: string;
}

export interface OrganizationAnalytics {
  total_public_spaces: number;
  condition_breakdown: {
    Good: number;
    Fair: number;
    Poor: number;
    Unknown: number;
  };
  average_survey_score: number;
}

export const getOrganizations = async (
  search?: string,
  skip: number = 0,
  limit: number = 10
): Promise<Organization[]> => {
  const params: any = { skip, limit };
  if (search) {
    params.search = search;
  }
  const response = await api.get("/organizations/", { params });
  return response.data;
};

export const getOrganizationById = async (id: number): Promise<Organization> => {
  const response = await api.get(`/organizations/${id}`);
  return response.data;
};

export const createOrganization = async (
  data: OrganizationCreate
): Promise<Organization> => {
  const response = await api.post("/organizations/", data);
  return response.data;
};

export const updateOrganization = async (
  id: number,
  data: OrganizationUpdate
): Promise<Organization> => {
  const response = await api.put(`/organizations/${id}`, data);
  return response.data;
};

export const deleteOrganization = async (id: number): Promise<void> => {
  await api.delete(`/organizations/${id}`);
};

export const getOrganizationAnalytics = async (
  id: number
): Promise<OrganizationAnalytics> => {
  const response = await api.get(`/organizations/${id}/analytics`);
  return response.data;
};
