import L from "leaflet";

const createIcon = (url, size) =>
  new L.Icon({
    iconUrl: url,
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: size, // [width, height]
    iconAnchor: [size[0] / 2, size[1]], // Bottom center
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

const redUrl =
  "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png";
const greenUrl =
  "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png";
const blueUrl =
  "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png";

// Standard Icons
export const redIcon = createIcon(redUrl, [25, 41]);
export const greenIcon = createIcon(greenUrl, [25, 41]);
export const blueIcon = createIcon(blueUrl, [25, 41]);

// Highlighted Icons (Bigger)
export const redIconBig = createIcon(redUrl, [35, 57]);
export const greenIconBig = createIcon(greenUrl, [35, 57]);
export const blueIconBig = createIcon(blueUrl, [35, 57]);
