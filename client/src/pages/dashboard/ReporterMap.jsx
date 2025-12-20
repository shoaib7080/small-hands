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
import { HiArrowLeft, HiPlus, HiLocationMarker } from "react-icons/hi";
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
    formData.append("contact_info", data.contact_info || "");
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
      <div className="absolute top-5 right-5 z-[1000]">
        <Link
          to="/dashboard/reporter"
          className="bg-surface text-text-primary w-10 h-10 rounded-full shadow-lg hover:bg-gray-100 transition-colors flex items-center justify-center"
        >
          <HiArrowLeft className="w-5 h-5" />
        </Link>
      </div>
      {/* The Map */}
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

      {/* Floating Action Button */}
      <div className="fixed bottom-4 right-4 md:bottom-10 md:right-10 z-[1000] max-w-[calc(100vw-2rem)]">
        {coords && !showModal && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-error-500 hover:bg-error-600 text-white font-medium py-3 px-6 rounded-full shadow-lg text-sm md:text-base flex items-center gap-2 transition-colors"
          >
            <HiPlus className="w-5 h-5" />
            Report Need Here
          </button>
        )}

        {!coords && (
          <div className="bg-surface p-3 rounded-lg shadow-lg border border-border flex items-center gap-2 text-text-secondary font-medium text-sm">
            <HiLocationMarker className="w-5 h-5 text-primary-500" />
            Tap map to pin location
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showModal && (
        <div className="absolute inset-0 z-[2000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl p-6 w-full max-w-md shadow-2xl border border-border">
            <h2 className="text-xl font-bold mb-4 text-text-primary">
              Report a Need
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Category
                </label>
                <select
                  {...register("type")}
                  className="w-full border border-border bg-background text-text-primary p-2 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="Food">Food / Ration</option>
                  <option value="Medical">Medical Aid</option>
                  <option value="Shelter">Shelter / Bedding</option>
                  <option value="Clothes">Clothes</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Contact Info
                </label>
                <input
                  type="text"
                  {...register("contact_info")}
                  placeholder="Phone, WhatsApp, or any contact method"
                  className="w-full border border-border bg-background text-text-primary p-2 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Severity
                </label>
                <select
                  {...register("severity")}
                  className="w-full border border-border bg-background text-text-primary p-2 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="Medium">Medium</option>
                  <option value="High">High (Urgent)</option>
                  <option value="Critical">Critical (Life Threatening)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Description
                </label>
                <textarea
                  {...register("description", { required: true })}
                  placeholder="Describe the situation..."
                  className="w-full border border-border bg-background text-text-primary p-2 rounded-lg h-24 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Photo Evidence (Optional)
                </label>
                <input
                  type="file"
                  {...register("images")}
                  className="w-full text-text-secondary text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary-600 hover:file:bg-primary-100"
                  accept="image/*"
                />
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-text-secondary hover:bg-background rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-error-500 text-white rounded-lg hover:bg-error-600 disabled:opacity-50 transition-colors"
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
