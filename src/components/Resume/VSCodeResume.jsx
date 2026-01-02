// src/components/vscode/VSCodeResume.jsx
import React, { useState, useEffect, useRef } from "react";
import { fetchAllResumeData } from "../../utils/api";
import { useNavigate } from "react-router-dom";

import {
  SiPython,
  SiJavascript,
  SiTypescript,
  SiReact,
  SiMarkdown,
  SiYaml,
} from "react-icons/si";
import { DiJava } from "react-icons/di";
import { VscFileCode } from "react-icons/vsc";

// Titlebar with window controls; close navigates to /home
function VSCodeTitlebar() {
  const navigate = useNavigate();
  return (
    <div className="vscode-titlebar">
      <div className="window-controls">
        <button
          type="button"
          className="control close"
          aria-label="Close window"
          onClick={() => navigate("/home")}
        />
        <button
          type="button"
          className="control minimize"
          aria-label="minimize window"
          onClick={() => navigate("/home")}
        />
        <span className="control maximize"></span>
      </div>
      <div className="title-bar">Resume - Visual Studio Code</div>
      <div className="titlebar-actions">
        <span className="action-icon">⚙️</span>
      </div>
    </div>
  );
}

const VSCodeResume = () => {
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [highlightedSection, setHighlightedSection] = useState(null);

  const sectionRefs = useRef({});
  const editorRef = useRef(null);
  const navigate = useNavigate();

  // File extensions for each section (for sidebar file list)
  const sectionExtensions = {
    "personal-info": "md",
    experience: "py",
    education: "java",
    skills: "jsx",
    projects: "ts",
    certifications: "md",
    leadership: "yml",
  };

  const getFileIcon = (extension) => {
    switch (extension) {
      case "py":
        return <SiPython className="file-icon python" />;
      case "js":
        return <SiJavascript className="file-icon javascript" />;
      case "jsx":
        return <SiReact className="file-icon react" />;
      case "ts":
        return <SiTypescript className="file-icon typescript" />;
      case "md":
        return <SiMarkdown className="file-icon markdown" />;
      case "yml":
        return <SiYaml className="file-icon yaml" />;
      case "java":
        return <DiJava className="file-icon java" />;
      default:
        return <VscFileCode className="file-icon generic" />;
    }
  };

  useEffect(() => {
    document.body.className = "theme-dark";
    const loadResumeData = async () => {
      try {
        const data = await fetchAllResumeData();
        setResumeData(data);
        setSelectedFile({
          sectionType: "personal-info",
          sectionName: "Personal Info",
        });
        setHighlightedSection("personal-info");
      } catch (err) {
        console.error("Error loading resume data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadResumeData();
    return () => {
      document.body.className = "";
    };
  }, []);

  const handleFileClick = (section) => {
    setSelectedFile(section);
    setHighlightedSection(section.sectionType);

    const sectionElement = sectionRefs.current[section.sectionType];
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: "smooth", block: "start" });
      sectionElement.style.background = "var(--bg-line-highlight)";
      setTimeout(() => {
        sectionElement.style.background = "transparent";
      }, 2000);
    }
  };

  if (loading) {
    return (
      <div className="vscode-loading">
        <div className="loading-text">Loading VSCode Resume...</div>
        <div className="loading-dots">
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </div>
      </div>
    );
  }

  if (!resumeData) {
    return (
      <div className="vscode-error">
        <div className="error-text">Failed to load resume data</div>
        <div className="error-subtitle">
          Please check your connection and try again
        </div>
      </div>
    );
  }

  const sortedSections = resumeData.sections
    .filter(
      (section) => section.visible && section.sectionType !== "personal-info"
    )
    .sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div className="vscode-container">
      {/* Titlebar */}
      <VSCodeTitlebar />

      <div className="vscode-layout">
        {/* Left Sidebar - File Explorer */}
        <div className="vscode-sidebar">
          <div className="explorer-header">
            <div className="explorer-title">
              <span className="folder-icon">📁</span>
              <span>RESUME</span>
            </div>
            <div className="explorer-actions">
              <span className="action-icon">⋯</span>
            </div>
          </div>

          <div className="file-tree">
            {/* Personal info as README */}
            <div
              className={`file-item ${
                selectedFile?.sectionType === "personal-info" ? "active" : ""
              }`}
              onClick={() =>
                handleFileClick({
                  sectionType: "personal-info",
                  sectionName: "Personal Info",
                })
              }
            >
              <span className="file-icon">📝</span>
              <span className="file-name">Readme.md</span>
            </div>

            {/* Other sections */}
            {sortedSections.map((section) => (
              <div
                key={section.id || section.sectionType}
                className={`file-item ${
                  selectedFile?.sectionType === section.sectionType
                    ? "active"
                    : ""
                }`}
                onClick={() => handleFileClick(section)}
              >
                {getFileIcon(sectionExtensions[section.sectionType])}
                <span className="file-name">
                  {section.sectionName.toLowerCase().replace(/\s+/g, "-")}.
                  {sectionExtensions[section.sectionType]}
                </span>
              </div>
            ))}
          </div>

          {/* Status indicator */}
          <div className="sidebar-status">
            <div className="git-status">
              <span className="git-icon">🔗</span>
              <span className="git-text">main</span>
            </div>
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="vscode-editor" ref={editorRef}>
          {/* Tabs */}
          <div className="editor-tabs">
            <div className="tab active">
              <span className="tab-icon">📄</span>
              <span className="tab-name">resume.js</span>
              <span className="tab-close">×</span>
            </div>
          </div>

          {/* Code Content - Entire Resume */}
          <div className="editor-content">
            <div className="line-numbers">
              {Array.from({ length: 200 }, (_, i) => (
                <span key={i + 1}>{i + 1}</span>
              ))}
            </div>

            <div className="code-area">
              <FullResumeCode
                resumeData={resumeData}
                sortedSections={sortedSections}
                sectionRefs={sectionRefs}
                highlightedSection={highlightedSection}
              />
            </div>
          </div>

          {/* Status bar */}
          <div className="editor-status">
            <div className="status-left">
              <span className="status-item">JavaScript</span>
              <span className="status-item">UTF-8</span>
            </div>
            <div className="status-right">
              <span className="status-item">Ln 1, Col 1</span>
            </div>
          </div>
        </div>
      </div>

      {/* Centered floating glass pills (no download button) */}

      <div className="vscode-floating-actions">
        {/* Home */}
        <div
          onClick={() => navigate("/home")}
          role="button"
          aria-label="Go Home"
          className="vscode-floating-action"
        >
          <span>Home</span>
        </div>

        {/* Light Mode -> /resume */}
        <div
          onClick={() => navigate("/resume")}
          role="button"
          aria-label="Switch to light resume"
          className="vscode-floating-action"
        >
          <span>Download/Light Mode</span>
        </div>
      </div>
    </div>
  );
};

