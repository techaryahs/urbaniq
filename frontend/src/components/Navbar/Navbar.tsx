import { MapPinned } from "lucide-react";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="bg-slate-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <MapPinned className="text-blue-400" size={32} />

          <div>
            <h1 className="text-2xl font-bold">PSSIP</h1>

            <p className="text-xs text-slate-400">
              Public Space Stewardship Intelligence Platform
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav>
          <ul className="flex items-center gap-8 text-sm font-medium">
            <li>
              <NavLink to="/" className={({ isActive }) => `cursor-pointer hover:text-blue-400 ${isActive ? 'text-blue-400 font-bold' : ''}`} end>Dashboard</NavLink>
            </li>
            <li>
              <NavLink to="/map" className={({ isActive }) => `cursor-pointer hover:text-blue-400 ${isActive ? 'text-blue-400 font-bold' : ''}`}>Map</NavLink>
            </li>
            <li>
              <NavLink to="/upload" className={({ isActive }) => `cursor-pointer hover:text-blue-400 ${isActive ? 'text-blue-400 font-bold' : ''}`}>Upload</NavLink>
            </li>
            <li>
              <NavLink to="/analytics" className={({ isActive }) => `cursor-pointer hover:text-blue-400 ${isActive ? 'text-blue-400 font-bold' : ''}`}>Analytics</NavLink>
            </li>
            <li>
              <NavLink to="/reports" className={({ isActive }) => `cursor-pointer hover:text-blue-400 ${isActive ? 'text-blue-400 font-bold' : ''}`}>Reports</NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
