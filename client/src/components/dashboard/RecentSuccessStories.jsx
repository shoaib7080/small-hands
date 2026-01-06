import { useState, useEffect } from "react";
import {
  HiCheckCircle,
  HiX,
  HiStar,
  HiLocationMarker,
  HiCalendar,
  HiLightningBolt,
  HiPhotograph,
} from "react-icons/hi";
import api from "../../services/api";
import { toast } from "react-toastify";
import LoadingOverlay from "../common/LoadingOverlay";

const RecentSuccessStories = () => {
  const [recentCases, setRecentCases] = useState([]);
  const [viewingSuccess, setViewingSuccess] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const { data } = await api.get("/reports/recent-resolved");
        setRecentCases(data.data || []);
      } catch (err) {
        console.error("Failed to load success stories");
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    return "Recently";
  };

  if (loading) return <LoadingOverlay text="Loading stories..." />;

  return (
    <>
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-border p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-text-primary mb-3 sm:mb-6 flex items-center gap-2">
          Recently Resolved Cases
        </h2>

        {recentCases.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {recentCases.map((case_item) => (
              <div
                key={case_item._id}
                className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setViewingSuccess(case_item)}
              >
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-success-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <HiCheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-success-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base text-text-primary mb-1">
                    {case_item.type} Assistance
                  </h3>
                  <p className="text-text-secondary text-xs sm:text-sm mb-1 sm:mb-2 line-clamp-2">
                    {case_item.description}
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-text-muted">
                    <span>
                      Reported by{" "}
                      {case_item.reporter_id?.name || "a Community Member"}
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span>Resolved {formatTimeAgo(case_item.updatedAt)}</span>
                  </div>
                </div>
                {case_item.resolution_images &&
                  case_item.resolution_images.length > 0 && (
                    <img
                      src={case_item.resolution_images[0]}
                      alt="Resolution proof"
                      className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 sm:py-8 text-text-muted">
            <HiPhotograph className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4 text-gray-400" />
            <p className="text-sm sm:text-base">No success stories yet</p>
          </div>
        )}
        {/* SUCCESS STORY MODAL */}
        {viewingSuccess && (
          <div className="fixed inset-0 z-[2000] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-surface rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
              {/* Modal Header */}
              <div className="bg-primary-600 text-white p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 z-50">
                  <button
                    onClick={() => setViewingSuccess(null)}
                    className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors text-white"
                  >
                    <HiX className="w-6 h-6" />
                  </button>
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 text-success-100 font-bold text-sm uppercase mb-2">
                    Help Successfully Delivered
                  </div>
                  <h2 className="text-xl lg:text-3xl font-bold">
                    Excellent work by {viewingSuccess.claimed_by?.name}
                  </h2>
                </div>
                {/* Decorative Pattern */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl z-0"></div>
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl z-0"></div>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto">
                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <h3 className="text-sm font-bold text-text-secondary uppercase mb-3 flex items-center gap-2">
                      <HiLocationMarker className="w-4 h-4" />
                      Mission Details
                    </h3>
                    <div className="bg-background rounded-xl p-4 border border-border">
                      <p className="font-bold text-lg text-text-primary mb-1">
                        {viewingSuccess.type}
                      </p>
                      <p className="text-text-secondary text-sm mb-3">
                        {viewingSuccess.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-text-muted border-t border-border pt-3">
                        <HiCalendar className="w-4 h-4" />
                        Reported:{" "}
                        {new Date(
                          viewingSuccess.createdAt
                        ).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-text-secondary uppercase mb-3 flex items-center gap-2">
                      <HiStar className="w-4 h-4" />
                      Impact Report
                    </h3>
                    <div className="bg-background rounded-xl p-4 border border-border space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-text-secondary">
                          Status
                        </span>
                        <span className="px-3 py-1 bg-success-100 text-success-700 rounded-full text-xs font-bold">
                          Resolved
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-text-secondary">
                          Responder
                        </span>
                        <span className="font-medium text-text-primary">
                          {viewingSuccess.claimed_by?.name}
                        </span>
                      </div>
                      {viewingSuccess.severity && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-text-secondary">
                            Severity
                          </span>
                          <span className="font-medium text-text-primary">
                            {viewingSuccess.severity}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Evidence Section */}
                <div>
                  <h3 className="text-sm font-bold text-text-secondary uppercase mb-4 flex items-center gap-2">
                    <HiPhotograph className="w-4 h-4" />
                    Visual Evidence
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Before Images */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-text-secondary uppercase text-center">
                        Initial Report
                      </p>
                      {viewingSuccess.images &&
                      viewingSuccess.images.length > 0 ? (
                        viewingSuccess.images.map((img, i) => (
                          <img
                            key={`before-${i}`}
                            src={img}
                            alt="Report Evidence"
                            className="w-full h-40 sm:h-48 object-cover rounded-lg border border-border shadow-sm"
                          />
                        ))
                      ) : (
                        <div className="w-full h-40 sm:h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-text-muted">
                          <HiPhotograph className="w-8 h-8 mb-2 text-gray-400" />
                          <span className="text-sm">
                            No initial images received
                          </span>
                        </div>
                      )}
                    </div>

                    {/* After Images */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-text-secondary uppercase text-center">
                        Resolution Proof
                      </p>
                      {viewingSuccess.resolution_images &&
                      viewingSuccess.resolution_images.length > 0 ? (
                        viewingSuccess.resolution_images.map((img, i) => (
                          <img
                            key={`after-${i}`}
                            src={img}
                            alt="Resolution Proof"
                            className="w-full h-40 sm:h-48 object-cover rounded-lg border border-border shadow-sm"
                          />
                        ))
                      ) : (
                        <div className="w-full h-40 sm:h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-text-muted">
                          <HiPhotograph className="w-8 h-8 mb-2 text-gray-400" />
                          <span className="text-sm">No resolution image</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default RecentSuccessStories;
