import React, { useState, useEffect } from 'react';
import { fetchAllResumeData } from '../../utils/api';
import Header from './Header';
import Section from './Section';

const Resume = () => {
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadResumeData = async () => {
      try {
        const data = await fetchAllResumeData();
        setResumeData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadResumeData();
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <p>Loading resume...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <p>Failed to load resume: {error}</p>
      </div>
    );
  }

  if (!resumeData) {
    return <div className="error">No resume data available</div>;
  }

  // Sort sections by orderIndex
  const sortedSections = resumeData.sections
    .filter(section => section.visible)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div className="resume">
      {/* Header with personal info */}
      <Header personal={resumeData.personal} />
      
      {/* Render sections in order */}
      {sortedSections.map(section => {
        // Map section types to data
        let sectionData;
        switch (section.sectionType) {
          case 'personal-info':
            return null;
            break;
          case 'experience':
            sectionData = resumeData.experience;
            break;
          case 'education':
            sectionData = resumeData.education;
            break;
          case 'skills':
            sectionData = resumeData.skills;
            break;
          case 'projects':
            sectionData = resumeData.projects;
            break;
          case 'certifications':
            sectionData = resumeData.certifications;
            break;
          case 'leadership':
            sectionData = resumeData.leadership;
            break;
          default:
            sectionData = [];
        }

        return (
          <Section 
            key={section.id || section.sectionType}
            section={section}
            data={sectionData}
          />
        );
      })}
    </div>
  );
};

export default Resume;
