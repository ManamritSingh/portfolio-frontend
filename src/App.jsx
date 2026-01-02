import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Admin layout and pages
import AdminLayout from './components/admin/Layout';
import Dashboard from './components/admin/Dashboard';
import ProjectsManager from './components/admin/ProjectsManager';
import ExperienceManager from './components/admin/ExperienceManager';
import EducationManager from './components/admin/EducationManager';
import SkillsManager from './components/admin/SkillsManager';
import PersonalInfoManager from './components/admin/PersonalInfoManager';
import LeadershipManager from './components/admin/LeadershipManager';
import CertificationsManager from './components/admin/CertificationsManager';
import UnifiedSectionsManager from './components/admin/UnifiedSectionsManager';
import SectionContentManager from './components/admin/SectionContentManager';
import LoginPage from './components/auth/LoginPage.jsx';

// Portfolio routes
import ThemeManager from './components/ThemesManager.jsx';
import Resume from './components/Resume/Resume';
import VSCodeResume from './components/Resume/VSCodeResume';
import Preferences from './components/home/PreferencePage.jsx';
import './styles/themes.css';
import { warmUpPublicApi } from './utils/api';

// Home (public landing) sections using MUI
import Main from './components/home/Main.jsx'

// auth related
import ProtectedRoute from "./auth/ProtectedRoute";
import { AuthProvider } from "./auth/AuthContext";

function App() {
  useEffect(() => {
    warmUpPublicApi();
  }, []);

  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <ThemeManager />
          <Routes>
            {/* public */}
            <Route path="/" element={<Main />} />
            <Route path="/vscode" element={<VSCodeResume />} />
            <Route path="/resume" element={<Resume />} />
            <Route path="/start" element={<Preferences />} />
            <Route path="/home" element={<Main />} />
            <Route path="/login" element={<LoginPage />} />

            {/* protect entire admin tree */}
            <Route element={<ProtectedRoute requiredRole="admin" />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="personal" element={<PersonalInfoManager />} />
                <Route path="experience" element={<ExperienceManager />} />
                <Route path="education" element={<EducationManager />} />
                <Route path="skills" element={<SkillsManager />} />
                <Route path="projects" element={<ProjectsManager />} />
                <Route path="certifications" element={<CertificationsManager />} />
                <Route path="leadership" element={<LeadershipManager />} />
                <Route path="sections" element={<UnifiedSectionsManager />} />
                <Route path="sections/:sectionId/content" element={<SectionContentManager />} />
                <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
              </Route>
            </Route>

            <Route path="/admin-dashboard" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}
export default App;
