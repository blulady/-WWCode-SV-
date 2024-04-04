import React, { useEffect, useState } from "react";
import styles from "./ResourcesLinks.module.css";
import cx from "classnames";

const ResourcesLinks = (props) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editLink, setEditLink] = useState(props.editUrl);
  const [publishLink, setPublishLink] = useState(props.publishUrl);

  useEffect(() => {
    setEditLink(props.editUrl);
    setPublishLink(props.publishUrl);

    if (props.editUrl.length === 0 && props.publishUrl.length === 0) {
      setIsAdding(true);
    } else {
      setIsAdding(false);
    }
  }, [props.editUrl, props.publishUrl]);

  const saveOrEdit = () => {
    if (isEditing && props.onUpdateDocument) {
      props.onUpdateDocument(editLink, publishLink);
    }
    setIsEditing(!isEditing);
  };

  const addDocument = () => {
    props.onSaveFirstDocument(
      editLink,
      publishLink,
    );
  };

  const openEditDocument = () => {
    if (editLink) {
      window.open(editLink, "_blank");
    }
  };

  const onChangeEditLinks = (event) => {
    setEditLink(event.target.value);
  };

  const onChangePublishLinks = (event) => {
    setPublishLink(event.target.value);
  };

  const labels = {
    editInput: "Edit URL:",
    publishInput: "Published Embedded URL:",
  };

  if (isAdding) {
    labels.editInput = "Enter URL:";
    labels.publishInput = "Enter Published Embedded URL:";
  }

  return (
    <div className="row">
      <div className="col-12 col-md-8">
        <div className={styles["input-container"]}>
          <div className={cx(styles["input-label"], "mb-2")}>
            {labels.editInput}
          </div>
          <input
            type="text"
            readOnly={!isEditing && !isAdding}
            className={cx(
              {
                "form-control-plaintext": !isEditing && !isAdding,
                "wwc-text-input": isEditing || isAdding,
              },
              styles["input-text"]
            )}
            value={editLink}
            onChange={onChangeEditLinks}
            data-testid="editLink"
            placeholder="Enter URL:"
          />
        </div>
        <div className={styles["input-container"]}>
          <div className={cx(styles["input-label"], "mb-2")}>
            {labels.publishInput}
          </div>
          <input
            type="text"
            readOnly={!isEditing && !isAdding}
            className={cx(
              {
                "form-control-plaintext": !isEditing && !isAdding,
                "wwc-text-input": isEditing || isAdding,
              },
              styles["input-text"]
            )}
            value={publishLink}
            onChange={onChangePublishLinks}
            data-testid="publishLink"
            placeholder="Enter Published Embedded URL"
          />
        </div>
      </div>
      {isAdding ? (
        <div className="col-12 col-md-4">
          <div className="d-flex justify-content-around">
            <button
              onClick={addDocument}
              type="button"
              className="wwc-action-button"
            >
              + Add Document
            </button>
          </div>
        </div>
      ) : (
        <div className="col-12 col-md-4">
          <div className="d-flex justify-content-around">
            <button
              onClick={saveOrEdit}
              className="wwc-action-button"
              data-testid="saveBtn"
            >
              {isEditing ?
                <div className="d-flex">
                  <span className="icon save-purple-icon mr-2"></span>
                    Save Links
                </div> :
                <div className="d-flex">
                  <span className="icon edit-purple-icon mr-2"></span>
                    Edit Links
                </div>
              }
            </button>
            <button onClick={openEditDocument} className="wwc-action-button">
              <div className="d-flex">
                <span className="icon edit-purple-icon mr-2"></span>
                Edit Document
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourcesLinks;
