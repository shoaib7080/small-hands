import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  HiPlus,
  HiTrendingUp,
  HiDocumentText,
  HiCheckCircle,
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

const ReporterDashboard = () => {
  const [user, setUser] = useState({});
  const [myReports, setMyReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: userData } = await api.get("/auth/me");
        setUser(userData.data);

        localStorage.setItem("user", JSON.stringify(userData.data));

        // (Optional) Fetch history if you want list
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
    <div className="p-4 md:py-6 md:px-24 lg:px-36 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Hello, {user.name}
          </h1>
          <p className="text-text-secondary">Here is your impact summary.</p>
        </div>
        <Link
          to="/dashboard/reporter/create"
          className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2"
        >
          <HiPlus className="w-5 h-5" />
          Create New Report
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <StatCard
          title="Karma Points"
          value={user.karma_points || 0}
          color="bg-warning-500"
        />
        <StatCard
          title="Reports Posted"
          value={user.reports_posted || 0}
          color="bg-primary-500"
        />
        <StatCard
          title="Verified Solutions"
          value={user.reports_resolved || 0}
          color="bg-success-500"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-surface rounded-xl shadow-sm p-6 border border-border">
        <h3 className="text-lg font-bold text-text-primary mb-4">
          Your Recent Reports
        </h3>

        {myReports.length === 0 ? (
          <div className="text-center py-10 text-text-muted">
            <HiDocumentText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>You haven't submitted any reports yet.</p>
            <p className="text-sm">Spot a need? Click the button above!</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {myReports.map((report) => (
              <li
                key={report._id}
                className="py-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-bold text-text-primary">{report.type}</p>
                  <p className="text-sm text-text-muted">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    report.status === "Resolved"
                      ? "bg-success-100 text-success-700"
                      : "bg-warning-100 text-warning-700"
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
