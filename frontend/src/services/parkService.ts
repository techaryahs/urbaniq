import api from "./api";

export interface Park {
  id: number;
  name: string;
  type?: string;
  latitude: number;
  longitude: number;
  condition: string;
  organization?: string;
  survey_score?: number;
  area?: number;
}

interface GeoJSONFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: {
    id: number;
    name: string;
    type: string;
    area: number | null;
    condition: string;
    organization: string;
    survey_score: number;
  };
}

interface GeoJSONResponse {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

export interface BufferGeoJSON {
  type: "Feature";
  geometry: GeoJSON.Geometry;
  properties: {
    radius: number;
  };
}

export interface NearbyPark {
  id: number;
  name: string;
  type?: string;
  area: number;
  latitude: number;
  longitude: number;
  distance_meters: number;
}

/**
 * Fetch all public spaces mapped of interface Park
 */
export const getParks = async (): Promise<Park[]> => {
  const response = await api.get<GeoJSONResponse>("/public-spaces/geojson");

  return response.data.features.map((feature) => ({
    id: feature.properties.id,
    name: feature.properties.name,
    type: feature.properties.type,
    latitude: feature.geometry.coordinates[1],
    longitude: feature.geometry.coordinates[0],
    condition: feature.properties.condition || "Unknown",
    organization: feature.properties.organization,
    survey_score: feature.properties.survey_score,
    area: feature.properties.area || undefined,
  }));
};

/**
 * Create Park (Public Space of type PARK)
 */
export const createPark = async (park: Omit<Park, "id">): Promise<void> => {
  await api.post("/public-spaces", {
    name: park.name,
    type: park.type || "PARK",
    area: park.area ?? 5000,
    latitude: park.latitude,
    longitude: park.longitude,
    condition: park.condition,
    organization_id: undefined, // Or resolved if needed
  });
};

/**
 * Get nearest public space
 */
export const getNearestPark = async (latitude: number, longitude: number) => {
  const response = await api.get("/parks/nearest", {
    params: {
      latitude,
      longitude,
    },
  });

  return response.data;
};

/**
 * Get nearby public spaces
 */
export const getNearbyParks = async (
  latitude: number,
  longitude: number,
  radius: number,
): Promise<NearbyPark[]> => {
  const response = await api.get("/parks/within", {
    params: {
      latitude,
      longitude,
      radius,
    },
  });

  return response.data;
};

/**
 * Get buffer polygon
 */
export const getBuffer = async (
  latitude: number,
  longitude: number,
  radius: number,
): Promise<BufferGeoJSON> => {
  const response = await api.get("/parks/buffer", {
    params: {
      latitude,
      longitude,
      radius,
    },
  });

  return response.data;
};
