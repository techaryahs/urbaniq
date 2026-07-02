import { useState } from "react";
import { Layers, Map as MapIcon, ChevronDown, ChevronUp, Info } from "lucide-react";
import { BASEMAPS } from "../../utils/mapLayers";
import type { BasemapKey } from "../../utils/mapLayers";
import MapLegend from "./MapLegend";

export type LayerKey = "parks" | "heatmap" | "buffer" | "measurements" | "analytics";

interface Props {
  activeLayers: LayerKey[];
  onLayerToggle: (layer: LayerKey) => void;
  selectedBasemap: BasemapKey;
  onBasemapChange: (key: BasemapKey) => void;
}

const LayerControl = ({
  activeLayers,
  onLayerToggle,
  selectedBasemap,
  onBasemapChange,
}: Props) => {
  const [expandedSection, setExpandedSection] = useState<"basemap" | "layers" | "legend" | null>("layers");

  const layers: { id: LayerKey; label: string }[] = [
    { id: "parks", label: "Parks" },
    { id: "heatmap", label: "Heatmap" },
    { id: "buffer", label: "Buffer" },
    { id: "measurements", label: "Measurements" },
    { id: "analytics", label: "Analytics" },
  ];

  const toggleSection = (section: "basemap" | "layers" | "legend") => {
    setExpandedSection(prev => (prev === section ? null : section));
  };

  return (
    <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur rounded-xl shadow-lg border border-gray-200 w-64 overflow-hidden">
      
      {/* Basemap Section */}
      <div className="border-b border-gray-100 last:border-0">
        <button
          onClick={() => toggleSection("basemap")}
          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2 font-bold text-sm text-gray-700">
            <Layers className="w-4 h-4 text-blue-600" />
            Basemap
          </div>
          {expandedSection === "basemap" ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>
        
        {expandedSection === "basemap" && (
          <div className="px-4 pb-4 space-y-2">
            {(Object.keys(BASEMAPS) as BasemapKey[]).map((key) => (
              <label key={key} className="flex items-center gap-3 text-sm cursor-pointer hover:bg-gray-50 p-2 rounded-lg border border-transparent hover:border-gray-200 transition-all">
                <input
                  type="radio"
                  name="basemap"
                  value={key}
                  checked={selectedBasemap === key}
                  onChange={() => onBasemapChange(key)}
                  className="text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                {BASEMAPS[key].name}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Layers Section */}
      <div className="border-b border-gray-100 last:border-0">
        <button
          onClick={() => toggleSection("layers")}
          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2 font-bold text-sm text-gray-700">
            <MapIcon className="w-4 h-4 text-green-600" />
            Layers
          </div>
          {expandedSection === "layers" ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>
        
        {expandedSection === "layers" && (
          <div className="px-4 pb-4 space-y-1">
            {layers.map((layer) => (
              <label key={layer.id} className="flex items-center gap-3 text-sm cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-all">
                <input
                  type="checkbox"
                  checked={activeLayers.includes(layer.id)}
                  onChange={() => onLayerToggle(layer.id)}
                  className="text-blue-600 focus:ring-blue-500 rounded w-4 h-4"
                />
                {layer.label}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Legend Section */}
      <div className="border-b border-gray-100 last:border-0">
        <button
          onClick={() => toggleSection("legend")}
          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2 font-bold text-sm text-gray-700">
            <Info className="w-4 h-4 text-purple-600" />
            Legend
          </div>
          {expandedSection === "legend" ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>
        
        {expandedSection === "legend" && (
          <div className="px-4 pb-4">
            <MapLegend isEmbedded={true} />
          </div>
        )}
      </div>

    </div>
  );
};

export default LayerControl;
