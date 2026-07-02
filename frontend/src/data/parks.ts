export interface Park {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  condition: string;
}

export const parks: Park[] = [
  {
    id: 1,
    name: "Central Park",
    latitude: 40.785091,
    longitude: -73.968285,
    condition: "Fair",
  },
  {
    id: 2,
    name: "Bryant Park",
    latitude: 40.753596,
    longitude: -73.983232,
    condition: "Good",
  },
  {
    id: 3,
    name: "Washington Square Park",
    latitude: 40.730823,
    longitude: -73.997332,
    condition: "Poor",
  },
  {
    id: 4,
    name: "Prospect Park",
    latitude: 40.660204,
    longitude: -73.968956,
    condition: "Good",
  },
];
