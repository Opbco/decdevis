import React from "react";
import { styled } from "@mui/material/styles";
import {
  Typography,
  FormControl,
  InputAdornment,
  InputLabel,
  Input,
  IconButton,
  Button,
  CircularProgress,
  Box
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  AccountCircle,
  KeySharp,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { connect } from "react-redux";
import { loginUser, clearErrors } from "./../redux/actions/UserActions";
import Alert from "@mui/material/Alert";

const Grid = styled("div")({
  display: "grid",
  placeItems: "center",
  minHeight: "100vh",
  width: "100%",
});


const Form = styled("form")({
  display: "flex",
  flexDirection: "column",
  gap: 16,
  justifyContent: "space-around",
  marginTop: 24,
});

const Login = ({ error, isLoading, loginUser, clearErrors }) => {
  const { t } = useTranslation(["login"]);
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
    showPassword: false,
  });
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  let navigate = useNavigate();


  const handleChange = (prop) => (event) => {
    setCredentials({ ...credentials, [prop]: event.target.value });
  };
  const handleClickShowPassword = () => {
    setCredentials({
      ...credentials,
      showPassword: !credentials.showPassword,
    });
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const submitForm = (e) => {
    e.preventDefault();
    console.log(from);
    loginUser(credentials, navigate, from);
  };

  return (
    <>
      <Grid id="#flogin">
        <Box display="flex" flexDirection="column" justifyContent="center">
          <Typography
            component="h3"
            variant="caption"
            align="center"
          >
            {t("title")}
          </Typography>
          {isLoading ? (
            <CircularProgress sx={{ mt: "4rem", alignSelf: "center" }} />
          ) : (
            <>
              <Form>
                {error && (
                  <Alert
                    onClose={() => {
                      clearErrors();
                    }}
                    severity="error"
                  >
                    {error}
                  </Alert>
                )}
                <FormControl fullWidth variant="standard">
                  <InputLabel htmlFor="email">{t("username")}</InputLabel>
                  <Input
                    id="email"
                    value={credentials.pseudo}
                    onChange={handleChange("email")}
                    startAdornment={
                      <InputAdornment position="start">
                        <AccountCircle />
                      </InputAdornment>
                    }
                  />
                </FormControl>
                <FormControl fullWidth variant="standard">
                  <InputLabel htmlFor="password">{t("password")}</InputLabel>
                  <Input
                    id="password"
                    type={credentials.showPassword ? "text" : "password"}
                    value={credentials.password}
                    onChange={handleChange("password")}
                    startAdornment={
                      <InputAdornment position="start">
                        <KeySharp />
                      </InputAdornment>
                    }
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                        >
                          {credentials.showPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                </FormControl>
                <Button
                  variant="contained"
                  sx={{ alignSelf: "flex-end", marginTop: 2 }}
                  onClick={(e) => submitForm(e)}
                >
                  {t("seconnecter")}
                </Button>
              </Form>
            </>
          )}
        </Box>
      </Grid>
    </>
  );
};

const mapStateToProps = (state) => ({
  error: state.errors,
  isLoading: state.loading,
});

const mapActionsToProps = {
  loginUser,
  clearErrors,
};

export default connect(mapStateToProps, mapActionsToProps)(Login);
