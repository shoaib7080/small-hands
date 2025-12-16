import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../services/api";
import ReportHistoryModal from "./ReportHistoryModal";

const AdminReporters = () => {
  const [reporters, setReporters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [historyTarget, setHistoryTarget] = useState(null);

  useEffect(() => {
    const fetchReporters = async () => {
      try {
        const { data } = await api.get("/admin/reporters");
        setReporters(data.data);
      } catch (err) {
        toast.error("Failed to fetch reporters");
      } finally {
        setLoading(false);
      }
    };
    fetchReporters();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Ban this user permanently? This cannot be undone."))
      return;
    try {
      await api.delete(`/admin/reporters/${id}`);
      toast.success("User Banned");
      setReporters((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      toast.error("Action failed");
    }
  };

  // Search Filter
  const filteredReporters = reporters.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <input
          type="text"
          placeholder="🔍 Search by name or phone..."
          className="w-full border p-2 rounded-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Loading Directory...
          </div>
        ) : (
          <>
            {/* 🖥️ DESKTOP VIEW (Table) */}
            <table className="hidden md:table w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b">
                  <th className="p-4">Citizen Name</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4 text-center">Karma</th>
                  <th className="p-4 text-center">Reports</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredReporters.map((reporter) => (
                  <tr key={reporter._id} className="hover:bg-gray-50">
                    <td className="p-4 font-bold text-gray-800">
                      {reporter.name}
                    </td>
                    <td className="p-4 font-mono text-sm text-gray-600">
                      {reporter.phone}
                    </td>
                    <td className="p-4 text-center font-bold text-yellow-600">
                      {reporter.karma_points}
                    </td>
                    <td className="p-4 text-center">
                      {reporter.reports_posted || 0}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setHistoryTarget(reporter._id)}
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-xs font-bold hover:bg-blue-200"
                      >
                        History
                      </button>
                      <button
                        onClick={() => handleDelete(reporter._id)}
                        className="text-red-600 hover:text-red-900 font-bold text-sm bg-red-50 px-3 py-1 rounded"
                      >
                        Ban User
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* 📱 MOBILE VIEW (Cards) */}
            <div className="md:hidden divide-y">
              {filteredReporters.map((reporter) => (
                <div
                  key={reporter._id}
                  className="p-4 flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-bold text-gray-800">{reporter.name}</h3>
                    <p className="text-sm text-gray-500 mb-1">
                      {reporter.phone}
                    </p>
                    <div className="flex gap-2 text-xs">
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                        ⭐ {reporter.karma_points} Karma
                      </span>
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                        📝 {reporter.reports_posted || 0} Reports
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(reporter._id)}
                    className="bg-red-100 text-red-600 p-2 rounded-lg"
                  >
                    🚫
                  </button>
                </div>
              ))}
            </div>

            {filteredReporters.length === 0 && (
              <div className="p-6 text-center text-gray-400">
                No users found.
              </div>
            )}
          </>
        )}
      </div>
      {historyTarget && (
        <ReportHistoryModal
          targetId={historyTarget}
          type="reporter"
          onClose={() => setHistoryTarget(null)}
        />
      )}
    </div>
  );
};

export default AdminReporters;
