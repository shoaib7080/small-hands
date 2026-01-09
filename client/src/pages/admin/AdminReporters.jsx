import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../services/api";
import ReportHistoryModal from "./ReportHistoryModal";

const AdminReporters = () => {
  const [reporters, setReporters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [historyTarget, setHistoryTarget] = useState(null);

  useEffect(() => {
    const fetchReporters = async () => {
      try {
        const params = searchTerm ? `?search=${searchTerm}` : "";
        const { data } = await api.get(`/admin/reporters${params}`);
        setReporters(data.data);
      } catch (err) {
        toast.error("Failed to fetch reporters");
      } finally {
        setLoading(false);
      }
    };
    fetchReporters();
  }, [searchTerm]);

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

  const handleBan = async (id) => {
    if (!window.confirm("Ban this user? They won't be able to login.")) return;
    try {
      await api.patch(`/admin/reporters/${id}/ban`);
      toast.success("User Banned");
      setReporters((prev) =>
        prev.map((r) => (r._id === id ? { ...r, isBanned: true } : r))
      );
    } catch (err) {
      toast.error("Action failed");
    }
  };

  const sortedReporters = [...reporters].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "karma") return b.karma_points - a.karma_points;
    if (sortBy === "reports")
      return (b.reports_posted || 0) - (a.reports_posted || 0);
    return 0;
  });

  // Search Filter
  // const filteredReporters = reporters.filter(
  //   (r) =>
  //     r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     r.phone.includes(searchTerm)
  // );

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="🔍 Search by name or phone..."
            className="w-full border p-2 rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border p-2 rounded-lg"
          >
            <option value="name">Sort by Name</option>
            <option value="karma">Sort by Karma</option>
            <option value="reports">Sort by Reports</option>
          </select>
        </div>
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
                {sortedReporters.map((reporter) => (
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
                      {!reporter.isBanned && (
                        <button
                          onClick={() => handleBan(reporter._id)}
                          className="text-red-600 hover:text-red-900 font-bold text-sm bg-red-50 px-3 py-1 rounded"
                        >
                          Ban User
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* 📱 MOBILE VIEW (Cards) */}
            <div className="md:hidden divide-y">
              {sortedReporters.map((reporter) => (
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
                        {reporter.karma_points} Karma
                      </span>
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                        {reporter.reports_posted || 0} Reports
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setHistoryTarget(reporter._id)}
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-xs font-bold hover:bg-blue-200"
                  >
                    History
                  </button>
                  <button
                    onClick={() => handleBan(reporter._id)}
                    className="bg-red-100 text-red-600 p-2 rounded-lg"
                  >
                    🚫
                  </button>
                </div>
              ))}
            </div>

            {sortedReporters.length === 0 && (
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
