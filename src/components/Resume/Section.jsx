import React from 'react';

const Section = ({ section, data }) => {
  const renderSectionContent = () => {
    switch (section.sectionType) {
      case 'education':
        return (
          <div className="education-content">
            {data.map(item => (
              <div key={item.id} className="education-item">
                <div className="education-header">
                  <span className="degree">{item.degree}, {item.institution}</span>
                  <span className="duration">{item.duration}</span>
                </div>
              </div>
            ))}
          </div>
        );

        case 'personal-info':
            return null;
        

      case 'skills':
        return (
          <div className="skills-content">
            {data.map(skill => (
              <div key={skill.id} className="skill-category">
                <strong>{skill.category}</strong>
                <div className="skills-list">{skill.skillsList}</div>
              </div>
            ))}
          </div>
        );

      case 'experience':
        return (
          <div className="experience-content">
            {data.map(exp => (
              <div key={exp.id} className="experience-item">
                <div className="experience-header">
                  <div className="position-company">
                    <span className="position">{exp.position}</span>
                    {/* {exp.status && <span className="status">({exp.status})</span>} */}
                    <br />
                    <span className="company">{exp.company}</span>
                  </div>
                  <div className="duration-location">
                    <div className="duration">{exp.duration}</div>
                    <div className="location">{exp.location}</div>
                  </div>
                </div>
                <ul className="bullet-points">
                  {exp.bulletPoints.map((bullet, idx) => (
                    <li key={idx}>{bullet}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        );

      case 'projects':
        return (
          <div className="projects-content">
            {data.map(project => (
              <div key={project.id} className="project-item">
                <div className="project-header">
                  <strong>{project.title}</strong>
                </div>
                <div className="project-subtitle">{project.subtitle}</div>
                <ul className="bullet-points">
                  {project.bulletPoints.map((bullet, idx) => (
                    <li key={idx}>{bullet}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        );

      case 'leadership':
        return (
          <div className="leadership-content">
            <ul className="bullet-points">
              {data.map(item => (
                <li key={item.id}>{item.description}</li>
              ))}
            </ul>
          </div>
        );

      case 'certifications':
        return (
          <div className="certifications-content">
            <ul className="bullet-points">
              {data.map(cert => (
                <li key={cert.id}>
                  {cert.name} – {cert.issuer}
                  {cert.url && (
                    <>
                      {' '}[<a href={cert.url} target="_blank" rel="noopener noreferrer">Credential</a>]
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        );

      default:
        return <div>Section type not implemented: {section.sectionType}</div>;
    }
  };

  return (
    <section className="resume-section">
      <h2 className="section-title">{section.sectionName.toUpperCase()}</h2>
      {renderSectionContent()}
    </section>
  );
};

export default Section;
