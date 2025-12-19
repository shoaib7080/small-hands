import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  HiPlus,
  HiDocumentText,
  HiCheckCircle,
  HiClock,
  HiX,
  HiLocationMarker,
  HiCalendar,
} from "react-icons/hi";
import api from "../../services/api";
import LoadingOverlay from "../../components/common/LoadingOverlay";

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

const ReportModal = ({ report, isOpen, onClose }) => {
  if (!isOpen || !report) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case "Open":
        return "bg-warning-100 text-warning-700";
      case "Claimed":
        return "bg-primary-100 text-primary-700";
      case "Resolved":
        return "bg-success-100 text-success-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Open":
        return <HiClock className="w-4 h-4" />;
      case "Claimed":
        return <HiDocumentText className="w-4 h-4" />;
      case "Resolved":
        return <HiCheckCircle className="w-4 h-4" />;
      default:
        return <HiClock className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold text-text-primary">
              {report.type} Request
            </h2>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary p-1"
            >
              <HiX className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {getStatusIcon(report.status)}
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  report.status
                )}`}
              >
                {report.status}
              </span>
              <span className="text-sm text-text-muted capitalize">
                {report.severity} Priority
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-text-secondary">
                <HiCalendar className="w-4 h-4" />
                <span className="text-sm">
                  {new Date(report.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-text-secondary">
                <HiLocationMarker className="w-4 h-4" />
                <span className="text-sm">
                  {report.location?.coordinates?.[1]?.toFixed(4)},{" "}
                  {report.location?.coordinates?.[0]?.toFixed(4)}
                </span>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-text-primary mb-2">
                Description
              </h3>
              <p className="text-text-secondary">{report.description}</p>
            </div>

            {report.claimed_by && (
              <div>
                <h3 className="font-medium text-text-primary mb-2">
                  Handled By
                </h3>
                <p className="text-text-secondary">{report.claimed_by.name}</p>
              </div>
            )}

            {report.images && report.images.length > 0 && (
              <div>
                <h3 className="font-medium text-text-primary mb-2">
                  Evidence Photos
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {report.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Evidence ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}

            {report.resolution_images &&
              report.resolution_images.length > 0 && (
                <div>
                  <h3 className="font-medium text-text-primary mb-2">
                    Resolution Photos
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {report.resolution_images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Resolution ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ReporterDashboard = () => {
  const [user, setUser] = useState({});
  const [myReports, setMyReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userData, reportsData] = await Promise.all([
          api.get("/auth/me"),
          api.get("/reports/my-reports"),
        ]);

        setUser(userData.data.data);
        setMyReports(reportsData.data.data);
        localStorage.setItem("user", JSON.stringify(userData.data.data));
      } catch (err) {
        console.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

  const handleReportClick = (report) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  if (loading)
    return <LoadingOverlay isVisible={true} text="Loading dashboard..." />;

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
          <div className="space-y-3">
            {myReports.map((report) => (
              <div
                key={report._id}
                onClick={() => handleReportClick(report)}
                className="p-4 rounded-lg border border-border hover:bg-background cursor-pointer transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-text-primary">
                        {report.type}
                      </h4>
                      <span className="text-xs text-text-muted capitalize">
                        {report.severity}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary line-clamp-2">
                      {report.description}
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      report.status === "Resolved"
                        ? "bg-success-100 text-success-700"
                        : report.status === "Claimed"
                        ? "bg-primary-100 text-primary-700"
                        : "bg-warning-100 text-warning-700"
                    }`}
                  >
                    {report.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ReportModal
        report={selectedReport}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
};

export default ReporterDashboard;
