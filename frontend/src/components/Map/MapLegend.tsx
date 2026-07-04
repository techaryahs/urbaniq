interface Props {
  isEmbedded?: boolean;
}

const MapLegend = ({ isEmbedded = false }: Props) => {
  const containerClasses = isEmbedded
    ? "text-sm"
    : "absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-gray-200 z-[1000] text-sm";

  return (
    <div className={containerClasses}>
      {!isEmbedded && <h3 className="font-bold mb-3 text-gray-800">Legend</h3>}
      
      <div className="space-y-3">
        <div>
          <span className="font-semibold text-xs text-gray-500 uppercase tracking-wider mb-1 block">Park Conditions</span>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm" />
            <span>Good Condition</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-sm" />
            <span>Fair Condition</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm" />
            <span>Poor Condition</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm" />
            <span>Standard / Unknown</span>
          </div>
        </div>

        <div className="pt-2 border-t border-gray-100">
          <span className="font-semibold text-xs text-gray-500 uppercase tracking-wider mb-1 block">Analytics</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500/20 border-2 border-blue-500" />
            <span>Buffer Area</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-4 h-0.5 bg-blue-500 border-t-2 border-dashed border-blue-500" />
            <span>Measurement Line</span>
          </div>
        </div>

        <div className="pt-2 border-t border-gray-100">
          <span className="font-semibold text-xs text-gray-500 uppercase tracking-wider mb-1 block">Density (Heatmap)</span>
          <div className="h-2 w-full rounded bg-gradient-to-r from-blue-500 via-green-500 to-red-500 mt-1"></div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapLegend;
