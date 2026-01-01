import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";

const links = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Portfolio", href: "/start" },
  { label: "Skills", href: "#skills" },
  { label: "Contact", href: "#contact" },
  { label: "Admin", href: "/admin" },
];

export default function Navbar({
  resumeLink = "https://drive.google.com/drive/folders/17O85EriUJ2HJpUWPSCLsdlDZMpkY9IEJ?usp=sharing",
}) {
  const BAR_HEIGHT = 64;
  const navLinks = [
    ...links,
    {
      label: "Download Resume",
      href: resumeLink,
      target: "_blank",
      rel: "noopener noreferrer",
      resume: true,
    },
  ];

  return (
    <Box
      component="nav"
      sx={{
        position: "fixed",
        top: 15,
        left: "50%",
        transform: "translateX(-50%)",
        height: { xs: "auto", sm: BAR_HEIGHT },
        zIndex: (t) => t.zIndex.appBar,
        // Transparent pill
        backgroundColor: "transparent",
        borderRadius: 9999,
        overflow: "hidden",
        // Subtle outline to define the pill on any background
        border: "1px solid",
        borderColor: "divider",
        // Optional glassy blur
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        // Width control (adjust as desired)
        width: { xs: "calc(100% - 60px)", sm: "auto" },
        // If using "auto" width, rely on Container's maxWidth below
      }}
    >
      <Container
        maxWidth="md"
        sx={{
          height: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 1.5, md: 2 },
          py: { xs: 0.5, sm: 0 },
          // Ensure transparent inside too
          backgroundColor: "transparent",
        }}
      >
        <Stack
          direction="row"
          spacing={{ xs: 0.15, sm: 1 }}
          sx={{ flexWrap: "nowrap", justifyContent: "center" }}
        >
          {navLinks.map((l) => (
            <Button
              key={l.href}
              href={l.href}
              target={l.target}
              rel={l.rel}
              variant="text"
              disableElevation
              sx={{
                borderRadius: 9999,
                px: { xs: 0.35, sm: 1.5 },
                textTransform: "none",
                fontWeight: 600,
                fontSize: { xs: "0.58rem", sm: "0.875rem" },
                lineHeight: 1.1,
                minWidth: 0,
                whiteSpace: "nowrap",
                color: "text.primary",
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
                overflow: "hidden",
                ...(l.resume && {
                  display: "none",
                  "@media (max-width:900px)": { display: "inline-flex" },
                  backgroundColor: "primary.secondary",
                  color: "background.default",
                  fontSize: { xs: "0.62rem" },
                  px: { xs: 0.6 },
                  ml: { xs: "14px" },
                  whiteSpace: "nowrap",
                  "&:hover": {
                    backgroundColor: "primary.main",
                    color: "primary.contrastText",
                  },
                }),
              }}
            >
              {l.label}
            </Button>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}
