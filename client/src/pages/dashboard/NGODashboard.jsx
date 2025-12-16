import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";

const StatCard = ({ label, value, color, icon }) => (
  <div
    className={`bg-white p-6 rounded-xl shadow-sm border-l-4 ${color} transform transition hover:scale-105`}
  >
    <div className="flex justify-between items-center">
      <div>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">
          {label}
        </p>
        <p className="text-3xl font-extrabold text-gray-800 mt-2">{value}</p>
      </div>
      <div className="text-3xl opacity-20">{icon}</div>
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
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Mission Control 🌍
          </h1>
          <p className="text-gray-500 mt-1">
            Welcome back,{" "}
            <span className="font-semibold text-blue-600">{user.name}</span>.
          </p>
        </div>

        {/* The "Action" Button */}
        <Link
          to="/dashboard/ngo/live"
          className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold shadow-lg flex items-center justify-center gap-2 transition-all"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>
          Launch Live Console
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          label="Lives Impacted"
          value={user.cases_resolved || 0}
          color="border-green-500"
          icon="🙌"
        />
        <StatCard
          label="Impact Score"
          value={user.impact_score || 0}
          color="border-yellow-500"
          icon="⭐"
        />
        <StatCard
          label="Missions Accepted"
          value={user.cases_claimed || 0}
          color="border-blue-500"
          icon="📈"
        />
      </div>

      {/* Recent History / Tips Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">
            Recent Success Stories
          </h3>
          <div className="space-y-4">
            {/* Mock Data */}
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
                ✓
              </div>
              <div>
                <p className="font-bold text-gray-800">
                  Food Distribution - Block A
                </p>
                <p className="text-xs text-gray-500">Resolved 2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
                ✓
              </div>
              <div>
                <p className="font-bold text-gray-800">
                  Medical Kit - Sector 4
                </p>
                <p className="text-xs text-gray-500">Resolved Yesterday</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-900 text-white p-6 rounded-xl shadow-sm flex flex-col justify-center">
          <h3 className="font-bold text-xl mb-2">Did you know?</h3>
          <p className="opacity-90 mb-4">
            You gain +20 Impact Points for every verified resolution. Keep your
            "Verified" badge by maintaining a 4.5+ rating.
          </p>
          <button className="bg-white text-blue-900 font-bold py-2 px-4 rounded self-start hover:bg-gray-100">
            View Guidelines
          </button>
        </div>
      </div>
    </div>
  );
};

export default NGODashboard;
