import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  User, 
  GraduationCap, 
  Briefcase, 
  Code, 
  FolderOpen, 
  Award, 
  Users, 
  Eye,
  Plus,
  LayoutDashboard // Add this import for dashboard icon
} from 'lucide-react';

const AdminLayout = () => {
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard }, // Add dashboard first
    { name: 'Personal Info', path: '/admin/personal', icon: User },
    { name: 'Education', path: '/admin/education', icon: GraduationCap },
    { name: 'Skills', path: '/admin/skills', icon: Code },
    { name: 'Experience', path: '/admin/experience', icon: Briefcase },
    { name: 'Projects', path: '/admin/projects', icon: FolderOpen },
    { name: 'Leadership', path: '/admin/leadership', icon: Users },
    { name: 'Certifications', path: '/admin/certifications', icon: Award },
    { name: 'Custom Sections', path: '/admin/sections', icon: Plus },
  ];

  // Handle click on Portfolio Admin header
  const handleHeaderClick = () => {
    navigate('/admin/dashboard');
  };

  return (
    // s1: Updated main container with dark theme colors
    <div className="min-h-screen bg-admin-bg flex font-noir">
      {/* s1: Updated sidebar with dark theme styling */}
      <div className="w-64 bg-admin-card shadow-xl border-r border-admin-border">
        {/* s1: Header with golden accent border - NOW CLICKABLE */}
        <div 
          className="p-6 border-b border-admin-border cursor-pointer hover:bg-admin-accent/5 transition-colors duration-200"
          onClick={handleHeaderClick}
        >
          <h1 className="text-2xl font-bold text-admin-text hover:text-admin-accent transition-colors duration-200">
            Currliculum V8
          </h1>
          <p className="text-sm text-admin-text/70 mt-1">Turbocharge your career</p>
          {/* s1: Golden accent line */}
          <div className="w-15 h-0.5 bg-admin-accent mt-3"></div>
        </div>
        
        {/* s1: Navigation with hover effects */}
        <nav className="mt-6">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-6 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-admin-accent bg-admin-accent/10 border-r-2 border-admin-accent'
                    : 'text-admin-text/80 hover:text-admin-accent hover:bg-admin-accent/5'
                }`
              }
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </NavLink>
          ))}
          
          {/* s1: Preview section with separator */}
          <div className="border-t border-admin-border mt-6 pt-6">
            <NavLink
              to="/admin/preview"
              className="flex items-center px-6 py-3 text-sm font-medium text-admin-text/80 hover:text-admin-accent hover:bg-admin-accent/5 transition-all duration-200"
            >
              <Eye className="w-5 h-5 mr-3" />
              Preview Resume
            </NavLink>
          </div>
        </nav>
      </div>

      {/* s1: Main content area with proper dark theme */}
      <div className="flex-1 overflow-hidden bg-admin-bg">
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
