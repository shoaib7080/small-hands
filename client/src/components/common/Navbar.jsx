import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [isOpen, setIsOpen] = useState(false); // Mobile menu state

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const logoLink = user
    ? user.role === "ngo"
      ? "/dashboard/ngo"
      : "/dashboard/reporter"
    : "/";

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              to="/"
              className="text-2xl font-bold text-blue-800 flex items-center gap-2"
            >
              <span className="bg-blue-800 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">
                S
              </span>
              Small Hands
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/leaderboard"
              className="text-gray-600 hover:text-blue-600 font-medium"
            >
              Leaderboard
            </Link>

            {!user ? (
              /* GUEST LINKS */
              <>
                <Link
                  to="/"
                  className="text-gray-600 hover:text-blue-600 font-medium"
                >
                  Home
                </Link>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-blue-600 font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register/reporter"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 shadow"
                >
                  Join Now
                </Link>
              </>
            ) : (
              /* LOGGED IN LINKS */
              <>
                <Link
                  to={
                    user.role === "ngo"
                      ? "/dashboard/ngo"
                      : "/dashboard/reporter"
                  }
                  className="text-blue-600 font-bold"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 focus:outline-none"
            >
              <span className="text-2xl">☰</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white border-t p-4 space-y-3 shadow-lg">
          <Link to="/leaderboard" className="block text-gray-600 font-medium">
            Leaderboard
          </Link>

          {!user ? (
            <>
              <Link to="/" className="block text-gray-600 font-medium">
                Home
              </Link>
              <Link to="/login" className="block text-gray-600 font-medium">
                Login
              </Link>
              <Link
                to="/register/reporter"
                className="block text-blue-600 font-bold"
              >
                Join Now
              </Link>
            </>
          ) : (
            <>
              <Link
                to={
                  user.role === "ngo" ? "/dashboard/ngo" : "/dashboard/reporter"
                }
                className="block text-blue-600 font-bold"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left text-red-600 font-medium"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
