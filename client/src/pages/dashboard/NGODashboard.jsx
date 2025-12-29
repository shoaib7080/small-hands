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
import RecentSuccessStories from "../../components/dashboard/RecentSuccessStories"; // Import

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
        {/* Success Stories using Reusable Component */}
        <RecentSuccessStories />

        <div className="bg-primary-600 text-white p-6 rounded-xl shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <HiLightningBolt className="w-6 h-6" />
            <h3 className="font-bold text-xl">Did you know?</h3>
          </div>
          <p className="opacity-90 mb-4">
            You gain +20 Impact Points for every verified resolution. Higher
            your resolve rate, greater your impact!
          </p>
          <Link
            to={"/leaderboard"}
            className="bg-white text-primary-600 font-medium py-2 px-4 rounded self-start hover:bg-gray-100 transition-colors"
          >
            View Leaderboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NGODashboard;
