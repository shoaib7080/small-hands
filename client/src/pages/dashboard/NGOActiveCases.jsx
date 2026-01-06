import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  HiArrowLeft,
  HiLocationMarker,
  HiX,
  HiUpload,
  HiDocument,
} from "react-icons/hi";
import { io } from "socket.io-client";
import api from "../../services/api";
import LoadingOverlay from "../../components/common/LoadingOverlay";
import MapContainer, { MapMarker } from "../../components/map/MapContainer";

const NGOActiveCases = () => {
  const [reports, setReports] = useState([]);
  const [ngoLocation, setNgoLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileView, setMobileView] = useState("list");
  const [filter, setFilter] = useState("all");
  const [userZoom, setUserZoom] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [checkingVerification, setCheckingVerification] = useState(true);

  // Overlay Loading State
  const [isLoadingOverlay, setIsLoadingOverlay] = useState(false);
  const [overlayText, setOverlayText] = useState("Loading...");

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

  // Fetch Reports API
  const fetchNearbyReports = async (lat, lng) => {
    try {
      const { data } = await api.get(
        `/reports/nearby?lat=${lat}&lng=${lng}&radius=10000`
      ); // 10km radius
      // Sort in frontend if needed (Newest First)
      const sorted = data.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setReports(sorted);
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
        setIsLoadingOverlay(true);
        setOverlayText("Fetching Cases...");
        let endpoint = "";
        if (filter === "all") {
          // Fetch Nearby Open Reports
          endpoint = `/reports/nearby?lat=${ngoLocation[0]}&lng=${ngoLocation[1]}&radius=10000`;
        } else {
          // Fetch My Specific Claimed Cases (persists after refresh!)
          endpoint = `/reports/my-cases`;
        }

        const { data } = await api.get(endpoint);
        const sorted = data.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setReports(sorted);
      } catch (err) {
        toast.error("Failed to fetch cases");
      } finally {
        setIsLoadingOverlay(false);
      }
    };
    fetchData();
  }, [ngoLocation, filter]);

  // 3. Claim Handler
  const handleClaim = async (reportId) => {
    try {
      setIsLoadingOverlay(true);
      setOverlayText("Claiming Case...");
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
    } finally {
      setIsLoadingOverlay(false);
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

      // Update report status locally instead of removing
      setReports((prev) =>
        prev.map((r) =>
          r._id === resolveModalId
            ? { ...r, status: "Resolved", resolution_images: [] } // Mark as resolved
            : r
        )
      );
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
    setUserZoom(16);
  };

  const openGoogleMaps = (lat, lng) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    window.open(url, "_blank");
  };

  const displayedReports = reports;

  if (checkingVerification) {
    return <LoadingOverlay isVisible={true} text="Loading..." />;
  }

  if (verificationStatus !== "verified") {
    return (
      <div className="h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-surface p-10 rounded-2xl shadow-xl max-w-lg border border-border">
          <div className="text-6xl mb-4">⏳</div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Verification Pending
          </h1>
          <p className="text-text-secondary text-lg mb-6">
            Thank you for joining <strong>Small Hands</strong>. To ensure the
            safety of our network, an Admin must verify your license documents
            before you can access the Live Console.
          </p>

          <div className="bg-primary-50 p-4 rounded-lg text-left mb-6 border border-primary-200">
            <p className="font-bold text-primary-700 text-sm uppercase mb-1">
              What happens next?
            </p>
            <ul className="list-disc list-inside text-sm text-primary-600 space-y-1">
              <li>Admins review your license number.</li>
              <li>This process usually takes 24-48 hours.</li>
              <li>You will gain access automatically upon approval.</li>
            </ul>
          </div>

          <Link
            to="/dashboard/ngo"
            className="text-primary-600 font-bold hover:underline"
          >
            <HiArrowLeft className="inline w-4 h-4 mr-1" />
            Return to Dashboard Stats
          </Link>
        </div>
      </div>
    );
  }

  if (!ngoLocation)
    return (
      <LoadingOverlay isVisible={true} text="Booting Satellite Uplink..." />
    );

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] bg-background overflow-hidden">
      <LoadingOverlay isVisible={isLoadingOverlay} text={overlayText} />
      {/* HEADER (Mobile) */}
      <div className="md:hidden bg-primary-600 rounded-b-2xl text-white p-4 flex flex-col gap-2 shadow-md z-20 sticky top-0">
        <div className="flex justify-between items-center">
          <Link
            to="/dashboard/ngo"
            className="font-bold flex items-center gap-2"
          >
            <HiArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <span className="font-bold">Live Console</span>
          <div className="w-10"></div>
        </div>
        <div className="flex bg-primary-700 rounded-full p-1 mt-2">
          <button
            onClick={() => setFilter("all")}
            className={`flex-1 py-1 text-sm rounded-full ${
              filter === "all"
                ? "bg-surface text-primary-600 font-bold"
                : "text-primary-100"
            }`}
          >
            Nearby
          </button>
          <button
            onClick={() => setFilter("claimed")}
            className={`flex-1 py-1 text-sm rounded-full ${
              filter === "claimed"
                ? "bg-surface text-primary-600 font-bold"
                : "text-primary-100"
            }`}
          >
            My Cases
          </button>
        </div>
      </div>

      {/* LIST VIEW */}
      <div
        className={`w-full md:w-1/3 bg-surface border-r border-border flex flex-col shadow-lg z-10 h-full ${
          mobileView === "list" ? "flex" : "hidden md:flex"
        }`}
      >
        <div className="hidden md:block p-4 bg-primary-600 rounded-b-2xl text-white sticky top-0 z-10">
          <Link
            to="/dashboard/ngo"
            className="text-xs text-primary-100 hover:text-white mb-2 block flex items-center gap-1"
          >
            <HiArrowLeft className="w-3 h-3" />
            Back to Dashboard
          </Link>
          <div className="flex bg-primary-700 rounded-full p-1 mt-2">
            <button
              onClick={() => setFilter("all")}
              className={`flex-1 py-1 text-sm rounded-full ${
                filter === "all"
                  ? "bg-surface text-primary-600 font-bold"
                  : "text-primary-100"
              }`}
            >
              All Nearby
            </button>
            <button
              onClick={() => setFilter("claimed")}
              className={`flex-1 py-1 text-sm rounded-full ${
                filter === "claimed"
                  ? "bg-surface text-primary-600 font-bold"
                  : "text-primary-100"
              }`}
            >
              My Claimed
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {displayedReports.length === 0 && (
            <p className="text-center py-10 text-text-muted">
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
                onClick={() => setViewingReport(report)}
                onMouseEnter={() => setHighlightedId(report._id)}
                onMouseLeave={() => setHighlightedId(null)}
                className={`p-4 rounded-lg shadow-sm cursor-pointer transition hover:shadow-lg ${
                  isMyClaim ? " bg-green-50" : " bg-surface"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <h3 className="font-bold text-text-primary">
                      {report.type}
                    </h3>
                    {report.status === "Resolved" && (
                      <span className="text-xs bg-success-100 text-success-700 px-2 py-0.5 rounded-full w-fit font-bold mt-1">
                        Resolved
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-text-muted flex flex-col items-end">
                    <span>
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                    <span>
                      {new Date(report.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </span>
                </div>
                <p className="text-sm text-text-secondary mt-1 line-clamp-2">
                  {report.description}
                </p>
                <p className="text-xs text-primary-600 mt-2 font-bold">
                  View Details
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* MAP VIEW */}
      <div
        className={`w-full md:w-2/3 relative h-full ${
          mobileView === "map" ? "h-[calc(100vh-120px)]" : "hidden md:block"
        }`}
      >
        <MapContainer
          center={mapCenter || ngoLocation}
          zoom={userZoom || 13}
          enableSearch={true}
          className="h-full w-full"
          key={mobileView}
          ngoHQ={ngoLocation}
        >
          {/* HQ Marker */}
          {/* {ngoLocation && (
            <MapMarker
              position={ngoLocation}
              type="HQ"
              label="Headquarter"
            ></MapMarker>
          )} */}

          {displayedReports.map((report) => {
            const isHighlighted = report._id === highlightedId;
            const isMine =
              report.claimed_by &&
              (report.claimed_by._id === user.id ||
                report.claimed_by === user.id);

            return (
              <MapMarker
                key={report._id}
                position={[
                  report.location.coordinates[1],
                  report.location.coordinates[0],
                ]}
                type={report.type}
                severity={report.severity}
                status={report.status}
                isHighlighted={isHighlighted}
                isMine={isMine}
              >
                <div className="min-w-[200px] max-w-[280px] p-3 bg-white rounded-lg shadow-lg">
                  {/* Category Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold ${
                        report.severity === "High"
                          ? "bg-error-100 text-error-700"
                          : report.severity === "Critical"
                          ? "bg-error-200 text-error-800"
                          : "bg-warning-100 text-warning-700"
                      }`}
                    >
                      {report.type}
                    </span>
                    {isMine && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">
                        Yours
                      </span>
                    )}
                  </div>

                  {/* Short Description */}
                  <p className="text-sm text-gray-700 mb-2 line-clamp-1">
                    {report.description}
                  </p>

                  {/* Reporting Time */}
                  <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                    <span>🕒</span>
                    {new Date(report.createdAt).toLocaleString([], {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>

                  {/* CTA Button */}
                  <button
                    onClick={() => setViewingReport(report)}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    View Full Details
                    {/* <span>→</span> */}
                  </button>
                </div>
              </MapMarker>
            );
          })}
        </MapContainer>
      </div>

      {/* MOBILE TOGGLE BUTTON */}
      <div className="md:hidden absolute bottom-6 left-1/2 transform -translate-x-1/2 z-[1000]">
        <button
          onClick={() => setMobileView(mobileView === "list" ? "map" : "list")}
          className="bg-text-primary text-surface px-6 py-3 rounded-full shadow-2xl font-bold flex items-center gap-2"
        >
          {mobileView === "list" ? (
            <>
              <HiLocationMarker className="w-4 h-4" />
              View Map
            </>
          ) : (
            <>
              <HiDocument className="w-4 h-4" />
              View List
            </>
          )}
        </button>
      </div>

      {/* VIEW DETAILS MODAL */}
      {viewingReport && (
        <div className="absolute inset-0 z-[2000] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-surface rounded-xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-border">
            {/* Header */}
            <div className="bg-background p-4 border-b border-border flex justify-between items-center">
              <h2 className="text-xl font-bold text-text-primary">
                Report Details
              </h2>
              <button
                onClick={() => setViewingReport(null)}
                className="text-text-secondary hover:text-text-primary"
              >
                <HiX className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                      viewingReport.severity === "High"
                        ? "bg-error-100 text-error-700"
                        : "bg-warning-100 text-warning-700"
                    }`}
                  >
                    {viewingReport.severity} Severity
                  </span>
                  <h1 className="text-2xl font-bold mt-2 text-text-primary">
                    {viewingReport.type}
                  </h1>
                  <p className="text-text-muted text-sm">
                    Reported:{" "}
                    {new Date(viewingReport.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <button
                    onClick={() =>
                      openGoogleMaps(
                        viewingReport.location.coordinates[1],
                        viewingReport.location.coordinates[0]
                      )
                    }
                    className="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded-full text-xs font-bold text-primary-600 transition-colors"
                    title="Open in Google Maps"
                  >
                    <span className="text-xs font-bold">
                      Open in Google Maps
                    </span>
                  </button>

                  <button
                    onClick={() => handleLocate(viewingReport)}
                    className="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded-full text-xs font-bold text-primary-600 transition-colors"
                    title="Locate on Dashboard Map"
                  >
                    <span className="text-xs font-bold">
                      Locate on Dashboard
                    </span>
                  </button>
                </div>
              </div>

              <div className="bg-background p-4 rounded-lg mb-4 border border-border">
                <p className="text-text-primary whitespace-pre-wrap">
                  {viewingReport.description}
                </p>
              </div>

              {/* Contact Info Section */}
              {viewingReport.contact_info && (
                <div className="mb-4">
                  <h3 className="font-bold text-sm text-text-secondary mb-2">
                    CONTACT INFORMATION
                  </h3>
                  <div className="bg-primary-50 p-3 rounded-lg border border-primary-200">
                    {typeof viewingReport.contact_info === "string" ? (
                      <p className="text-primary-700 font-medium">
                        {viewingReport.contact_info}
                      </p>
                    ) : (
                      <div className="space-y-1">
                        {viewingReport.contact_info.phone && (
                          <p className="text-primary-700">
                            📞 {viewingReport.contact_info.phone}
                          </p>
                        )}
                        {viewingReport.contact_info.whatsapp && (
                          <p className="text-primary-700">
                            💬 {viewingReport.contact_info.whatsapp}
                          </p>
                        )}
                        {viewingReport.contact_info.email && (
                          <p className="text-primary-700">
                            ✉️ {viewingReport.contact_info.email}
                          </p>
                        )}
                        {viewingReport.contact_info.contact_person && (
                          <p className="text-primary-700">
                            👤 {viewingReport.contact_info.contact_person}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Images Grid */}
              {viewingReport.images && viewingReport.images.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold text-sm text-text-secondary mb-2">
                    ATTACHED EVIDENCE
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {viewingReport.images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt="Evidence"
                        className="w-full h-32 object-cover rounded-lg border border-border hover:scale-105 transition"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-border bg-background flex gap-3">
              {viewingReport.claimed_by &&
              (viewingReport.claimed_by._id === user.id ||
                viewingReport.claimed_by === user.id) ? (
                <button
                  onClick={() => {
                    setViewingReport(null);
                    setResolveModalId(viewingReport._id);
                  }}
                  className="w-full bg-success-500 hover:bg-success-600 text-white py-3 rounded-lg font-bold shadow transition-colors"
                >
                  ✅ Mark as Resolved
                </button>
              ) : viewingReport.status === "Open" ? (
                <button
                  onClick={() => {
                    handleClaim(viewingReport._id);
                    setViewingReport(null);
                  }}
                  className="w-full bg-error-500 hover:bg-error-600 text-white py-3 rounded-lg font-bold shadow transition-colors"
                >
                  ✋ Claim This Case
                </button>
              ) : (
                <div className="w-full text-center py-3 text-text-muted font-bold bg-background rounded-lg border border-border">
                  Locked (Assigned to other)
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RESOLVE MODAL */}
      {resolveModalId && (
        <div className="absolute inset-0 z-[2000] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-lg p-6 w-full max-w-sm shadow-2xl border border-border">
            <h3 className="text-lg font-bold text-text-primary mb-2">
              Complete Mission
            </h3>
            <p className="text-sm text-text-secondary mb-4">
              Upload a photo to prove aid was delivered.
            </p>
            <form onSubmit={handleResolveSubmit}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProofFile(e.target.files[0])}
                className="w-full border border-border bg-background text-text-primary p-2 rounded mb-4 text-sm"
                required
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setResolveModalId(null);
                    setProofFile(null);
                  }}
                  className="flex-1 py-2 text-text-secondary hover:bg-background rounded border border-border transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 py-2 bg-success-500 hover:bg-success-600 text-white rounded font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    "Uploading..."
                  ) : (
                    <>
                      <HiUpload className="w-4 h-4" />
                      Confirm
                    </>
                  )}
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
