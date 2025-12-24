import { useEffect } from "react";
import {
  MapContainer as LeafletMapContainer,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { HiLocationMarker } from "react-icons/hi";
import { toast } from "react-toastify";
import MapSearch from "./MapSearch";

// Internal Controller to handle flyTo and clicks
// We combine the functionality here to keep the main component clean
const MapController = ({ center, onMapClick }) => {
  const map = useMap();

  // Handle FlyTo changes
  useEffect(() => {
    if (center) {
      map.flyTo(center, map.getZoom(), { animate: true });
    }
  }, [center, map]);

  // Handle Resize Issues (Grey tiles)
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [map]);

  // Handle Clicks
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(e.latlng);
      }
    },
    locationfound(e) {
      map.flyTo(e.latlng, 14);
    },
  });

  return null;
};

// Internal Component for "Locate Me" Button
const LocateButton = ({ onLocationFound, ngoHQ }) => {
  const map = useMap();

  const handleLocate = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    // If user is NGO and HQ location is available, go to HQ
    if (user.role === "ngo" && ngoHQ) {
      toast.info("Zooming to HQ...");
      map.flyTo(ngoHQ, 14, { animate: true });
      return;
    }

    // Otherwise, get current location
    if (!navigator.geolocation) {
      return toast.error("Geolocation is not supported");
    }

    toast.info("Locating...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        map.flyTo([latitude, longitude], 14, { animate: true });

        // Notify parent if needed (e.g. to set a pin)
        if (onLocationFound) {
          onLocationFound({ lat: latitude, lng: longitude });
        }
      },
      () => {
        toast.error("Unable to retrieve location");
      }
    );
  };

  return (
    <button
      onClick={handleLocate}
      className="absolute bottom-20 right-5 z-[1000] bg-white text-gray-700 p-2 rounded-full shadow-lg hover:bg-gray-50 border border-gray-200"
      title="Locate Me"
      type="button"
    >
      <HiLocationMarker className="w-6 h-6 text-primary-600" />
    </button>
  );
};

const MapContainer = ({
  center = [28.61, 77.2], // Default Delhi
  zoom = 13,
  enableSearch = false,
  enableLocate = true,
  onMapClick,
  children,
  className = "h-full w-full",
  ngoHQ = null,
}) => {
  return (
    <div className={`relative ${className} z-0`}>
      <LeafletMapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false} // We can add custom controls if needed, or leave default
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Search Input Overlay - Must be inside MapContainer to use useMap() */}
        {enableSearch && <MapSearch />}

        {/* Locate Me Button */}
        {enableLocate && (
          <LocateButton onLocationFound={onMapClick} ngoHQ={ngoHQ} />
        )}

        <MapController center={center} onMapClick={onMapClick} />

        {children}
      </LeafletMapContainer>
    </div>
  );
};

export default MapContainer;
