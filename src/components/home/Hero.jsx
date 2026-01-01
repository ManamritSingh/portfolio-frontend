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
import portraitUrl from '../../assets/IMG_1874.JPG';

export default function Hero() {
  // Replace with a public asset (e.g., /images/portrait.png) instead of an absolute path
  // const portraitUrl = "src/assets/IMG_1874.JPG";

  return (
    <Container
      maxWidth={false}
      sx={{ pt: { xs: 3, md: 6 }, pb: { xs: 6, md: 10 } }}
    >
      <Paper
        elevation={3}
        sx={{
          borderRadius: { xs: 16, md: 10 }, // rounded edges
          overflow: "hidden", // clip the diagonal and image inside the card
          // Optional: add a soft outline for definition on light backgrounds
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            position: "relative",
            minHeight: { xs: "auto", md: "45vh", lg: "96vh" },
            display: { xs: "flex", md: "flex", lg: "block" },
            flexDirection: { xs: "column", md: "column", lg: "initial" },
            // Two sections via gradient inside the card
            background: {
              xs: `linear-gradient(78deg,
                    var(--mui-palette-background-paper) 0 48%,
                    var(--mui-palette-common-black) 48% 100%)`,
              md: `linear-gradient(78deg,
                    var(--mui-palette-background-paper) 0 48%,
                    var(--mui-palette-common-black) 48% 100%)`,
              lg: `linear-gradient(78deg,
                    var(--mui-palette-background-paper) 0 48%,
                    var(--mui-palette-common-black) 48% 100%)`,
            },
          }}
        >
          {/* Left content */}
          <Container
            maxWidth="lg"
            sx={{
              minHeight: { xs: "auto", md: "45vh", lg: "95vh" }, // ensure it has height to center within
              display: "flex",
              alignItems: "center",
              disableGutters: true, // if you prefer no side padding
              px: { xs: 2, md: 3, lg: 0 }, // or control gutters explicitly
              py: { xs: 4, md: 5, lg: 0 },
            }}
          >
            <Box
              sx={{
                maxWidth: { xs: 600, md: 720 },
                width: "100%",
                // manual horizontal control:
                ml: { xs: 0, md: 0, lg: "2%" }, // shift right at lg+
                mr: { xs: 0, md: 0 },
                textAlign: { xs: "left", md: "left" },
              }}
            >
              <Typography
                variant="overline"
                sx={(theme) => ({
                  color: "text.secondary",
                  letterSpacing: 2,
                  [theme.breakpoints.only("md")]: { fontSize: "1.5rem" },
                })}
              >
                Hi, I am
              </Typography>
              <Typography
                variant="h2"
                sx={(theme) => ({
                  fontWeight: 800,
                  lineHeight: 1.05,
                  mt: 1,
                  [theme.breakpoints.down("sm")]: { fontSize: "1rem" },
                  [theme.breakpoints.only("md")]: { fontSize: "2.5rem" },
                })}
              >
                Manamrit Singh
              </Typography>
              <Typography
                variant="h6"
                sx={(theme) => ({
                  color: "text.secondary",
                  mt: 2,
                  fontWeight: 600,
                  [theme.breakpoints.down("sm")]: { fontSize: "0.95rem" },
                  [theme.breakpoints.only("md")]: { fontSize: "2.2rem" },
                })}
              >
                CS GRAD
              </Typography>

              <Stack
                direction="row"
                spacing={1.5}
                sx={{ mt: { xs: 3, md: 4 }, justifyContent: "flex-start" }}
              >
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

              backgroundSize: { xs: "70%", md: "85%", lg: "60%" },
              backgroundPosition: {
                xs: "right -9% bottom",
                md: "right -68% bottom",
                lg: "right bottom",
              },
              WebkitMaskImage: {
                xs: "linear-gradient(78deg, transparent 0 48%, #000 48% 100%)",
                md: "linear-gradient(78deg, transparent 0 48%, #000 48% 100%)",
                lg: "linear-gradient(78deg, transparent 0 48%, #000 48% 100%)",
              },
              maskImage: {
                xs: "linear-gradient(78deg, transparent 0 48%, #000 48% 100%)",
                md: "linear-gradient(78deg, transparent 0 48%, #000 48% 100%)",
                lg: "linear-gradient(78deg, transparent 0 48%, #000 48% 100%)",
              },
            }}
          />
        </Box>
      </Paper>
    </Container>
  );
}
