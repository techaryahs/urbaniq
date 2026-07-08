import { useEffect, useState } from "react";
import MapView from "../components/Map/MapView";
import SearchBar from "../components/Search/SearchBar";
import FilterBar from "../components/Filter/FilterBar";
import GISToolbar from "../components/Map/GISToolbar";
import AnalyticsSidebar from "../components/Analytics/AnalyticsSidebar";
import ParkInfo from "../components/Sidebar/ParkInfo";
import AddSurveyModal from "../components/Map/AddSurveyModal";
import type { BufferGeoJSON } from "../services/parkService";
import { getParks } from "../services/parkService";
import type { BasemapKey } from "../utils/mapLayers";
import type { LayerKey } from "../components/Map/LayerControl";
import { getAverageCoordinates, getAverageDistanceBetweenParks, getBufferCoveragePercentage } from "../utils/spatialAnalytics";
import { getParkConditionStats } from "../utils/statistics";

export interface Park {
  id: number;
  name: string;
  type?: string;
  latitude: number;
  longitude: number;
  condition: string;
  organization?: string;
  area?: number;
  survey_score?: number;
}

const MapPage = () => {
  const [parks, setParks] = useState<Park[]>([]);
  const [selectedPark, setSelectedPark] = useState<Park | null>(null);
  const [showAddSurvey, setShowAddSurvey] = useState(false);
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
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-600">Loading Parks...</h2>
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
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-end mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold">GIS Workspace</h1>
          <p className="text-gray-500 mt-2">Professional mapping and spatial analysis</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-start">
        <div className="min-w-0 flex-1">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </div>
        <div className="w-full md:w-64 lg:w-72">
          <FilterBar condition={condition} setCondition={setCondition} />
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col lg:flex-row gap-6 mt-6">
        
        {/* Left: Map */}
        <div className="w-full lg:w-3/4 relative min-h-[420px] h-[65vh] lg:min-h-[700px] lg:h-[80vh]">
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
        <div className="w-full lg:w-1/4 flex flex-col gap-6 lg:overflow-y-auto lg:max-h-[80vh] lg:pr-2">
          {selectedPark ? (
            <ParkInfo
              park={selectedPark}
              onClear={() => setSelectedPark(null)}
              onCreateSurvey={() => setShowAddSurvey(true)}
            />
          ) : (
            activeLayers.includes("analytics") && (
              <AnalyticsSidebar 
                stats={stats} 
                spatialStats={spatialStats} 
                bufferStats={bufferStats} 
              />
            )
          )}
        </div>
      </div>

      {showAddSurvey && selectedPark && (
        <AddSurveyModal
          parkId={selectedPark.id}
          parkName={selectedPark.name}
          onClose={() => setShowAddSurvey(false)}
          onSave={async () => {
            setShowAddSurvey(false);
            await loadParks();
            try {
              // Re-fetch to inspect newly updated metrics
              const freshParks = await getParks();
              const updated = freshParks.find((p) => p.id === selectedPark.id);
              if (updated) {
                setSelectedPark(updated);
              }
            } catch (err) {
              console.error("Error refreshing selected park:", err);
            }
          }}
        />
      )}
    </div>
  );
};

export default MapPage;
