import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { isBrowser } from "react-device-detect";
import { useNavigate } from "react-router-dom";
import WwcApi from "../../../WwcApi";
import PendingMemberList from "./PendingMemberList";
import PendingMemberTable from "./PendingMemberTable";
import ModalDialog from "../../common/ModalDialog";
import MessageBox from "../../messagebox/MessageBox";
import {
    ERROR_TEAM_MEMBERS_UNABLE_TO_LOAD,
    ERROR_REQUEST_MESSAGE,
} from "../../../Messages";
import styles from "./PendingMembers.module.css";

const PendingMembers = (props) => {
  const [users, setUsers] = useState([]);
  const [apiError, setApiError] = useState(null);
  const [showMessage, setShowMessage] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  const renderTable = () => {
    return (
      <PendingMemberTable
        users={users}
        target="#resendConfirmationDialog"
        onDeleteMember={handelDeleteMember}
      />
    );
  };
  const renderList = () => {
    return (
      <PendingMemberList
        users={users}
        target="#resendConfirmationDialog"
      ></PendingMemberList>
    );
  };

  const getInvitees = async () => {
    try {
      let _users = await WwcApi.getInvitees();
      setUsers(_users);
    } catch (error) {
      setApiError(ERROR_TEAM_MEMBERS_UNABLE_TO_LOAD.replace("{0}", ""));
      console.log(error);
    }
  };

  const goToAddMember = () => {
    navigate("/member/add");
  };

  const resendInvite = async () => {
    try {
      await WwcApi.resendInvite(currentUser);
      await getInvitees();
      setShowMessage(true);
    } catch (error) {
      setApiError(ERROR_REQUEST_MESSAGE);
      console.log(error);
    }
  };

  const handelDeleteMember = (userId) => {
    const temp = [...users];
    const filteredMembers = temp.filter((member) => member.id !== userId);
    setUsers(filteredMembers);
    WwcApi.deleteInvitees(userId).catch((err) => {
        setUsers(temp);
        setApiError(ERROR_REQUEST_MESSAGE);
    });
  };

  const onOpeningResendDialog = (target) => {
    let user = null;
    if (target) {
      user = target.getAttribute("data-bs-user");
    }
    setCurrentUser(user);
  };

  useEffect(() => {
    getInvitees();
  }, []);

  if (apiError) {
    // TODO: Revisit to see if we can consolidate this with MessageBox below
    return (
      <div className="d-flex justify-content-center">
        <MessageBox type="Error" title="Sorry!" message={apiError}></MessageBox>
      </div>
    );
  } else {
    return (
      <div className={styles["pending-members-container"]}>
        <div className="d-flex justify-content-end mb-2 mb-md-5">
          <button
            type="button"
            className="wwc-action-button"
            onClick={goToAddMember}
          >
            + Add Member
          </button>
        </div>
        {showMessage && (
          <div className="d-flex justify-content-center">
            <MessageBox
              type="Success"
              title="Success!"
              message="New registration link has been sent."
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
        <ModalDialog
          id="resendConfirmationDialog"
          title="Are you sure?"
          text="Are you sure you want to resend the registration link?"
          onConfirm={resendInvite}
          onOpening={onOpeningResendDialog}
        ></ModalDialog>
      </div>
    );
  }
};

export default PendingMembers;
