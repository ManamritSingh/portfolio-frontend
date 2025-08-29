import React from 'react';

const Header = ({ personal }) => {
  return (
    <header className="resume-header">
      <h1 className="name">{personal.name}</h1>
      <div className="contact-info">
        <span>{personal.phone}</span>
        <span className="separator">⋄</span>
        <span>{personal.location}</span>
      </div>
      <div className="contact-info">
        <a href={`mailto:${personal.email}`}>
          {personal.email}
        </a>
        <span className="separator">⋄</span>
        <a href={personal.linkedinUrl} target="_blank" rel="noopener noreferrer">
          {personal.linkedinUrl}
        </a>
      </div>
    </header>
  );
};

export default Header;
