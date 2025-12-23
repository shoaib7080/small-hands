import { Link } from "react-router-dom";
import { HiX, HiCalendar, HiLocationMarker } from "react-icons/hi";
import { getStatusColor, getStatusIcon } from "../../utils/statusHelpers.jsx";

const ReportModal = ({ report, isOpen, onClose }) => {
  if (!isOpen || !report) return null;

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
              <div className="flex items-center gap-2">
                <Link
                  to={`/dashboard/reporter/create?lat=${report.location?.coordinates?.[1]}&lng=${report.location?.coordinates?.[0]}`}
                  className="flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  <HiLocationMarker className="w-4 h-4" />
                  View on Map
                </Link>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-text-primary mb-2">
                Description
              </h3>
              <p className="text-text-secondary">{report.description}</p>
            </div>

            {report.contact_info && (
              <div>
                <h3 className="font-medium text-text-primary mb-2">
                  Contact Info
                </h3>
                <p className="text-text-secondary">{report.contact_info}</p>
              </div>
            )}

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

export default ReportModal;