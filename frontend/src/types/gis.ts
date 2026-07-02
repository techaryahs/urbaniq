export interface GISFeature {
  type: string;
  geometry?: {
    type: string;
    coordinates: unknown;
  };
  properties?: Record<string, unknown>;
}
