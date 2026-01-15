export const reverseGeocode = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();

    if (data.results && data.results[0]) {
      const result = data.results[0];
      const addressComponents = result.address_components;

      const locality =
        addressComponents.find((c) => c.types.includes("sublocality"))
          ?.long_name || "";

      const city =
        addressComponents.find((c) =>
          c.types.includes("administrative_area_level_3")
        )?.long_name || locality;

      return {
        locality,
        city,
        fullAddress: result.formatted_address,
      };
    }
    return null;
  } catch (err) {
    console.error("Reverse geocode failed:", err);
    return null;
  }
};
