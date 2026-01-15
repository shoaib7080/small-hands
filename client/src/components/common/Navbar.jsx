import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  HiBell,
  HiChevronDown,
  HiMenu,
  HiLogout,
  // HiTrophy,
  HiViewGrid,
  HiArrowLeft,
  HiUser,
  HiExclamationCircle,
} from "react-icons/hi";
import LoadingOverlay from "./LoadingOverlay";
import ReportIssueModal from "./ReportIssueModal";
import NotificationBell from "./NotificationBell.jsx";

const Navbar = () => {
  const user = (() => {
    try {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  })();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);

  const handleLogout = () => {
    setIsLoggingOut(true);
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setTimeout(() => {
      window.location.href = "/"; // Full page refresh and redirect
    }, 1000);
  };

  const getDashboardLink = () => {
    if (user.role === "ngo") return "/dashboard/ngo";
    if (user.role === "admin") return "/admin";
    return "/dashboard/reporter";
  };

  return (
    <nav className="bg-surface shadow-md sticky top-0 z-50 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              to="/"
              className="text-2xl font-bold text-primary-600 flex items-center gap-2"
            >
              <span className="bg-primary-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">
                S
              </span>
              Small Hands
            </Link>
          </div>

          {/* Right Side - Actions & Profile */}
          <div className="hidden md:flex items-center space-x-4">
            {!user ? (
              /* GUEST LINKS */
              <>
                <Link
                  to="/leaderboard"
                  className="text-text-secondary hover:text-primary-600 font-medium"
                >
                  Leaderboard
                </Link>
                <Link
                  to="/login"
                  className="text-text-secondary hover:text-primary-600 font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register/reporter"
                  className="bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors"
                >
                  Join Now
                </Link>
              </>
            ) : (
              /* LOGGED IN ACTIONS */
              <>
                {/* Leaderboard Button - Show when NOT on leaderboard */}
                {location.pathname !== "/leaderboard" && (
                  <Link
                    to="/leaderboard"
                    className="text-text-secondary hover:text-primary-600 font-medium"
                  >
                    Leaderboard
                  </Link>
                )}

                {/* Dashboard Button - Only on Leaderboard */}
                {location.pathname === "/leaderboard" && (
                  <Link
                    to={getDashboardLink()}
                    className="text-text-secondary hover:text-primary-600 p-2 rounded-lg hover:bg-background transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <HiArrowLeft className="w-5 h-5" /> Dashboard
                    </div>
                  </Link>
                )}

                <button
                  onClick={() => setShowIssueModal(true)}
                  className="text-text-secondary hover:text-primary-600 p-2 rounded-lg hover:bg-background transition-colors"
                  title="Report an Issue"
                >
                  <HiExclamationCircle className="w-5 h-5" />
                </button>

                {/* Notification Icon */}
                <NotificationBell />

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-background transition-colors"
                  >
                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {user.name?.charAt(0) || "U"}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-text-primary">
                        {user.name}
                      </p>
                      <p className="text-xs text-text-muted capitalize">
                        {user.role}
                      </p>
                    </div>
                    <HiChevronDown className="w-4 h-4 text-text-secondary" />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {showProfileDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-surface rounded-lg shadow-lg border border-border py-1">
                      <div className="px-4 py-2 border-b border-border">
                        <p className="text-sm font-medium text-text-primary">
                          {user.name}
                        </p>
                        <p className="text-xs text-text-muted">
                          {user.email || "No email"}
                        </p>
                      </div>
                      <Link
                        to="/profile"
                        className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-background transition-colors flex items-center gap-2"
                        onClick={() => setShowProfileDropdown(false)}
                      >
                        <HiUser className="w-4 h-4" />
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-error-500 hover:bg-background transition-colors flex items-center gap-2"
                      >
                        <HiLogout className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            {user && <NotificationBell />}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-text-secondary focus:outline-none p-2"
            >
              <HiMenu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 md:hidden bg-surface border-t border-border shadow-lg z-50">
          <div className="p-4 space-y-3">
            {user && (
              <div className="flex items-center gap-3 pb-3 border-b border-border">
                <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold">
                  {user.name?.charAt(0) || "U"}
                </div>
                <Link to="/profile" onClick={() => setIsOpen(false)}>
                  <p className="font-medium text-text-primary">{user.name}</p>
                  <p className="text-sm text-text-muted capitalize">
                    {user.role}
                  </p>
                </Link>
              </div>
            )}

            {!user ? (
              <>
                <Link
                  to="/leaderboard"
                  className="block text-text-secondary font-medium py-2"
                  onClick={() => setIsOpen(false)}
                >
                  Leaderboard
                </Link>
                <Link
                  to="/login"
                  className="block text-text-secondary font-medium py-2"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register/reporter"
                  className="block text-primary-600 font-bold py-2"
                  onClick={() => setIsOpen(false)}
                >
                  Join Now
                </Link>
              </>
            ) : (
              <>
                {/* Show Leaderboard when NOT on leaderboard */}
                {location.pathname !== "/leaderboard" && (
                  <Link
                    to="/leaderboard"
                    className="block text-text-secondary font-medium py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Leaderboard
                  </Link>
                )}

                {/* Show Dashboard when ON leaderboard */}
                {location.pathname === "/leaderboard" && (
                  <Link
                    to={getDashboardLink()}
                    className=" text-primary-600 font-bold py-2 flex items-center gap-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <HiArrowLeft className="w-4 h-4" />
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left text-error-500 font-medium py-2 flex items-center gap-2"
                >
                  <HiLogout className="w-4 h-4" />
                  Logout
                </button>
              </>
            )}
            <button
              onClick={() => setShowIssueModal(true)}
              className="text-text-secondary hover:text-primary-600 p-2 rounded-lg hover:bg-background transition-colors"
              title="Report an Issue"
            >
              Report an issue
            </button>
          </div>
        </div>
      )}

      <LoadingOverlay isVisible={isLoggingOut} text="Logging out..." />
      <ReportIssueModal
        isOpen={showIssueModal}
        onClose={() => setShowIssueModal(false)}
      />
    </nav>
  );
};

export default Navbar;
