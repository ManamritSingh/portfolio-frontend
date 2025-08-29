// src/components/home/About.jsx
import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

export default function About({
  width = '100%',
  height = 'auto',
  stickyTop = 80,
  padding = { xs: 3, md: 4 },
  borderRadius = { xs: 2, md: 3 }
}) {
  return (
    <Box sx={{ position: 'relative' , width: '100%' }}>
      <Container maxWidth={false} disableGutter sx={{ width: '100%' }}>
        <Paper
          elevation={3}
          sx={{
            position: 'sticky',
            top: stickyTop,
            zIndex: (t) => t.zIndex.appBar - 1,
            borderRadius: { xs: 30, md: 10 },
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
            boxShadow: '0 12px 28px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)',
            width,
            height,
            px: padding,
            py: padding
          }}
        >
          <Typography variant="h4" 
          align = "center"
          sx = {{ fontWeight: 700, mb: 2 }}>
            About
          </Typography>
          <Typography align='center' color="text.secondary">
            I’m someone who enjoys building at the intersection of technology, design, and problem-solving. My work spans across web development, backend systems, data science, and machine learning, with a strong interest in creating tools that feel intuitive and impactful. I enjoy turning complex ideas into practical solutions—whether that’s optimizing models for efficiency, shaping intuitive user experiences, or designing reliable systems that scale.
            <br/>Curiosity drives me: blending research-driven approaches with hands-on engineering. From analyzing large-scale datasets to architecting full-stack applications, my focus is always on creating tools that are not only functional but also meaningful to the people who use them.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
