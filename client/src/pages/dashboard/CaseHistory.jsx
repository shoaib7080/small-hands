import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { HiArrowLeft, HiDocumentText } from "react-icons/hi";
import api from "../../services/api";
import LoadingOverlay from "../../components/common/LoadingOverlay";
import ReportDetailsModal from "../../components/modals/ReportDetailsModal";

const CaseHistory = () => {
  const location = useLocation();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const isNGO = user?.role === "ngo";

  const searchParams = new URLSearchParams(location.search);
  const filter = searchParams.get("filter");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        let endpoint = isNGO
          ? "/reports/my-recent-resolved"
          : "/reports/my-reports";
        const { data } = await api.get(endpoint);
        let allReports = data.data || [];

        if (!isNGO && filter === "resolved") {
          allReports = allReports.filter(
            (report) => report.status === "Resolved"
          );
        }

        setReports(allReports);
      } catch (err) {
        console.error("Failed to load history");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [filter, isNGO]);

  if (loading)
    return <LoadingOverlay isVisible={true} text="Loading history..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to={isNGO ? "/dashboard/ngo" : "/dashboard/reporter"}
          className="text-text-secondary hover:text-text-primary"
        >
          <HiArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-2xl font-bold text-text-primary">
          {isNGO ? "My Resolved Cases" : "My Report History"}
        </h1>
      </div>

      <div className="bg-surface rounded-xl shadow-sm p-6 border border-border">
        {reports.length === 0 ? (
          <div className="text-center py-10 text-text-muted">
            <HiDocumentText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nothing to show.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((report) => (
              <button
                key={report._id}
                onClick={() => setSelectedReport(report)}
                className="p-4 rounded-lg border border-border hover:bg-background cursor-pointer transition-colors text-left flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                      report.status === "Resolved"
                        ? "bg-success-100 text-success-700"
                        : report.status === "Claimed"
                        ? "bg-primary-100 text-primary-700"
                        : "bg-warning-100 text-warning-700"
                    }`}
                  >
                    {report.status}
                  </span>
                  <span className="text-xs text-text-muted">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-bold text-text-primary mb-1">
                  {report.type}
                </h3>
                <p className="text-sm text-text-secondary line-clamp-3 mb-4 flex-grow">
                  {report.description}
                </p>
                <div className="text-xs text-text-muted pt-3 border-t border-border mt-auto">
                  Severity:{" "}
                  <span className="font-medium">{report.severity}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <ReportDetailsModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
      />
    </div>
  );
};

export default CaseHistory;
