import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { io } from "socket.io-client";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import L from "leaflet";
import api from "../../services/api";
import "leaflet/dist/leaflet.css";

// Custom Icons for Map Pins
const redIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const greenIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Helper: Refreshes map layout when shown/hidden
const MapInvalidator = ({ mobileView }) => {
  const map = useMap();

  useEffect(() => {
    // Wait 100ms for the CSS transition to finish, then fix map size
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [mobileView, map]); // Run whenever mobileView changes

  return null;
};

const NGOActiveCases = () => {
  const [reports, setReports] = useState([]);
  const [ngoLocation, setNgoLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileView, setMobileView] = useState("list");
  const [filter, setFilter] = useState("all");

  // Modal State
  const [selectedReport, setSelectedReport] = useState(null);
  const [proofFile, setProofFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const socketRef = useRef();
  const user = JSON.parse(localStorage.getItem("user"));

  // 1. Initialize Data & Socket
  useEffect(() => {
    const getGeoLocation = () => {
      if (!navigator.geolocation) {
        useFallbackLocation();
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          initializeDashboard(latitude, longitude);
        },
        (err) => {
          console.error("Geo Error:", err);
          toast.warn("Location access denied. Using default view.");
          useFallbackLocation();
        },
        { timeout: 5000 } // Don't wait more than 5 seconds
      );
    };

    const useFallbackLocation = () => {
      // Default to New Delhi (or set this to your city)
      initializeDashboard(28.6139, 77.209);
    };

    const initializeDashboard = (lat, lng) => {
      setNgoLocation([lat, lng]);
      fetchNearbyReports(lat, lng);
    };

    getGeoLocation();

    socketRef.current = io("http://localhost:5000");
    socketRef.current.on("new_report", (data) => {
      toast.info(`🚨 New Alert: ${data.report.type}`);
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

  // 👇 NEW: Handle Resolution
  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!proofFile) return toast.error("Please upload proof!");

    setUploading(true);
    const formData = new FormData();
    formData.append("proof", proofFile);

    try {
      await api.patch(`/reports/${selectedReport}/resolve`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Case Resolved! +50 Impact Points added.");

      // Remove the resolved report from the list (it's closed now)
      setReports((prev) => prev.filter((r) => r._id !== selectedReport));
      setSelectedReport(null);
      setProofFile(null);
    } catch (err) {
      toast.error("Failed to resolve case.");
    } finally {
      setUploading(false);
    }
  };

  const displayedReports = reports;

  if (!ngoLocation)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 flex-col">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800 mb-4"></div>
        <p className="text-gray-600 font-medium">Booting Satellite Uplink...</p>
      </div>
    );

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100 relative">
      {/* 1. Header with Tabs */}
      <div className="md:hidden bg-blue-800 text-white p-4 flex flex-col gap-2 shadow-md z-20">
        <div className="flex justify-between items-center">
          <Link to="/dashboard/ngo" className="font-bold">
            ← Back
          </Link>
          <span className="font-bold">Live Console</span>
          <div className="w-10"></div>
        </div>
        {/* Mobile Tabs */}
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

      {/* 2. LIST VIEW */}
      <div
        className={`
        w-full md:w-1/3 bg-white border-r flex-col shadow-lg z-10 h-full
        ${mobileView === "list" ? "flex" : "hidden md:flex"}
      `}
      >
        <div className="hidden md:block p-4 bg-blue-800 text-white">
          <Link
            to="/dashboard/ngo"
            className="text-xs opacity-70 hover:underline hover:text-white mb-2 block"
          >
            ← Back to Dashboard
          </Link>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold">Active Cases</h1>
          </div>
          {/* Desktop Tabs */}
          <div className="flex bg-blue-900 rounded p-1">
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
          <p className="text-xs text-gray-500 font-bold uppercase">
            {filter === "all" ? "Live Feed" : "Your Ongoing Missions"}
          </p>

          {displayedReports.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-10">
              No reports found.
            </p>
          )}

          {displayedReports.map((report) => {
            const isMyClaim =
              report.claimed_by &&
              (report.claimed_by._id === user.id ||
                report.claimed_by === user.id);
            return (
              <div
                key={report._id}
                className={`p-4 rounded-lg border-l-4 shadow-sm ${
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
                <p className="text-sm text-gray-600 mt-1">
                  {report.description}
                </p>

                {/* ACTION BUTTONS */}
                {isMyClaim ? (
                  <button
                    onClick={() => setSelectedReport(report._id)} // Open Modal
                    className="mt-3 w-full bg-green-600 text-white text-sm font-bold py-2 rounded hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    ✅ Mark Resolved
                  </button>
                ) : report.status === "Open" ? (
                  <button
                    onClick={() => handleClaim(report._id)}
                    className="mt-3 w-full bg-red-100 text-red-700 text-sm font-bold py-2 rounded hover:bg-red-200"
                  >
                    Claim Case
                  </button>
                ) : (
                  <span className="mt-3 block text-center text-xs font-bold text-gray-400">
                    Locked (Other NGO)
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. MAP VIEW (Visible if Desktop OR (Mobile & view='map')) */}
      <div
        className={`
        w-full md:w-2/3 relative h-full
        ${mobileView === "map" ? "block" : "hidden md:block"}
      `}
      >
        <MapContainer
          center={ngoLocation}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <MapInvalidator mobileView={mobileView} />
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={ngoLocation}>
            <Popup>HQ</Popup>
          </Marker>
          {displayedReports.map((report) => (
            <Marker
              key={report._id}
              position={[
                report.location.coordinates[1],
                report.location.coordinates[0],
              ]}
              icon={report.status === "Open" ? redIcon : greenIcon}
            >
              <Popup>
                <div className="min-w-[150px]">
                  <h3 className="font-bold">{report.type}</h3>
                  <p className="text-sm my-1">{report.description}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* MOBILE VIEW */}
      <div className="md:hidden absolute bottom-6 left-1/2 transform -translate-x-1/2 z-[1000]">
        <button
          onClick={() => setMobileView(mobileView === "list" ? "map" : "list")}
          className="bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl font-bold flex items-center gap-2"
        >
          {mobileView === "list" ? <>🗺️ Map</> : <>📋 List</>}
        </button>
      </div>
      {/* 5. RESOLUTION MODAL */}
      {selectedReport && (
        <div className="absolute inset-0 z-[2000] bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Complete Mission
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Upload a photo to prove aid was delivered. This rewards the
              citizen with Karma.
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
                    setSelectedReport(null);
                    setProofFile(null);
                  }}
                  className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700 disabled:opacity-50"
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
