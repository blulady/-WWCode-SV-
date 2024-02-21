import React, { useState, useEffect } from "react";
import GenericTable from "../../common/Table";
import WwcApi from '../../../WwcApi'
import cx from "classnames";
import styles from "./CompanyHosts.index.module.css";
import TruncatedText from "./TruncatedText";
import ModalDialog from "../../common/ModalDialog";
import Contacts from "./Contacts";
import MessageBox from "../../messagebox/MessageBox";
import { isBrowser } from "react-device-detect";
import { useLocation, useNavigate } from "react-router-dom";
import CardList from "../../common/CardList/CardList";

const CompanyHosts = () => {
  const [companyHosts, setCompanyHosts] = useState([]);
  const [currentRecord, setCurrentRecord] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const created = location.state?.created;
  const [showRequestStatus, setShowRequestStatus] = useState({});

  useEffect(() => {
    const fetchCompanyHost = async () => {
      try {
        const hosts = await WwcApi.getCompanyHost();
        setCompanyHosts(hosts.data);
        setShowRequestStatus({ type: "Success" });
      } catch (error) {
        console.warn("An error occurred while fetching company hosts:", error.message);
        setShowRequestStatus({ type: "Error", title: "Sorry!", message: error.response.data.detail });
      }
    }
    fetchCompanyHost();
  }, []);

  const handleDeleteCompanyHost = () => {
    WwcApi.deleteCompanyHost(currentRecord.id)
      .then((res) => {
        setCompanyHosts(companyHosts.filter((record) => record.id !== currentRecord.id));
        setCurrentRecord(null);
      })
      .catch((err) => {
        console.warn("Host deletion did not process.");
      });
  };

  const columns = [
    {
      key: "company",
      title: "Company",
      dataIndex: "company",
    },
    {
      key: "city",
      title: "City",
      dataIndex: "city",
    },
    {
      key: "contacts",
      title: "Contacts",
      dataIndex: "contacts",
      render: (data) => {
        return <Contacts data={data} />
      },
    },
    {
      key: "notes",
      title: "Notes",
      dataIndex: "notes",
      render: (notes) => {
        return <TruncatedText text={notes} />;
      },
    },
  ];

  const goToCompanyHostForm = (edit, companyHostInfo) => {
    navigate(`${location.pathname}/form`, { state: { edit: edit, companyHostInfo: companyHostInfo } });
  };

  const renderHostCompanies = () => {
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
                  goToCompanyHostForm(true, { ...record });
                  e.stopPropagation();
                }}
              />
              <ModalDialog
                id="deleteCompanyHost"
                title="Are you sure?"
                text="Are you sure you want to delete the company host?"
                onConfirm={handleDeleteCompanyHost}
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
      return <GenericTable tableClass={styles["company-hosts-table"]} columns={extendedColumns} data={companyHosts} />;
    }

    const actions = [
      {
        render: (dataid, data) => {
          return (<button className="wwc-action-button d-flex align-items-center" data-bs-dismiss="modal" data-bs-target={`#${dataid}`} onClick={(e) => {
            goToCompanyHostForm(true, { ...data });
          }}>
            <div className={styles["edit"] + " " + styles["icon"]}></div>
            <div className={styles["label"]}>Edit</div>
          </button>);
        }
      },
      {
        render: (dataid, data) => {
          return (<ModalDialog
            id="deleteCompanyHost"
            title="Are you sure?"
            text="Are you sure you want to delete the company host?"
            onConfirm={handleDeleteCompanyHost}
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

    return <CardList columns={columns} data={companyHosts} actions={actions}></CardList>
  };

  const renderContent = () => {
    let elements = [];
    if (created) {
      elements.push(<MessageBox type="Success" title="Success!" message={`${created} was added to the list of host companies.`}></MessageBox>);
    }
    elements.push(
      <div className="d-flex justify-content-end mb-2 mb-md-5" key="">
        <button type="button" className="wwc-action-button" onClick={() => goToCompanyHostForm(false, {})}>
          + Add Host
        </button>
      </div>
    );
    elements.push(renderHostCompanies());
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

export default CompanyHosts;
