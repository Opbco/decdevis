import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import App from "./App";
import Home from "./pages/Home";
import Login from "./pages/Login";
import { persistor, store } from "./redux/store";
import { PersistGate } from "redux-persist/integration/react";
import "./i18n";
import Authorized from "./utils/Authorized";
import reportWebVitals from "./reportWebVitals";
import {
  Box,
  createTheme,
  CssBaseline,
  ThemeProvider,
  CircularProgress,
} from "@mui/material";
import { blue } from "@mui/material/colors";
import Regions from "./pages/Regions";
import Departement from "./pages/Departement";
import Arrondissement from "./pages/Arrondissement";
import Structure from "./pages/Structure";
import Exam from "./pages/Exam";
import Session from "./pages/Session";
import Centres from "./pages/Centres";
import NotFound from "./pages/NotFound";
import Statistiques from "./pages/Statistiques";

const theme = createTheme({
  palette: {
    mode: "light",
    secondary: {
      main: "#faead6",
    },
  },
  typography: {
    fontSize: 12,
    caption: {
      color: blue[400],
      fontSize: 22,
      fontWeight: 700,
      textTransform: "uppercase",
      textShadow: "-0.3rem 1.1rem 0rem hsla(191, 59%, 41%, 0.2)",
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Suspense
        fallback={
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="100vh"
          >
            <CircularProgress sx={{ alignSelf: "center" }} />
          </Box>
        }
      >
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <BrowserRouter>
              <Routes>
                <Route
                  path="/"
                  element={
                    <Authorized auth={true}>
                      <App />
                    </Authorized>
                  }
                >
                  <Route index element={<Home />} />
                  <Route path="/regions" element={<Regions />} />
                  <Route path="/departements" element={<Departement />} />
                  <Route path="/arrondissements" element={<Arrondissement />} />
                  <Route path="/structures" element={<Structure />} />
                  <Route path="/exams" element={<Exam />}>
                    <Route path="/exams/sessions" element={<Session />} />
                  </Route>
                  <Route path="/exams/centres" element={<Centres />} />
                  <Route path="/exams/stats" element={<Statistiques />} />
                </Route>
                <Route
                  path="login"
                  element={
                    <Authorized auth={false}>
                      <Login />
                    </Authorized>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </PersistGate>
        </Provider>
      </Suspense>
    </ThemeProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
