import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  authenticated: false,
  access_token: "",
  showSideBar: true,
  loading: false,
  errors: null,
  credentials: {},
};

const UserSclice = createSlice({
  name: "user",
  initialState,
  reducers: {
    AUTHENTICATED: (state, action) => {
      return {
        ...state,
        errors: "",
        access_token: action.payload.token,
        authenticated: true,
      };
    },
    LOAD_USER: (state, action) => {
      return {
        ...state,
        loading: true,
      };
    },
    SET_ERRORS: (state, action) => {
      return {
        ...state,
        errors: action.payload,
        loading: false,
      };
    },
    CLEAR_ERRORS: (state, action) => {
      return {
        ...state,
        errors: "",
        loading: false,
      };
    },
    SET_USER: (state, action) => {
      return {
        ...state,
        authenticated: true,
        loading: false,
        errors: "",
        credentials: {
          userid: action.payload.userid,
          username: action.payload.username,
          email: action.payload.email,
          role: action.payload.role_name,
          permissions: action.payload.permissions,
        },
      };
    },
    UNAUTHENTICATED: (state, action) => {
      return initialState;
    },
    TOGGLE_SIDEBAR: (state, action) => {
      return {
        ...state,
        showSideBar: !state.showSideBar,
      };
    },
  },
});

export const {
  AUTHENTICATED,
  LOAD_USER,
  SET_ERRORS,
  CLEAR_ERRORS,
  SET_USER,
  UNAUTHENTICATED,
  REFRESH_TOKEN,
  TOGGLE_SIDEBAR,
} = UserSclice.actions;

export default UserSclice.reducer;
