import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { io } from "socket.io-client";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import L from "leaflet";
import api from "../../services/api";
import "leaflet/dist/leaflet.css";

// --- ICONS CONFIGURATION ---
const createIcon = (url, size) =>
  new L.Icon({
    iconUrl: url,
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: size, // [width, height]
    iconAnchor: [size[0] / 2, size[1]], // Bottom center
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

const redUrl =
  "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png";
const greenUrl =
  "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png";

// Standard Icons
const redIcon = createIcon(redUrl, [25, 41]);
const greenIcon = createIcon(greenUrl, [25, 41]);

// Highlighted Icons (Bigger)
const redIconBig = createIcon(redUrl, [35, 57]);
const greenIconBig = createIcon(greenUrl, [35, 57]);

const MapController = ({ centerLocation, mobileView }) => {
  const map = useMap();

  useEffect(() => {
    // Fix Map Grey Area on Tab Switch
    setTimeout(() => map.invalidateSize(), 200);
  }, [mobileView, map]);

  useEffect(() => {
    // Fly to location if user clicked "Locate"
    if (centerLocation) {
      map.flyTo(centerLocation, 15, { animate: true });
    }
  }, [centerLocation, map]);

  return null;
};

const NGOActiveCases = () => {
  const [reports, setReports] = useState([]);
  const [ngoLocation, setNgoLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileView, setMobileView] = useState("list");
  const [filter, setFilter] = useState("all");
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [checkingVerification, setCheckingVerification] = useState(true);

  // Modal State
  const [proofFile, setProofFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [resolveModalId, setResolveModalId] = useState(null); // For "Mark Resolved"
  const [viewingReport, setViewingReport] = useState(null);

  // LOGIC STATES
  const [highlightedId, setHighlightedId] = useState(null); // Bigger icon on map
  const [mapCenter, setMapCenter] = useState(null);

  const socketRef = useRef();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const checkVerification = async () => {
      try {
        const { data } = await api.get("/auth/me");
        setVerificationStatus(data.data.verification_status);
      } catch (err) {
        console.error("Failed to check verification");
      } finally {
        setCheckingVerification(false);
      }
    };
    checkVerification();
  }, []);

  // 1. Initialize Data & Socket
  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        // Get NGO's registered location from database
        const { data } = await api.get("/auth/me");
        const ngoData = data.data;

        if (ngoData.location && ngoData.location.coordinates) {
          const [longitude, latitude] = ngoData.location.coordinates;
          setNgoLocation([latitude, longitude]); // Note: Leaflet uses [lat, lng]
          fetchNearbyReports(latitude, longitude);
        } else {
          // Fallback if no location in database
          toast.warn("NGO location not set. Please update your profile.");
          useFallbackLocation();
        }
      } catch (err) {
        console.error("Failed to get NGO location:", err);
        useFallbackLocation();
      }
    };

    const useFallbackLocation = () => {
      // Default to New Delhi
      const lat = 28.6139;
      const lng = 77.209;
      setNgoLocation([lat, lng]);
      fetchNearbyReports(lat, lng);
    };

    initializeDashboard();

    const SOCKET_URL =
      import.meta.env.VITE_API_URL?.replace("/api", "") ||
      "http://localhost:5000";
    socketRef.current = io(SOCKET_URL);
    socketRef.current.on("new_report", (data) => {
      toast.info(`New Alert: ${data.report.type}`);
      setReports((prev) => [data.report, ...prev]);
    });

    // Listen for resolution updates
    socketRef.current.on("report_resolved", (data) => {
      setReports((prev) => prev.filter((r) => r._id !== data.reportId)); // Remove resolved from list
    });

    return () => socketRef.current.disconnect();
  }, []);

  // 2. Fetch Reports API
  const fetchNearbyReports = async (lat, lng) => {
    try {
      const { data } = await api.get(
        `/reports/nearby?lat=${lat}&lng=${lng}&radius=10000`
      ); // 10km radius
      setReports(data.data);
    } catch (err) {
      toast.error("Failed to load map data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!ngoLocation) return;

    const fetchData = async () => {
      try {
        let endpoint = "";
        if (filter === "all") {
          // Fetch Nearby Open Reports
          endpoint = `/reports/nearby?lat=${ngoLocation[0]}&lng=${ngoLocation[1]}&radius=10000`;
        } else {
          // Fetch My Specific Claimed Cases (persists after refresh!)
          endpoint = `/reports/my-cases`;
        }

        const { data } = await api.get(endpoint);
        setReports(data.data);
      } catch (err) {
        toast.error("Failed to fetch cases");
      }
    };
    fetchData();
  }, [ngoLocation, filter]);

  // 3. Claim Handler
  const handleClaim = async (reportId) => {
    try {
      await api.patch(`/reports/${reportId}/claim`);
      toast.success("Case Claimed! You are the responder.");

      // Update local state: Set status to Claimed AND claimed_by to me
      setReports((prev) =>
        prev.map((r) =>
          r._id === reportId
            ? { ...r, status: "Claimed", claimed_by: { _id: user.id } }
            : r
        )
      );
    } catch (err) {
      toast.error("Failed to claim case.");
    }
  };

  // Handle Resolution
  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!proofFile) return toast.error("Please upload proof!");

    setUploading(true);
    const formData = new FormData();
    formData.append("proof", proofFile);

    try {
      await api.patch(`/reports/${resolveModalId}/resolve`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Case Resolved! +50 Impact Points added.");

      // Remove the resolved report from the list (it's closed now)
      setReports((prev) => prev.filter((r) => r._id !== resolveModalId));
      setResolveModalId(null);
      setProofFile(null);
    } catch (err) {
      toast.error("Failed to resolve case.");
    } finally {
      setUploading(false);
    }
  };

  //Handle "Locate on Map"
  const handleLocate = (report) => {
    setHighlightedId(report._id);
    setMapCenter([
      report.location.coordinates[1],
      report.location.coordinates[0],
    ]);
    setMobileView("map");
    setViewingReport(null);
  };

  const displayedReports = reports;

  if (checkingVerification) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 flex-col">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800 mb-4"></div>
        <p className="text-gray-600 font-medium">Loading...</p>
      </div>
    );
  }

  if (verificationStatus !== "verified") {
    return (
      <div className="h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-10 rounded-2xl shadow-xl max-w-lg border-t-8 border-yellow-400">
          <div className="text-6xl mb-4">⏳</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Verification Pending
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            Thank you for joining <strong>Small Hands</strong>. To ensure the
            safety of our network, an Admin must verify your license documents
            before you can access the Live Console.
          </p>

          <div className="bg-blue-50 p-4 rounded-lg text-left mb-6">
            <p className="font-bold text-blue-800 text-sm uppercase mb-1">
              What happens next?
            </p>
            <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
              <li>Admins review your license number.</li>
              <li>This process usually takes 24-48 hours.</li>
              <li>You will gain access automatically upon approval.</li>
            </ul>
          </div>

          <Link
            to="/dashboard/ngo"
            className="text-blue-600 font-bold hover:underline"
          >
            &larr; Return to Dashboard Stats
          </Link>
        </div>
      </div>
    );
  }

  if (!ngoLocation)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 flex-col">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800 mb-4"></div>
        <p className="text-gray-600 font-medium">Booting Satellite Uplink...</p>
      </div>
    );

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] bg-gray-100 overflow-hidden">
      {/* HEADER (Mobile) */}
      <div className="md:hidden bg-blue-800 text-white p-4 flex flex-col gap-2 shadow-md z-20 sticky top-0">
        <div className="flex justify-between items-center">
          <Link to="/dashboard/ngo" className="font-bold">
            ← Back
          </Link>
          <span className="font-bold">Live Console</span>
          <div className="w-10"></div>
        </div>
        <div className="flex bg-blue-900 rounded p-1 mt-2">
          <button
            onClick={() => setFilter("all")}
            className={`flex-1 py-1 text-sm rounded ${
              filter === "all"
                ? "bg-white text-blue-900 font-bold"
                : "text-blue-200"
            }`}
          >
            Nearby
          </button>
          <button
            onClick={() => setFilter("claimed")}
            className={`flex-1 py-1 text-sm rounded ${
              filter === "claimed"
                ? "bg-white text-blue-900 font-bold"
                : "text-blue-200"
            }`}
          >
            My Cases
          </button>
        </div>
      </div>

      {/* LIST VIEW */}
      <div
        className={`w-full md:w-1/3 bg-white border-r flex flex-col shadow-lg z-10 h-full ${
          mobileView === "list" ? "flex" : "hidden md:flex"
        }`}
      >
        <div className="hidden md:block p-4 bg-blue-800 text-white sticky top-0 z-10">
          <Link
            to="/dashboard/ngo"
            className="text-xs opacity-70 hover:underline hover:text-white mb-2 block"
          >
            ← Back to Dashboard
          </Link>
          <div className="flex bg-blue-900 rounded p-1 mt-2">
            <button
              onClick={() => setFilter("all")}
              className={`flex-1 py-1 text-sm rounded ${
                filter === "all"
                  ? "bg-white text-blue-900 font-bold"
                  : "text-blue-200"
              }`}
            >
              All Nearby
            </button>
            <button
              onClick={() => setFilter("claimed")}
              className={`flex-1 py-1 text-sm rounded ${
                filter === "claimed"
                  ? "bg-white text-blue-900 font-bold"
                  : "text-blue-200"
              }`}
            >
              My Claimed
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {displayedReports.length === 0 && (
            <p className="text-center py-10 text-gray-400">No reports found.</p>
          )}

          {displayedReports.map((report) => {
            const isMyClaim =
              report.claimed_by &&
              (report.claimed_by._id === user.id ||
                report.claimed_by === user.id);
            return (
              <div
                key={report._id}
                onClick={() => setViewingReport(report)} // Open Detail Modal on Click
                className={`p-4 rounded-lg border-l-4 shadow-sm cursor-pointer transition hover:shadow-md ${
                  isMyClaim
                    ? "border-green-500 bg-green-50"
                    : "border-red-500 bg-white"
                }`}
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-gray-800">{report.type}</h3>
                  <span className="text-xs text-gray-500">
                    {new Date(report.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {report.description}
                </p>
                <p className="text-xs text-blue-600 mt-2 font-bold underline">
                  View Details &gt;
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* MAP VIEW */}
      <div
        className={`w-full md:w-2/3 relative h-full ${
          mobileView === "map" ? "block" : "hidden md:block"
        }`}
      >
        <MapContainer
          center={ngoLocation}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          <MapController centerLocation={mapCenter} mobileView={mobileView} />

          <Marker position={ngoLocation}>
            <Popup>HQ</Popup>
          </Marker>

          {displayedReports.map((report) => {
            const isHighlighted = report._id === highlightedId;
            const isClaimed = report.status === "Claimed";
            // Logic: If highlighted, use BIG icon. Else use normal red/green.
            let icon = isClaimed ? greenIcon : redIcon;
            if (isHighlighted) icon = isClaimed ? greenIconBig : redIconBig;

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
                    <button
                      onClick={() => setViewingReport(report)}
                      className="text-blue-600 underline text-xs"
                    >
                      View Full Details
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* MOBILE TOGGLE BUTTON */}
      <div className="md:hidden absolute bottom-6 left-1/2 transform -translate-x-1/2 z-[1000]">
        <button
          onClick={() => setMobileView(mobileView === "list" ? "map" : "list")}
          className="bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl font-bold flex items-center gap-2"
        >
          {mobileView === "list" ? <>🗺️ Map</> : <>📋 List</>}
        </button>
      </div>

      {/* --- MODAL 1: VIEW DETAILS --- */}
      {viewingReport && (
        <div className="absolute inset-0 z-[2000] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="bg-gray-100 p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                Report Details
              </h2>
              <button
                onClick={() => setViewingReport(null)}
                className="text-gray-500 hover:text-gray-800 text-2xl"
              >
                &times;
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                      viewingReport.severity === "High"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {viewingReport.severity} Severity
                  </span>
                  <h1 className="text-2xl font-bold mt-2">
                    {viewingReport.type}
                  </h1>
                  <p className="text-gray-500 text-sm">
                    Reported:{" "}
                    {new Date(viewingReport.createdAt).toLocaleString()}
                  </p>
                </div>
                {/* 🎯 THE LOCATE BUTTON */}
                <button
                  onClick={() => handleLocate(viewingReport)}
                  className="flex flex-col items-center justify-center text-blue-600 hover:bg-blue-50 p-2 rounded transition"
                >
                  <span className="text-2xl">📍</span>
                  <span className="text-xs font-bold">Locate</span>
                </button>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-4 border">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {viewingReport.description}
                </p>
              </div>

              {/* Images Grid */}
              {viewingReport.images && viewingReport.images.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold text-sm text-gray-500 mb-2">
                    ATTACHED EVIDENCE
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {viewingReport.images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt="Evidence"
                        className="w-full h-32 object-cover rounded-lg border hover:scale-105 transition"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t bg-gray-50 flex gap-3">
              {/* Logic to show Claim or Resolve buttons inside detail modal */}
              {viewingReport.claimed_by &&
              (viewingReport.claimed_by._id === user.id ||
                viewingReport.claimed_by === user.id) ? (
                <button
                  onClick={() => {
                    setViewingReport(null);
                    setResolveModalId(viewingReport._id);
                  }}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 shadow"
                >
                  ✅ Mark as Resolved
                </button>
              ) : viewingReport.status === "Open" ? (
                <button
                  onClick={() => {
                    handleClaim(viewingReport._id);
                    setViewingReport(null);
                  }}
                  className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 shadow"
                >
                  ✋ Claim This Case
                </button>
              ) : (
                <div className="w-full text-center py-3 text-gray-500 font-bold bg-gray-200 rounded-lg">
                  Locked (Assigned to other)
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: RESOLVE (Upload Proof) --- */}
      {resolveModalId && (
        <div className="absolute inset-0 z-[2000] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Complete Mission
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Upload a photo to prove aid was delivered.
            </p>
            <form onSubmit={handleResolveSubmit}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProofFile(e.target.files[0])}
                className="w-full border p-2 rounded mb-4 text-sm"
                required
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setResolveModalId(null);
                    setProofFile(null);
                  }}
                  className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700"
                >
                  {uploading ? "Uploading..." : "Confirm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NGOActiveCases;
