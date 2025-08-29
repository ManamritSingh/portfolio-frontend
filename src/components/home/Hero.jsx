// src/components/home/Hero.jsx
import React from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import EmailIcon from "@mui/icons-material/Email";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";

export default function Hero() {
  // Replace with a public asset (e.g., /images/portrait.png) instead of an absolute path
  const portraitUrl = "src/assets/IMG_1874.JPG";

  return (
    <Container
      maxWidth={false}
      sx={{ pt: { xs: 3, md: 6 }, pb: { xs: 6, md: 10 } }}
    >
      <Paper
        elevation={3}
        sx={{
          borderRadius: { xs: 30, md: 10 }, // rounded edges
          overflow: "hidden", // clip the diagonal and image inside the card
          // Optional: add a soft outline for definition on light backgrounds
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            position: "relative",
            minHeight: { xs: 720, md: "96vh" },
            // Two sections via gradient inside the card
            background: {
              xs: `linear-gradient(78deg,
                    var(--mui-palette-background-paper) 0 55%,
                    var(--mui-palette-common-black) 55% 100%)`,
              md: `linear-gradient(78deg,
                    var(--mui-palette-background-paper) 0 48%,
                    var(--mui-palette-common-black) 48% 100%)`,
            },
          }}
        >
          {/* Left content */}
          <Container
            maxWidth="lg"
            sx={{
              minHeight: { xs: "7vh", md: "95vh" }, // ensure it has height to center within
              display: "flex",
              alignItems: "center",
              disableGutters: true, // if you prefer no side padding
              px: { xs: 2, md: 0 }, // or control gutters explicitly
            }}
          >
            <Box
              sx={{
                maxWidth: { xs: 600, md: 720 },
                width: "100%",
                // manual horizontal control:
                ml: { xs: 2, md: "2%" }, // shift right at md+
                mr: { xs: 2, md: 0 }, // keep a small right gutter on mobile
                textAlign: { xs: "left" },
              }}
            >
              <Typography
                variant="overline"
                sx={{ color: "text.secondary", letterSpacing: 2 }}
              >
                Hi, I am
              </Typography>
              <Typography
                variant="h2"
                sx={{ fontWeight: 800, lineHeight: 1.05, mt: 1 }}
              >
                Manamrit Singh
              </Typography>
              <Typography
                variant="h6"
                sx={{ color: "text.secondary", mt: 2, fontWeight: 600 }}
              >
                CS GRAD
              </Typography>

              <Stack direction="row" spacing={1.5} sx={{ mt: 4 }}>
                <IconButton
                  aria-label="Email"
                  href="mailto:manamritsingh@nyu.edu"
                >
                  <EmailIcon />
                </IconButton>
                <IconButton
                  aria-label="GitHub"
                  href="https://github.com/ManamritSingh"
                  target="_blank"
                  rel="noreferrer"
                >
                  <GitHubIcon />
                </IconButton>
                <IconButton
                  aria-label="LinkedIn"
                  href="https://www.linkedin.com/in/manamritsingh/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <LinkedInIcon />
                </IconButton>
              </Stack>
            </Box>
          </Container>

          {/* Right image layer (masked to the right half) */}
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              backgroundImage: `url(${portraitUrl})`,
              backgroundRepeat: "no-repeat",

              backgroundSize: { xs: "130%", md: "60%" },
              backgroundPosition: {
                xs: "right -2% bottom",
                md: "right -4% bottom",
              },
              WebkitMaskImage: {
                xs: "linear-gradient(78deg, transparent 0 55%, #000 55% 100%)",
                md: "linear-gradient(78deg, transparent 0 48%, #000 48% 100%)",
              },
              maskImage: {
                xs: "linear-gradient(78deg, transparent 0 55%, #000 55% 100%)",
                md: "linear-gradient(78deg, transparent 0 48%, #000 48% 100%)",
              },
            }}
          />
        </Box>
      </Paper>
    </Container>
  );
}
