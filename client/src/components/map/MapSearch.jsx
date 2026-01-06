import { useState, useEffect } from "react";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { HiSearch, HiX, HiArrowLeft } from "react-icons/hi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const MapSearch = ({ showBackButton = false }) => {
  const map = useMap();
  const placesLib = useMapsLibrary("places");
  const [searchBox, setSearchBox] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const navigate = useNavigate();

  // Initialize SearchBox when library loads
  useEffect(() => {
    if (!placesLib || !map) return;

    // Create the input element reference (we'll attach it later via ID or ref)
    const input = document.getElementById("google-map-search-input");
    if (input) {
      const box = new placesLib.SearchBox(input);
      setSearchBox(box);

      // Listen for the event fired when the user selects a prediction
      box.addListener("places_changed", () => {
        const places = box.getPlaces();

        if (!places || places.length === 0) {
          return;
        }

        // Get the first result
        const place = places[0];

        if (!place.geometry || !place.geometry.location) {
          toast.error("No location data found for this place.");
          return;
        }

        // If the place has a viewport, use it to set the bounds
        if (place.geometry.viewport) {
          map.fitBounds(place.geometry.viewport);
        } else {
          map.setCenter(place.geometry.location);
          map.setZoom(15);
        }
      });
    }
  }, [placesLib, map]);

  return (
    <div className="absolute top-4 left-4 right-4 z-10 flex items-center gap-2">
      <button
        onClick={() => navigate(-1)}
        className="bg-white text-text-primary w-12 h-12 rounded-full shadow-xl hover:bg-gray-50 transition-colors flex items-center justify-center flex-shrink-0 border border-gray-200"
      >
        <HiArrowLeft className="w-5 h-5" />
      </button>
      <div className="relative shadow-xl bg-white rounded-full flex items-center overflow-hidden border border-gray-200 flex-1 max-w-md">
        <div className="pl-3 text-gray-400">
          <HiSearch className="w-5 h-5" />
        </div>
        <input
          id="google-map-search-input"
          type="text"
          placeholder="Search places..."
          className="w-full p-3 outline-none text-gray-700 placeholder-gray-400"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        {inputValue && (
          <button
            onClick={() => setInputValue("")}
            className="pr-3 text-gray-400 hover:text-gray-600"
          >
            <HiX className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default MapSearch;
