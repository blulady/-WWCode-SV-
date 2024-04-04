import React from 'react';
import styles from "./BackToTeamHomeButton.module.css";
import { useNavigate } from "react-router-dom";
import { getNavItem } from '../../navitems';


const BackToTeamHomeButton = ({ pageId }) => {
  const navigate = useNavigate();
  const pageInfo = getNavItem(pageId);

  return (
    <div>
      <button
        className={styles['tab-selected-button']}
        onClick={() => {
          navigate(`/${pageId}/members`);
        }}
      >
        {pageInfo.name}
      </button>
    </div>
  )
}

export default BackToTeamHomeButton;
