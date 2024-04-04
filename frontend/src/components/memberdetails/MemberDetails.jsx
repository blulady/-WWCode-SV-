import React, { useState, useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";
import AuthContext from "../../context/auth/AuthContext";
import ContainerWithNav from "../layout/ContainerWithNav";
import BackToTeamHomeButton from "./BackToTeamHomeButton";
import BackToMemberPortal from "../layout/BackToMemberPortal";
import MemberImage from "./MemberImage";
import MemberInfoUnEditable from "./MemberInfoUnEditable";
import MemberStatus from "./MemberStatus";
import MemberRole from "./MemberRole";
import MemberTeams from "./MemberTeams";
import AddNewRole from "./AddNewRole";
import AssignEditTeams from "./AssignEditTeams";
import Spinner from "../layout/Spinner";
import ProfileImage from "../../images/ProfileImage.png";

import WwcApi from "../../WwcApi";
import styles from "./MemberDetails.module.css";
import cx from "classnames";
import MessageBox from "../messagebox/MessageBox";
import { ERROR_REQUEST_MESSAGE } from "../../Messages";

function ViewMemberDetails() {
  const location = useLocation();
  const { id, pageId } = location.state;
  const { userInfo } = useContext(AuthContext);

  const [errorOnLoading, setErrorOnLoading] = useState(false);
  const [allSelectedRolesTeams, setAllSelectedRolesTeams] = useState({
    roles: [],
    teams: [],
  });
  const [newRoleTeam, setNewRoleTeam] = useState({
    add: false,
    role: null,
    teams: null,
  });
  let [editing, setEditing] = useState(null);
  // Hardcoding team, role and user info for development as BE endpoint not ready
  // TODO When done with development,
  //      make api calls to get possible teams,roles and current user info by id

  const [user, setUser] = useState({
    date_joined: "",
    email: "",
    first_name: "",
    id: null,
    last_name: "",
    status: "",
    role_teams: {
      // DIRECTOR: [],
      // LEADER: ["Event Volunteers", "Volunteer Management"],
      // VOLUNTEER: ["Partnership Management", "Social Media", "Host Management"],
    },
  });

  const memberRoleArray = [
    {
      id: "1",
      role: "Volunteer",
      desc: "Limited access to areas of portal",
      value: "VOLUNTEER",
    },
    {
      id: "2",
      role: "Leader",
      desc: "Access to all areas excluding Director area",
      value: "LEADER",
    },
    {
      id: "3",
      role: "Director",
      desc: "Access to all areas of portal",
      value: "DIRECTOR",
    },
  ];

  const teamsArray = [
    { id: 1, name: "Event Volunteers" },
    { id: 2, name: "Hackathon Volunteers" },
    { id: 3, name: "Host Management" },
    { id: 4, name: "Partnership Management" },
    { id: 5, name: "Social Media Team" },
    { id: 6, name: "Tech Event Team" },
    { id: 7, name: "Volunteer Management" },
    { id: 8, name: "Tech Bloggers" },
  ];

  let handleStatusChange = async (checked) => {
    let status = checked ? "ACTIVE" : "INACTIVE";
    setUser({ ...user, status: status });
    //TODO: Remove comments to make API call to change status once BE endpoint is ready
    try {
      await WwcApi.changeMemberStatus(id, {status: status });
    } catch (error) {
      setErrorOnLoading(true);
      console.log(error);
    }
  };

  let handleRoleChange = async (role) => {
    // delete role
    let rt = {};
    for (let key in user.role_teams) {
      if (key !== role) {
        rt[key] = user.role_teams[key];
      }
    }
    setUser({ ...user, role_teams: { ...rt } });
    //TODO: Remove comments to make API call once BE endpoint is ready
    // try {
    //   await WwcApi.deleteMemberRole(id,{role});
    // } catch (error) {
    //   setErrorOnLoading(true);
    //   console.log(error);
    // }
  };

  let handleTeamChange = async (role, selectedTeams) => {
    setEditing(null);
    if (!selectedTeams.size) {
      setUser({ ...user, role_teams: { ...role_teams, [role]: [] } });
    }
    let teams = [];
    let teamIds = [];
    for (let team of teamsArray) {
      if (selectedTeams.has(team.name)) {
        teams.push(team.name);
        teamIds.push(team.id);
      }
    }
    setUser({ ...user, role_teams: { ...role_teams, [role]: teams } });
    //TODO Make API call to change teams when endpoint ready
    try {
      await WwcApi.editMemberRoleTeams(id, { role: role, teams: teamIds })
      //await WwcApi.editMember(id, { status: user.status, role: role, teams: teamIds });
    } catch (error) {
      setErrorOnLoading(true);
      console.log(error);
    }
  };

  const handleAddNewMember = () => {
    setNewRoleTeam({ ...newRoleTeam, add: true });
  };

  const handleAddNewRole = (role) => {
    setNewRoleTeam({ ...newRoleTeam, role: role });
  };

  const cancelAddNewMember = () => {
    setNewRoleTeam({ add: false, role: null, teams: null });
  };

  const handleAddNewTeams = (teams) => {
    handleTeamChange(newRoleTeam.role.value, teams);
    cancelAddNewMember();
  };

  const { date_joined, email, first_name, last_name, status, role_teams } =
    user;
  const roles = Object.keys(role_teams);

  useEffect(() => {
    const getSelectedTeams = () => {
      let allTeams = [];
      let allRoles = [];
      for (let key in user.role_teams) {
        allTeams.push(...user.role_teams[key]);
        allRoles.push(key);
      }
      setAllSelectedRolesTeams({ roles: allRoles, teams: allTeams });
    };
    Object.keys(user.role_teams).length && getSelectedTeams();
  }, [user]);

  useEffect(() => {
    const getMemberData = async (userId) => {
      try {
        let usr = await WwcApi.getMember(userId);
        let role_teams = {};
        usr.role_teams.forEach((t) => {
          (t.role_name in role_teams) || (role_teams[t.role_name] = []);
          if (t.team_name) {
            role_teams[t.role_name].push(t.team_name);
          }
        });
        usr["role_teams"] = role_teams;
        setUser(usr);
      } catch (error) {
        setErrorOnLoading(true);
        console.log(error);
      }
    };
    getMemberData(id);
  }, [id]);

  // Before rendering based on the user role make a choice to restrict
  // delegation of the following functions to the component tree
  if (userInfo.role === "LEADER" || userInfo.role === "VOLUNTEER") {
    handleStatusChange = null;
    handleRoleChange = null;
    handleTeamChange = null;
    setEditing = null;
  }

  return (
    <ContainerWithNav>
      <div className={styles["view-member-wrapper"]}>
        <BackToTeamHomeButton label="Back to" pageId={pageId} />
        <div className={styles["member-container"]}>
          <BackToMemberPortal pageId={pageId} />
          <div className={cx(styles["member-details-container"], "align-items-center")}>
            {errorOnLoading && (
              <MessageBox
                type="Error"
                title="Sorry!"
                message={ERROR_REQUEST_MESSAGE}
              ></MessageBox>
            )}
            {!Object.keys(user).length ? (
              <Spinner />
            ) : (
              <div className={cx("col-10", styles["view-member-fields-div"])}>
                <div className={styles["view-member-image-div"]}>
                  <MemberImage image={ProfileImage} />
                </div>
                <MemberInfoUnEditable
                  first_name={first_name}
                  last_name={last_name}
                  email={email}
                  date_joined={date_joined}
                />
                <div className={styles["view-member-info-editable"]}>
                  <MemberStatus
                    status={status}
                    changeStatus={handleStatusChange}
                  />
                  {roles.map((role) => (
                    <section key={role}>
                      <MemberRole
                        role={role}
                        status={status}
                        numRoles={roles.length}
                        modifyRole={handleRoleChange}
                      />
                      <MemberTeams
                        role={role}
                        teams={role_teams[role]}
                        status={status}
                        modifyTeams={handleTeamChange}
                        totalTeams={teamsArray}
                        allSelectedTeams={allSelectedRolesTeams.teams}
                        editing={editing}
                        setEditing={setEditing}
                      />
                      <hr className={styles["section-divider"]} />
                    </section>
                  ))}
                  {status === "ACTIVE" ? (
                    newRoleTeam.add ? (
                      <>
                        <AddNewRole
                          selectedRolesForUser={allSelectedRolesTeams.roles}
                          allRoles={memberRoleArray}
                          addNewRole={handleAddNewRole}
                        />
                        <AssignEditTeams
                          role={newRoleTeam.role}
                          selectedTeamsForUser={allSelectedRolesTeams.teams}
                          totalTeams={teamsArray}
                          editRoleTeams={handleAddNewTeams}
                          status={status}
                          setTeamEditMode={cancelAddNewMember}
                        />
                      </>
                    ) : (
                      (Object.keys(user.role_teams).length <
                        memberRoleArray.length && userInfo.role == "DIRECTOR") && (
                        <p
                          className={cx(
                            "mt-2",
                            styles["add-team-role"],
                            styles["view-member-info-editable"]
                          )}
                          onClick={handleAddNewMember}
                        >
                          + add role and team
                        </p>
                      )
                    )
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ContainerWithNav>
  );
}
export default ViewMemberDetails;
