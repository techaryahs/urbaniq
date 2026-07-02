import { FeatureGroup } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";

const DrawControl = () => {
  return (
    <FeatureGroup>
      <EditControl
        position="topleft"
        onCreated={(e) => {
          console.log("Created:", e.layerType);
        }}
        onEdited={() => {
          console.log("Edited");
        }}
        onDeleted={() => {
          console.log("Deleted");
        }}
        draw={{
          polyline: false,
          polygon: true,
          rectangle: true,
          circle: true,
          circlemarker: false,
          marker: true,
        }}
      />
    </FeatureGroup>
  );
};

export default DrawControl;
