import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  HiUsers,
  HiStar,
  HiTrendingUp,
  HiCheckCircle,
  HiLightningBolt,
} from "react-icons/hi";
import api from "../../services/api";

const StatCard = ({ title, value, subtext, color }) => (
  <div className="bg-surface p-4 md:p-6 rounded-xl shadow-sm border border-border">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-text-secondary text-sm font-medium uppercase tracking-wide">
        {title}
      </h3>
      <span className={`w-3 h-3 rounded-full ${color}`}></span>
    </div>
    <div className="space-y-1">
      <span className="text-3xl md:text-4xl font-bold text-text-primary block">
        {value}
      </span>
      {subtext && (
        <span className="text-xs text-text-muted block">{subtext}</span>
      )}
    </div>
  </div>
);

const NGODashboard = () => {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/auth/me");
        setUser(data.data);
      } catch (err) {
        console.error("Failed to load stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
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
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-success-100 rounded-full flex items-center justify-center">
                <HiCheckCircle className="w-6 h-6 text-success-600" />
              </div>
              <div>
                <p className="font-bold text-text-primary">
                  Food Distribution - Block A
                </p>
                <p className="text-xs text-text-muted">Resolved 2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-success-100 rounded-full flex items-center justify-center">
                <HiCheckCircle className="w-6 h-6 text-success-600" />
              </div>
              <div>
                <p className="font-bold text-text-primary">
                  Medical Kit - Sector 4
                </p>
                <p className="text-xs text-text-muted">Resolved Yesterday</p>
              </div>
            </div>
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
    </div>
  );
};

export default NGODashboard;
