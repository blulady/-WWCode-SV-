/** @format */

import React, { useState, useContext, createRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import styles from "./ViewMembers.module.css";
import cx from "classnames";

import AuthContext from "../../../context/auth/AuthContext";
import MessageBox from "../../messagebox/MessageBox";
import WwcApi from "../../../WwcApi";
import { ERROR_TEAM_MEMBERS_UNABLE_TO_LOAD } from "../../../Messages";
import { useTeamContext } from "../../../context/team/TeamContext";
import { getPageId, getTabId } from "../../../utils";
import SearchSortFilter from "../../searchsortfilter/SearchSortFilter";
import { memberBaseFilters, memberSortOptions } from "../../searchsortfilter/constants";
import MemberCardList from "./MemberCardList";
import ScrollToTop from "../../scrollToTop/ScrollToTop";

const ViewMembers = ({ teamId }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const pageId = getPageId(location.pathname);
  const tabId = getTabId(location.pathname);
  const pageRef = createRef();

  const { teams } = useTeamContext();
  const { userInfo, isDirectorForTeam } = useContext(AuthContext);
  const isDirector = isDirectorForTeam(teamId);

  const [errorOnLoading, setErrorOnLoading] = useState(false);
  const [data, setData] = useState([]);
  const [prevSearch, setPrevSearch] = useState("");

  const handleAddMember = () => {
    navigate("/member/add",{
      state: { pageId }
    });
  };

  const getMembersData = async (sort, search, filters) => {
    try {
      let _users = await WwcApi.getMembers(sort, search, filters);
      return _users;
    } catch (error) {
      setErrorOnLoading(true);
      console.warn(error);
    }
  };

  const getFilters = (vals) => {
    const teams = vals.team || [];
    vals.team = teams.filter((val) => {
      return val !== 0;
    });
    return vals
  }

  const getSearchSuggestions = async (query) => {
      let users = await getMembersData(null, query, null);
      let suggestOptions = users.map((user) => {
        return {
          id: user.id,
          value: user.first_name + " " + user.last_name,
        };
      });
     return suggestOptions;
  }

  // create team filter if not chapter member or director page
  let availableFilters = [...memberBaseFilters];
  let initialFilterStatus = { role: [], status: [], date_joined: [], team: [] };

  if (teamId === 0 || pageId === 'directors') {
    const teamFilter = [{ value: 0, label: "All Teams" }];
    teams.forEach((t) => {
      if (t.id !== 0 && pageId === 'directors') {
        teamFilter.push({
          value: t.id,
          label: t.name
        });
      }
    });
    let teamOptions = {
      group: "team",
      label: "Team",
      type: "selection",
      options: teamFilter,
    };
    availableFilters.splice(2, 0, teamOptions);
    if (pageId === 'directors') {
      const directorFilterOnly = {
        group: "role",
        label: "Role",
        type: "button",
        options: [
          { label: "Director", value: "DIRECTOR", enable: true },
          { label: "Leader", value: "LEADER", enable: false },
          { label: "Volunteer", value: "VOLUNTEER", enable: false }
        ],
      }
      availableFilters.splice(0, 1, directorFilterOnly);
      initialFilterStatus.role = ["DIRECTOR"];
    }

  } else {
    initialFilterStatus.team = [teamId];
  }

  if (isDirector) {
    availableFilters[1].options[2] = true;
  }

  return (
    <React.Fragment>
      {errorOnLoading && (
        <div
          className={cx(
            styles["error-container"],
            "d-flex justify-content-center"
          )}
        >
          <MessageBox
            type="Error"
            title="Sorry!"
            message={ERROR_TEAM_MEMBERS_UNABLE_TO_LOAD.replace("{0}", teams[teamId]?.name)}
          ></MessageBox>
        </div>
      )}
      {!errorOnLoading && (
        <div
          id="viewMemberPage"
          className={cx(styles["view-member-page"])}
          ref={pageRef}
        >
          <SearchSortFilter
            initialFilterStatus={initialFilterStatus}
            availableFilters={availableFilters}
            sortOptions={memberSortOptions}
            fetchData={getMembersData}
            addData={handleAddMember}
            setData={setData}
            setPrevSearch={setPrevSearch}
            searchPlaceholder={"Search for name"}
            getFilters={getFilters}
            getSearchSuggestions={getSearchSuggestions}
            isDirector={isDirector}
            addButton={"+ Add Member"}
            pageId={pageId}
            tabId={tabId}
          />
          <MemberCardList
            data={data}
            prevSearch={prevSearch}
            userInfo={userInfo}
            isDirector={isDirector}
          /> 
         <ScrollToTop />
        </div>
      )}
    </React.Fragment>
  );
};

export default ViewMembers;
