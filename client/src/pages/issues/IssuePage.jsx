import { useEffect, useState } from "react";
import api from "../../services/api";
import { toast } from "react-toastify";

const IssuesPage = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const { data } = await api.get("/issues");
        setIssues(data.data);
      } catch (error) {
        toast.error("Failed to load issues");
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-text-primary mb-6">
        Reported Issues
      </h1>
      <div className="space-y-4">
        {issues.map((issue) => (
          <div
            key={issue._id}
            className="bg-surface border border-border rounded-lg p-4"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-text-primary">{issue.title}</h3>
              <span
                className={`px-2 py-1 rounded text-xs ${
                  issue.status === "Open"
                    ? "bg-red-100 text-red-700"
                    : issue.status === "In Progress"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {issue.status}
              </span>
            </div>
            <p className="text-text-secondary text-sm mb-2">
              {issue.description}
            </p>
            <div className="flex gap-2 text-xs text-text-muted">
              <span className="bg-background px-2 py-1 rounded">
                {issue.category}
              </span>
              <span className="bg-background px-2 py-1 rounded">
                {issue.priority}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IssuesPage;
