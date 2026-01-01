// src/components/home/Skills.jsx
import React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";

// img imports

import azurelogo from "/src/assets/azure.png";
import clogo from "/src/assets/c.png";
import cpplogo from "/src/assets/cpp.png";
import cudalogo from "/src/assets/cuda.png";
import djangologo from "/src/assets/django.png";
import gitlogo from "/src/assets/git.png";
import javalogo from "/src/assets/java.png";
import keraslogo from "/src/assets/keras.png";
import matplotliblogo from "/src/assets/matplotlib.png";
import mysqllogo from "/src/assets/mysql.png";
import numpylogo from "/src/assets/numpy.png";
import opencvlogo from "/src/assets/opencv.png";
import pandaslogo from "/src/assets/pandas.png";
import postgreslogo from "/src/assets/postgres.png";
import pythonlogo from "/src/assets/python.png";
import Pytorchlogo from "/src/assets/Pytorch.png";
import Reactlogo from "/src/assets/React.png";
import springlogo from "/src/assets/spring.png";
import tkinterlogo from "/src/assets/tkinter.png";
import vitelogo from "/src/assets/vite.jpeg";
import tensorflowlogo from "/src/assets/tensorflow.png";
import awslogo from "/src/assets/aws.png";
import gcplogo from "/src/assets/gcp.png";

const skills = [
  // ML / DL
  { name: "PyTorch", img: Pytorchlogo }, // Wikimedia [3]
  { name: "TensorFlow", img: tensorflowlogo }, // Wikipedia [13]
  { name: "Keras", img: keraslogo },
  { name: "OpenCV", img: opencvlogo },

  // Python ecosystem
  { name: "Python", img: pythonlogo },
  { name: "NumPy", img: numpylogo },
  { name: "Pandas", img: pandaslogo },
  { name: "Matplotlib", img: matplotliblogo },
  // { name: 'Tkinter', img: tkinterlogo },

  // Backend / APIs
  // { name: 'REST APIs', img: 'https://raw.githubusercontent.com/github/explore/main/topics/rest-api/rest-api.png' },
  { name: "Spring Boot", img: springlogo },
  { name: "Django", img: djangologo },
  { name: "React", img: Reactlogo },
  { name: "Vite", img: vitelogo },

  // Systems / Languages
  { name: "Java", img: javalogo },
  { name: "C++", img: cpplogo },
  { name: "C", img: clogo },

  // Tools / Cloud / DB
  { name: "Git", img: gitlogo },
  { name: "CUDA", img: cudalogo },
  { name: "Azure", img: azurelogo },
  { name: "AWS", img: awslogo },
  { name: "GCP", img: gcplogo },
  // { name: 'Amazon S3', img: 'https://raw.githubusercontent.com/github/explore/main/topics/amazon-s3/amazon-s3.png' },
  { name: "MySQL", img: mysqllogo },
  { name: "PostgresQL", img: postgreslogo },
];

export default function Skills() {
  return (
    <Box>
      <Typography
        variant="h4"
        sx={(theme) => ({
          fontWeight: 700,
          mb: 3,
          textAlign: "center",
          [theme.breakpoints.down("sm")]: { fontSize: "1.5rem" },
        })}
      >
        Skills
      </Typography>

      {/* Center last row */}
      <Box
        sx={{
          maxWidth: 1200,
          mx: "auto",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Grid
          container
          spacing={{ xs: 1, md: 3 }}
          justifyContent="center"
          alignItems="stretch"
          sx={{ width: "100%" }}
        >
          {skills.map((s) => (
            <Grid key={s.name} item xs={3} sm="auto">
              <Card
                elevation={3}
                sx={{
                  "--tile-size": { xs: "84px", sm: "160px" },
                  "--tile-padding": { xs: "6px", sm: "12px" },
                  "--tile-label-height": { xs: "19px", sm: "36px" },
                  "--tile-image-box": { xs: "42px", sm: "80px" },
                  width: "var(--tile-size)",
                  height: "var(--tile-size)",
                  borderRadius: { xs: 8, md: 10 },
                  border: "1px solid",
                  borderColor: "divider",
                  overflow: "hidden",
                  backgroundColor: "background.paper",
                  boxShadow:
                    "0 12px 24px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.06)",
                  display: "flex",
                  flexDirection: "column",

                  // Smooth transitions
                  transition: (theme) =>
                    theme.transitions.create(
                      ["transform", "box-shadow", "border-color"],
                      {
                        duration: 180,
                        easing: theme.transitions.easing.easeInOut,
                      }
                    ),
                  willChange: "transform",

                  // Hover + keyboard focus
                  "&:hover, &:focus-visible": {
                    transform: "translateY(-4px) scale3d(1.03, 1.03, 1)",
                    boxShadow:
                      "0 18px 36px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08)",
                    borderColor: "action.focus",
                  },

                  // Reduce motion preference
                  "@media (prefers-reduced-motion: reduce)": {
                    transition: "none",
                    "&:hover, &:focus-visible": {
                      transform: "none",
                    },
                  },
                }}
                tabIndex={0}
              >
                {/* Content with fixed spacing */}
                <Box
                  sx={{
                    flex: 1,
                    position: "relative",
                    p: "var(--tile-padding)",
                  }}
                >
                  {/* Top image box (near top, centered horizontally) */}
                  <Box
                    sx={{
                      width: "var(--tile-image-box)",
                      height: "var(--tile-image-box)",
                      mx: "auto",
                      mt: 1, // nudge down from top padding
                      // Optional: subtle logo response on parent hover
                      transition: (theme) =>
                        theme.transitions.create("opacity", { duration: 180 }),
                      ".MuiCard-root:hover & , .MuiCard-root:focus-visible &": {
                        opacity: 0.95,
                      },
                      "@media (prefers-reduced-motion: reduce)": {
                        transition: "none",
                      },
                    }}
                  >
                    <Box
                      component="img"
                      src={s.img}
                      alt={s.name}
                      loading="lazy"
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        objectPosition: "center",
                        display: "block",
                      }}
                    />
                  </Box>

                  {/* Label fixed at bottom inside the tile */}
                  <Box
                    sx={{
                      position: "absolute",
                      left: "var(--tile-padding)",
                      right: "var(--tile-padding)",
                      bottom: "calc(var(--tile-padding) - 2px)",
                      height: "var(--tile-label-height)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={(theme) => ({
                        fontWeight: 600,
                        [theme.breakpoints.down('sm')]: { fontSize: '0.5rem' },
                      })}
                      color="text.primary"
                      noWrap
                    >
                      {s.name}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
