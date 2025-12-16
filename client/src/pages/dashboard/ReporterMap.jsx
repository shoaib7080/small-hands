import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import api from "../../services/api";
import "leaflet/dist/leaflet.css";
import { Link } from "react-router-dom";

// 1. Component to Handle Map Clicks & User Location
const MapClickParams = ({ setCoords }) => {
  const map = useMapEvents({
    click(e) {
      setCoords([e.latlng.lat, e.latlng.lng]); // Set pin location
    },
    locationfound(e) {
      map.flyTo(e.latlng, 14); // Zoom to user
    },
  });

  // Ask for location on load
  useEffect(() => {
    map.locate();
  }, [map]);

  return null;
};

const ReporterHome = () => {
  const [coords, setCoords] = useState(null); // [lat, lng]
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset } = useForm();

  // 2. Submit Handler
  const onSubmit = async (data) => {
    if (!coords)
      return toast.error("Please click on the map to pin a location first!");

    setLoading(true);
    const formData = new FormData();
    formData.append("type", data.type);
    formData.append("description", data.description);
    formData.append("severity", data.severity);
    formData.append("latitude", coords[0]);
    formData.append("longitude", coords[1]);

    // Append files (if any)
    if (data.images && data.images.length > 0) {
      for (let i = 0; i < data.images.length; i++) {
        formData.append("images", data.images[i]);
      }
    }

    try {
      await api.post("/reports", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Help Request Posted! NGOs notified.");
      setShowModal(false);
      reset();
      setCoords(null);
    } catch (err) {
      toast.error("Failed to post report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full relative">
      <div className="absolute top-5 left-5 z-[1000]">
        <Link
          to="/dashboard/reporter"
          className="bg-white text-gray-800 px-4 py-2 rounded-lg shadow font-bold hover:bg-gray-100"
        >
          ← Back
        </Link>
      </div>
      {/* 3. The Map */}
      <MapContainer
        center={[28.61, 77.2]}
        zoom={5}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapClickParams setCoords={setCoords} />

        {/* Show Pin where user clicked */}
        {coords && (
          <Marker position={coords}>
            <Popup>Location Selected</Popup>
          </Marker>
        )}
      </MapContainer>

      {/* 4. Floating Action Button (FAB) */}
      <div className="absolute bottom-10 right-10 z-[1000]">
        {/* Only show button if location is picked */}
        {coords && !showModal && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-full shadow-2xl text-xl animate-bounce"
          >
            + Report Need Here
          </button>
        )}

        {/* Instruction if no location picked */}
        {!coords && (
          <div className="bg-white p-3 rounded-lg shadow-lg text-gray-700 font-medium">
            👇 Tap map to pin location
          </div>
        )}
      </div>

      {/* 5. The Form Modal */}
      {showModal && (
        <div className="absolute inset-0 z-[2000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Report a Need
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700">
                  Category
                </label>
                <select
                  {...register("type")}
                  className="w-full border p-2 rounded mt-1"
                >
                  <option value="Food">Food / Ration</option>
                  <option value="Medical">Medical Aid</option>
                  <option value="Shelter">Shelter / Bedding</option>
                  <option value="Clothes">Clothes</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700">
                  Severity
                </label>
                <select
                  {...register("severity")}
                  className="w-full border p-2 rounded mt-1"
                >
                  <option value="Medium">Medium</option>
                  <option value="High">High (Urgent)</option>
                  <option value="Critical">Critical (Life Threatening)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700">
                  Description
                </label>
                <textarea
                  {...register("description", { required: true })}
                  placeholder="Describe the situation..."
                  className="w-full border p-2 rounded mt-1 h-24"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700">
                  Photo Evidence (Optional)
                </label>
                <input
                  type="file"
                  {...register("images")}
                  className="w-full mt-1"
                  accept="image/*"
                />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? "Posting..." : "Submit Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReporterHome;
