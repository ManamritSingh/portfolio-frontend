// components/home/Main.jsx
import React from "react";
import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";

// Local homepage sections
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
  const NAV_HEIGHT = 64; // match your NavBar height (Toolbar default is ~64 on desktop, 56 on mobile)

  return (
    <ThemeProvider theme={homeTheme}>
      <CssBaseline />
      <Box>
        <NavBar />
        {/* Add gap below the navbar */}
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
