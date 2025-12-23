import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { HiArrowRight } from "react-icons/hi";
import api from "../../services/api";

const StatCard = ({ title, value, subtext, color, icon }) => (
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

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/admin/stats");
        setStats(data.data);
      } catch (err) {
        toast.error("Failed to load system stats.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading)
    return (
      <div className="p-10 text-center text-gray-500">Scanning Database...</div>
    );
  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* 1. Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          title="Total NGOs"
          value={stats.ngos.total}
          subtext={`${stats.ngos.pending} Pending`}
          color="bg-primary-500"
        />
        <StatCard
          title="Citizen Reporters"
          value={stats.reporters.total}
          color="bg-accent-500"
        />
        <StatCard
          title="Total Incidents"
          value={stats.reports.total}
          color="bg-warning-500"
        />
        <StatCard
          title="Resolved Cases"
          value={stats.reports.resolved}
          subtext={`${(
            (stats.reports.resolved / (stats.reports.total || 1)) *
            100
          ).toFixed(0)}% Success Rate`}
          color="bg-success-500"
        />
      </div>

      {/* 2. Visual Alert for Pending Approvals */}
      {stats.ngos.pending > 0 && (
        <a
          href="/admin/ngos"
          className="block bg-yellow-50 border border-yellow-200 p-4 rounded-xl hover:bg-yellow-100 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl"></span>
              <div>
                <h3 className="text-base font-bold text-yellow-800">
                  Pending Verification Requests
                </h3>
                <p className="text-sm text-yellow-700">
                  Organizations waiting for approval
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-yellow-500 text-white text-sm font-bold px-2 py-1 rounded-full min-w-[24px] text-center">
                {stats.ngos.pending}
              </span>
              <div className="flex items-center gap-1 text-yellow-600 text-sm font-medium">
                Review <HiArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </a>
      )}
    </div>
  );
};

export default AdminDashboard;
