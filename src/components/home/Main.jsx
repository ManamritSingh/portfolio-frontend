import React from "react";
import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

import NavBar from "./Navbar.jsx";
import Hero from "./Hero.jsx";
import About from "./About.jsx";
import Skills from "./Skills.jsx";
import Socials from "./Socials.jsx";

const homeTheme = createTheme({
  cssVariables: true, // optional; enables var(--mui-...) for CSS if needed
  palette: {
    mode: "light",
    primary: { main: "#f5c4c5", secondary: "#5c0608", tertiary: "#000000"},
    background: { default: "#f5dadb", paper: "#ffffff" },
    text: { primary: "#5c0608", secondary: "#6b7280" },
    common: { black: "#000000", white: "#ffffff" },
  },
  typography: {
    fontFamily: ["Inter", "Roboto", "Helvetica", "Arial", "sans-serif"].join(
      ","
    ),
  },
});

export default function Main() {
  const NAV_HEIGHT = 64;

  // 🎯 use your Google Drive or Dropbox direct download link here
  const resumeLink = "https://drive.google.com/drive/folders/17O85EriUJ2HJpUWPSCLsdlDZMpkY9IEJ?usp=sharing";

  // shared button style (matches your NavBar aesthetic)
  const buttonStyle = {
    borderRadius: 9999,
    px: 1.5,
    textTransform: "none",
    fontWeight: 600,
    color: "text.primary",
    border: "1px solid",
    borderColor: "divider",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    backgroundColor: "transparent",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "primary.main",
      color: "primary.contrastText",
    },
    "&:focus-visible, &.Mui-focusVisible": {
      outline: "2px solid",
      outlineColor: "primary.main",
      outlineOffset: 2,
      borderRadius: 9999,
    },
    "&:active": {
      backgroundColor: "primary.dark",
      color: "primary.contrastText",
    },
  };

  const buttonStyle1 = {
    borderRadius: 9999,
    px: 1.5,
    textTransform: "none",
    fontWeight: 600,
    color: "background.default",
    border: "1px solid",
    borderColor: "divider",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    backgroundColor: "primary.secondary",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "primary.main",
      color: "primary.contrastText",
    },
    "&:focus-visible, &.Mui-focusVisible": {
      outline: "2px solid",
      outlineColor: "primary.main",
      outlineOffset: 2,
      borderRadius: 9999,
    },
    "&:active": {
      backgroundColor: "primary.dark",
      color: "primary.contrastText",
    },
  };

  return (
    <ThemeProvider theme={homeTheme}>
      <CssBaseline />
      <Box>
        <NavBar />

        {/* Floating buttons (top-right) */}
        <Stack
          direction="row"
          spacing={2}
          sx={{
            position: "fixed",
            top: 16,
            right: 16,
            zIndex: 1200,
            display: { xs: "none", sm: "flex" }, // hide on mobile if desired
          }}
        >
          <Button
            href="/start"
            sx={buttonStyle1}
          >
            Get Started
          </Button>

          <Button
            href={resumeLink}
            target="_blank"
            rel="noopener noreferrer"
            sx={buttonStyle}
          >
            Download Resume
          </Button>
        </Stack>

        {/* Main content */}
        <Box
          component="main"
          id="home"
          sx={{ pt: { xs: `${NAV_HEIGHT + 8}px`, md: `${NAV_HEIGHT + 16}px` } }}
        >
          <Hero />
          <Container
            id="about"
            maxWidth={false}
            disableGutters
            sx={{ py: { xs: 8, md: 10 }, width: "100%" }}
          >
            <About />
          </Container>
          <Container id="skills" maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
            <Skills />
          </Container>
          <Container id="contact" maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
            <Socials />
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
