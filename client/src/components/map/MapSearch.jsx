import { useState, useCallback } from "react";
import { useMap } from "react-leaflet"; // Assuming you use React Leaflet
import axios from "axios";
import _ from "lodash"; // Import lodash for debounce

const MapSearch = () => {
  const map = useMap(); // Access the Leaflet Map Instance
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [active, setActive] = useState(false);

  // 1. The Search Function (Debounced)
  // We wrap this in useCallback so it doesn't get recreated every render
  const searchLocation = useCallback(
    _.debounce(async (searchText) => {
      if (!searchText) return setResults([]);

      try {
        // NOMINATIM API (OpenStreetMap) - Free, No Key
        const { data } = await axios.get(
          `https://nominatim.openstreetmap.org/search?format=json&q=${searchText}`
        );
        setResults(data);
      } catch (error) {
        console.error("Search failed:", error);
      }
    }, 1000), // Wait 1000ms after typing stops
    []
  );

  // 2. Handle Input Change
  const handleChange = (e) => {
    setQuery(e.target.value);
    searchLocation(e.target.value);
    setActive(true);
  };

  // 3. Handle Result Click
  const handleSelect = (lat, lon, displayName) => {
    map.flyTo([lat, lon], 14, {
      // Fly to coordinates
      duration: 2, // Smooth animation duration
    });
    setQuery(displayName); // Update input text
    setResults([]); // Hide dropdown
    setActive(false);
  };

  return (
    <div className="absolute top-4 left-16 right-4 z-[1000] max-w-80 md:right-auto md:w-80">
      {/* SEARCH INPUT */}
      <div className="bg-white rounded-lg shadow-lg flex items-center p-2">
        <span className="text-gray-400 mx-2">🔍</span>
        <input
          type="text"
          placeholder="Search location..."
          value={query}
          onChange={handleChange}
          onFocus={() => setActive(true)}
          className="w-full outline-none text-gray-700 text-sm"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
            }}
            className="text-gray-400 hover:text-gray-600 px-2"
          >
            ✕
          </button>
        )}
      </div>

      {/* RESULTS DROPDOWN */}
      {active && results.length > 0 && (
        <ul className="bg-white mt-2 rounded-lg shadow-xl overflow-hidden max-h-60 overflow-y-auto">
          {results.map((item) => (
            <li
              key={item.place_id}
              onClick={() =>
                handleSelect(item.lat, item.lon, item.display_name)
              }
              className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 text-sm text-gray-700 transition-colors"
            >
              {item.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MapSearch;
