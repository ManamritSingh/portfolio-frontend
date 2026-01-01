// src/components/home/Socials.jsx
import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import XIcon from '@mui/icons-material/X';
import EmailIcon from '@mui/icons-material/Email';

export default function Socials() {
  return (
    <Box
  component="footer"
  role="contentinfo"
  sx={{
    position: 'relative',
    left: '50%',
    transform: 'translateX(-50%)',
    right: 'auto',
    bottom: 'calc(env(safe-area-inset-bottom, 0px) - var(--footer-safe-offset, 0px))', // safe offset technique [9]
    zIndex: (theme) => theme.zIndex.appBar, // float above content
    width: 'min(1100px, 92vw)', // centered floating bar
    mx: 'auto',
    mb: { xs: 1, sm: 2 }, // visual breathing room from bottom
    px: 2,
    py: 2,
    bgcolor: 'primary.tertiary',
    color: 'primary.main',
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: { xs: 12, md: 10 }, // rounded corners for the floating feel
    boxShadow: 6, // MUI elevation [7]
    backdropFilter: 'saturate(120%) blur(8px)', // optional glassy feel [10]
    WebkitBackdropFilter: 'saturate(120%) blur(8px)',
  }}
>
      <Box sx={{ maxWidth: 1200, mx: 'auto', px : 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Contact
        </Typography>
        <Typography color="primary.main" sx={{ mb: 2 }}>
          My socials:
        </Typography>
        <Stack direction="row" spacing={1}>
          <IconButton
            color="inherit"
            aria-label="GitHub"
            href="https://github.com/ManamritSingh"
            target="_blank"
            rel="noreferrer"
            sx={{
              transition: (theme) => theme.transitions.create(['transform', 'color'], { duration: 150 }),
              '&:hover': { transform: 'translateY(-2px)', color: 'text.primary' },
            }}
          >
            <GitHubIcon />
          </IconButton>
          <IconButton
            color="inherit"
            aria-label="LinkedIn"
            href="https://www.linkedin.com/in/manamritsingh/"
            target="_blank"
            rel="noreferrer"
            sx={{
              transition: (theme) => theme.transitions.create(['transform', 'color'], { duration: 150 }),
              '&:hover': { transform: 'translateY(-2px)', color: 'text.primary' },
            }}
          >
            <LinkedInIcon />
          </IconButton>
          <IconButton
            color="inherit"
            aria-label="X"
            href="https://x.com/_manamrit_"
            target="_blank"
            rel="noreferrer"
            sx={{
              transition: (theme) => theme.transitions.create(['transform', 'color'], { duration: 150 }),
              '&:hover': { transform: 'translateY(-2px)', color: 'text.primary' },
            }}
          >
            <XIcon />
          </IconButton>
          <IconButton
            color="inherit"
            aria-label="Email"
            href="mailto:you@example.com"
            sx={{
              transition: (theme) => theme.transitions.create(['transform', 'color'], { duration: 150 }),
              '&:hover': { transform: 'translateY(-2px)', color: 'text.primary' },
            }}
          >
            <EmailIcon />
          </IconButton>
        </Stack>

        <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 2, color: 'primary.main' }}>
          <Typography variant="caption">© {new Date().getFullYear()} Manamrit Singh</Typography>
          <Typography variant="caption">•</Typography>
          <Typography variant="caption">All rights reserved</Typography>
        </Box>
      </Box>
    </Box>
  );
}
