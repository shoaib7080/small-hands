import { useState, useEffect } from "react";
import { TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import MapContainer from "../../components/map/MapContainer";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { HiArrowLeft, HiPlus, HiLocationMarker } from "react-icons/hi";
import api from "../../services/api";
import "leaflet/dist/leaflet.css";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { processImages } from "../../utils/imageUtils";
import ReportModal from "../../components/dashboard/ReportModal";
import { blueIcon, blueIconBig, greenIcon } from "../../utils/mapIcons.js";

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
  const [mapCenter, setMapCenter] = useState([26.7606, 83.3732]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [myReports, setMyReports] = useState([]);
  const [searchParams] = useSearchParams();
  const [viewingReport, setViewingReport] = useState(null);
  const [highlightedId, setHighlightedId] = useState(null);
  const [processedImages, setProcessedImages] = useState([]);
  // const [formData, setFormData] = useState({ image: null });
  const [imagePreview, setImagePreview] = useState(null);

  const navigate = useNavigate();

  const { register, handleSubmit, reset } = useForm();

  // Load user's reports and handle URL params
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await api.get("/reports/my-reports");
        const reports = response.data.data;
        setMyReports(reports);

        // Center map on last report if available and no URL params
        const lat = searchParams.get("lat");
        const lng = searchParams.get("lng");
        if (!lat && !lng && reports.length > 0) {
          const lastReport = reports[0]; // Assumes backend sorts by desc
          if (lastReport.location?.coordinates) {
            setMapCenter([
              lastReport.location.coordinates[1],
              lastReport.location.coordinates[0],
            ]);
          }
        }
      } catch (err) {
        console.error("Failed to load reports");
      }
    };

    fetchReports();

    // Check if location is passed via URL
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    if (lat && lng) {
      const newCoords = [parseFloat(lat), parseFloat(lng)];
      setCoords(newCoords);
      setMapCenter(newCoords);
    }
  }, [searchParams]);

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);

    // Show loading state if you have one
    const processed = await processImages(files);
    setProcessedImages(processed);
  };

  // Submit Handler
  const onSubmit = async (data) => {
    if (!coords)
      return toast.error("Please click on the map to pin a location first!");

    setLoading(true);
    const apiPayload = new FormData();

    // Add text fields from RHF 'data'
    apiPayload.append("type", data.type);
    apiPayload.append("description", data.description);
    apiPayload.append("contact_info", data.contact_info || "");
    apiPayload.append("severity", data.severity);
    apiPayload.append("latitude", coords[0]);
    apiPayload.append("longitude", coords[1]);

    // Use processedImages instead of formData.image
    processedImages.forEach((image) => {
      apiPayload.append("images", image);
    });

    try {
      await api.post("/reports", apiPayload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Help Request Posted! NGOs notified.");
      setShowModal(false);
      reset();
      setCoords(null);
      setProcessedImages([]);
      navigate("/dashboard/reporter");
    } catch (err) {
      toast.error("Failed to post report.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewOnMap = (report) => {
    setHighlightedId(report._id);
    setMapCenter([
      report.location.coordinates[1],
      report.location.coordinates[0],
    ]);
    // Optional: You could also highlight the specific marker here
  };

  return (
    <div className="h-screen w-full relative">
      <div
        className="absolute top-3
       left-5 z-[1000]"
      >
        <button
          onClick={() => navigate(-1)}
          className="bg-surface text-text-primary w-10 h-10 rounded-full shadow-lg hover:bg-gray-100 transition-colors flex items-center justify-center"
        >
          <HiArrowLeft className="w-5 h-5" />
        </button>
      </div>
      {/* The Map */}
      <MapContainer
        center={mapCenter}
        zoom={13}
        enableSearch={true}
        onMapClick={(latlng) => {
          setCoords([latlng.lat, latlng.lng]);
          setMapCenter([latlng.lat, latlng.lng]);
        }}
      >
        {/* Show user's reports */}
        {myReports.map((report) => {
          const isHighlighted = report._id === highlightedId;
          const icon = isHighlighted ? blueIconBig : blueIcon;

          return (
            <Marker
              key={report._id}
              position={[
                report.location.coordinates[1],
                report.location.coordinates[0],
              ]}
              icon={icon}
            >
              <Popup>
                <div className="min-w-[150px]">
                  <h3 className="font-bold">{report.type}</h3>
                  {/* <p className="text-sm text-gray-600">{report.description}</p> */}
                  <div className="flex items-center justify-between mt-2 gap-2">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs mt-1 ${
                        report.status === "Resolved"
                          ? "bg-green-100 text-green-700"
                          : report.status === "Claimed"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {report.status}
                    </span>
                    <button
                      onClick={() => setViewingReport(report)}
                      className="text-primary-600 underline text-xs"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Show new pin where user clicked */}
        {coords && (
          <Marker position={coords} icon={greenIcon}>
            <Popup>Location Selected</Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Floating Action Button */}
      <div className="fixed bottom-4 left-4 md:bottom-10 md:right-10 z-[1000] max-w-[calc(100vw-2rem)]">
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
                  name="images"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-text-secondary text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary-600 hover:file:bg-primary-100"
                  multiple
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
      <ReportModal
        report={viewingReport}
        isOpen={!!viewingReport}
        onClose={() => setViewingReport(null)}
        onViewOnMap={handleViewOnMap}
      />
    </div>
  );
};

export default ReporterHome;
