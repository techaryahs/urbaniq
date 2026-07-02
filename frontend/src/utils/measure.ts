export const calculatePolygonArea = (latlngs: { lat: number; lng: number }[]): number => {
  // Uses the shoelace formula on a spherical model
  let area = 0;
  const radius = 6378137; // Earth radius in meters

  if (latlngs.length > 2) {
    for (let i = 0; i < latlngs.length; i++) {
      const p1 = latlngs[i];
      const p2 = latlngs[(i + 1) % latlngs.length];

      area += ((p2.lng - p1.lng) * Math.PI) / 180 * 
              (2 + Math.sin((p1.lat * Math.PI) / 180) + Math.sin((p2.lat * Math.PI) / 180));
    }
    area = (area * radius * radius) / 2.0;
  }
  return Math.abs(area);
};
