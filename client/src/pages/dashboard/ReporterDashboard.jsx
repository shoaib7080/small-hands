import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";

const StatCard = ({ label, value, color }) => (
  <div className={`bg-white p-6 rounded-xl shadow-sm border-l-4 ${color}`}>
    <p className="text-gray-500 text-sm font-semibold uppercase">{label}</p>
    <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
  </div>
);

const ReporterDashboard = () => {
  const [user, setUser] = useState({});
  const [myReports, setMyReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // 1. Fetch FRESH user stats
        const { data: userData } = await api.get("/auth/me");
        setUser(userData.data);

        // 2. Update LocalStorage (Optional, keeps it roughly synced)
        localStorage.setItem("user", JSON.stringify(userData.data));

        // 3. (Optional) Fetch history if you want list
        // const { data: reports } = await api.get('/reports/my-history');
        // setMyReports(reports.data);
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
      {/* 1. Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Hello, {user.name} 👋
          </h1>
          <p className="text-gray-500">Here is your impact summary.</p>
        </div>
        <Link
          to="/dashboard/reporter/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition transform hover:scale-105"
        >
          + Create New Report
        </Link>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          label="Karma Points"
          value={user.karma_points || 0}
          color="border-yellow-500"
        />
        <StatCard
          label="Reports Posted"
          value={user.reports_posted || 0}
          color="border-blue-500"
        />
        <StatCard
          label="Verified Solutions"
          value={user.reports_resolved || 0}
          color="border-green-500"
        />
      </div>

      {/* 3. Recent Activity List */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Your Recent Reports
        </h3>

        {myReports.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p>You haven't submitted any reports yet.</p>
            <p className="text-sm">Spot a need? Click the button above!</p>
          </div>
        ) : (
          <ul className="divide-y">
            {myReports.map((report) => (
              <li key={report._id} className="py-4 flex justify-between">
                <div>
                  <p className="font-bold">{report.type}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    report.status === "Resolved"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {report.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ReporterDashboard;
