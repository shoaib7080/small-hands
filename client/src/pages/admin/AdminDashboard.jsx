import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../services/api";

const StatCard = ({ title, value, subtext, color }) => (
  <div className={`bg-white p-6 rounded-xl shadow-sm border-l-4 ${color}`}>
    <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider">
      {title}
    </h3>
    <div className="flex items-end gap-2 mt-2">
      <span className="text-4xl font-extrabold text-gray-800">{value}</span>
      {subtext && <span className="text-sm text-gray-500 mb-1">{subtext}</span>}
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total NGOs"
          value={stats.ngos.total}
          subtext={`${stats.ngos.pending} Pending`}
          color="border-blue-500"
        />
        <StatCard
          title="Citizen Reporters"
          value={stats.reporters.total}
          color="border-purple-500"
        />
        <StatCard
          title="Total Incidents"
          value={stats.reports.total}
          color="border-red-500"
        />
        <StatCard
          title="Resolved Cases"
          value={stats.reports.resolved}
          subtext={`${(
            (stats.reports.resolved / (stats.reports.total || 1)) *
            100
          ).toFixed(0)}% Success Rate`}
          color="border-green-500"
        />
      </div>

      {/* 2. Visual Alert for Pending Approvals */}
      {stats.ngos.pending > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-xl flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-3xl">⚠️</span>
            <div>
              <h3 className="text-lg font-bold text-yellow-800">
                Pending Verification Requests
              </h3>
              <p className="text-yellow-700">
                There are {stats.ngos.pending} organizations waiting for your
                approval.
              </p>
            </div>
          </div>
          <a
            href="/admin/ngos"
            className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-6 rounded-lg shadow-sm"
          >
            Review Now
          </a>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
