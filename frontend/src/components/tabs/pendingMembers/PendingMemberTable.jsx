import React from "react";

import TableBody from "./TableBody";
import styles from "./PendingMemberTable.module.css";

const PendingMemberTable = ({ users, ...props }) => {
  return (
    <table className={styles["pending-members-table"]}>
      <thead>
        <tr>
          <th></th>
          <th>Email</th>
          <th>Role</th>
          <th>Status</th>
          <th>Resend Invite</th>
          <th>Actions</th>
        </tr>
      </thead>
      <TableBody
        users={users}
        {...props}
      />
    </table>
  );
};

export default PendingMemberTable;
