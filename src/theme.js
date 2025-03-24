import { createContext, useState, useMemo } from "react";
import { createTheme } from "@mui/material/styles";

import "@fontsource/montserrat"; 
import "@fontsource/jaldi"; 
import "@fontsource/signika"; 

export const tokens = (mode) => ({
  ...(mode === "dark"
    ? {
        // Dark mode color palette
        lightShades: {
          main: "#EAE3DF", 
        },
        lightAccent: {
          main: "#678094", 
        },
        Darkbackground: {
          main: "#141B2D", 
        },
        darkAccent: {
          main: "#43709B", 
        },
        darkShades: {
          main: "#151318", 
        },
      }
    : {
        // Light mode color palette
        lightShades: {
          main: "#EAE3DF", 
        },
        lightAccent: {
          main: "#678094",
        },
        Lightbackground: {
          main: "#EAE3DF", 
        },
        darkAccent: {
          main: "#43709B", 
        },
        darkShades: {
          main: "#141B2D", 
        },
      }),
});

export const themeSettings = (mode) => {
  const colors = tokens(mode);
  return {
    palette: {
      mode: mode,
      ...(mode === "dark"
        ? {
            // Palette values for dark mode
            primary: {
              main: colors.Darkbackground.main,
            },
            secondary: {
              main: colors.darkAccent.main,
            },
            background: {
              default: colors.Darkbackground.main,
            },
            text: {
              primary: colors.lightShades.main,
              secondary: colors.lightAccent.main,
            },
          }
        : {
            // Palette values for light mode
            primary: {
              main: colors.Lightbackground.main,
            },
            secondary: {
              main: colors.darkAccent.main,
            },
            background: {
              default: colors.lightShades.main,
            },
            text: {
              primary: colors.darkShades.main,
              secondary: colors.lightAccent.main,
            },
          }),
    },
    typography: {
      fontFamily: ["Signika", "sans-serif"].join(","),
      fontSize: 12,
      h1: {
        fontFamily: ["Montserrat", "sans-serif"].join(","),
        fontSize: 40,
      },
      h2: {
        fontFamily: ["Jaldi", "sans-serif"].join(","),
        fontSize: 32,
      },
      h3: {
        fontFamily: ["Montserrat", "sans-serif"].join(","),
        fontSize: 24,
      },
      h4: {
        fontFamily: ["Jaldi", "sans-serif"].join(","),
        fontSize: 20,
      },
      h5: {
        fontFamily: ["Montserrat", "sans-serif"].join(","),
        fontSize: 16,
      },
      h6: {
        fontFamily: ["Signika", "sans-serif"].join(","),
        fontSize: 14,
      },
    },
  };
};

// Context for color mode
export const ColorModeContext = createContext({
  toggleColorMode: () => {},
});

export const useMode = () => {
  const [mode, setMode] = useState("dark");

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () =>
        setMode((prev) => (prev === "light" ? "dark" : "light")),
    }),
    []
  );

  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);
  return [theme, colorMode];
};

