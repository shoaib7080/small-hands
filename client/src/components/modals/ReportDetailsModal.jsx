import { useEffect, useState } from "react";
import { HiX, HiLocationMarker } from "react-icons/hi";
import { reverseGeocode } from "../../utils/geocode";

const ReportDetailsModal = ({ report, onClose, onUnflag, onDelete }) => {
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (report?.location?.coordinates) {
      const [lng, lat] = report.location.coordinates;
      reverseGeocode(lat, lng).then(setAddress);
    }
  }, [report]);

  if (!report) return null;

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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Report Details</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <HiX className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 uppercase">Type</label>
              <p className="font-bold text-gray-800">{report.type}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase">
                Severity
              </label>
              <p className="font-bold text-gray-800">{report.severity}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase">Status</label>
              <StatusBadge status={report.status} />
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase">Created</label>
              <p className="text-gray-800">
                {new Date(report.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 uppercase">
              Description
            </label>
            <p className="text-gray-800 bg-gray-50 p-3 rounded">
              {report.description}
            </p>
          </div>

          <div>
            <label className="text-xs text-gray-500 uppercase">
              Contact Info
            </label>
            <p className="text-gray-800">{report.contact_info || "N/A"}</p>
          </div>

          <div>
            <label className="text-xs text-gray-500 uppercase">Reporter</label>
            <p className="font-bold text-gray-800">
              {report.reporter_id?.name || "Unknown"}
            </p>
            <p className="text-sm text-gray-600">{report.reporter_id?.phone}</p>
          </div>

          {report.claimed_by && (
            <div>
              <label className="text-xs text-gray-500 uppercase">
                Claimed By
              </label>
              <p className="text-gray-800">{report.claimed_by?.name}</p>
            </div>
          )}

          <div>
            <label className="text-xs text-gray-500 uppercase">Location</label>
            <p className="text-gray-800">{address || "Loading address..."}</p>
            <button
              onClick={() => {
                const [lng, lat] = report.location.coordinates;
                window.open(
                  `https://www.google.com/maps?q=${lat},${lng}`,
                  "_blank"
                );
              }}
              className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold hover:bg-blue-200 flex items-center gap-1"
            >
              <HiLocationMarker className="w-4 h-4" />
              View on Google Maps
            </button>
          </div>

          {report.isFlagged && (
            <div className="bg-red-50 border border-red-200 p-3 rounded">
              <label className="text-xs text-red-700 uppercase font-bold">
                Flagged
              </label>
              <p className="text-red-800">{report.flagReason}</p>
              <p className="text-xs text-red-600 mt-1">
                Flagged by: {report.flaggedBy?.name || "Unknown"}
              </p>
            </div>
          )}

          {report.images && report.images.length > 0 && (
            <div>
              <label className="text-xs text-gray-500 uppercase">Images</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {report.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Evidence ${idx + 1}`}
                    className="w-full h-32 object-cover rounded cursor-pointer hover:opacity-90"
                    onClick={() => window.open(img, "_blank")}
                  />
                ))}
              </div>
            </div>
          )}

          {(onUnflag || onDelete) && (
            <div className="flex gap-2 pt-4 border-t">
              {report.isFlagged && onUnflag && (
                <button
                  onClick={() => onUnflag(report._id)}
                  className="px-4 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700"
                >
                  Unflag Report
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(report._id)}
                  className="px-4 py-2 bg-red-600 text-white rounded font-bold hover:bg-red-700"
                >
                  Delete Report
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportDetailsModal;
