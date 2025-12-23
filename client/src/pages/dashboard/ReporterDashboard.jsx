import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HiPlus, HiDocumentText } from "react-icons/hi"; // Removed unused icons
import { toast } from "react-toastify"; // Import Toast
import api from "../../services/api";
import LoadingOverlay from "../../components/common/LoadingOverlay";
import StatCard from "../../components/dashboard/StatCard";
import ReportModal from "../../components/dashboard/ReportModal";




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
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // useEffect(() => {
  //   const fetchStats = async () => {
  //     try {
  //       const { data: userData } = await api.get("/auth/me");
  //       console.log("Fetched user stats:", userData.data);
  //       setUser(userData.data);

  //       localStorage.setItem("user", JSON.stringify(userData.data));

  //       // (Optional) Fetch history if you want list
  //       // const { data: reports } = await api.get('/reports/my-history');
  //       // setMyReports(reports.data);
  //     } catch (err) {
  //       console.error("Failed to load stats");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchStats();
  // }, []);

  const handleReportClick = (report) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  if (loading)
    return <LoadingOverlay isVisible={true} text="Loading dashboard..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
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
              <button
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
              </button>
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
