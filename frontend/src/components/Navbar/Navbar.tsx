import { MapPinned, LogOut, UserCircle } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-slate-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-4">
        {/* Logo */}

        <div className="flex items-center gap-3">
          <MapPinned className="text-blue-400" size={32} />

          <div>
            <h1 className="text-2xl font-bold">UrbanIQ</h1>

            <p className="text-xs text-slate-400">
              Public Space Stewardship Intelligence Platform
            </p>
          </div>
        </div>

        {/* Navigation */}

        <nav>
          <ul className="flex items-center gap-8 text-sm font-medium">
            <li>
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `hover:text-blue-400 ${
                    isActive ? "text-blue-400 font-bold" : ""
                  }`
                }
              >
                Dashboard
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/map"
                className={({ isActive }) =>
                  `hover:text-blue-400 ${
                    isActive ? "text-blue-400 font-bold" : ""
                  }`
                }
              >
                Map
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/upload"
                className={({ isActive }) =>
                  `hover:text-blue-400 ${
                    isActive ? "text-blue-400 font-bold" : ""
                  }`
                }
              >
                Upload
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/analytics"
                className={({ isActive }) =>
                  `hover:text-blue-400 ${
                    isActive ? "text-blue-400 font-bold" : ""
                  }`
                }
              >
                Analytics
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/reports"
                className={({ isActive }) =>
                  `hover:text-blue-400 ${
                    isActive ? "text-blue-400 font-bold" : ""
                  }`
                }
              >
                Reports
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* User */}

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <UserCircle size={34} className="text-blue-400" />

            <div>
              <h4 className="text-sm font-semibold">{user?.full_name}</h4>

              <p className="text-xs text-slate-400 capitalize">
                {user?.role?.replace("_", " ")}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm hover:bg-red-700 transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
