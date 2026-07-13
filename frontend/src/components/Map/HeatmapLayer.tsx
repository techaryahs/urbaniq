import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";
import type { Park } from "../../services/parkService";

interface Props {
  parks: Park[];
  enabled: boolean;
}

const HeatmapLayer = ({ parks, enabled }: Props) => {
  const map = useMap();

  useEffect(() => {
    if (!enabled || parks.length === 0) return;

    // TypeScript might not know about heatLayer if types are incomplete, so we cast to unknown
    interface LWithHeat {
      heatLayer: (points: number[][], options: Record<string, unknown>) => L.Layer;
    }
    const LHeat = L as unknown as LWithHeat;
    
    if (typeof LHeat.heatLayer !== "function") {
      console.warn("leaflet.heat is not loaded correctly.");
      return;
    }

    const points = parks.map(p => [p.latitude, p.longitude, 1]); // lat, lng, intensity
    
    let heat: L.Layer | null = null;

    // Use requestAnimationFrame to ensure the map container has dimensions
    // before leaflet.heat tries to create its internal canvas
    const timer = setTimeout(() => {
      heat = LHeat.heatLayer(points, {
        radius: 30,
        blur: 20,
        maxZoom: 15,
        gradient: {
          0.2: 'blue',
          0.4: 'green',
          0.6: 'yellow',
          0.8: 'orange',
          1.0: 'red'
        }
      });
      heat.addTo(map);
    }, 100);

    return () => {
      clearTimeout(timer);
      if (heat) {
        map.removeLayer(heat);
      }
    };
  }, [map, parks, enabled]);

  return null;
};

export default HeatmapLayer;
