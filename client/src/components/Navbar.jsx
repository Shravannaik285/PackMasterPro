import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, LogOut, User, Package, Menu, X } from 'lucide-react';
import { getCurrentUser, loginWithGoogle, logoutUser } from '../services/authService';

/**
 * Navbar Component:
 * Clean, minimalistic navigation bar matching the reference UI.
 * Shows brand logo, navigation links, and dynamic Google Auth / Avatar state ('SN').
 */
export default function Navbar({ onOpenAuth }) {
  const [user, setUser] = useState(getCurrentUser());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Listen for login/logout events to update UI immediately
  useEffect(() => {
    const handleAuthChange = () => {
      setUser(getCurrentUser());
    };
    window.addEventListener('authChange', handleAuthChange);
    return () => window.removeEventListener('authChange', handleAuthChange);
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setDropdownOpen(false);
    navigate('/');
  };

  const handleGetStarted = () => {
    if (!user) {
      if (onOpenAuth) onOpenAuth();
      else loginWithGoogle().then(() => navigate('/plan'));
    } else {
      navigate('/plan');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors duration-200">
              <Box className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">
              PackMasterPro<span className="text-green-600">.</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-600">
            <Link to="/" className="hover:text-green-600 transition-colors">
              Home
            </Link>
            <a href="/plan" className="hover:text-green-600 transition-colors">
              New Packaging Plans
            </a>
            {user && (
              <Link to="/orders" className="hover:text-green-600 transition-colors flex items-center gap-1.5 text-green-700 font-semibold">
                <Package className="w-4 h-4" />
                My Orders
              </Link>
            )}
          </nav>

          {/* Right Action / User Avatar */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold text-sm flex items-center justify-center border border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  title={user.name || 'User Profile'}
                >
                  {user.initials || 'SN'}
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/orders"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Package className="w-4 h-4 text-green-600" />
                      My Orders/Plans
                    </Link>
                    <Link
                      to="/plan"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Box className="w-4 h-4 text-green-600" />
                      New Packaging Plan
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth && onOpenAuth()}
                  className="text-gray-700 hover:text-green-600 font-medium text-sm px-3.5 py-2 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={handleGetStarted}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium text-sm px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition-all duration-200"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            {user && (
              <span className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 font-semibold text-xs flex items-center justify-center border border-gray-300">
                {user.initials || 'SN'}
              </span>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
            >
              Home
            </Link>
            <Link
              to="/plan"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-green-700 hover:bg-green-50"
            >
              Start Packaging Plan
            </Link>
            {user ? (
              <>
                <Link
                  to="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                >
                  My Orders
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                >
                  Sign Out ({user.name})
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleGetStarted();
                }}
                className="w-full mt-2 bg-green-600 text-white px-4 py-2.5 rounded-lg font-medium"
              >
                Sign In with Google
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
