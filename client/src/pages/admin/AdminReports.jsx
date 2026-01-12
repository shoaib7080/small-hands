import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { HiX, HiLocationMarker, HiSearch } from "react-icons/hi";
import api from "../../services/api";
import { reverseGeocode } from "../../utils/geocode";
import ReportDetailsModal from "../../components/modals/ReportDetailsModal";

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    type: "",
    severity: "",
    flagged: "",
    search: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportAddress, setReportAddress] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const params = new URLSearchParams();
        if (filters.status) params.append("status", filters.status);
        if (filters.type) params.append("type", filters.type);
        if (filters.severity) params.append("severity", filters.severity);
        if (filters.flagged) params.append("flagged", filters.flagged);
        if (filters.search) params.append("search", filters.search);
        params.append("page", pagination.page);
        params.append("limit", pagination.limit);

        const { data } = await api.get(`/admin/reports?${params}`);
        setReports(data.data);
        setPagination((prev) => ({
          ...prev,
          total: data.total,
          totalPages: data.totalPages,
        }));
      } catch (err) {
        toast.error("Failed to load reports");
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [filters, pagination.page]);

  useEffect(() => {
    if (selectedReport?.location?.coordinates) {
      const [lng, lat] = selectedReport.location.coordinates;
      reverseGeocode(lat, lng).then(setReportAddress);
    }
  }, [selectedReport]);

  const handleUnflag = async (id) => {
    try {
      await api.patch(`/admin/reports/${id}/unflag`);
      toast.success("Report unflagged");
      setReports((prev) =>
        prev.map((r) =>
          r._id === id ? { ...r, isFlagged: false, flagReason: "" } : r
        )
      );
    } catch (err) {
      toast.error("Action failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this report permanently?")) return;
    try {
      await api.delete(`/admin/reports/${id}`);
      toast.success("Report Deleted");
      setReports((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      toast.error("Action failed");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ ...filters, search: searchInput });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const StatusBadge = ({ status }) => {
    const colors = {
      Open: "bg-red-100 text-red-700",
      Claimed: "bg-yellow-100 text-yellow-800",
      Resolved: "bg-green-100 text-green-700",
    };
    return (
      <span
        className={`px-2 py-1 rounded text-xs font-bold uppercase ${
          colors[status] || "bg-gray-100"
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl shadow-sm space-y-4">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 relative">
            <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, description or contact info..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
          >
            Search
          </button>
        </form>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={filters.status}
            onChange={(e) => {
              setFilters({ ...filters, status: e.target.value });
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="border p-2 rounded-lg"
          >
            <option value="">All Status</option>
            <option value="Open">Open</option>
            <option value="Claimed">Claimed</option>
            <option value="Resolved">Resolved</option>
          </select>
          <select
            value={filters.type}
            onChange={(e) => {
              setFilters({ ...filters, type: e.target.value });
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="border p-2 rounded-lg"
          >
            <option value="">All Types</option>
            <option value="Food">Food</option>
            <option value="Medical">Medical</option>
            <option value="Shelter">Shelter</option>
            <option value="Clothes">Clothes</option>
            <option value="Other">Other</option>
          </select>
          <select
            value={filters.severity}
            onChange={(e) => {
              setFilters({ ...filters, severity: e.target.value });
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="border p-2 rounded-lg"
          >
            <option value="">All Severity</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
          <select
            value={filters.flagged}
            onChange={(e) => {
              setFilters({ ...filters, flagged: e.target.value });
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="border p-2 rounded-lg"
          >
            <option value="">All Reports</option>
            <option value="true">Flagged Only</option>
          </select>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500">
            Loading Global Incidents...
          </div>
        ) : (
          <>
            {/* 🖥️ DESKTOP VIEW */}
            <table className="hidden md:table w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b">
                  <th className="p-4">Type</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Posted By</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {reports.map((report) => (
                  <tr
                    key={report._id}
                    onClick={() => setSelectedReport(report)}
                    className={`hover:bg-gray-50 cursor-pointer ${
                      report.isFlagged ? "bg-red-50" : ""
                    }`}
                  >
                    <td className="p-4 font-bold text-gray-800">
                      {report.type}
                    </td>
                    <td className="p-4 max-w-xs text-sm text-gray-600 truncate">
                      {report.description}
                      {report.isFlagged && (
                        <p className="text-xs text-red-600 mt-1">
                          ⚠️ Flagged: {report.flagReason}
                        </p>
                      )}
                    </td>
                    <td className="p-4 text-sm">
                      <p className="font-medium">
                        {report.reporter_id?.name || "Unknown"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {report.reporter_id?.phone}
                      </p>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={report.status} />
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {report.isFlagged ? (
                        <button
                          onClick={() => handleUnflag(report._id)}
                          className="text-green-500 hover:text-green-700 text-sm font-bold"
                        >
                          Unflag
                        </button>
                      ) : null}
                      <button
                        onClick={() => handleDelete(report._id)}
                        className="text-red-500 hover:text-red-700 text-sm font-bold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* 📱 MOBILE VIEW */}
            <div className="md:hidden divide-y">
              {reports.map((report) => (
                <div key={report._id} className="p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-800">{report.type}</h3>
                      <p className="text-xs text-gray-500">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <StatusBadge status={report.status} />
                  </div>

                  <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded border border-gray-100">
                    {report.description}
                  </p>

                  <div className="flex justify-between items-center mt-2">
                    <div className="text-xs text-gray-500">
                      By:{" "}
                      <span className="font-medium">
                        {report.reporter_id?.name || "Unknown"}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDelete(report._id)}
                      className="bg-red-50 text-red-600 px-3 py-1 rounded text-xs font-bold border border-red-100"
                    >
                      Delete Post
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {reports.length === 0 && (
              <div className="p-6 text-center text-gray-400">
                No reports found.
              </div>
            )}
            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="p-4 border-t flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {reports.length} of {pagination.total} reports
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: Math.max(1, prev.page - 1),
                      }))
                    }
                    disabled={pagination.page === 1}
                    className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: Math.min(prev.totalPages, prev.page + 1),
                      }))
                    }
                    disabled={pagination.page === pagination.totalPages}
                    className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      {/* Report Details Modal */}
      <ReportDetailsModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
        onUnflag={(id) => {
          handleUnflag(id);
          setSelectedReport(null);
        }}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default AdminReports;
