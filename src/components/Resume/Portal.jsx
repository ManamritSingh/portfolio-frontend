// src/components/Portal.jsx
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function Portal({ children, id = "resume-export-host" }) {
  const hostRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let host = document.getElementById(id);
    if (!host) {
      host = document.createElement("div");
      host.id = id;
      document.body.appendChild(host);
    }
    hostRef.current = host;
    setMounted(true);
    return () => {
      // keep host for reuse across exports (don’t remove)
    };
  }, [id]);

  if (!mounted || !hostRef.current) return null;
  return createPortal(children, hostRef.current);
}
