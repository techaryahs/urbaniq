import { useState, useEffect } from "react";
import { MapContainer, TileLayer, useMapEvents, GeoJSON, Polyline, Tooltip } from "react-leaflet";
import L from "leaflet";

import ParkMarker from "./ParkMarker";
import AddParkModal from "./AddParkModal";
import GeoJSONExport from "./GeoJSONExport";
import { GeomanControl } from "./GeomanControl";
import Events from "./Events";
import FeatureList from "./FeatureList";

import type { Park } from "../../services/parkService";
import type { BufferGeoJSON } from "../../services/parkService";
import type { LayerKey } from "./LayerControl";
import type { BasemapKey } from "../../utils/mapLayers";
import { BASEMAPS } from "../../utils/mapLayers";

import HeatmapLayer from "./HeatmapLayer";
import LayerControl from "./LayerControl";

import {
  createPark,
  getParks,
  getBuffer,
  getNearbyParks,
} from "../../services/parkService";

interface Props {
  parks: Park[];
  setParks: React.Dispatch<React.SetStateAction<Park[]>>;
  searchTerm: string;
  condition: string;
  onParkSelect: (park: Park) => void;
  activeTool: "select" | "add" | "measure" | "buffer";
  nearbyParkIds: number[];
  setNearbyParkIds: React.Dispatch<React.SetStateAction<number[]>>;
  measurePoints: [number, number][];
  setMeasurePoints: React.Dispatch<React.SetStateAction<[number, number][]>>;
  measureDistance: number | null;
  setMeasureDistance: React.Dispatch<React.SetStateAction<number | null>>;
  bufferGeoJSON: BufferGeoJSON | null;
  setBufferGeoJSON: React.Dispatch<React.SetStateAction<BufferGeoJSON | null>>;
  activeLayers: LayerKey[];
  onLayerToggle: (layer: LayerKey) => void;
  selectedBasemap: BasemapKey;
  onBasemapChange: (key: BasemapKey) => void;
  readOnly?: boolean;
}

interface ClickHandlerProps {
  onMapClick: (lat: number, lng: number) => void;
}

import type { GISFeature } from "../../types/gis";

const MapClickHandler = ({ onMapClick }: ClickHandlerProps) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
};

