import React, { useEffect, useState, useContext } from "react";
import TeamContext from "./TeamContext";
import WwcApi from "../../WwcApi"
import AuthContext from "../auth/AuthContext";

const teamInfo = new Map();
teamInfo.set(0, { slug: "volunteer_resource"});
teamInfo.set(1, { slug: "event_volunteers_resource"});
teamInfo.set(2, { slug: "hackathon_volunteers_resource"});
teamInfo.set(3, { slug: "host_management_resource"});
teamInfo.set(4, { slug: "partner_management_resourcepartner_management_resource"});
teamInfo.set(5, { slug: "volunteer_management_resource"});
teamInfo.set(6, { slug: "tech_bloggers_resource"});

const TeamProvider = ({ children }) => {
    const [teams, setTeams] = useState([]);
    const [fetching, setFetching] = useState(true); // TODO: Is there a better way to delay rendering??
    const { userInfo } = useContext(AuthContext);
  
    useEffect(() => {
        const fetchTeams = async () => {
            let t = [];
            try {
                t = await WwcApi.getTeams();
            } catch (e) {
                console.log(e);
            }
            let allTeams = [{ id: 0, name: "Chapter Members" }, ...t];
            allTeams.sort((a,b) => a.id-b.id);
            allTeams = allTeams.map((info) => {
                const additionalInfo = teamInfo.get(info.id);
                return { ...info, ...additionalInfo };
            });
            setTeams([...allTeams]);
            setFetching(false);
        }
        fetchTeams();
    }, []);

    const getTeamInfo = (teamId) => {
        return teams.find((t) => {
            return t.id == teamId;
        });
    };

    return (
        <TeamContext.Provider value={ { teams: (fetching ? [] : teams ), getTeamInfo } }>
            {!fetching && children }
        </TeamContext.Provider>  
    );
}

export default TeamProvider;