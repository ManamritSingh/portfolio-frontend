import React, { useState, useEffect } from 'react';
import axios from '../../../src/utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  FolderOpen, 
  Award, 
  Users, 
  Database,
  Eye,
  Calendar,
  TrendingUp,
  FileText,
  Settings,
  Activity
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalSections: 0,
    visibleSections: 0,
    totalProjects: 0,
    totalExperience: 0,
    totalEducation: 0,
    totalSkills: 0,
    totalCertifications: 0,
    totalLeadership: 0
  });
  const [loading, setLoading] = useState(true);

  const API_BASE = 'http://localhost:8080/api';

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      // Fetch stats from your various APIs
      const responses = await Promise.allSettled([
        axios.get(`${API_BASE}/admin/sections/unified`),
        axios.get(`${API_BASE}/admin/projects`),
        axios.get(`${API_BASE}/admin/experience`),
        axios.get(`${API_BASE}/admin/education`),
        axios.get(`${API_BASE}/admin/skills`),
        axios.get(`${API_BASE}/admin/certifications`),
        axios.get(`${API_BASE}/admin/leadership`)
      ]);

      const [sectionsRes, projectsRes, expRes, eduRes, skillsRes, certRes, leaderRes] = responses;

      setStats({
        totalSections: sectionsRes.status === 'fulfilled' ? sectionsRes.value.data.length : 0,
        visibleSections: sectionsRes.status === 'fulfilled' ? sectionsRes.value.data.filter(s => s.visible).length : 0,
        totalProjects: projectsRes.status === 'fulfilled' ? projectsRes.value.data.length : 0,
        totalExperience: expRes.status === 'fulfilled' ? expRes.value.data.length : 0,
        totalEducation: eduRes.status === 'fulfilled' ? eduRes.value.data.length : 0,
        totalSkills: skillsRes.status === 'fulfilled' ? skillsRes.value.data.length : 0,
        totalCertifications: certRes.status === 'fulfilled' ? certRes.value.data.length : 0,
        totalLeadership: leaderRes.status === 'fulfilled' ? leaderRes.value.data.length : 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, onClick }) => (
    <div 
      onClick={onClick}
      className="bg-admin-card border border-admin-border rounded-xl p-6 card-hover cursor-pointer group transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-admin-text/60 text-sm font-medium uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold text-admin-text mt-2">{loading ? '...' : value}</p>
        </div>
        <div className={`p-3 rounded-xl ${color} group-hover:scale-110 transition-transform duration-200`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const QuickActionCard = ({ title, description, icon: Icon, color, onClick }) => (
    <div 
      onClick={onClick}
      className="bg-admin-card border border-admin-border rounded-xl p-6 card-hover cursor-pointer group transition-all duration-200"
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${color} group-hover:scale-110 transition-transform duration-200`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-admin-text mb-2">{title}</h3>
          <p className="text-admin-text/60 text-sm leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-admin-text mb-3">touch Resume.pdf</h1>
        <p className="text-admin-text/70 text-lg">
          Create your Resume, the developer way!
        </p>
      </div>

      {/* Key Statistics */}
      <div>
        <h2 className="text-xl font-semibold text-admin-text mb-6 flex items-center">
          <Activity className="w-5 h-5 mr-3 text-admin-accent" />
          Content Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Sections"
            value={stats.totalSections}
            icon={Database}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
            onClick={() => navigate('/admin/sections')}
          />
          <StatCard
            title="Visible Sections"
            value={stats.visibleSections}
            icon={Eye}
            color="bg-gradient-to-br from-green-500 to-green-600"
            onClick={() => navigate('/admin/sections')}
          />
          <StatCard
            title="Projects"
            value={stats.totalProjects}
            icon={FolderOpen}
            color="bg-gradient-to-br from-purple-500 to-purple-600"
            onClick={() => navigate('/admin/projects')}
          />
          <StatCard
            title="Experience"
            value={stats.totalExperience}
            icon={Briefcase}
            color="bg-gradient-to-br from-orange-500 to-orange-600"
            onClick={() => navigate('/admin/experience')}
          />
        </div>
      </div>

      {/* Content Breakdown */}
      <div>
        <h2 className="text-xl font-semibold text-admin-text mb-6 flex items-center">
          <TrendingUp className="w-5 h-5 mr-3 text-admin-accent" />
          Content Breakdown
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Education"
            value={stats.totalEducation}
            icon={GraduationCap}
            color="bg-gradient-to-br from-indigo-500 to-indigo-600"
            onClick={() => navigate('/admin/education')}
          />
          <StatCard
            title="Skills"
            value={stats.totalSkills}
            icon={Settings}
            color="bg-gradient-to-br from-teal-500 to-teal-600"
            onClick={() => navigate('/admin/skills')}
          />
          <StatCard
            title="Certifications"
            value={stats.totalCertifications}
            icon={Award}
            color="bg-gradient-to-br from-red-500 to-red-600"
            onClick={() => navigate('/admin/certifications')}
          />
          <StatCard
            title="Leadership"
            value={stats.totalLeadership}
            icon={Users}
            color="bg-gradient-to-br from-pink-500 to-pink-600"
            onClick={() => navigate('/admin/leadership')}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-admin-text mb-6 flex items-center">
          <FileText className="w-5 h-5 mr-3 text-admin-accent" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <QuickActionCard
            title="Manage Sections"
            description="Reorder and organize all your resume sections. Control visibility and add custom sections."
            icon={Database}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
            onClick={() => navigate('/admin/sections')}
          />
          <QuickActionCard
            title="Personal Information"
            description="Update your contact details, bio, and personal information displayed on your resume."
            icon={User}
            color="bg-gradient-to-br from-green-500 to-green-600"
            onClick={() => navigate('/admin/personal')}
          />
          <QuickActionCard
            title="Add New Project"
            description="Showcase your latest work by adding new projects to your portfolio."
            icon={FolderOpen}
            color="bg-gradient-to-br from-purple-500 to-purple-600"
            onClick={() => navigate('/admin/projects')}
          />
          <QuickActionCard
            title="Update Experience"
            description="Add your latest work experience, internships, or professional roles."
            icon={Briefcase}
            color="bg-gradient-to-br from-orange-500 to-orange-600"
            onClick={() => navigate('/admin/experience')}
          />
          <QuickActionCard
            title="Education & Skills"
            description="Keep your educational background and technical skills up to date."
            icon={GraduationCap}
            color="bg-gradient-to-br from-indigo-500 to-indigo-600"
            onClick={() => navigate('/admin/education')}
          />
          <QuickActionCard
            title="Certifications"
            description="Add new professional certifications and credentials you've earned."
            icon={Award}
            color="bg-gradient-to-br from-red-500 to-red-600"
            onClick={() => navigate('/admin/certifications')}
          />
        </div>
      </div>

      {/* Footer Stats */}
      <div className="bg-admin-card border border-admin-border rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-admin-accent mr-3" />
            <span className="text-admin-text/70">Last updated: {new Date().toLocaleDateString()}</span>
          </div>
          <button
            onClick={fetchDashboardStats}
            className="flex items-center px-4 py-2 bg-admin-accent text-admin-bg rounded-lg hover:bg-admin-accent/90 transition-colors duration-200"
          >
            <Activity className="w-4 h-4 mr-2" />
            Refresh Stats
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
