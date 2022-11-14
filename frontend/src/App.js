import React from "react";
import "./App.css";
import { Link as RouterLink, useLocation, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AppBar from "./components/AppBar";
import Drawer from "./components/Drawer";
import { Box } from "@mui/material";

function App() {
  const { i18n, t } = useTranslation(["common"]);
  const location = useLocation();
  const [open, setOpen] = React.useState(true);

  return (
    <div className="App">
      <AppBar openDrawer={setOpen} />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          marginTop: 8,
        }}
      >
        <Drawer open={open} />
        <main>
          <Outlet />
        </main>
      </Box>
    </div>
  );
}

export default App;
