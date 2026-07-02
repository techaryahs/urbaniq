import { Map, MapPin, Maximize, Target } from "lucide-react";

interface Props {
  totalVisible: number;
  avgDistance: number;
  bufferCoverage: number;
  avgLat: number;
  avgLng: number;
}

const SpatialStats = ({ totalVisible, avgDistance, bufferCoverage, avgLat, avgLng }: Props) => {
  return (
    <div className="bg-white rounded-xl shadow p-5">
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-blue-600" />
        Spatial Statistics
      </h3>
      <div className="space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
          <span className="text-gray-600 text-sm flex items-center gap-2">
            <Map className="w-4 h-4" /> Visible Parks
          </span>
          <span className="font-semibold">{totalVisible}</span>
        </div>
        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
          <span className="text-gray-600 text-sm flex items-center gap-2">
            <Maximize className="w-4 h-4" /> Avg Distance
          </span>
          <span className="font-semibold">{(avgDistance / 1000).toFixed(2)} km</span>
        </div>
        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
          <span className="text-gray-600 text-sm flex items-center gap-2">
            <Target className="w-4 h-4" /> Buffer Coverage
          </span>
          <span className="font-semibold">{bufferCoverage.toFixed(1)}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Center
          </span>
          <span className="font-semibold text-sm">
            {avgLat.toFixed(3)}, {avgLng.toFixed(3)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SpatialStats;
