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
];

export default function Navbar() {
  const BAR_HEIGHT = 64;

  return (
    <Box
      component="nav"
      sx={{
        position: "fixed",
        top: 15,
        left: "50%",
        transform: "translateX(-50%)",
        height: BAR_HEIGHT,
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
        width: { xs: "calc(100% - 30px)", sm: "auto" },
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
          // Ensure transparent inside too
          backgroundColor: "transparent",
        }}
      >
        <Stack direction="row" spacing={1} sx={{ display: { xs: "none", sm: "flex" } }}>
          {links.map((l) => (
            <Button
              key={l.href}
              href={l.href}
              variant="text"
              disableElevation
              sx={{
                borderRadius: 9999,
                px: 1.5,
                textTransform: "none",
                fontWeight: 600,
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
