import { useEffect, useState } from "react";
import api from "../../services/api";
import ReportDetailsModal from "../../components/modals/ReportDetailsModal";

const ReportHistoryModal = ({ targetId, type, onClose }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const param =
          type === "reporter" ? `reporterId=${targetId}` : `ngoId=${targetId}`;
        const { data } = await api.get(`/admin/reports?${param}`);
        setReports(data.data);
      } catch (err) {
        console.error("Failed to load history");
      } finally {
        setLoading(false);
      }
    };
    if (targetId) fetchHistory();
  }, [targetId, type]);

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[80vh]">
          <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
            <h3 className="font-bold text-lg text-gray-800">
              {type === "reporter" ? "Report History" : "Mission Log"}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-black text-2xl"
            >
              &times;
            </button>
          </div>

          <div className="p-4 overflow-y-auto flex-1">
            {loading ? (
              <div className="text-center py-10">Loading records...</div>
            ) : reports.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                No records found for this user.
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map((report) => (
                  <div
                    key={report._id}
                    onClick={() => setSelectedReport(report)}
                    className="border rounded-lg p-3 hover:bg-gray-50 transition cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                            report.status === "Resolved"
                              ? "bg-green-100 text-green-700"
                              : report.status === "Claimed"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {report.status}
                        </span>
                        <h4 className="font-bold text-gray-800 mt-1">
                          {report.type}
                        </h4>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                      {report.description}
                    </p>

                    <div className="mt-2 text-xs text-gray-400 flex gap-2">
                      {type === "ngo" && report.status === "Resolved" && (
                        <span className="text-green-600 font-bold">
                          +50 Impact Points Earned
                        </span>
                      )}
                      {type === "reporter" && report.status === "Resolved" && (
                        <span className="text-blue-600 font-bold">
                          Karma Awarded
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 border-t bg-gray-50 text-right">
            <span className="text-xs text-gray-500">
              Total Records: {reports.length}
            </span>
          </div>
        </div>
      </div>

      {selectedReport && (
        <ReportDetailsModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </>
  );
};

export default ReportHistoryModal;
