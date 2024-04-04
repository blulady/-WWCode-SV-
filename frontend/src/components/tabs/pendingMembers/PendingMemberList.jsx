import React from "react";
import Dropdown from "../../common/Dropdown";
import ModalDialog from "../../common/ModalDialog";
import styles from "./PendingMemberList.module.css";
import "../../../Common.css";

const PendingMemberList = ({ users, onResendInvite, onDeleteMember }) => {
  return users.map((user) => (
    <div
      className={styles["pending-member-list-card"] + " d-flex flex-column"}
      key={user.id}
    >
      <div className={"align-self-end"}>
        <Dropdown
          menu={[
            {
              label: (
                <ModalDialog
                  id={`deletePendingMemberDialog-${user.id}`}
                  title="Are you sure?"
                  text="Are you sure you want to permanently delete this invitee from the records?"
                  onConfirm={() => onDeleteMember(user.id)}
                >
                  <button className="dropdown-item">
                    Delete
                  </button>
                </ModalDialog>
              ),
              key: "delete",
            },
          ]}
        >
          <div className={styles["icon"] + " " + styles["more"]}></div>
        </Dropdown>
      </div>
      <div className={"d-flex " + styles["row"]}>
        <div className={styles["column"]}>Email</div>
        <div className={styles["column"]}>{user.email}</div>
      </div>
      <div className={"d-flex " + styles["row"]}>
        <div className={styles["column"]}>Role</div>
        <div className={styles["column"] + " wwc-text-capitalize"}>
          {user.role_name.toLowerCase()}
        </div>
      </div>
      <div className={"d-flex " + styles["row"]}>
        <div className={styles["column"]}>Status</div>
        <div className={styles["column"] + " wwc-text-capitalize"}>
          {user.status.toLowerCase()}
        </div>
      </div>
      <div className={"d-flex " + styles["row"]}>
        <div className={styles["column"]}>Resend Invite</div>
        <div className={styles["column"]}>
          <ModalDialog
            id={`resendConfirmationDialog-${user.id}`}
            title="Are you sure?"
            text="Are you sure you want to resend the registration link?"
            onConfirm={() => onResendInvite(user.id)}
          >
            <button
              className={styles["invite-button"] + " " + styles["icon"]}
              type="button"
            >
              Resend Invite
            </button>
          </ModalDialog>
        </div>
      </div>
    </div>
  ));
};

export default PendingMemberList;
