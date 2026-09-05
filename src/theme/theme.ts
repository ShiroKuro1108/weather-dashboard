import { createTheme, type Theme } from "@mui/material/styles";

export const getAppTheme = (mode: "light" | "dark" = "dark"): Theme => {
  if (mode === "light") {
    return createTheme({
      palette: {
        mode: "light",
        primary: {
          main: "#1976d2",
          light: "#42a5f5",
          dark: "#1565c0",
        },
        secondary: {
          main: "#7b1fa2",
        },
        background: {
          default: "#f1f5f9",
          paper: "#ffffff",
        },
        text: {
          primary: "#0f172a",
          secondary: "#475569",
        },
        divider: "rgba(0, 0, 0, 0.08)",
        success: { main: "#16a34a", light: "#4ade80", dark: "#15803d" },
        warning: { main: "#d97706", light: "#fbbf24", dark: "#b45309" },
        error: { main: "#dc2626", light: "#f87171", dark: "#b91c1c" },
        action: {
          hover: "rgba(0, 0, 0, 0.04)",
          selected: "rgba(25, 118, 210, 0.08)",
        },
      },
      typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h4: { fontWeight: 700 },
        h6: { fontWeight: 600 },
      },
      shape: { borderRadius: 12 },
      components: {
        MuiAppBar: {
          styleOverrides: {
            root: {
              backgroundImage: "none",
              backgroundColor: "#ffffff",
              color: "#0f172a",
              borderBottom: "1px solid rgba(0,0,0,0.08)",
              boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              backgroundImage: "none",
              backgroundColor: "#ffffff",
              border: "1px solid rgba(0,0,0,0.08)",
              boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.04)",
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: "none",
            },
          },
        },
        MuiChip: {
          styleOverrides: {
            root: {
              fontWeight: 600,
            },
          },
        },
        MuiTableCell: {
          styleOverrides: {
            root: {
              borderColor: "rgba(0,0,0,0.08)",
              color: "#0f172a",
            },
            head: {
              fontWeight: 700,
              backgroundColor: "#f8fafc",
              color: "#0f172a",
              borderColor: "rgba(0,0,0,0.12)",
            },
          },
        },
      },
    });
  }

  // Dark Theme (Default / Current exact styles)
  return createTheme({
    palette: {
      mode: "dark",
      primary: { main: "#90caf9" },
      secondary: { main: "#ce93d8" },
      background: {
        default: "#0a1929",
        paper: "#132f4c",
      },
      divider: "rgba(255, 255, 255, 0.08)",
      success: { main: "#66bb6a", light: "#81c784", dark: "#388e3c" },
      warning: { main: "#ffa726", light: "#ffb74d", dark: "#f57c00" },
      error: { main: "#f44336", light: "#e57373", dark: "#d32f2f" },
      action: {
        hover: "rgba(255, 255, 255, 0.04)",
        selected: "rgba(144, 202, 249, 0.12)",
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h4: { fontWeight: 700 },
      h6: { fontWeight: 600 },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            border: "1px solid rgba(255,255,255,0.08)",
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: "rgba(255,255,255,0.06)",
          },
          head: {
            fontWeight: 700,
            backgroundColor: "#0d2137",
          },
        },
      },
    },
  });
};

const theme = getAppTheme("dark");
export default theme;
