import React from "react";
import { connect } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

const Authorized = ({ authenticated, children, auth }) => {
  const location = useLocation();
  return authenticated === auth ? (
    children
  ) : auth === true ? (
    <Navigate to="/login" state={{ from: location }} replace />
  ) : (
    <Navigate to="/" />
  );
};

const mapStateToProps = (state) => ({
  authenticated: state.authenticated,
});

export default connect(mapStateToProps)(Authorized);
