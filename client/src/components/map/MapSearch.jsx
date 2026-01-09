import { useState, useEffect, useRef } from "react";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { HiSearch, HiX, HiArrowLeft, HiLocationMarker } from "react-icons/hi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const MapSearch = ({ showBackButton = false }) => {
  const map = useMap();
  const placesLib = useMapsLibrary("places");
  const [placesService, setPlacesService] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();
  const debounceTimer = useRef(null);
  const skipSearch = useRef(false);

  // Initialize SearchBox when library loads
  useEffect(() => {
    if (!placesLib || !map) return;
    const service = new placesLib.AutocompleteService();
    setPlacesService(service);
  }, [placesLib, map]);

  // Debounced search
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (skipSearch.current) {
      skipSearch.current = false;
      return;
    }

    if (!inputValue.trim() || !placesService) {
      setPredictions([]);
      setShowResults(false);
      return;
    }

    debounceTimer.current = setTimeout(() => {
      placesService.getPlacePredictions(
        { input: inputValue },
        (results, status) => {
          if (status === placesLib.PlacesServiceStatus.OK && results) {
            setPredictions(results);
            setShowResults(true);
          } else {
            setPredictions([]);
            setShowResults(false);
          }
        }
      );
    }, 300);

    return () => clearTimeout(debounceTimer.current);
  }, [inputValue, placesService, placesLib]);

  const handlePlaceSelect = (placeId) => {
    if (!placesLib || !map) return;

    const service = new placesLib.PlacesService(map);
    service.getDetails({ placeId }, (place, status) => {
      if (status === placesLib.PlacesServiceStatus.OK && place) {
        if (!place.geometry || !place.geometry.location) {
          toast.error("No location data found for this place.");
          return;
        }

        if (place.geometry.viewport) {
          map.fitBounds(place.geometry.viewport);
        } else {
          map.setCenter(place.geometry.location);
          map.setZoom(16);
        }

        skipSearch.current = true;
        setInputValue(place.name || "");
        setPredictions([]);
        setShowResults(false);
      }
    });
  };

  const clearSearch = () => {
    setInputValue("");
    setPredictions([]);
    setShowResults(false);
  };

  return (
    <div className="absolute top-4 left-4 right-4 z-10 flex items-center gap-2">
      <button
        onClick={() => navigate(-1)}
        className="bg-white text-text-primary w-12 h-12 rounded-full shadow-xl hover:bg-gray-50 transition-colors flex items-center justify-center flex-shrink-0 border border-gray-200"
      >
        <HiArrowLeft className="w-5 h-5" />
      </button>
      <div className="relative flex-1 max-w-md">
        <div className="relative shadow-xl bg-white rounded-full flex items-center overflow-hidden border border-gray-200">
          <div className="pl-3 text-gray-400">
            <HiSearch className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Search places..."
            className="w-full p-3 outline-none text-gray-700 placeholder-gray-400"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => predictions.length > 0 && setShowResults(true)}
          />
          {inputValue && (
            <button
              onClick={clearSearch}
              className="pr-3 text-gray-400 hover:text-gray-600"
            >
              <HiX className="w-5 h-5" />
            </button>
          )}
        </div>

        {showResults && predictions.length > 0 && (
          <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 max-h-80 overflow-y-auto">
            {predictions.map((prediction) => (
              <button
                key={prediction.place_id}
                onClick={() => handlePlaceSelect(prediction.place_id)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start gap-3 border-b border-gray-100 last:border-b-0 transition-colors"
              >
                <HiLocationMarker className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 font-medium truncate">
                    {prediction.structured_formatting.main_text}
                  </p>
                  <p className="text-gray-500 text-sm truncate">
                    {prediction.structured_formatting.secondary_text}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MapSearch;
