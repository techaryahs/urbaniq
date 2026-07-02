import L from "leaflet";
import { Marker, Popup } from "react-leaflet";

interface Props {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  condition: string;
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

const getMarkerColor = (condition: string, bufferActive?: boolean, isInsideBuffer?: boolean) => {
  if (bufferActive) {
    return isInsideBuffer ? "green" : "blue";
  }

  switch (condition) {
    case "Good":
      return "green";
    case "Fair":
      return "orange";
    case "Poor":
      return "red";
    default:
      return "blue";
  }
};

const createIcon = (color: string) =>
  new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
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
  onParkSelect,
  isInsideBuffer,
  bufferActive,
}: Props) => {
  return (
    <Marker
      position={[latitude, longitude]}
      icon={createIcon(getMarkerColor(condition, bufferActive, isInsideBuffer))}
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

          <p>
            <strong>Condition:</strong> {condition}
          </p>
        </div>
      </Popup>
    </Marker>
  );
};

export default ParkMarker;
