// src/hooks/useResumePdf.js
import { useRef, useState, useCallback } from 'react';

let jsPDFLib = null;
let html2canvasLib = null;

export default function useResumePdf() {
  const targetRef = useRef(null);
  const [exporting, setExporting] = useState(false);

  const ensureLibs = useCallback(async () => {
    if (!jsPDFLib) {
      const { jsPDF } = await import('jspdf');
      jsPDFLib = jsPDF;
    }
    if (!html2canvasLib) {
      const mod = await import('html2canvas');
      html2canvasLib = mod.default || mod;
    }
  }, []);

  const exportPdf = useCallback(async (filename = 'resume.pdf') => {
    if (!targetRef.current) return;
    setExporting(true);
    try {
      await ensureLibs();
      const node = targetRef.current;

      const scale = Math.max(window.devicePixelRatio || 1, 2);
      const canvas = await html2canvasLib(node, {
        scale,
        useCORS: true,
        allowTaint: false,
        backgroundColor: getComputedStyle(document.body).backgroundColor || '#ffffff',
        windowWidth: node.scrollWidth,
        windowHeight: node.scrollHeight,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      const pxToMm = (px) => (px * 25.4) / 96;
      const pdfWidth = pxToMm(canvas.width / scale);
      const pdfHeight = pxToMm(canvas.height / scale);
      const pdf = new jsPDFLib({
        orientation: pdfWidth > pdfHeight ? 'l' : 'p',
        unit: 'mm',
        format: [pdfWidth, pdfHeight],
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(filename);
    } finally {
      setExporting(false);
    }
  }, [ensureLibs]);

  return { targetRef, exportPdf, exporting };
}
