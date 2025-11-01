import { Link, useNavigate } from "react-router-dom";
import { Home, Search, Bell, User, LogOut, Moon, Sun } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const profileLink = user?._id || user?.id ? `/profile/${user._id || user.id}` : "/home";

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/home" className="navbar-logo">
          <h2>PicProof</h2>
        </Link>

        <div className="navbar-links">
          <Link to="/home" className="nav-link">
            <Home size={24} />
            <span>Home</span>
          </Link>
          <Link to="/search" className="nav-link">
            <Search size={24} />
            <span>Search</span>
          </Link>
          <Link to="/notifications" className="nav-link">
            <Bell size={24} />
            <span>Notifications</span>
          </Link>
          <Link to={profileLink} className="nav-link">
            <User size={24} />
            <span>Profile</span>
          </Link>
        </div>

        <div className="navbar-actions">
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={handleLogout} className="btn btn-outline">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
