import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#90caf9" },
    secondary: { main: "#ce93d8" },
    background: {
      default: "#0a1929",
      paper: "#132f4c",
    },
    success: { main: "#66bb6a", light: "#81c784", dark: "#388e3c" },
    warning: { main: "#ffa726", light: "#ffb74d", dark: "#f57c00" },
    error: { main: "#f44336", light: "#e57373", dark: "#d32f2f" },
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

export default theme;