// Component that renders the entire resume as code in the VSCode UI
const FullResumeCode = ({
  resumeData,
  sortedSections,
  sectionRefs,
  highlightedSection,
}) => {
  return (
    <div className="code-content">
      <div className="code-line">
        <span className="comment">/**</span>
      </div>
      <div className="code-line">
        <span className="comment">
          {" "}
          * {resumeData.personal.name} - Software Developer Resume
        </span>
      </div>
      <div className="code-line">
        <span className="comment">
          {" "}
          * Generated on {new Date().toLocaleDateString()}
        </span>
      </div>
      <div className="code-line">
        <span className="comment"> * @author {resumeData.personal.name}</span>
      </div>
      <div className="code-line">
        <span className="comment"> * @contact {resumeData.personal.email}</span>
      </div>
      <div className="code-line">
        <span className="comment"> */</span>
      </div>
      <div className="code-line empty-line"></div>

      <div className="code-line">
        <span className="keyword">import</span>{" "}
        <span className="bracket">{"{"}</span>{" "}
        <span className="variable">skills</span>
        <span className="operator">,</span>{" "}
        <span className="variable">experience</span>
        <span className="operator">,</span>{" "}
        <span className="variable">projects</span>{" "}
        <span className="bracket">{"}"}</span>{" "}
        <span className="keyword">from</span>{" "}
        <span className="string">'./portfolio'</span>
        <span className="operator">;</span>
      </div>
      <div className="code-line empty-line"></div>

      <div className="code-line">
        <span className="keyword">const</span>{" "}
        <span className="variable">resume</span>{" "}
        <span className="operator">=</span>{" "}
        <span className="bracket">{"{"}</span>
      </div>

      {/* Personal Info */}
      <div
        ref={(el) => (sectionRefs.current["personal-info"] = el)}
        className={`code-section ${
          highlightedSection === "personal-info" ? "highlighted" : ""
        }`}
      >
        <div className="code-line indent">
          <span className="comment">// Personal Information</span>
        </div>
        <div className="code-line indent">
          <span className="property">personal</span>
          <span className="operator">:</span>{" "}
          <span className="bracket">{"{"}</span>
        </div>
        <div className="code-line indent-2">
          <span className="property">name</span>
          <span className="operator">:</span>{" "}
          <span className="string">"{resumeData.personal.name}"</span>
          <span className="operator">,</span>
        </div>
        <div className="code-line indent-2">
          <span className="property">email</span>
          <span className="operator">:</span>{" "}
          <a href={`mailto:${resumeData.personal.email}`} className="string">
            "{resumeData.personal.email}"
          </a>
          <span className="operator">,</span>
        </div>
        <div className="code-line indent-2">
          <span className="property">phone</span>
          <span className="operator">:</span>{" "}
          <span className="string">"{resumeData.personal.phone}"</span>
          <span className="operator">,</span>
        </div>
        <div className="code-line indent-2">
          <span className="property">location</span>
          <span className="operator">:</span>{" "}
          <span className="string">"{resumeData.personal.location}"</span>
          <span className="operator">,</span>
        </div>
        <div className="code-line indent-2">
          <span className="property">linkedin</span>
          <span className="operator">:</span>{" "}
          <a
            href={resumeData.personal.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="string"
          >
            "{resumeData.personal.linkedinUrl}"
          </a>
        </div>
        <div className="code-line indent">
          <span className="bracket">{"}"}</span>
          <span className="operator">,</span>
        </div>
        <div className="code-line empty-line"></div>
      </div>

      {/* Other sections */}
      {sortedSections.map((section, index) => (
        <div
          key={section.sectionType}
          ref={(el) => (sectionRefs.current[section.sectionType] = el)}
          className={`code-section ${
            highlightedSection === section.sectionType ? "highlighted" : ""
          }`}
        >
          <SectionCodeRenderer
            section={section}
            data={resumeData[section.sectionType.replace("-", "")]}
            isLast={index === sortedSections.length - 1}
          />
        </div>
      ))}

      <div className="code-line">
        <span className="bracket">{"}"}</span>
        <span className="operator">;</span>
      </div>

      <div className="code-line empty-line"></div>
      <div className="code-line">
        <span className="keyword">export</span>{" "}
        <span className="keyword">default</span>{" "}
        <span className="variable">resume</span>
        <span className="operator">;</span>
      </div>
      <div className="code-line empty-line"></div>
      <div className="code-line">
        <span className="comment">// End of resume.js</span>
      </div>
    </div>
  );
};

// Individual section code renderer
const SectionCodeRenderer = ({ section, data, isLast }) => {
  const renderSectionData = () => {
    switch (section.sectionType) {
      case "experience":
        return (
          <>
            <div className="code-line indent">
              <span className="comment">// Professional Experience</span>
            </div>
            <div className="code-line indent">
              <span className="property">experience</span>
              <span className="operator">:</span>{" "}
              <span className="bracket">[</span>
            </div>
            {data.map((exp, index) => (
              <div key={exp.id}>
                <div className="code-line indent-2">
                  <span className="bracket">{"{"}</span>
                </div>
                <div className="code-line indent-3">
                  <span className="property">position</span>
                  <span className="operator">:</span>{" "}
                  <span className="string">"{exp.position}"</span>
                  <span className="operator">,</span>
                </div>
                {exp.status && (
                  <div className="code-line indent-3">
                    <span className="property">status</span>
                    <span className="operator">:</span>{" "}
                    <span className="string">"{exp.status}"</span>
                    <span className="operator">,</span>
                  </div>
                )}
                <div className="code-line indent-3">
                  <span className="property">company</span>
                  <span className="operator">:</span>{" "}
                  <span className="string">"{exp.company}"</span>
                  <span className="operator">,</span>
                </div>
                <div className="code-line indent-3">
                  <span className="property">duration</span>
                  <span className="operator">:</span>{" "}
                  <span className="string">"{exp.duration}"</span>
                  <span className="operator">,</span>
                </div>
                <div className="code-line indent-3">
                  <span className="property">location</span>
                  <span className="operator">:</span>{" "}
                  <span className="string">"{exp.location}"</span>
                  <span className="operator">,</span>
                </div>
                <div className="code-line indent-3">
                  <span className="property">achievements</span>
                  <span className="operator">:</span>{" "}
                  <span className="bracket">[</span>
                </div>
                {exp.bulletPoints.map((bullet, idx) => (
                  <div
                    key={idx}
                    className="code-line achievement-bullet indent-4"
                  >
                    <span className="string">
                      "{bullet}"{idx < exp.bulletPoints.length - 1 ? "," : ""}
                    </span>
                  </div>
                ))}
                <div className="code-line indent-3">
                  <span className="bracket">]</span>
                </div>
                <div className="code-line indent-2">
                  <span className="bracket">{"}"}</span>
                  {index < data.length - 1 ? (
                    <span className="operator">,</span>
                  ) : (
                    ""
                  )}
                </div>
                {index < data.length - 1 && (
                  <div className="code-line empty-line"></div>
                )}
              </div>
            ))}
            <div className="code-line indent">
              <span className="bracket">]</span>
              {!isLast ? <span className="operator">,</span> : ""}
            </div>
          </>
        );

      case "skills":
        return (
          <>
            <div className="code-line indent">
              <span className="comment">// Technical Skills</span>
            </div>
            <div className="code-line indent">
              <span className="property">skills</span>
              <span className="operator">:</span>{" "}
              <span className="bracket">{"{"}</span>
            </div>
            {data.map((skill, index) => (
              <div key={skill.id} className="code-line indent-2">
                <span className="property">"{skill.category}"</span>
                <span className="operator">:</span>{" "}
                <span className="string">"{skill.skillsList}"</span>
                {index < data.length - 1 ? (
                  <span className="operator">,</span>
                ) : (
                  ""
                )}
              </div>
            ))}
            <div className="code-line indent">
              <span className="bracket">{"}"}</span>
              {!isLast ? <span className="operator">,</span> : ""}
            </div>
          </>
        );

      case "projects":
        return (
          <>
            <div className="code-line indent">
              <span className="comment">// Key Projects</span>
            </div>
            <div className="code-line indent">
              <span className="property">projects</span>
              <span className="operator">:</span>{" "}
              <span className="bracket">[</span>
            </div>
            {data.map((project, index) => (
              <div key={project.id}>
                <div className="code-line indent-2">
                  <span className="bracket">{"{"}</span>
                </div>
                <div className="code-line indent-3">
                  <span className="property">title</span>
                  <span className="operator">:</span>{" "}
                  <span className="string">"{project.title}"</span>
                  <span className="operator">,</span>
                </div>
                <div className="code-line indent-3">
                  <span className="property">description</span>
                  <span className="operator">:</span>{" "}
                  <span className="string">"{project.subtitle}"</span>
                  <span className="operator">,</span>
                </div>
                <div className="code-line indent-3">
                  <span className="property">features</span>
                  <span className="operator">:</span>{" "}
                  <span className="bracket">[</span>
                </div>
                {project.bulletPoints.map((bullet, idx) => (
                  <div
                    key={idx}
                    className="code-line achievement-bullet indent-4"
                  >
                    <span className="string">
                      "{bullet}"
                      {idx < project.bulletPoints.length - 1 ? "," : ""}
                    </span>
                  </div>
                ))}
                <div className="code-line indent-3">
                  <span className="bracket">]</span>
                </div>
                <div className="code-line indent-2">
                  <span className="bracket">{"}"}</span>
                  {index < data.length - 1 ? (
                    <span className="operator">,</span>
                  ) : (
                    ""
                  )}
                </div>
                {index < data.length - 1 && (
                  <div className="code-line empty-line"></div>
                )}
              </div>
            ))}
            <div className="code-line indent">
              <span className="bracket">]</span>
              {!isLast ? <span className="operator">,</span> : ""}
            </div>
          </>
        );

      case "education":
        return (
          <>
            <div className="code-line indent">
              <span className="comment">// Education</span>
            </div>
            <div className="code-line indent">
              <span className="property">education</span>
              <span className="operator">:</span>{" "}
              <span className="bracket">[</span>
            </div>
            {data.map((edu, index) => (
              <div key={edu.id}>
                <div className="code-line indent-2">
                  <span className="bracket">{"{"}</span>
                </div>
                <div className="code-line indent-3">
                  <span className="property">degree</span>
                  <span className="operator">:</span>{" "}
                  <span className="string">"{edu.degree}"</span>
                  <span className="operator">,</span>
                </div>
                <div className="code-line indent-3">
                  <span className="property">institution</span>
                  <span className="operator">:</span>{" "}
                  <span className="string">"{edu.institution}"</span>
                  <span className="operator">,</span>
                </div>
                <div className="code-line indent-3">
                  <span className="property">duration</span>
                  <span className="operator">:</span>{" "}
                  <span className="string">"{edu.duration}"</span>
                </div>
                <div className="code-line indent-2">
                  <span className="bracket">{"}"}</span>
                  {index < data.length - 1 ? (
                    <span className="operator">,</span>
                  ) : (
                    ""
                  )}
                </div>
              </div>
            ))}
            <div className="code-line indent">
              <span className="bracket">]</span>
              {!isLast ? <span className="operator">,</span> : ""}
            </div>
          </>
        );

      case "leadership":
        return (
          <>
            <div className="code-line indent">
              <span className="comment">// Leadership & Involvement</span>
            </div>
            <div className="code-line indent">
              <span className="property">leadership</span>
              <span className="operator">:</span>{" "}
              <span className="bracket">[</span>
            </div>
            {data.map((item, index) => (
              <div key={item.id}>
                <div className="code-line indent-2">
                  <span className="bracket">{"{"}</span>
                </div>
                <div className="code-line indent-3">
                  <span className="property">role</span>
                  <span className="operator">:</span>{" "}
                  <span className="string">
                    "{item.role || "Leadership Role"}"
                  </span>
                  <span className="operator">,</span>
                </div>
                <div className="code-line indent-3">
                  <span className="property">organization</span>
                  <span className="operator">:</span>{" "}
                  <span className="string">
                    "{item.organization || "Organization"}"
                  </span>
                  <span className="operator">,</span>
                </div>
                <div className="code-line indent-3">
                  <span className="property">description</span>
                  <span className="operator">:</span>{" "}
                  <span className="string">"{item.description}"</span>
                </div>
                <div className="code-line indent-2">
                  <span className="bracket">{"}"}</span>
                  {index < data.length - 1 ? (
                    <span className="operator">,</span>
                  ) : (
                    ""
                  )}
                </div>
              </div>
            ))}
            <div className="code-line indent">
              <span className="bracket">]</span>
              {!isLast ? <span className="operator">,</span> : ""}
            </div>
          </>
        );

      case "certifications":
        return (
          <>
            <div className="code-line indent">
              <span className="comment">// Certifications & Achievements</span>
            </div>
            <div className="code-line indent">
              <span className="property">certifications</span>
              <span className="operator">:</span>{" "}
              <span className="bracket">[</span>
            </div>
            {data.map((cert, index) => (
              <div key={cert.id}>
                <div className="code-line indent-2">
                  <span className="bracket">{"{"}</span>
                </div>
                <div className="code-line indent-3">
                  <span className="property">name</span>
                  <span className="operator">:</span>{" "}
                  <span className="string">"{cert.name}"</span>
                  <span className="operator">,</span>
                </div>
                <div className="code-line indent-3">
                  <span className="property">issuer</span>
                  <span className="operator">:</span>{" "}
                  <span className="string">"{cert.issuer}"</span>
                  <span className="operator">,</span>
                </div>
                {cert.issueDate && (
                  <div className="code-line indent-3">
                    <span className="property">issueDate</span>
                    <span className="operator">:</span>{" "}
                    <span className="string">"{cert.issueDate}"</span>
                    <span className="operator">,</span>
                  </div>
                )}
                {cert.expiryDate && (
                  <div className="code-line indent-3">
                    <span className="property">expiryDate</span>
                    <span className="operator">:</span>{" "}
                    <span className="string">"{cert.expiryDate}"</span>
                    <span className="operator">,</span>
                  </div>
                )}
                {cert.url && (
                  <div className="code-line indent-3">
                    <span className="property">credentialUrl</span>
                    <span className="operator">:</span>{" "}
                    <a
                      href={cert.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="string"
                    >
                      "{cert.url}"
                    </a>
                    <span className="operator">,</span>
                  </div>
                )}
                <div className="code-line indent-3">
                  <span className="property">verified</span>
                  <span className="operator">:</span>{" "}
                  <span className="constant">
                    {cert.url ? "true" : "false"}
                  </span>
                </div>
                <div className="code-line indent-2">
                  <span className="bracket">{"}"}</span>
                  {index < data.length - 1 ? (
                    <span className="operator">,</span>
                  ) : (
                    ""
                  )}
                </div>
              </div>
            ))}
            <div className="code-line indent">
              <span className="bracket">]</span>
              {!isLast ? <span className="operator">,</span> : ""}
            </div>
          </>
        );

      default:
        return (
          <>
            <div className="code-line indent">
              <span className="comment">// {section.sectionName}</span>
            </div>
            <div className="code-line indent">
              <span className="property">
                {section.sectionType.replace("-", "_")}
              </span>
              <span className="operator">:</span>{" "}
              <span className="string">"Coming soon..."</span>
              {!isLast ? <span className="operator">,</span> : ""}
            </div>
          </>
        );
    }
  };

  return (
    <>
      {renderSectionData()}
      <div className="code-line empty-line"></div>
    </>
  );
};

export default VSCodeResume;
