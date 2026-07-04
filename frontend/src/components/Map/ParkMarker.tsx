import L from "leaflet";
import { Marker, Popup } from "react-leaflet";

interface Props {
  id: number;
  name: string;
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
import yellowMarker from "../../assets/markers/yellow-marker.svg";
import redMarker from "../../assets/markers/red-marker.svg";
import blueMarker from "../../assets/markers/blue-marker.svg";

const ICONS: Record<string, string> = {
  green: greenMarker,
  yellow: yellowMarker,
  red: redMarker,
  blue: blueMarker,
};

const getMarkerColor = (condition: string) => {
  const norm = condition.trim().toLowerCase();
  switch (norm) {
    case "good":
      return "green";
    case "fair":
      return "yellow";
    case "poor":
      return "red";
    default:
      return "blue";
  }
};

const createIcon = (color: string, isBright: boolean) =>
  new L.Icon({
    iconUrl: ICONS[color] || ICONS.blue,
    className: isBright ? "marker-bright" : "",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

const ParkMarker = ({
  id,
  name,
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
  return (
    <Marker
      position={[latitude, longitude]}
      icon={createIcon(getMarkerColor(condition), !!(bufferActive && isInsideBuffer))}
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
