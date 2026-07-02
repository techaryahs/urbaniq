import { createControlComponent } from "@react-leaflet/core";
import * as L from "leaflet";

import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";

interface Props extends L.ControlOptions {
  position: L.ControlPosition;
  oneBlock?: boolean;
}

const Geoman = L.Control.extend({
  options: {},

  initialize(options: Props) {
    L.setOptions(this, options);
  },

  addTo(map: L.Map) {
    map.pm.addControls({
      ...this.options,
    });

    return this;
  },
});

const createGeomanInstance = (props: Props) => {
  return new Geoman(props);
};

export const GeomanControl = createControlComponent(createGeomanInstance);
