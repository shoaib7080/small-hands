// client/src/utils/geocode.js
export const reverseGeocode = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${
        import.meta.env.VITE_GOOGLE_MAPS_API_KEY
      }`
    );
    const data = await response.json();
    if (data.results && data.results[0]) {
      return data.results[0].formatted_address;
    }
    return "Address not available";
  } catch (err) {
    return "Address not available";
  }
};
