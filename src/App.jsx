import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/admin/Layout';
import ProjectsManager from './components/admin/ProjectsManager';
import ExperienceManager from './components/admin/ExperienceManager';
import EducationManager from './components/admin/EducationManager';
import SkillsManager from './components/admin/SkillsManager';
import PersonalInfoManager from './components/admin/PersonalInfoManager';
import LeadershipManager from './components/admin/LeadershipManager';
import CertificationsManager from './components/admin/CertificationsManager';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/admin/projects" replace />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/projects" replace />} />
            <Route path="projects" element={<ProjectsManager />} />
            <Route path="experience" element={<ExperienceManager />} />
            <Route path="education" element={<EducationManager />} />
            <Route path="skills" element={<SkillsManager />} />
            <Route path="personal" element={<PersonalInfoManager />} />
            <Route path="leadership" element={<LeadershipManager />} />
            <Route path="certifications" element={<CertificationsManager />} />
            {/* We'll add more routes here */}
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