const MapBoundsFitter = ({ parks, readOnly }: { parks: Park[]; readOnly: boolean }) => {
  const map = useMapEvents({});
  useEffect(() => {
    if (parks.length > 0) {
      const bounds = L.latLngBounds(parks.map(p => [p.latitude, p.longitude]));
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, [parks, map]);
  
  return null;
};

const MapView = ({
  parks,
  setParks,
  searchTerm,
  condition,
  onParkSelect,
  activeTool,
  nearbyParkIds,
  setNearbyParkIds,
  measurePoints,
  setMeasurePoints,
  measureDistance,
  setMeasureDistance,
  bufferGeoJSON,
  setBufferGeoJSON,
  activeLayers,
  onLayerToggle,
  selectedBasemap,
  onBasemapChange,
  readOnly = false,
}: Props) => {
  const [showModal, setShowModal] = useState(false);

  const [clickedLocation, setClickedLocation] = useState({
    latitude: 0,
    longitude: 0,
  });

  const [features, setFeatures] = useState<GISFeature[]>([]);

  const filteredParks = parks.filter((park) => {
    const matchesSearch = park.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesCondition = condition === "" || park.condition === condition;

    return matchesSearch && matchesCondition;
  });

  const handleMapClick = async (latitude: number, longitude: number) => {
    if (activeTool === "add") {
      setClickedLocation({ latitude, longitude });
      setShowModal(true);
    } else if (activeTool === "measure") {
      const newPoints = [...measurePoints, [latitude, longitude] as [number, number]];
      if (newPoints.length <= 2) {
        setMeasurePoints(newPoints);
      }
      if (newPoints.length === 2) {
        // Calculate distance
        const latlng1 = L.latLng(newPoints[0][0], newPoints[0][1]);
        const latlng2 = L.latLng(newPoints[1][0], newPoints[1][1]);
        setMeasureDistance(latlng1.distanceTo(latlng2));
      } else if (newPoints.length > 2) {
        // Restart measurement
        setMeasurePoints([[latitude, longitude]]);
        setMeasureDistance(null);
      }
    } else if (activeTool === "buffer") {
      try {
        const radius = 1000; // 1km default
        const buffer = await getBuffer(latitude, longitude, radius);
        setBufferGeoJSON(buffer);
        const nearby = await getNearbyParks(latitude, longitude, radius);
        setNearbyParkIds(nearby.map((p) => p.id));
      } catch (error) {
        console.error("Failed to apply buffer", error);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMeasurePoints([]);
        setMeasureDistance(null);
        setBufferGeoJSON(null);
        setNearbyParkIds([]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setMeasurePoints, setMeasureDistance, setBufferGeoJSON, setNearbyParkIds]);

  const handleSavePark = async (name: string, type: string, parkCondition: string) => {
    try {
      await createPark({
        name,
        type,
        latitude: clickedLocation.latitude,
        longitude: clickedLocation.longitude,
        condition: parkCondition,
      });

      const updatedParks = await getParks();
      setParks(updatedParks);

      setShowModal(false);
    } catch (error) {
      console.error("Failed to save park:", error);
    }
  };

  return (
    <>
      <div className="relative h-full w-full">
        <MapContainer
          center={[40.758, -73.9855]}
          zoom={12}
          style={{
            height: "100%",
            width: "100%",
            borderRadius: "18px",
          }}
        >
          <TileLayer
            attribution={BASEMAPS[selectedBasemap].attribution}
            url={BASEMAPS[selectedBasemap].url}
          />

          <MapBoundsFitter parks={parks} readOnly={readOnly} />

          {!readOnly && (
            <>
              <LayerControl 
                activeLayers={activeLayers} 
                onLayerToggle={onLayerToggle} 
                selectedBasemap={selectedBasemap} 
                onBasemapChange={onBasemapChange} 
              />
              <HeatmapLayer parks={parks} enabled={activeLayers.includes("heatmap")} />
              <GeomanControl position="topleft" oneBlock />
              <Events setFeatures={setFeatures} />
              <MapClickHandler onMapClick={handleMapClick} />
            </>
          )}

          {/* Measure Line */}
          {activeLayers.includes("measurements") && measurePoints.length > 0 && (
            <Polyline positions={measurePoints} color="blue" weight={4} dashArray="5, 10">
              {measureDistance !== null && measurePoints.length === 2 && (
                <Tooltip permanent direction="top" className="font-bold text-sm bg-white p-1 rounded shadow">
                  Distance: {measureDistance.toFixed(0)} m
                </Tooltip>
              )}
            </Polyline>
          )}

          {/* Buffer Polygon */}
          {activeLayers.includes("buffer") && bufferGeoJSON && (
            <GeoJSON
              data={bufferGeoJSON}
              style={{
                color: "#3b82f6",
                weight: 2,
                opacity: 0.8,
                fillColor: "#3b82f6",
                fillOpacity: 0.2,
              }}
            />
          )}

          {/* Existing Parks */}
          {activeLayers.includes("parks") && filteredParks.map((park) => (
            <ParkMarker
              key={park.id}
              id={park.id}
              name={park.name}
              type={park.type}
              latitude={park.latitude}
              longitude={park.longitude}
              condition={park.condition}
              onParkSelect={onParkSelect}
              isInsideBuffer={nearbyParkIds.includes(park.id)}
              bufferActive={activeTool === "buffer" && bufferGeoJSON !== null}
            />
          ))}
        </MapContainer>

        {/* GIS Feature Panel (Relocated to floating widget) */}
        {!readOnly && features.length > 0 && (
          <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur rounded-xl shadow-lg border border-gray-200 p-4 max-w-sm max-h-64 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-800 text-sm">Drawn Features ({features.length})</h3>
              <GeoJSONExport features={features} />
            </div>
            <FeatureList features={features} />
          </div>
        )}
      </div>

      {/* Add Park Modal */}
      {showModal && (
        <AddParkModal
          latitude={clickedLocation.latitude}
          longitude={clickedLocation.longitude}
          onClose={() => setShowModal(false)}
          onSave={handleSavePark}
        />
      )}
    </>
  );
};

export default MapView;
