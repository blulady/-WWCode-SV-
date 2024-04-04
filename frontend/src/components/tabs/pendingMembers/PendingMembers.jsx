import React, { useEffect, useState, useContext } from "react";
import { isBrowser } from "react-device-detect";
import { useNavigate, useLocation } from "react-router-dom";

import WwcApi from "../../../WwcApi";
import AuthContext from "../../../context/auth/AuthContext";
import PendingMemberList from "./PendingMemberList";
import PendingMemberTable from "./PendingMemberTable";
import MessageBox from "../../messagebox/MessageBox";
import { getPageId, getTabId } from "../../../utils";
import {
  ERROR_TEAM_MEMBERS_UNABLE_TO_LOAD,
  ERROR_REQUEST_MESSAGE,
} from "../../../Messages";
import SearchSortFilter from "../../searchsortfilter/SearchSortFilter";
import styles from "./PendingMembers.module.css";
import { memberSortOptions } from "../../searchsortfilter/constants";

const PendingMembers = ({teamId}) => {
  const location = useLocation();
  const pageId = getPageId(location.pathname);
  const tabId = getTabId(location.pathname);
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [apiError, setApiError] = useState(null);
  const [showMessage, setShowMessage] = useState(false);
  const [prevSearch, setPrevSearch] = useState("");

  const { isDirectorForTeam } = useContext(AuthContext);
  const isDirector = isDirectorForTeam(teamId);

  useEffect(() => {
    getInvitees();
  }, []);

  const getInvitees = async () => {
    try {
      let users = await WwcApi.getInvitees();
      setUsers(users);
      return users;
    } catch (error) {
      setApiError(ERROR_TEAM_MEMBERS_UNABLE_TO_LOAD.replace("{0}", ""));
      console.warn(error);
    }
  };

    const goToAddMember = () => {
        navigate("/member/add",{
            state: { pageId: "chapter", pending: true }
          });
    };

  const resendInvite = async (currentUser) => {
    try {
      await WwcApi.resendInvite(currentUser);
      await getInvitees();
      setShowMessage(true);
    } catch (error) {
      setApiError(ERROR_REQUEST_MESSAGE);
      console.warn(error);
    }
  };

  const handleDeleteMember = async (currentUserId) => {
    const temp = [...users];
    try {
      await WwcApi.deleteInvitees(currentUserId)
      const filteredMembers = temp.filter(
        (member) => member.id !== currentUserId
      );
      setUsers(filteredMembers);
    } catch (err) {
      setUsers(temp);
      setApiError(ERROR_REQUEST_MESSAGE);
      console.error(err)
    }
  };

  const getSearchSuggestions = async (query) => {
    let users = await getInvitees(null, query, null);
    let suggestOptions = users.map((user) => {
      return {
        id: user.id,
        value: user.email,
      };
    });
   return suggestOptions;
}

  const renderTable = () => {
    return (
      <PendingMemberTable
        users={users}
        onDeleteMember={handleDeleteMember}
        onResendInvite={resendInvite}
      />
    );
  };
  const renderList = () => {
    return (
      <PendingMemberList
        users={users}
        onResendInvite={resendInvite}
        onDeleteMember={handleDeleteMember}
      ></PendingMemberList>
    );
  };

  return (
    <div className={styles["pending-members-container"]}>
      <SearchSortFilter
        initialFilterStatus={[]}
        availableFilters={[]}
        sortOptions={memberSortOptions}
        fetchData={getInvitees}
        addData={goToAddMember}
        setData={setUsers}
        setPrevSearch={setPrevSearch}
        searchPlaceholder={"Search by email"}
        getFilters={undefined}
        getSearchSuggestions={getSearchSuggestions}
        isDirector={isDirector}
        addButton={"+ Add Member"}
        pageId={pageId}
        tabId={tabId}
      />
      {showMessage && (
        <div className="d-flex justify-content-center">
          <MessageBox
            type="Success"
            title="Success!"
            message="New registration link has been sent."
          ></MessageBox>
        </div>
      )}
      {apiError && (
        <div className="d-flex justify-content-center">
          <MessageBox
            type="Error"
            title="Sorry!"
            message={apiError}
          ></MessageBox>
        </div>
      )}
      {users.length ? (
        isBrowser ? (
          renderTable()
        ) : (
          renderList()
        )
      ) : (
        <div className={styles["no-users-msg"]}>No invitees to display</div>
      )}
    </div>
  );
};

export default PendingMembers;
