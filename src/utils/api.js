// src/utils/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const API_ENDPOINTS = {
  sections: `${API_BASE_URL}/api/sections/unified/public`,
  personalInfo: `${API_BASE_URL}/api/personal-info`,
  experience: `${API_BASE_URL}/api/experience/public`,
  education: `${API_BASE_URL}/api/education/public`,
  skills: `${API_BASE_URL}/api/skills/public`,
  projects: `${API_BASE_URL}/api/projects/public`,
  certifications: `${API_BASE_URL}/api/certifications/public`,
  leadership: `${API_BASE_URL}/api/leadership/public`
};

export const fetchAllResumeData = async () => {
  try {
    const [
      sections, personal, experience, education,
      skills, projects, certifications, leadership
    ] = await Promise.all([
      fetch(API_ENDPOINTS.sections).then(r => r.json()),
      fetch(API_ENDPOINTS.personalInfo).then(r => r.json()),
      fetch(API_ENDPOINTS.experience).then(r => r.json()),
      fetch(API_ENDPOINTS.education).then(r => r.json()),
      fetch(API_ENDPOINTS.skills).then(r => r.json()),
      fetch(API_ENDPOINTS.projects).then(r => r.json()),
      fetch(API_ENDPOINTS.certifications).then(r => r.json()),
      fetch(API_ENDPOINTS.leadership).then(r => r.json())
    ]);

    return {
      sections, personal, experience, education,
      skills, projects, certifications, leadership
    };
  } catch (error) {
    console.error('Error fetching resume data:', error);
    throw error;
  }
};
