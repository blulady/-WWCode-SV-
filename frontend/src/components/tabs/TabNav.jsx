import React, { useState, useContext, useEffect } from 'react';
import ContainerWithNav from "../layout/ContainerWithNav";
import styles from "./TabNav.module.css";
import cx from "classnames";
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuthContext } from "../../context/auth/AuthContext";

const TabNav = ({ navInfo }) => {
  const { userInfo, isDirectorForTeam } = useAuthContext();
  const tabs = navInfo.tabs;
  const teamId = navInfo.teamId == undefined ? -1 : navInfo.teamId;
  const roles = userInfo.role_teams;
  const isMember = !!roles.find((r) => r.team_id == teamId);
  const location = useLocation();
  const currentPath = location.pathname;
  const currentTab = currentPath.substring(currentPath.lastIndexOf("/") + 1);

  return (
    <ContainerWithNav>
      <div
        id='teamHomeContainer'
        className={cx(styles["team-home-container"], "d-flex flex-column")}
      >
        <div className={styles["team-home-container-inner"]}>
          <div className={styles["team-home-tab-container"]}>
            {
              tabs.map((tab, i) => {
                const data = tab.data;
                if (tab.type === 'externalLink') {
                  return (
                    <a href={data.link} target="_blank" rel="noopener" key={i}>
                      <button className={styles["tab-button"]}>
                        {tab.label}
                      </button>
                    </a>
                  );
                }
                if (teamId == -1 || ((!tab.isDirectorOnly || isDirectorForTeam(teamId)) && (!tab.isMemberOnly || isMember))) {
                  return (
                    <NavLink to={tab.tabId} key={i}>
                      <button
                        className={styles["tab-button"] + (tab.tabId === currentTab ? " " + styles["tab-button-selected"] : '')}
                      >
                        {tab.label}
                      </button>
                    </NavLink>
                  );
                }
              }
            )}
          </div>
          <div
            className={cx(styles["team-home-tab-contents"], "d-flex flex-column")}
          >
            <Outlet />
          </div>
        </div>
      </div>
    </ContainerWithNav>
  );
};

export default TabNav;
