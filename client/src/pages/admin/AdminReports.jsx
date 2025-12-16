import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../services/api";

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const { data } = await api.get("/admin/reports");
        setReports(data.data);
      } catch (err) {
        toast.error("Failed to load reports");
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

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
                <tr key={report._id} className="hover:bg-gray-50">
                  <td className="p-4 font-bold text-gray-800">{report.type}</td>
                  <td className="p-4 max-w-xs text-sm text-gray-600 truncate">
                    {report.description}
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
                  <td className="p-4 text-right">
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
        </>
      )}
    </div>
  );
};

export default AdminReports;
