import React, { useState } from "react";
import ChevronDown from "../../../icons/ChevronDown";
import ChevronUp from "../../../icons/ChevronUp";
import styles from "./CompanyHosts.index.module.css";

const Contacts = ({ data }) => {
  const [collapsedDown, setCollapsedDown] = useState(
    Array(data.length).fill(false)
  );

  const toggleCollapseDown = (index) => {
    const newCollapsedDown = [...collapsedDown];
    newCollapsedDown[index] = !newCollapsedDown[index];
    setCollapsedDown(newCollapsedDown);
  };

  return (
    <>
      {data.map((item, index) => (
        <div key={index} className={styles["contactWrapper"]}>
          <div
            className={[
              "d-flex justify-content-between align-items-center",
              collapsedDown[index] ? styles.contactNameWithCollapse : styles.contactNameWithoutCollapse,
            ].join(" ")}
            data-bs-toggle="collapse"
            href={`#multiCollapse${index}`}
            onClick={() => toggleCollapseDown(index)}
          >
            {item.name} {collapsedDown[index] ? "" : <ChevronDown />}
          </div>
          <div className="collapse multi-collapse" id={`multiCollapse${index}`}>
            <div className={styles.contactNotes}>
              <div>{item.email}</div>
              <div>{item.info}</div>
              <hr></hr>
              <div
                className="d-flex justify-content-end"
                data-bs-toggle="collapse"
                href={`#multiCollapse${index}`}
                onClick={() => toggleCollapseDown(index)}
              >
                <ChevronUp />
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default Contacts;
