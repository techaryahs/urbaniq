import { useState } from "react";
import { MapPinned, LogOut, UserCircle, Menu, X } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { user, logout, isResearcher, isCityPlanner } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block rounded-lg px-3 py-2 transition hover:bg-slate-800 hover:text-blue-400 lg:rounded-none lg:px-0 lg:py-0 lg:hover:bg-transparent ${
      isActive ? "bg-slate-800 text-blue-400 font-bold lg:bg-transparent" : ""
    }`;

  return (
    <header className="bg-slate-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:flex lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex min-w-0 items-center gap-3">
            <MapPinned className="shrink-0 text-blue-400" size={32} />

            <div className="min-w-0">
              <h1 className="text-xl font-bold sm:text-2xl">UrbanIQ</h1>

              <p className="text-[11px] leading-snug text-slate-400 sm:text-xs">
                Public Space Stewardship Intelligence Platform
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-700 text-slate-200 transition hover:bg-slate-800 hover:text-white lg:hidden"
            aria-label="Toggle navigation"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        <div
          className={`${
            isMenuOpen ? "block" : "hidden"
          } mt-4 border-t border-slate-800 pt-4 lg:mt-0 lg:flex lg:items-center lg:gap-8 lg:border-0 lg:pt-0`}
        >
          {/* Navigation */}
          <nav>
            <ul className="flex flex-col gap-1 text-sm font-medium lg:flex-row lg:items-center lg:gap-8">
              {/* Dashboard */}
              <li>
                <NavLink
                  to="/"
                  end
                  onClick={() => setIsMenuOpen(false)}
                  className={navLinkClass}
                >
                  Dashboard
                </NavLink>
              </li>

              {/* Map - Everyone */}
              <li>
                <NavLink
                  to="/map"
                  onClick={() => setIsMenuOpen(false)}
                  className={navLinkClass}
                >
                  Map
                </NavLink>
              </li>

              {/* Organizations - Everyone */}
              <li>
                <NavLink
                  to="/organizations"
                  onClick={() => setIsMenuOpen(false)}
                  className={navLinkClass}
                >
                  Organizations
                </NavLink>
              </li>

              {/* Surveys - Everyone */}
              <li>
                <NavLink
                  to="/surveys"
                  onClick={() => setIsMenuOpen(false)}
                  className={navLinkClass}
                >
                  Surveys
                </NavLink>
              </li>

              {/* Researcher Only */}
              {isResearcher && (
                <li>
                  <NavLink
                    to="/upload"
                    onClick={() => setIsMenuOpen(false)}
                    className={navLinkClass}
                  >
                    Upload
                  </NavLink>
                </li>
              )}

              {/* City Planner Only */}
              {isCityPlanner && (
                <li>
                  <NavLink
                    to="/analytics"
                    onClick={() => setIsMenuOpen(false)}
                    className={navLinkClass}
                  >
                    Analytics
                  </NavLink>
                </li>
              )}

              {/* City Planner Only */}
              {isCityPlanner && (
                <li>
                  <NavLink
                    to="/reports"
                    onClick={() => setIsMenuOpen(false)}
                    className={navLinkClass}
                  >
                    Reports
                  </NavLink>
                </li>
              )}
            </ul>
          </nav>

          {/* User Info */}
          <div className="mt-4 flex flex-col gap-3 border-t border-slate-800 pt-4 sm:flex-row sm:items-center sm:justify-between lg:mt-0 lg:border-0 lg:pt-0">
            <div className="flex min-w-0 items-center gap-3">
              <UserCircle size={36} className="shrink-0 text-blue-400" />

              <div className="min-w-0">
                <h4 className="truncate text-sm font-semibold">{user?.full_name}</h4>

                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                    isResearcher
                      ? "bg-green-600 text-white"
                      : "bg-blue-600 text-white"
                  }`}
                >
                  {user?.role?.replace("_", " ")}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium transition hover:bg-red-700 sm:w-auto"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
