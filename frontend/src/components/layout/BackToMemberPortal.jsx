import React from 'react';
import BackButton from "../../images/arrow_back_24px.png";
import styles from "./BackToMemberPortal.module.css";
import { useNavigate } from "react-router-dom";
import { getNavItem } from '../../navitems';


const BackToMemberPortal = ({ pageId, pending }) => {
  const navigate = useNavigate();
  const pageInfo = getNavItem(pageId);
  const path = `/${pageId}/${pending ? "pending" : "members"}`;

  return (
    <div>
      <button
        className={styles["back-member-btn"]}
        onClick={() => {
          navigate(path);
        }}
      >
        <img
        src={BackButton}
        className={styles["back-btn-img"]}
        alt="Back Button"
      />
      Back to {pageInfo.name}
      </button>
    </div>
  )
}

export default BackToMemberPortal;
