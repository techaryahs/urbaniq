import { useEffect, useState } from "react";
import MapView from "../components/Map/MapView";
import SearchBar from "../components/Search/SearchBar";
import FilterBar from "../components/Filter/FilterBar";
import GISToolbar from "../components/Map/GISToolbar";
import AnalyticsSidebar from "../components/Analytics/AnalyticsSidebar";
import type { BufferGeoJSON } from "../services/parkService";
import { getParks } from "../services/parkService";
import type { BasemapKey } from "../utils/mapLayers";
import type { LayerKey } from "../components/Map/LayerControl";
import { getAverageCoordinates, getAverageDistanceBetweenParks, getBufferCoveragePercentage } from "../utils/spatialAnalytics";
import { getParkConditionStats } from "../utils/statistics";

export interface Park {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  condition: string;
  organization?: string;
  area?: number;
  survey_score?: number;
}

const MapPage = () => {
  const [parks, setParks] = useState<Park[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedPark, setSelectedPark] = useState<Park | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [condition, setCondition] = useState("");
  const [loading, setLoading] = useState(true);

  // GIS Tool State
  const [activeTool, setActiveTool] = useState<"select" | "add" | "measure" | "buffer">("select");
  const [nearbyParkIds, setNearbyParkIds] = useState<number[]>([]);
  const [measurePoints, setMeasurePoints] = useState<[number, number][]>([]);
  const [measureDistance, setMeasureDistance] = useState<number | null>(null);
  const [bufferGeoJSON, setBufferGeoJSON] = useState<BufferGeoJSON | null>(null);

  // Layer & Basemap State
  const [activeLayers, setActiveLayers] = useState<LayerKey[]>(["parks", "heatmap", "buffer", "measurements"]);
  const [selectedBasemap, setSelectedBasemap] = useState<BasemapKey>("osm");

  const handleToolChange = (tool: "select" | "add" | "measure" | "buffer") => {
    setActiveTool(tool);
    if (tool !== "measure") {
      setMeasurePoints([]);
      setMeasureDistance(null);
    }
    if (tool !== "buffer") {
      setBufferGeoJSON(null);
      setNearbyParkIds([]);
    }
  };

  const handleLayerToggle = (layer: LayerKey) => {
    setActiveLayers((prev) =>
      prev.includes(layer) ? prev.filter((l) => l !== layer) : [...prev, layer]
    );
  };

  const loadParks = async () => {
    try {
      const data = await getParks();
      setParks(data);
    } catch (error) {
      console.error("Failed to load parks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadParks();
  }, []);

  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <h2 className="text-2xl font-semibold text-gray-600">Loading Parks...</h2>
      </div>
    );
  }

  // Filtered Data
  const filteredParks = parks.filter((park) => {
    const matchesSearch = park.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCondition = condition === "" || park.condition === condition;
    return matchesSearch && matchesCondition;
  });

  // Derived Analytics
  const stats = getParkConditionStats(filteredParks);
  const avgCoords = getAverageCoordinates(filteredParks);
  const avgDistance = getAverageDistanceBetweenParks(filteredParks);
  const bufferCoverage = bufferGeoJSON ? getBufferCoveragePercentage(nearbyParkIds.length, filteredParks.length) : 0;
  
  const bufferStats = bufferGeoJSON ? {
    inside: nearbyParkIds.length,
    outside: filteredParks.length - nearbyParkIds.length
  } : null;

  const spatialStats = {
    totalVisible: filteredParks.length,
    avgDistance,
    bufferCoverage,
    avgLat: avgCoords.latitude,
    avgLng: avgCoords.longitude,
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-4xl font-bold">GIS Workspace</h1>
          <p className="text-gray-500 mt-2">Professional mapping and spatial analysis</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="col-span-3">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </div>
        <FilterBar condition={condition} setCondition={setCondition} />
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col lg:flex-row gap-6 mt-6">
        
        {/* Left: Map */}
        <div className="w-full lg:w-3/4 relative min-h-[700px] h-[80vh]">
          <GISToolbar activeTool={activeTool} onToolChange={handleToolChange} />
          <MapView
            parks={parks}
            setParks={setParks}
            searchTerm={searchTerm}
            condition={condition}
            onParkSelect={setSelectedPark}
            activeTool={activeTool}
            nearbyParkIds={nearbyParkIds}
            setNearbyParkIds={setNearbyParkIds}
            measurePoints={measurePoints}
            setMeasurePoints={setMeasurePoints}
            measureDistance={measureDistance}
            setMeasureDistance={setMeasureDistance}
            bufferGeoJSON={bufferGeoJSON}
            setBufferGeoJSON={setBufferGeoJSON}
            activeLayers={activeLayers}
            onLayerToggle={handleLayerToggle}
            selectedBasemap={selectedBasemap}
            onBasemapChange={setSelectedBasemap}
          />
        </div>

        {/* Right: Sidebar */}
        <div className="w-full lg:w-1/4 flex flex-col gap-6 overflow-y-auto max-h-[80vh] pr-2">
          {activeLayers.includes("analytics") && (
            <AnalyticsSidebar 
              stats={stats} 
              spatialStats={spatialStats} 
              bufferStats={bufferStats} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MapPage;
