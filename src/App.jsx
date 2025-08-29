import React from 'react';
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

// Portfolio routes
import ThemeManager from './components/ThemesManager.jsx';
import Resume from './components/Resume/Resume';
import VSCodeResume from './components/Resume/VSCodeResume';
import './styles/themes.css';

// Home (public landing) sections using MUI
import Main from './components/home/Main.jsx'



function App() {
  return (
    <Router>
      <div className="App">
        {/* ThemeManager can stay global so all routes inherit themes */}
        <ThemeManager />

        <Routes>
          {/* Public/portfolio routes */}
          <Route path="/" element={<Resume />} />
          <Route path="/vscode" element={<VSCodeResume />} />

          <Route path="/home" element={<Main />} />

          {/* Admin routes with nested structure */}
          <Route path="/admin" element={<AdminLayout />}>
            {/* Dashboard as default (index) */}
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />

            {/* Content Management */}
            <Route path="personal" element={<PersonalInfoManager />} />
            <Route path="experience" element={<ExperienceManager />} />
            <Route path="education" element={<EducationManager />} />
            <Route path="skills" element={<SkillsManager />} />
            <Route path="projects" element={<ProjectsManager />} />
            <Route path="certifications" element={<CertificationsManager />} />
            <Route path="leadership" element={<LeadershipManager />} />

            {/* Section Management */}
            <Route path="sections" element={<UnifiedSectionsManager />} />
            <Route path="sections/:sectionId/content" element={<SectionContentManager />} />

            {/* Catch-all redirect for invalid admin routes */}
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>

          {/* Direct admin access redirect */}
          <Route path="/admin-dashboard" element={<Navigate to="/admin/dashboard" replace />} />

          {/* Catch-all redirect - portfolio as default */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
