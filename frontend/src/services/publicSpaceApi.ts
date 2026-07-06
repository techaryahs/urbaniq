import api from "./api";

export type PublicSpaceType = "PARK" | "LAKE" | "SCHOOL" | "GARDEN" | "PLAYGROUND" | "OPEN_SPACE";

export interface PublicSpace {
  id: number;
  name: string;
  type: PublicSpaceType;
  description: string | null;
  latitude: number;
  longitude: number;
  area: number | null;
  condition: string;
  survey_score: number;
  organization_id: number | null;
  organization?: string;
  created_by: number | null;
  created_at: string;
  updated_at: string;
  version: number;
}

export interface PublicSpaceCreate {
  name: string;
  type: PublicSpaceType;
  description?: string;
  latitude: number;
  longitude: number;
  area?: number;
  condition?: string;
  survey_score?: number;
  organization_id?: number;
}

export interface PublicSpaceUpdate {
  name?: string;
  type?: PublicSpaceType;
  description?: string;
  latitude?: number;
  longitude?: number;
  area?: number;
  condition?: string;
  survey_score?: number;
  organization_id?: number;
}

export interface PublicSpaceListResponse {
  items: PublicSpace[];
  total: number;
}

export interface GeoJSONFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: {
    id: number;
    name: string;
    type: PublicSpaceType;
    area: number | null;
    condition: string;
    organization: string;
    survey_score: number;
  };
}

export interface GeoJSONResponse {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

export const getPublicSpaces = async (params?: {
  search?: string;
  type?: PublicSpaceType;
  condition?: string;
  skip?: number;
  limit?: number;
}): Promise<PublicSpaceListResponse> => {
  const response = await api.get<PublicSpaceListResponse>("/public-spaces/", { params });
  return response.data;
};

export const getPublicSpacesGeoJSON = async (): Promise<GeoJSONResponse> => {
  const response = await api.get<GeoJSONResponse>("/public-spaces/geojson");
  return response.data;
};

export const getPublicSpace = async (id: number): Promise<PublicSpace> => {
  const response = await api.get<PublicSpace>(`/public-spaces/${id}`);
  return response.data;
};

export const createPublicSpace = async (data: PublicSpaceCreate): Promise<PublicSpace> => {
  const response = await api.post<PublicSpace>("/public-spaces/", data);
  return response.data;
};

export const updatePublicSpace = async (id: number, data: PublicSpaceUpdate): Promise<PublicSpace> => {
  const response = await api.put<PublicSpace>(`/public-spaces/${id}`, data);
  return response.data;
};

export const deletePublicSpace = async (id: number): Promise<void> => {
  await api.delete(`/public-spaces/${id}`);
};
