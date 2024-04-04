import React from "react";

import ModalDialog  from '../../common/ModalDialog'

import styles from "./PendingMemberTable.module.css";

const TableBody = ({ users, onResendInvite, onDeleteMember}) => {

  return (
    <tbody>
      {users.map((user, idx) => (
        <tr key={user.id}>
          <td>{idx + 1}</td>
          <td>{user.email}</td>
          <td className="wwc-text-capitalize">
            {user.role_name.toLowerCase()}
          </td>
          <td className="wwc-text-capitalize">{user.status.toLowerCase()}</td>
          <td>
          <ModalDialog
              id={`resendConfirmationDialog-${user.id}`}
              title="Are you sure?"
              text="Are you sure you want to resend the registration link?"
              onConfirm={() => onResendInvite(user.id)}
            >
            <button
              className={styles["invite-button"]}
              type="button"
            >
              Resend Invite
            </button>
            </ModalDialog>
          </td>
          <td>
            <ModalDialog
              id={`deletePendingMemberDialog-${user.id}`}
              title="Are you sure?"
              text="Are you sure you want to delete the pending member?"
              onConfirm={() => {
                onDeleteMember(user.id)}}
            >
              <button
                className={styles["delete"] + " " + styles["icon"]}
                type="button"
              />
            </ModalDialog>
          </td>
        </tr>
      ))}
    </tbody>
  );
};

export default TableBody;
