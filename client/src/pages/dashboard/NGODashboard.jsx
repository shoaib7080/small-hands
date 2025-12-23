import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  HiUsers,
  HiStar,
  HiTrendingUp,
  HiCheckCircle,
  HiLightningBolt,
  HiX,
  HiLocationMarker,
  HiPhotograph,
  HiCalendar,
} from "react-icons/hi";
import api from "../../services/api";
import StatCard from "../../components/dashboard/StatCard";
import LoadingOverlay from "../../components/common/LoadingOverlay";
import { toast } from "react-toastify";

const NGODashboard = () => {
  const [user, setUser] = useState({});
  const [recentCases, setRecentCases] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewingSuccess, setViewingSuccess] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userResponse, caseResponse] = await Promise.all([
          api.get("/auth/me"),
          api.get("/reports/recent-resolved"),
        ]);

        setUser(userResponse.data.data);
        setRecentCases(caseResponse.data.data || []);
      } catch (err) {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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

  if (loading)
    return <LoadingOverlay isVisible={true} text="Loading dashboard..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Mission Control
          </h1>
          <p className="text-text-secondary">
            Welcome back,{" "}
            <span className="font-semibold text-primary-600">{user.name}</span>
          </p>
        </div>
        <Link
          to="/dashboard/ngo/live"
          className="bg-error-500 hover:bg-error-600 text-white px-6 py-3 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>
          Launch Live Console
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <StatCard
          title="Lives Impacted"
          value={user.cases_resolved || 0}
          color="bg-success-500"
        />
        <StatCard
          title="Impact Score"
          value={user.impact_score || 0}
          color="bg-warning-500"
        />
        <StatCard
          title="Missions Accepted"
          value={user.cases_claimed || 0}
          color="bg-primary-500"
        />
      </div>

      {/* Recent History / Tips Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface p-6 rounded-xl shadow-sm border border-border">
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

        <div className="bg-primary-600 text-white p-6 rounded-xl shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <HiLightningBolt className="w-6 h-6" />
            <h3 className="font-bold text-xl">Did you know?</h3>
          </div>
          <p className="opacity-90 mb-4">
            You gain +20 Impact Points for every verified resolution. Keep your
            "Verified" badge by maintaining a 4.5+ rating.
          </p>
          <button className="bg-white text-primary-600 font-medium py-2 px-4 rounded self-start hover:bg-gray-100 transition-colors">
            View Guidelines
          </button>
        </div>
      </div>

      {/* SUCCESS STORY MODAL */}
      {viewingSuccess && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
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
                  console.log("Closing modal");
                }}
                className="px-6 py-2 bg-text-primary text-white rounded-lg font-bold hover:bg-gray-800 transition-colors"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NGODashboard;
