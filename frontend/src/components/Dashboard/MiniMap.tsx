import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Map, ExternalLink } from "lucide-react";
import MapView from "../Map/MapView";
import { getParks } from "../../services/parkService";
import type { BufferGeoJSON } from "../../services/parkService";
import type { Park } from "../../pages/Dashboard/Dashboard";

const MiniMap = () => {
  const [parks, setParks] = useState<Park[]>([]);
  const [loading, setLoading] = useState(true);

  // Dummy state required by MapView, not used in readOnly mode
  const [dummyNearby, setDummyNearby] = useState<number[]>([]);
  const [dummyMeasure, setDummyMeasure] = useState<[number, number][]>([]);
  const [dummyDistance, setDummyDistance] = useState<number | null>(null);
  const [dummyBuffer, setDummyBuffer] = useState<BufferGeoJSON | null>(null);

  useEffect(() => {
    getParks()
      .then(setParks)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6 flex flex-col h-full">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
          <Map className="w-5 h-5 text-blue-600" />
          Network Status
        </h2>
        <Link 
          to="/map" 
          className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors"
        >
          Open Full Map
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>
      
      <div className="flex-1 w-full min-h-[260px] sm:min-h-[300px] rounded-lg overflow-hidden border border-gray-200">
        {loading ? (
          <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-500">
            Loading map data...
          </div>
        ) : (
          <MapView
            parks={parks}
            setParks={setParks}
            searchTerm=""
            condition=""
            onParkSelect={() => {}}
            activeTool="select"
            nearbyParkIds={dummyNearby}
            setNearbyParkIds={setDummyNearby}
            measurePoints={dummyMeasure}
            setMeasurePoints={setDummyMeasure}
            measureDistance={dummyDistance}
            setMeasureDistance={setDummyDistance}
            bufferGeoJSON={dummyBuffer}
            setBufferGeoJSON={setDummyBuffer}
            activeLayers={["parks"]}
            onLayerToggle={() => {}}
            selectedBasemap="osm"
            onBasemapChange={() => {}}
            readOnly={true}
          />
        )}
      </div>
    </div>
  );
};

export default MiniMap;
