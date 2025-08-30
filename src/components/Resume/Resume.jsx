// src/components/resume/Resume.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

import { fetchAllResumeData } from '../../utils/api';
import Header from './Header';
import Section from './Section';


let jsPDFLib = null;
let html2canvasLib = null;

export default function Resume() {
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const printAreaRef = useRef(null);

  useEffect(() => {
    const loadResumeData = async () => {
      try {
        const data = await fetchAllResumeData();
        setResumeData(data);
      } catch (err) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    loadResumeData();
  }, []);

  const handleGoHome = () => navigate('/home', { replace: false });

  const handleGodark = () => navigate('/vscode', { replace: false });

  const ensureLibs = async () => {
    if (!jsPDFLib) {
      const { jsPDF } = await import('jspdf');
      jsPDFLib = jsPDF;
    }
    if (!html2canvasLib) {
      const mod = await import('html2canvas');
      html2canvasLib = mod.default || mod;
    }
  };

  const handleExportPdf = async () => {
    if (!printAreaRef.current) return;
    setExporting(true);
    try {
      await ensureLibs();
      const node = printAreaRef.current;

      // High-DPI render of just the resume area
      const scale = Math.max(window.devicePixelRatio || 1, 2);

      // Derive a solid background to avoid black outputs from transparent layers
      const pageBg = getComputedStyle(document.body).backgroundColor || '#ffffff';

      const canvas = await html2canvasLib(node, {
        scale,
        useCORS: true,       // allow cross-origin images that send CORS headers
        allowTaint: false,   // keep canvas untainted, prevents black/blank exports
        backgroundColor: pageBg,
        windowWidth: node.scrollWidth,
        windowHeight: node.scrollHeight,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      // Single-page PDF sized to the captured image’s CSS dimensions
      // Convert CSS pixels to millimeters (96 CSS px per inch)
      const pxToMm = (px) => (px * 25.4) / 96;
      const cssWidthPx = canvas.width / scale;
      const cssHeightPx = canvas.height / scale;
      const pdfWidth = pxToMm(cssWidthPx);
      const pdfHeight = pxToMm(cssHeightPx);

      const pdf = new jsPDFLib({
        orientation: pdfWidth > pdfHeight ? 'l' : 'p',
        unit: 'mm',
        format: [pdfWidth, pdfHeight], // custom single sheet sized to content
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('resume.pdf');
    } catch (e) {
      console.error(e);
      setError('Failed to export PDF');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '50vh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }} color="text.secondary">
          Loading resume…
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: '50vh', display: 'grid', placeItems: 'center' }}>
        <Typography color="error">Failed to load resume: {error}</Typography>
      </Box>
    );
  }

  if (!resumeData) {
    return (
      <Box sx={{ minHeight: '50vh', display: 'grid', placeItems: 'center' }}>
        <Typography color="error">No resume data available</Typography>
      </Box>
    );
  }

  const sortedSections = resumeData.sections
    .filter((section) => section.visible)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Export target */}
      <Box ref={printAreaRef} className="resume">
        <Header personal={resumeData.personal} />
        {sortedSections.map((section) => {
          let sectionData;
          switch (section.sectionType) {
            case 'personal-info':
              return null;
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
      </Box>

      {/* Centered floating glass pills — excluded from capture */}
      <Box
        data-html2canvas-ignore="true"
        sx={{
          position: 'fixed',
          left: '50%',
          bottom: { xs: 16, md: 24 },
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 1,
          zIndex: (t) => t.zIndex.modal + 1,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            borderRadius: 9999,
            overflow: 'hidden',
            background: 'rgba(255,255,255,0.22)',
            backdropFilter: 'saturate(160%) blur(10px)',
            WebkitBackdropFilter: 'saturate(160%) blur(10px)',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 12px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <Button
            onClick={handleGoHome}
            variant="text"
            sx={{
              minWidth: 0,
              width: 'auto',
              px: 2,
              py: 0.9,
              borderRadius: 9999,
              fontWeight: 800,
              textTransform: 'none',
              color: 'text.primary',
            }}
          >
            Home
          </Button>
        </Paper>

        <Paper
          elevation={3}
          sx={{
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            borderRadius: 9999,
            overflow: 'hidden',
            background: 'rgba(255,255,255,0.22)',
            backdropFilter: 'saturate(160%) blur(10px)',
            WebkitBackdropFilter: 'saturate(160%) blur(10px)',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 12px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <Button
            onClick={handleGodark}
            variant="text"
            sx={{
              minWidth: 0,
              width: 'auto',
              px: 2,
              py: 0.9,
              borderRadius: 9999,
              fontWeight: 800,
              textTransform: 'none',
              color: 'text.primary',
            }}
          >
            Tech Person ?
          </Button>
        </Paper>

        <Paper
          elevation={3}
          sx={{
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            borderRadius: 9999,
            overflow: 'hidden',
            background: 'rgba(255,255,255,0.22)',
            backdropFilter: 'saturate(160%) blur(10px)',
            WebkitBackdropFilter: 'saturate(160%) blur(10px)',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 12px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <Button
            onClick={handleExportPdf}
            variant="text"
            disabled={exporting}
            sx={{
              minWidth: 0,
              width: 'auto',
              px: 2,
              py: 0.9,
              borderRadius: 9999,
              fontWeight: 800,
              textTransform: 'none',
              color: 'text.primary',
              opacity: exporting ? 0.7 : 1,
            }}
          >
            {exporting ? 'Exporting…' : 'Export PDF'}
          </Button>
        </Paper>
      </Box>

      {/* Print styles — ensure no fixed UI is printed */}
      <style>{`
        @media print {
          @page { margin: 10mm; }
          body { background: #fff !important; }
          .MuiBox-root[style*="position: fixed"] { display: none !important; }
        }
      `}</style>
    </Box>
  );
}
