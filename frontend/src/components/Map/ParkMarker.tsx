import L from "leaflet";
import { Marker, Popup } from "react-leaflet";

interface Props {
  id: number;
  name: string;
  type?: string;
  latitude: number;
  longitude: number;
  condition: string;
  organization?: string;
  area?: number;
  survey_score?: number;
  onParkSelect: (park: {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    condition: string;
  }) => void;
  isInsideBuffer?: boolean;
  bufferActive?: boolean;
}

import greenMarker from "../../assets/markers/green-marker.svg";
import blueMarker from "../../assets/markers/blue-marker.svg";
import orangeMarker from "../../assets/markers/orange-marker.svg";
import purpleMarker from "../../assets/markers/purple-marker.svg";
import yellowMarker from "../../assets/markers/yellow-marker.svg";
import redMarker from "../../assets/markers/red-marker.svg";

// Helper function to return marker SVG import matching the type
function getMarkerIcon(type: string) {
  switch (type.toLowerCase()) {
    case "park":
    case "parks":
      return greenMarker;
    case "lake":
      return blueMarker;
    case "school":
      return orangeMarker;
    case "garden":
      return purpleMarker;
    case "playground":
      return yellowMarker;
    case "open_space":
    case "open space":
      return redMarker;
    default:
      return greenMarker;
  }
}

const ParkMarker = ({
  id,
  name,
  type,
  latitude,
  longitude,
  condition,
  organization,
  area,
  survey_score,
  onParkSelect,
  isInsideBuffer,
  bufferActive,
}: Props) => {
  
  // Reconstruct publicSpace object and console.log it along with its type as per requirements
  const publicSpace = {
    id,
    name,
    type,
    latitude,
    longitude,
    condition,
    organization,
    area,
    survey_score,
  };
  console.log(publicSpace);
  console.log(publicSpace.type);

  const iconUrl = getMarkerIcon(type || "park");

  const icon = L.icon({
    iconUrl,
    className: bufferActive && isInsideBuffer ? "marker-bright" : "",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  return (
    <Marker
      position={[latitude, longitude]}
      icon={icon}
      eventHandlers={{
        click: () =>
          onParkSelect({
            id,
            name,
            latitude,
            longitude,
            condition,
          }),
      }}
    >
      <Popup>
        <div className="space-y-2">
          <h2 className="font-bold text-lg">{name}</h2>

          <div className="text-sm">
            <p>
              <strong>Type:</strong> {type ? type.replace("_", " ") : "PARK"}
            </p>
            <p>
              <strong>Condition:</strong> {condition}
            </p>
            {organization && (
              <p>
                <strong>Organization:</strong> {organization}
              </p>
            )}
            {area !== undefined && (
              <p>
                <strong>Area:</strong> {area.toLocaleString()} m²
              </p>
            )}
            {survey_score !== undefined && (
              <p>
                <strong>Last Survey:</strong> {survey_score}%
              </p>
            )}
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

export default ParkMarker;
