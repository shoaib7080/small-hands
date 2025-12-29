import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { HiPlus, HiDocumentText, HiCheckCircle, HiStar } from "react-icons/hi"; // Removed unused icons
import { toast } from "react-toastify"; // Import Toast
import api from "../../services/api";
import LoadingOverlay from "../../components/common/LoadingOverlay";
import StatCard from "../../components/dashboard/StatCard";
import ReportModal from "../../components/dashboard/ReportModal";
import RecentSuccessStories from "../../components/dashboard/RecentSuccessStories";

const ReporterDashboard = () => {
  const navigate = useNavigate();
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

  const handleReportsPostedClick = () => {
    if (myReports.length > 0) {
      setSelectedReport(myReports[0]);
      setShowModal(true);
    } else {
      toast.info("No reports posted yet");
    }
  };

  const reporterHistory = () => {
    navigate("/dashboard/reporter/history");
  };

  const handleReportsResolvedClick = () => {
    navigate("/dashboard/reporter/history?filter=resolved");
  };

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
          <p className="text-text-secondary">
            Here’s how your reports are helping the community.
          </p>
        </div>
        <div className="flex flex-col t sm:items-center mt-6 gap-1 w-full md:w-auto">
          <Link
            to="/dashboard/reporter/create"
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium shadow-sm transition-colors flex items-center text-center gap-2 w-full sm:w-auto justify-center"
          >
            <HiPlus className="w-5 h-5" />
            Report someone in need
          </Link>
          <span className="text-xs text-text-muted">
            Your report is shared only with verified NGOs nearby.
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <StatCard
          title="Karma Points"
          value={user.karma_points || 0}
          color="bg-warning-500"
          icon={HiStar}
        />
        <StatCard
          title="Reports Posted"
          value={user.reports_posted || 0}
          color="bg-primary-500"
          onClick={reporterHistory}
          icon={HiDocumentText}
        />
        <StatCard
          title="Reports Resolved"
          value={user.reports_resolved || 0}
          color="bg-success-500"
          icon={HiCheckCircle}
          onClick={handleReportsResolvedClick}
        />
      </div>

      {/* Recent Success Stories */}
      <div>
        <RecentSuccessStories />
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
