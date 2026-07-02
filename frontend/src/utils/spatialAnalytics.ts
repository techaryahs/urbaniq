import type { Park } from "../pages/Dashboard/Dashboard";
import L from "leaflet";

export const getAverageCoordinates = (parks: Park[]) => {
  if (parks.length === 0) return { latitude: 0, longitude: 0 };
  const sum = parks.reduce(
    (acc, park) => {
      acc.lat += park.latitude;
      acc.lng += park.longitude;
      return acc;
    },
    { lat: 0, lng: 0 }
  );
  return {
    latitude: sum.lat / parks.length,
    longitude: sum.lng / parks.length,
  };
};

export const getAverageDistanceBetweenParks = (parks: Park[]) => {
  if (parks.length < 2) return 0;
  
  let totalDistance = 0;
  let count = 0;
  
  for (let i = 0; i < parks.length; i++) {
    const latlng1 = L.latLng(parks[i].latitude, parks[i].longitude);
    for (let j = i + 1; j < parks.length; j++) {
      const latlng2 = L.latLng(parks[j].latitude, parks[j].longitude);
      totalDistance += latlng1.distanceTo(latlng2);
      count++;
    }
  }
  
  return count === 0 ? 0 : totalDistance / count;
};

export const getBufferCoveragePercentage = (insideCount: number, totalCount: number) => {
  if (totalCount === 0) return 0;
  return (insideCount / totalCount) * 100;
};
