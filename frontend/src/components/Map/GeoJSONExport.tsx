import type { GISFeature } from "../../types/gis";

interface Props {
  features: GISFeature[];
}

const GeoJSONExport = ({ features }: Props) => {
  const exportGeoJSON = () => {
    const geojson = {
      type: "FeatureCollection",
      features: features.map((feature) => feature.geometry || feature),
    };

    const blob = new Blob([JSON.stringify(geojson, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "urbaniq-features.geojson";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={exportGeoJSON}
      className="mt-4 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg font-semibold transition"
    >
      📥 Export GeoJSON
    </button>
  );
};

export default GeoJSONExport;
