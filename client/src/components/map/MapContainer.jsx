import { useState, useEffect } from "react";
import {
  APIProvider,
  Map,
  InfoWindow,
  useMap,
} from "@vis.gl/react-google-maps";
import { HiLocationMarker } from "react-icons/hi";
import { toast } from "react-toastify";
import CustomMarker from "./CustomMarker";
import MapSearch from "./MapSearch";

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const MAP_ID = "DEMO_MAP_ID"; // Required for AdvancedMarker

// Internal Controller to handle camera updates from props
const MapController = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    if (map && center) {
      // center is [lat, lng] arrays in our app, but Google Maps wants {lat, lng} literals usually.
      // However, the library and API are flexible. Let's normalize.
      const newCenter = Array.isArray(center)
        ? { lat: center[0], lng: center[1] }
        : center;

      map.moveCamera({ center: newCenter, zoom: zoom || map.getZoom() });
    }
  }, [map, center, zoom]);

  return null;
};

// Wrapper for Marker to mimic Leaflet API slightly and use our CustomMarker
export const MapMarker = ({ position, children, icon, ...props }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Normalize position
  const pos = Array.isArray(position)
    ? { lat: position[0], lng: position[1] }
    : position;

  return (
    <>
      <CustomMarker position={pos} onClick={() => setIsOpen(true)} {...props} />
      {isOpen && children && (
        <InfoWindow
          position={pos}
          onCloseClick={() => setIsOpen(false)}
          pixelOffset={[0, -30]}
        >
          {children}
        </InfoWindow>
      )}
    </>
  );
};

// Wrapper for Popup (InfoWindow)
export const MapPopup = ({ children }) => {
  // In our MapMarker logic above, we render children inside InfoWindow.
  // So 'MapPopup' purely acts as a container for content in this migration.
  return <div className="p-1">{children}</div>;
};

const MapContainer = ({
  center = [28.61, 77.2],
  zoom = 13,
  enableSearch = false,
  enableLocate = true,
  onMapClick,
  onLocationFound,
  children,
  className = "h-full w-full",
  ngoHQ = null,
}) => {
  const [userLocation, setUserLocation] = useState(null);
  const [userZoom, setUserZoom] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  // Normalize Default Center
  const defaultCenter = Array.isArray(center)
    ? { lat: center[0], lng: center[1] }
    : center;

  const handleLocate = () => {
    if (ngoHQ) {
      toast.info("Zooming to HQ...");
      const hqPos = Array.isArray(ngoHQ)
        ? { lat: ngoHQ[0], lng: ngoHQ[1] }
        : ngoHQ;
      setUserLocation(hqPos);
      setUserZoom(18);
      if (onLocationFound) onLocationFound(hqPos);
      return;
    }

    if (!navigator.geolocation) return toast.error("Geolocation not supported");

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(pos);
        setUserZoom(18);
        if (onLocationFound) onLocationFound(pos);
        setIsLocating(false);
      },
      (error) => {
        console.error(error);
        toast.error("Unable to get location");
        setIsLocating(false);
      }
    );
  };

  return (
    <APIProvider apiKey={API_KEY}>
      <div className={`relative ${className} z-0`}>
        <Map
          defaultCenter={defaultCenter}
          defaultZoom={zoom}
          mapId={MAP_ID}
          disableDefaultUI={true} // Cleaner look
          className="h-full w-full"
          onClick={(e) => {
            if (onMapClick && e.detail.latLng) {
              onMapClick(e.detail.latLng);
            }
          }}
        >
          <MapController
            center={userLocation || center}
            zoom={userZoom || zoom}
          />

          {enableSearch && <MapSearch />}

          {/* Locate Me Button (Inside Map Context but absolute) */}
          {/* We can place it here or outside. Inside is fine visually. */}

          {/* Render Children (Markers) */}
          {children}

          {/* User Location Marker if found */}
          {userLocation && ngoHQ && (
            <CustomMarker
              position={userLocation}
              isHQ={true}
              label="Headquarter"
            />
          )}
          {userLocation && !ngoHQ && (
            <CustomMarker position={userLocation} isUserLocation={true} />
          )}
        </Map>

        {enableLocate && (
          <button
            onClick={handleLocate}
            disabled={isLocating}
            className="absolute bottom-6 right-4 sm:bottom-8 sm:right-6 z-10 bg-white text-gray-700 p-3 rounded-full shadow-xl hover:bg-gray-50 border border-gray-200 transition-transform hover:scale-105 active:scale-95"
            title="Locate Me"
          >
            {isLocating ? (
              <div className="w-6 h-6 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            ) : (
              <HiLocationMarker className="w-6 h-6 text-primary-600" />
            )}
          </button>
        )}
      </div>
    </APIProvider>
  );
};

export default MapContainer;
