import React, { useState, useEffect } from "react";
import { isBrowser } from "react-device-detect";
import { useLocation, useNavigate } from "react-router-dom";
import GenericTable from "../../common/Table";
import WwcApi from '../../../WwcApi'
import cx from "classnames";
import styles from "./CompanyHosts.index.module.css";
import TruncatedText from "./TruncatedText";
import { getPageId, getTabId } from "../../../utils";
import ModalDialog from "../../common/ModalDialog";
import Contacts from "./Contacts";
import MessageBox from "../../messagebox/MessageBox";
import CardList from "../../common/CardList/CardList";
import SearchSortFilter from "../../searchsortfilter/SearchSortFilter";
import { hostCompanySortOptions } from "../../searchsortfilter/constants";


const CompanyHosts = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pageId = getPageId(location.pathname);
  const tabId = getTabId(location.pathname);

  const [companyHosts, setCompanyHosts] = useState([]);
  const [currentRecord, setCurrentRecord] = useState(null);
  const created = location.state?.created;
  const [showRequestStatus, setShowRequestStatus] = useState({});
  const [prevSearch, setPrevSearch] = useState("");

  const fetchCompanyHost = async (sort, search, filters) => {
    try {
      const hosts = await WwcApi.getCompanyHost(sort, search, filters);
      setCompanyHosts(hosts.data);
      setShowRequestStatus({ type: "Success" });
      return hosts.data
    } catch (error) {
      console.warn("An error occurred while fetching company hosts:", error.message);
      setShowRequestStatus({ type: "Error", title: "Sorry!", message: error.response.data.detail });
    }
  }

  useEffect(() => {
    fetchCompanyHost(undefined, '', undefined);
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

  const handleAddHost = () => {
    goToCompanyHostForm(false, {})
  }

  const findMatchingCategoriesForSearch = (obj, str) => {
    const categories = []
    for (let key in obj) {
      if (typeof obj[key] === 'string' && obj[key].toLowerCase().includes(str.toLowerCase())) {
        categories.push({category: key, result: obj[key]});
      } else if (Array.isArray(obj[key])) {
        for (let item of obj[key]) {
          for (let key in item) {
            if (item[key].toLowerCase().includes(str.toLowerCase())) {
              categories.push({category: key, result: item[key]});
            }
          }
        }
      }
    }
    return categories;
  };

  const getSearchSuggestions = async (query) => {
    let hosts = await fetchCompanyHost(null, query, null);
    const suggestOptions = []
    hosts.map((host) => {
      const categories = findMatchingCategoriesForSearch(host, query)
      categories.map((categoryOptions) => {
        suggestOptions.push({
          id: host.id,
          value: categoryOptions.result,
          category: categoryOptions.category
        })
      })
    });
    return suggestOptions;
  }

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
        <SearchSortFilter
            initialFilterStatus={undefined}
            availableFilters={undefined}
            sortOptions={hostCompanySortOptions}
            fetchData={fetchCompanyHost}
            addData={handleAddHost}
            setData={setCompanyHosts}
            setPrevSearch={setPrevSearch}
            searchPlaceholder={"Search company, contact name, and email"}
            getFilters={undefined}
            getSearchSuggestions={getSearchSuggestions}
            isDirector={true}
            addButton={"+ Add Host"}
            pageId={pageId}
            tabId={tabId}
          />
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
