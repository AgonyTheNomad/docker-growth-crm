import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { ColorModeContext, useMode } from "./theme";
import { UserProvider, useAuth } from './services/UserContext';
import Sidebar from "./scenes/global/Sidebar";
import RouterConfig from "./router";
import './index.css';



function App() {
  const [theme, colorMode] = useMode();

  return (
      <UserProvider>
        <ColorModeContext.Provider value={colorMode}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
              <Box sx={{ display: 'flex', height: '100vh' }}>
                <SidebarComponent />
                <RouterConfig />
              </Box>
            </Router>
          </ThemeProvider>
        </ColorModeContext.Provider>
      </UserProvider>
  );
}

function SidebarComponent() {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? <Sidebar /> : null;
}

export default App;
