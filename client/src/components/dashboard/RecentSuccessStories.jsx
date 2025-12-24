import { useState, useEffect } from "react";
import { HiCheckCircle, HiX, HiStar, HiLocationMarker, HiCalendar, HiLightningBolt, HiPhotograph } from "react-icons/hi";
import api from "../../services/api";
import { toast } from "react-toastify";

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

  if (loading) return <div className="p-4 text-center text-text-muted">Loading stories...</div>;

  return (
    <>
      <div className="bg-surface p-6 rounded-xl shadow-sm border border-border h-full">
        <h3 className="font-bold text-text-primary mb-4 pb-2 border-b border-border">
          Recent Success Stories
        </h3>

        <div className="space-y-4">
          {recentCases.length > 0 ? (
            recentCases.map((case_item) => (
              <button
                key={case_item._id}
                onClick={() => setViewingSuccess(case_item)}
                className="w-full flex items-center gap-4 p-2 hover:bg-gray-50 rounded-lg transition-colors text-left group"
              >
                <div className="h-10 w-10 min-w-[2.5rem] bg-success-100 rounded-full flex items-center justify-center group-hover:bg-success-200 transition-colors">
                  <HiCheckCircle className="w-6 h-6 text-success-600" />
                </div>
                <div>
                  <p className="font-bold text-text-primary group-hover:text-primary-600 transition-colors">
                    {case_item.type}
                  </p>
                  <p className="text-sm text-text-secondary line-clamp-1 mb-0.5">
                    {case_item.description}
                  </p>
                  <p className="text-xs text-text-muted">
                    Resolved by {case_item.claimed_by?.name || "Unknown"} •{" "}
                    {formatTimeAgo(case_item.updatedAt)}
                  </p>
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-4 text-text-muted">
              <p>No resolved cases yet</p>
              <p className="text-xs">Start helping to see your impact!</p>
            </div>
          )}
        </div>
      </div>

      {/* SUCCESS STORY MODAL */}
      {viewingSuccess && (
        <div className="fixed inset-0 z-[2000] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-surface rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="bg-primary-600 text-white p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 z-50">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewingSuccess(null);
                  }}
                  className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors text-white"
                >
                  <HiX className="w-6 h-6" />
                </button>
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-success-100 font-bold text-sm uppercase mb-2">
                  <HiStar className="w-5 h-5" />
                  Mission Accomplished
                </div>
                <h2 className="text-3xl font-bold">Excellent Work!</h2>
                <p className="text-success-100 mt-1">
                  Review the details of this successful operation.
                </p>
              </div>
              {/* Decorative Pattern */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
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
                      {new Date(viewingSuccess.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-text-secondary uppercase mb-3 flex items-center gap-2">
                    <HiLightningBolt className="w-4 h-4" />
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
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-text-secondary">
                        Karma Earned
                      </span>
                      <span className="font-bold text-primary-600">
                        +20 Points
                      </span>
                    </div>
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
                        <span className="text-sm">No initial image</span>
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

            {/* Footer */}
            <div className="bg-background p-4 border-t border-border flex justify-end">
              <button
                onClick={(e) => {
                  setViewingSuccess(null);
                }}
                className="px-6 py-2 bg-text-primary text-white rounded-lg font-bold hover:bg-gray-800 transition-colors"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RecentSuccessStories;
