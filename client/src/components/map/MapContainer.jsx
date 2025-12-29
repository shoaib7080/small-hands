import { useState, useEffect } from "react";
import {
  MapContainer as LeafletMapContainer,
  TileLayer,
  useMap,
  useMapEvents,
  Marker,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { HiLocationMarker } from "react-icons/hi";
import { toast } from "react-toastify";
import MapSearch from "./MapSearch";
import { set } from "lodash";

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
// const LocateButton = ({ onLocationFound, ngoHQ }) => {
//   const map = useMap();
//   const [isLocating, setIsLocating] = useState(false);
//   const [userLocation, setUserLocation] = useState(null);

//   const handleLocate = (e) => {
//     e.preventDefault();
//     e.stopPropagation();

//     const user = JSON.parse(localStorage.getItem("user") || "{}");

//     // If user is NGO and HQ location is available, go to HQ
//     if (user.role === "ngo" && ngoHQ) {
//       toast.info("Zooming to HQ...");
//       map.flyTo(ngoHQ, 14, { animate: true });
//       return;
//     }

//     // Otherwise, get current location
//     if (!navigator.geolocation) {
//       return toast.error("Geolocation is not supported");
//     }

//     setIsLocating(true);

//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         const { latitude, longitude } = position.coords;
//         const location = [latitude, longitude];

//         setUserLocation(location);
//         map.flyTo(location, 16, { animate: true });

//         // Notify parent if needed (e.g. to set a pin)
//         if (onLocationFound) {
//           onLocationFound({ lat: latitude, lng: longitude });
//         }
//         setIsLocating(false);
//       },
//       () => {
//         toast.error("Unable to retrieve location");
//         setIsLocating(false);
//       }
//     );
//   };

//   return (
//     <>
//       <button
//         onClick={handleLocate}
//         disabled={isLocating}
//         className="absolute bottom-20 right-5 z-[1000] bg-white text-gray-700 p-2 rounded-full shadow-lg hover:bg-gray-50 border border-gray-200 disabled:opacity-70"
//         title="Locate Me"
//         type="button"
//       >
//         <HiLocationMarker
//           className={`w-6 h-6 text-primary-600 ${
//             isLocating ? "animate-spin" : ""
//           }`}
//         />
//       </button>

//       {userLocation && <Marker position={userLocation} />}
//     </>
//   );
// };

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
  const [isLocating, setIsLocating] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  const handleLocate = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    // If user is NGO and HQ location is available, go to HQ
    if (user.role === "ngo" && ngoHQ) {
      toast.info("Zooming to HQ...");
      setUserLocation(ngoHQ);
      if (onLocationFound) {
        onLocationFound({ lat: ngoHQ[0], lng: ngoHQ[1] });
      }
      return;
    }

    // Otherwise, get current location
    if (!navigator.geolocation) {
      return toast.error("Geolocation is not supported");
    }

    setIsLocating(true);

    const options = {
      enableHighAccuracy: false, // Use network location instead of GPS
      timeout: 10000, // 10 second timeout
      maximumAge: 300000, // Accept cached location up to 5 minutes old
    };
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location = [latitude, longitude];

        setUserLocation(location);

        // Notify parent if needed (e.g. to set a pin)
        if (onLocationFound) {
          onLocationFound({ lat: latitude, lng: longitude });
        }
        setIsLocating(false);
      },
      (error) => {
        let errorMessage = "Unable to retrieve location";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Location access denied. Please enable location permissions.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }

        toast.error(errorMessage);
        setIsLocating(false);
      },
      options
    );
  };

  return (
    <div className={`relative ${className} z-0`}>
      <LeafletMapContainer
        center={userLocation || center}
        zoom={userLocation ? 16 : zoom}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Search Input Overlay - Must be inside MapContainer to use useMap() */}
        {enableSearch && <MapSearch />}

        <MapController
          center={userLocation || center}
          onMapClick={onMapClick}
        />

        {userLocation && <Marker position={userLocation} />}
        {children}
      </LeafletMapContainer>

      {/* Move button outside LeafletMapContainer */}
      {enableLocate && (
        <button
          onClick={handleLocate}
          disabled={isLocating}
          className="absolute bottom-20 right-5 z-[1000] bg-white text-gray-700 p-2 rounded-full shadow-lg hover:bg-gray-50 border border-gray-200 disabled:opacity-70"
          title="Locate Me"
          type="button"
        >
          {isLocating ? (
            <div className="w-6 h-6 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          ) : (
            <HiLocationMarker className="w-6 h-6 text-primary-600" />
          )}
        </button>
      )}
    </div>
  );
};

export default MapContainer;
