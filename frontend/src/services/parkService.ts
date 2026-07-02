import api from "./api";
import type { Park } from "../pages/Dashboard/Dashboard";

interface GeoJSONFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: {
    id: number;
    name: string;
    area: number;
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
  area: number;
  latitude: number;
  longitude: number;
  distance_meters: number;
}

/**
 * Fetch all parks
 */
export const getParks = async (): Promise<Park[]> => {
  const response = await api.get<GeoJSONResponse>("/parks/geojson");

  return response.data.features.map((feature) => ({
    id: feature.properties.id,
    name: feature.properties.name,
    latitude: feature.geometry.coordinates[1],
    longitude: feature.geometry.coordinates[0],
    condition: "Good",
  }));
};

/**
 * Create Park
 */
export const createPark = async (park: Omit<Park, "id">): Promise<void> => {
  await api.post("/parks", {
    name: park.name,
    area: 5000,
    latitude: park.latitude,
    longitude: park.longitude,
  });
};

/**
 * Get nearest park
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
 * Get nearby parks
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
