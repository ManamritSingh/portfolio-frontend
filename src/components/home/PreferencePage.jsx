// src/components/Preferences.jsx
import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useNavigate } from "react-router-dom";
import homeTheme from "./homeTheme";

export default function Preferences() {
  const navigate = useNavigate();
  const [isTech, setIsTech] = useState(null); // 'yes' | 'no' | null
  const [mode, setMode] = useState(null); // 'light' | 'dark' | null
  const [allowMobile, setAllowMobile] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // later, programmatically set default
  // useEffect(() => {
  //   const prefersDark = window.matchMedia?.(
  //     "(prefers-color-scheme: dark)"
  //   ).matches;
  //   // only if still unset
  //   if (mode === null) setMode(prefersDark ? "dark" : "light");
  // }, [mode]);

  const handleSubmit = () => {
    // ensure both values exist before proceeding
    if (!isTech || !mode) return; // guards against undefined/empty inputs [3][5]

    // persist the chosen color mode
    localStorage.setItem("color-mode", mode); // store user's theme choice [11][13]

    // only go to /vscode if tech === 'yes' AND dark mode was chosen
    const to = isTech === "yes" && mode === "dark" ? "/vscode" : "/resume"; // refine conditional [2][5]

    // use replace to avoid adding to history stack
    navigate(to, { replace: true }); // replace current entry per React Router v6 docs [7][12][14]
  };

  return (
    <ThemeProvider theme={homeTheme}>
      <CssBaseline enableColorScheme />

      {isMobile && !allowMobile ? (
        <Box
          sx={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            px: 2,
            bgcolor: "background.default",
          }}
        >
          <Paper
            elevation={3}
            sx={{
              width: "min(92vw, 520px)",
              borderRadius: 4,
              p: { xs: 3, md: 4 },
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              color: "text.primary",
              boxShadow:
                "0 16px 40px rgba(0,0,0,0.12), 0 6px 16px rgba(0,0,0,0.08)",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
              Best on desktop
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              This experience is designed for desktop screens. Mobile users can
              download the resume from the home page.
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap" }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate("/home")}
                sx={{
                  minWidth: 0,
                  width: "auto",
                  borderRadius: 9999,
                  px: 2.5,
                  py: 0.9,
                  fontWeight: 800,
                  textTransform: "none",
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  "&:hover": { bgcolor: "primary.dark" },
                  boxShadow:
                    "0 10px 24px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                Go to home
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => setAllowMobile(true)}
                sx={{
                  minWidth: 0,
                  width: "auto",
                  borderRadius: 9999,
                  px: 2,
                  py: 0.6,
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  textTransform: "none",
                  color: "text.secondary",
                  borderColor: "divider",
                  "&:hover": {
                    borderColor: "text.secondary",
                    bgcolor: "action.hover",
                  },
                }}
              >
                Continue anyway
              </Button>
            </Stack>
          </Paper>
        </Box>
      ) : (
      <Box
        sx={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          px: 2,
          bgcolor: "background.default",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            position: "relative",
            width: "min(92vw, 760px)",
            borderRadius: 4,
            overflow: "hidden",
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            color: "text.primary",
            boxShadow:
              "0 16px 40px rgba(0,0,0,0.12), 0 6px 16px rgba(0,0,0,0.08)",
            "&::before": {
              content: '""',
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              backdropFilter: "saturate(160%) blur(10px)",
              WebkitBackdropFilter: "saturate(160%) blur(10px)",
              zIndex: 0,
            },
          }}
        >
          <Box sx={{ position: "relative", zIndex: 1, p: { xs: 3, md: 4.5 } }}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
              Quick preferences
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Answer two short questions to tailor the experience.
            </Typography>

            <Stack spacing={4}>
              {/* Q1: Tech */}
              <Stack spacing={1.5}>
                <Typography sx={{ fontWeight: 700 }}>
                  Are you into tech?
                </Typography>

                {/* Compact floating pill group */}
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    borderRadius: 9999,
                    p: 0.5,
                    gap: 0.5,
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow:
                      "0 10px 24px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)",
                    width: "max-content", // shrink-wrap to content
                    maxWidth: "100%", // prevent overflow on small screens
                  }}
                >
                  <ToggleButtonGroup
                    value={isTech}
                    exclusive
                    onChange={(e, v) => v && setIsTech(v)}
                    aria-label="tech preference"
                    sx={{
                      width: "max-content", // avoid stretching
                      "& .MuiToggleButtonGroup-grouped": {
                        border: 0,
                        mx: 0.25,
                        "&:not(:first-of-type)": { border: 0 },
                        "&:not(:last-of-type)": { border: 0 },
                      },
                    }}
                  >
                    <ToggleButton
                      value="yes"
                      aria-label="tech-yes"
                      sx={{
                        minWidth: 0, // let content define width
                        width: "auto",
                        px: 1.5,
                        py: 0.6,
                        borderRadius: 9999,
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        lineHeight: 1.2,
                        textTransform: "none",
                        color: "text.primary",
                        "&.Mui-selected": {
                          bgcolor: "primary.main",
                          color: "primary.contrastText",
                        },
                        "&:hover": { bgcolor: "action.hover" },
                      }}
                    >
                      Yes
                    </ToggleButton>
                    <ToggleButton
                      value="no"
                      aria-label="tech-no"
                      sx={{
                        minWidth: 0,
                        width: "auto",
                        px: 1.5,
                        py: 0.6,
                        borderRadius: 9999,
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        lineHeight: 1.2,
                        textTransform: "none",
                        color: "text.primary",
                        "&.Mui-selected": {
                          bgcolor: "primary.main",
                          color: "primary.contrastText",
                        },
                        "&:hover": { bgcolor: "action.hover" },
                      }}
                    >
                      No
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              </Stack>

              <Divider />

              {/* Q2: Mode */}
              <Stack spacing={1.5}>
                <Typography sx={{ fontWeight: 700 }}>Preferred mode</Typography>

                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    borderRadius: 9999,
                    p: 0.5,
                    gap: 0.5,
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow:
                      "0 10px 24px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)",
                    width: "max-content", // shrink-wrap to content
                    maxWidth: "100%",
                  }}
                >
                  <ToggleButtonGroup
                    value={mode}
                    exclusive
                    onChange={(e, v) => v && setMode(v)}
                    aria-label="color mode"
                    sx={{
                      width: "max-content",
                      "& .MuiToggleButtonGroup-grouped": {
                        border: 0,
                        mx: 0.25,
                        "&:not(:first-of-type)": { border: 0 },
                        "&:not(:last-of-type)": { border: 0 },
                      },
                    }}
                  >
                    <ToggleButton
                      value="light"
                      aria-label="light-mode"
                      sx={{
                        minWidth: 0,
                        width: "auto",
                        px: 1.5,
                        py: 0.6,
                        borderRadius: 9999,
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        lineHeight: 1.2,
                        textTransform: "none",
                        color: "text.primary",
                        "&.Mui-selected": {
                          bgcolor: "primary.main",
                          color: "primary.contrastText",
                        },
                        "&:hover": { bgcolor: "action.hover" },
                      }}
                    >
                      Light
                    </ToggleButton>
                    <ToggleButton
                      value="dark"
                      aria-label="dark-mode"
                      sx={{
                        minWidth: 0,
                        width: "auto",
                        px: 1.5,
                        py: 0.6,
                        borderRadius: 9999,
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        lineHeight: 1.2,
                        textTransform: "none",
                        color: "text.primary",
                        "&.Mui-selected": {
                          bgcolor: "primary.main",
                          color: "primary.contrastText",
                        },
                        "&:hover": { bgcolor: "action.hover" },
                      }}
                    >
                      Dark
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              </Stack>

              {/* Pill submit */}
              <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleSubmit}
                  disabled={!isTech || !mode}
                  sx={{
                    minWidth: 0,
                    width: "auto",
                    borderRadius: 9999,
                    px: 2,
                    py: 0.9,
                    fontWeight: 800,
                    textTransform: "none",
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    "&:hover": { bgcolor: "primary.dark" },
                    boxShadow:
                      "0 10px 24px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)",
                  }}
                >
                  Continue
                </Button>
              </Box>
            </Stack>
          </Box>
        </Paper>
      </Box>
      )}
    </ThemeProvider>
  );
}
