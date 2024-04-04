import React, { useState, useEffect, useContext } from "react";
import cx from "classnames";
import { useAuthContext } from "../../../context/auth/AuthContext";
import WwcApi from "../../../WwcApi";
import MessageBox from "../../messagebox/MessageBox";
import {
  ERROR_TEAM_RESOURCES_DOCUMENT_NOT_LOADED,
  ERROR_TEAM_RESOURCES_NO_DOCUMENT_AVAILABLE,
  ERROR_REQUEST_MESSAGE
} from "../../../Messages";
import ResourcesLinks from "./ResourcesLinks";
import { useTeamContext } from "../../../context/team/TeamContext";
import styles from "./TeamResources.module.css";

const TeamResources = ({ teamId }) => {
  const errorTitle = "Sorry!";
  const [errorRetrieveDocument, setErrorRetrieveDocument] = useState(false);
  const [errorRetrieveDocumentMessage, setErrorRetrieveDocumentMessage] = useState("");
  const [errorAddNewResources, setErrorAddNewResources] = useState(false);
  const [errorAddNewResourcesMessage, setErrorAddNewResourcesMessage] = useState("");
  const [errorEditDocument, setErrorEditDocument] = useState(false);
  const [instructionsOnLoading, setInstructionsOnLoading] = useState(false);
  const [teamResource, setTeamResource] = useState({
    edit_link: "",
    published_link: "",
  });
  const { isDirectorForTeam } = useAuthContext()
  const isDirector = isDirectorForTeam(teamId);

  const { getTeamInfo } = useTeamContext();
  const teamInfo = getTeamInfo(teamId);

  const slug = teamInfo.slug;

  const instructions = `
    <h5 class="c26">Instructions to set up Resources Document</h5>
    <ul>
      <li>Please create a Google Doc to be used for this resources document.</li>
      <li>Modify Share to 'Anyone on the internet with this link view.'</li>
      <li>Publish to the web: File -> Publish to the web -> Check 'Automatically republish when changes are made' -> Publish.</li>
      <li>Enter url in Enter URL field.</li>
      <li>Enter publish url in Published Embedded URL field.</li>
    </ul>`;

  useEffect(() => {
    getTeamResources();
  }, []);

  useEffect(() => {
    messageBoxContent();
  }, [teamResource]);

  const getTeamResources = async () => {
    try {
      let teamrResources = await WwcApi.getTeamResources(slug);
      setTeamResource(teamrResources.data);
    } catch (error) {
      if (error.response.status === 404) {
        if (isDirector) {
          setInstructionsOnLoading(true);
        } else {
          setErrorRetrieveDocument(true);
          setErrorRetrieveDocumentMessage(ERROR_TEAM_RESOURCES_NO_DOCUMENT_AVAILABLE);
        }
      }
      else {
        setErrorRetrieveDocument(true);
        setErrorRetrieveDocumentMessage(ERROR_TEAM_RESOURCES_DOCUMENT_NOT_LOADED);
      }
    }
  };

  const addNewResources = async (editLink, publishedLink) => {
    try {
      let teamrResources = await WwcApi.addNewResources({
        edit_link: editLink,
        published_link: publishedLink,
        slug: slug
      });
      setTeamResource(teamrResources.data);
      setErrorAddNewResources(false);
      setErrorAddNewResourcesMessage("");
      setInstructionsOnLoading(false);
    } catch (error) {
      setErrorAddNewResources(true);
      setErrorAddNewResourcesMessage("The resource document could not be saved. Please try later.");
    }
  }

  const updateResources = async (editLink, publishedLink) => {
    try {
      let teamrResources = await WwcApi.updateTeamResources(slug, {
        edit_link: editLink,
        published_link: publishedLink,
      });
      setTeamResource(teamrResources.data);
      setErrorEditDocument(false);
    } catch (error) {
      setErrorEditDocument(true);
    }
  };

  const messageBoxContent = () => {
    if (errorRetrieveDocument) { // getTeamResources
      return (
        <div className={"d-flex justify-content-center"}>
          <MessageBox
            type="Error"
            title={errorTitle}
            message={errorRetrieveDocumentMessage}
          ></MessageBox>
        </div>
      )
    }
    else if (errorAddNewResources) { // addNewResources
      return (
        <div className={"d-flex justify-content-center"}>
          <MessageBox
            type="Error"
            title={errorTitle}
            message={errorAddNewResourcesMessage}
          ></MessageBox>
        </div>
      )
    }
    else if (errorEditDocument) { // updateResources
      return (
        <div className={"d-flex justify-content-center"}>
          <MessageBox
            type="Error"
            title={errorTitle}
            message={ERROR_REQUEST_MESSAGE}
          ></MessageBox>
        </div>
      )
    }
    else if (instructionsOnLoading) {
      return (
        <div
          className={cx(
            styles["instructions-box"],
            "d-flex align-items-left justify-content-left flex-column"
          )}
          data-testid="message-box-info"
        >
          <div dangerouslySetInnerHTML={{ __html: instructions }}></div>
        </div>
      )
    }
    else {
      return (
        <iframe
          className={styles["resources-frame"]}
          src={teamResource.published_link}
          title="Team Resources"
        >
        </iframe>
      )
    }
  }

  return (
    <React.Fragment>
      <div>
        {isDirector && (
          <ResourcesLinks
            editUrl={teamResource.edit_link}
            publishUrl={teamResource.published_link}
            onSaveFirstDocument={addNewResources}
            onUpdateDocument={updateResources}
          ></ResourcesLinks>
        )}
      </div>
      {messageBoxContent()}
    </React.Fragment>
  );
};
export default TeamResources;
