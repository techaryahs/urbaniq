import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { calculatePolygonArea } from "../../utils/measure";
import type { GISFeature } from "../../types/gis";

interface Props {
  setFeatures: React.Dispatch<React.SetStateAction<GISFeature[]>>;
}

interface GeomanLayer extends L.Layer {
  pm?: unknown;
  toGeoJSON?: () => GISFeature;
  _url?: string;
}

interface GeomanEvent extends L.LeafletEvent {
  layer: L.Layer;
}

const Events = ({ setFeatures }: Props) => {
  const map = useMap();

  useEffect(() => {
    const syncFeatures = () => {
      const features: GISFeature[] = [];

      map.eachLayer((layer: L.Layer) => {
        const pmLayer = layer as GeomanLayer;
        if (
          pmLayer.toGeoJSON &&
          pmLayer.pm &&
          !pmLayer._url // Ignore TileLayer
        ) {
          features.push(pmLayer.toGeoJSON());
        }
      });

      setFeatures(features);

      console.log("Current Features:", features);
    };

    const handleCreate = (e: L.LeafletEvent) => {
      console.log("Created:", e);
      const layer = (e as GeomanEvent).layer;
      if (layer instanceof L.Polygon) {
        const latlngs = layer.getLatLngs();
        if (Array.isArray(latlngs) && latlngs.length > 0 && Array.isArray(latlngs[0])) {
          const coords = latlngs[0] as L.LatLng[];
          const area = calculatePolygonArea(coords);
          layer.bindTooltip(`Area: ${area.toFixed(0)} m²`, { permanent: true, direction: "center", className: "font-bold text-sm bg-white p-1 rounded shadow" }).openTooltip();
        }
      }
      syncFeatures();
    };

    const handleEdit = () => {
      console.log("Edited");
      syncFeatures();
    };

    const handleRemove = () => {
      console.log("Removed");
      syncFeatures();
    };

    const handleDragEnd = () => {
      console.log("Dragged");
      syncFeatures();
    };

    map.on("pm:create", handleCreate);
    map.on("pm:edit", handleEdit);
    map.on("pm:remove", handleRemove);
    map.on("pm:update", handleEdit);
    map.on("pm:dragend", handleDragEnd);

    return () => {
      map.off("pm:create", handleCreate);
      map.off("pm:edit", handleEdit);
      map.off("pm:remove", handleRemove);
      map.off("pm:update", handleEdit);
      map.off("pm:dragend", handleDragEnd);
    };
  }, [map, setFeatures]);

  return null;
};

export default Events;
