import React, { useState } from "react";
import AuthContext from "./AuthContext";
import WwcApi from "../../WwcApi";

let authTimeout;

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(
    JSON.parse(sessionStorage.getItem("token"))
  );
  const [userInfo, setUserInfo] = useState(
    JSON.parse(sessionStorage.getItem("user"))
  );

  /*
   * store token in session
   */
  const handleSetAuth = async (auth, role) => {
    const token = { access: auth.access, refresh: auth.refresh };
    const expiry = auth.access_expiry_in_sec;
    if (authTimeout) {
      clearTimeout(authTimeout);
    }
    if (expiry) {
      const expiryInt = parseInt(expiry) * 1000;
      authTimeout = setTimeout(() => {
        handleRemoveAuth();
      }, expiryInt);
    }
    sessionStorage.setItem("token", JSON.stringify(token));
    setToken(token);
    // get current user profile
    const { id, first_name, last_name, email, role_teams, highest_role } = await WwcApi.getUserProfile();
    const usr = { id, first_name, last_name, email, role_teams, highest_role, role };
    sessionStorage.setItem("user", JSON.stringify(usr));
    setUserInfo(usr);
  };

  // remove token from session
  const handleRemoveAuth = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setToken(null);
    setUserInfo(null);
    authTimeout = undefined;
  };

  const isDirectorForTeam = (team) => {
    if (team === 0  && userInfo.highest_role === "DIRECTOR") {
      return true;
    }
    return !!userInfo.role_teams.find((t) =>  t.team_id === team && t.role_name === "DIRECTOR" );
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        userInfo,
        handleSetAuth,
        handleRemoveAuth,
        isDirectorForTeam
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
