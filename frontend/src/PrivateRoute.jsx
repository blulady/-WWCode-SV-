import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthContext } from "./context/auth/AuthContext";

const PrivateRoute = ({ element }) => {
  const { token } = useAuthContext();

  if (!token) {
    return <Navigate to='/login' />;
  }

  return element;
};

export default PrivateRoute;
