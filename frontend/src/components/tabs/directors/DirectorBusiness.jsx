import React from "react";
import cx from "classnames";
import MessageBox from "../../messagebox/MessageBox";
import {ERROR_TEAM_RESOURCES_NO_DOCUMENT_AVAILABLE} from "../../../Messages";
import styles from "./DirectorBusiness.module.css";

export const DirectorBusiness = () => {
    return (
        <React.Fragment>
          <div className={cx(styles['message-container'])}>
            <MessageBox type="Error" title="Sorry!" message={ERROR_TEAM_RESOURCES_NO_DOCUMENT_AVAILABLE}></MessageBox>
          </div>
        </React.Fragment>
    )
};
