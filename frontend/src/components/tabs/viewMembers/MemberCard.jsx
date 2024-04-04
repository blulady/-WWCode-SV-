/** @format */

import React, { useState, useEffect } from "react";
import { ReactComponent as MemberImg } from "../../../images/open_person_icon.svg";
import { ReactComponent as MemberSmImg } from "../../../images/open_person_sm_icon.svg";
import { isBrowser, isMobile } from "react-device-detect";
import { useLocation, useNavigate } from "react-router-dom";

import styles from "./MemberCard.module.css";
import cx from "classnames";

import ReactTooltip from "react-tooltip";
import { getPageId } from "../../../utils";

const MemberCard = (props) => {
  const cardUserInfo = props.userInfo;
  cardUserInfo.numTeams = new Set(cardUserInfo.role_teams
                          .filter(team => team.hasOwnProperty("team_id"))
                          .map(team => team.team_id)).size;
  // Adjust number of teams a user is in if their highest role is or is not associated with a team
  cardUserInfo.numTeams = !cardUserInfo.role_teams[0].hasOwnProperty("team_name") ? cardUserInfo.numTeams : cardUserInfo.numTeams - 1;

  const isDirector = props.isDirector;
  const userRole = props.userRole;
  const memberCardAllowance = ["DIRECTOR", "LEADER", "VOLUNTEER"];

  const nameEltRef = React.createRef();
  const [isNameLong, setNameLong] = useState(false);
  const navigate = useNavigate();

  // Show only first team if multiple teams
  const hasTeams = !!cardUserInfo.role_teams.length;
  const teamsStr =
    (cardUserInfo.role_teams.length && cardUserInfo.role_teams[0].team_name) || "No Team";

  useEffect(() => {
    const nameElt = nameEltRef.current;
    const spanElt = nameElt.firstChild;
    setNameLong(spanElt && spanElt.offsetWidth >= nameElt.offsetWidth);
  }, [nameEltRef]);
  const random = Math.floor(Math.random() * 1000);
  const overridePosition = (
    { left, top },
    currentEvent,
    currentTarget,
    node
  ) => {
    return { top: 0, left: 0 };
  };


  const location = useLocation();
  const pageId = getPageId(location.pathname);

  const handleClick = (a) => {
    navigate("/member/view",{
      state: { ...cardUserInfo, pageId }
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) {
      return "";
    }
    let d = new Date(dateStr);
    const options = { year: "numeric", month: "long", day: "numeric" };
    return d.toLocaleDateString("en-US", options);
  };

  return (
    <React.Fragment>
      {isMobile && (
        <div
          className={cx(styles.membercard, "d-flex", props.viewClassName)}
          onClick={
            memberCardAllowance.includes(userRole) ? handleClick : undefined
          }
        >
          <div className="d-flex flex-column justify-content-around align-items-center">
            <MemberSmImg className={styles["membercard-img"]} />
            <div
              className={cx(
                styles["membercard-status"],
                cardUserInfo.status.toLowerCase()
              )}
            >
              {cardUserInfo.status.toLowerCase()}
            </div>
          </div>
          <div className="d-flex flex-column justify-content-around">
            <div
              className={cx(
                styles["membercard-name"],
                "text-truncate font-weight-bold"
              )}
              ref={nameEltRef}
            >
              {cardUserInfo.first_name + " " + cardUserInfo.last_name}
            </div>
            <div className={styles["membercard-type"]}>
              {cardUserInfo.highest_role?.toLowerCase()}
            </div>
            <div
              className={cx(
                styles["membercard-team"],
                hasTeams ? "" : styles["noteam"]
              )}
            >
              {teamsStr}
              {cardUserInfo.numTeams >= 1 && (
                <React.Fragment>
                  <div
                    className={styles["multi-dots"]}
                    data-tip
                    data-for={"team-tooltip-" + random}
                    onClick={(evt) => {
                      evt.stopPropagation();
                    }}
                  >
                    ...
                  </div>
                  <ReactTooltip
                    id={"team-tooltip-" + random}
                    effect="solid"
                    type="light"
                    place="bottom"
                  >
                    <span>
                      Also part of {cardUserInfo.numTeams} other team
                      {cardUserInfo.numTeams > 1 ? "s" : ""}
                    </span>
                  </ReactTooltip>
                </React.Fragment>
              )}
            </div>
            {isDirector && (
              <div className={styles["membercard-email"]}>
                {cardUserInfo.email}
              </div>
            )}
          </div>
        </div>
      )}

      {isBrowser && (
        <div
          className={cx(
            styles.membercard,
            "card text-center",
            props.viewClassName
          )}
          onClick={
            memberCardAllowance.includes(userRole) ? handleClick : undefined
          }
        >
          <div
            className={cx(
              styles["membercard-top"],
              "mx-auto d-flex flex-column justify-content-center"
            )}
          >
            {/* <div className="membercard-name text-truncate font-weight-bold" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} ref={nameEltRef}><span>{userInfo.username}</span></div>
                    <div className="membercard-name-tooltip font-weight-bold hidden">{cardUserInfo.username}</div> */}
            <div
              className={cx(
                styles["membercard-name"],
                "text-truncate font-weight-bold"
              )}
              ref={nameEltRef}
              data-tip
              data-for={"tooltip-" + random}
            >
              <span>
                {cardUserInfo.first_name} {cardUserInfo.last_name}
              </span>
            </div>
            {isNameLong && (
              <ReactTooltip
                className={cx(styles["membercard-name-tooltip"])}
                place="top"
                effect="solid"
                id={"tooltip-" + random}
                overridePosition={overridePosition}
                style={{ width: "235px" }}
              >
                {cardUserInfo.first_name} {cardUserInfo.last_name}
              </ReactTooltip>
            )}

            <div
              className={cx(
                styles["membercard-status"],
                cardUserInfo.status.toLowerCase()
              )}
            >
              {cardUserInfo.status.toLowerCase()}
            </div>
          </div>
          <MemberImg className={styles["membercard-img"]} />
          <div
            className={cx(
              styles["membercard-bottom"],
              "mx-auto d-flex flex-column justify-content-around"
            )}
          >
            <div className={styles["membercard-type"]}>
              {cardUserInfo.highest_role?.toLowerCase()}
            </div>
            <div
              className={cx(
                styles["membercard-team"],
                hasTeams ? "" : styles["noteam"]
              )}
            >
              {teamsStr}
              {cardUserInfo.numTeams >= 1 && (
                <React.Fragment>
                  <div
                    className={styles["multi-dots"]}
                    data-tip
                    data-for={"team-tooltip-" + random}
                    data-place="bottom"
                  >
                    ...
                  </div>
                  <ReactTooltip
                    id={"team-tooltip-" + random}
                    effect="solid"
                    type="light"
                  >
                    <span>
                      Also part of {cardUserInfo.numTeams} other team
                      {cardUserInfo.numTeams > 1 ? "s" : ""}
                    </span>
                  </ReactTooltip>
                </React.Fragment>
              )}
            </div>
            <div className={styles["membercard-date"]}>
              Member since {formatDate(cardUserInfo.date_joined)}
            </div>
            {isDirector && (
              <div className={styles["membercard-email"]}>
                {cardUserInfo.email}
              </div>
            )}
            {/* {isVolunteer && } */}
          </div>
        </div>
      )}
    </React.Fragment>
  );
};

export default MemberCard;
