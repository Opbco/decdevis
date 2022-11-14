import {
  AUTHENTICATED,
  LOAD_USER,
  SET_ERRORS,
  CLEAR_ERRORS,
  SET_USER,
  UNAUTHENTICATED,
} from "../reducers/UserReducer";

import PublicRequest from "../api/RequestApi";

export const loginUser = (userData, navigate, from) => (dispatch) => {
  dispatch(LOAD_USER());
  PublicRequest.post("/login", userData)
    .then((res) => {
      if (res.data.success === true) {
        dispatch(AUTHENTICATED(res.data.data));
        dispatch(getUserData(res.data.data.token));
        navigate(from, { replace: true });
      } else {
        dispatch(SET_ERRORS(res.data.error));
      }
    })
    .catch((err) => {
      dispatch(SET_ERRORS(err.response.data.message));
    });
};

export const registerUser = (userData, navigate, from) => (dispatch) => {
  dispatch(LOAD_USER());
  PublicRequest.post("/register", userData)
    .then((res) => {
      if (res.data.success === true) {
        dispatch(loginUser(userData, navigate, from));
      } else {
        dispatch(SET_ERRORS(res.data.error));
      }
    })
    .catch((err) => {
      dispatch(SET_ERRORS(err.message));
    });
};

export const getUserData = (access_token) => (dispatch) => {
  PublicRequest.get("/users/me", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access_token}`,
    },
  })
    .then((res) => {
      dispatch(SET_USER(res.data.data));
    })
    .catch((err) => {
      dispatch(SET_ERRORS(err.message));
    });
};

export const logoutUser = (navigate) => (dispatch) => {
  dispatch(UNAUTHENTICATED());
  navigate("/login", { replace: true });
};

export const clearErrors = () => (dispatch) => {
  dispatch(CLEAR_ERRORS());
};
