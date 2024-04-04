import React, { useState, useEffect } from "react";
import GenericTable from "../../common/Table";
import WwcApi from '../../../WwcApi'
import cx from "classnames";
import styles from "./TechEventMentorList.module.css";
import ModalDialog from "../../common/ModalDialog";
import { isBrowser } from "react-device-detect";
import { useLocation, useNavigate } from "react-router-dom";
import CardList from "../../common/CardList/CardList";
import MessageBox from "../../messagebox/MessageBox";

const TechEventMentorList = () => {
  const [mentors, setMentors] = useState([]);
  const [currentRecord, setCurrentRecord] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const status = location.state?.status;
  const name = location.state?.name;
  const [showRequestStatus, setShowRequestStatus] = useState({});

  useEffect(() => {
    const fetchTechEventMentors = async () => {
      try {
        const mentors = await WwcApi.getTechMentors();
        setMentors(mentors.data);
        setShowRequestStatus({ type: "Success" });
      } catch (error) {
        console.warn("An error occurred while fetching mentors:", error.message);
        //setShowRequestStatus({ type: "Error", title: "Sorry!", message: error.response.data.detail });
      }
    }
    fetchTechEventMentors();
  }, []);

  const handleDeleteMentor = () => {
    WwcApi.deleteTechMentor(currentRecord.id)
      .then((res) => {
        setMentors(mentors.filter((record) => record.id !== currentRecord.id));
        setCurrentRecord(null);
      })
      .catch((err) => {
        console.warn("Error while deleting mentor");
      });
  };

  const columns = [
    {
      key: "first_name",
      title: "First Name",
      dataIndex: "first_name",
    },
    {
      key: "last_name",
      title: "Last Name",
      dataIndex: "last_name",
    },
    {
      key: "email",
      title: "Email",
      dataIndex: "email"
    },
    {
      key: "level",
      title: "Level",
      dataIndex: "level"
    },
    {
      key: "reliability",
      title: "Reliability",
      dataIndex: "reliability"
    },
  ];

  const goToAddMentorForm = (edit, mentorInfo) => {
    navigate(`${location.pathname}/form`, { state: { edit: edit, mentorInfo: mentorInfo } });
  };

  const renderMentors = () => {
    if (isBrowser) {
      const extendedColumns = [{
        key: "id",
        title: "",
        dataIndex: "id",
      },
      ...columns,
      {
        key: "actions",
        title: "Actions",
        dataIndex: "",
        render: (_, record) => {
          return (
            <div className="d-flex gap-3">
              <button
                className={styles["edit"] + " " + styles["icon"]}
                type="button"
                onClick={(e) => {
                  goToAddMentorForm(true, { ...record });
                  e.stopPropagation();
                }}
              />
              <ModalDialog
                id="deleteMentor"
                title="Are you sure?"
                text="Are you sure you want to permanently delete this mentor from the records?"
                onConfirm={handleDeleteMentor}
                onCancel={() => setCurrentRecord(null)}
              >
                <button
                  className={styles["delete"] + " " + styles["icon"]}
                  type="button"
                  onClick={(e) => {
                    setCurrentRecord({ ...record });
                    e.stopPropagation();
                  }}
                />
              </ModalDialog>
            </div>
          );
        },
      }];
      return <GenericTable tableClass={styles["tech-event-mentor-table"]} columns={extendedColumns} data={mentors} />;
    }

    const actions = [
      {
        render: (dataid, data) => {
          return (<button className="wwc-action-button d-flex align-items-center" data-bs-dismiss="modal" data-bs-target={`#${dataid}`} onClick={(e) => {
            goToAddMentorForm(true, { ...data });
          }}>
            <div className={styles["edit"] + " " + styles["icon"]}></div>
            <div className={styles["label"]}>Edit</div>
          </button>);
        }
      },
      {
        render: (dataid, data) => {
          return (<ModalDialog
            id="deleteMentor"
            title="Are you sure?"
            text="Are you sure you want to permanently delete this mentor from the records?"
            onConfirm={handleDeleteMentor}
            onCancel={() => setCurrentRecord(null)}
          >
            <button className="wwc-action-button d-flex align-items-center" onClick={(e) => {
              setCurrentRecord({ ...data });
              e.stopPropagation();
            }}>
              <div className={styles["delete"] + " " + styles["icon"]}></div>
              <div className={styles["label"]}>Delete</div>
            </button>
          </ModalDialog>);
        }
      }
    ];

    return <CardList columns={columns} data={mentors} actions={actions}></CardList>
  };

  const renderContent = () => {
    let elements = [];
    if (status) {
      const msg = status === "edit" ? `Changes made to ${name} have been updated.` : `${name} was added to the list of tech memtors.`;
      elements.push(<MessageBox type="Success" title="Success!" message={msg}></MessageBox>);
    }
    elements.push(
      <div className="d-flex justify-content-end mb-2 mb-md-5" key="">
        <button type="button" className="wwc-action-button" onClick={() => goToAddMentorForm(false, {})}>
          + Add Mentor
        </button>
      </div>
    );
    elements.push(renderMentors());
    return elements;
  };

  return (
    <React.Fragment>
      <div className={cx(styles['message-container'])}>
        {showRequestStatus?.type === "Error" && (
          <MessageBox type={showRequestStatus.type} title={showRequestStatus.title} message={showRequestStatus.message}></MessageBox>
        )}
      </div>
      {showRequestStatus?.type === "Success" &&
        renderContent()
      }
    </React.Fragment>
  );

};

export default TechEventMentorList;
