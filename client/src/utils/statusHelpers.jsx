import { HiClock, HiDocumentText, HiCheckCircle } from "react-icons/hi";

export const getStatusColor = (status) => {
    switch (status) {
      case "Open":
        return "bg-warning-100 text-warning-700";
      case "Claimed":
        return "bg-primary-100 text-primary-700";
      case "Resolved":
        return "bg-success-100 text-success-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
};
  
export const getStatusIcon = (status) => {
    switch (status) {
      case "Open":
        return <HiClock className="w-4 h-4" />;
      case "Claimed":
        return <HiDocumentText className="w-4 h-4" />;
      case "Resolved":
        return <HiCheckCircle className="w-4 h-4" />;
      default:
        return <HiClock className="w-4 h-4" />;
    }
};