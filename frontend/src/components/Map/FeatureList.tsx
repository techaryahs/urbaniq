import type { GISFeature } from "../../types/gis";

interface Props {
  features: GISFeature[];
}

const FeatureList = ({ features }: Props) => {
  if (features.length === 0) {
    return (
      <div className="mt-6 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
        <div className="text-5xl mb-3">🗺️</div>

        <h3 className="text-lg font-semibold">No GIS Features</h3>

        <p className="text-gray-500 mt-2">
          Draw a marker, polygon, rectangle or circle using the Geoman toolbar.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-5 space-y-4">
      {features.map((feature, index) => {
        const geometryType = feature.geometry?.type ?? "Unknown";

        return (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">Feature #{index + 1}</h3>

                <p className="text-gray-500 mt-1">
                  Geometry: <span className="font-medium">{geometryType}</span>
                </p>
              </div>

              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                Active
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-5">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs uppercase text-gray-500">Geometry Type</p>

                <p className="font-semibold mt-1">{geometryType}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs uppercase text-gray-500">Coordinates</p>

                <p className="font-semibold mt-1">
                  {Array.isArray(feature.geometry?.coordinates)
                    ? feature.geometry.coordinates.length
                    : 0}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-5">
              <button className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">
                View
              </button>

              <button className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition">
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FeatureList;
