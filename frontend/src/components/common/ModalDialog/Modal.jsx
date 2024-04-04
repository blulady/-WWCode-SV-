import React from "react";
import cx from "classnames";
import classes from "./ModalDialog.module.css";

const Modal = ({
  id,
  title,
  text,
  contents,
  onCancel = () => Promise.resolve(),
  onConfirm,
}) => {
  const renderModalContents = () => {
    if (contents) {
      return contents;
    }
    return (
      <>
        <div className="mb-5">{text}</div>
        <div className="text-center">
          <button
            className={cx(
              "btn",
              classes["btn"],
              classes["cancel-btn"],
              classes["dialog-button"],
              "me-3"
            )}
            onClick={(e) => {
              e.preventDefault();
              onCancel();
            }}
            data-bs-dismiss="modal"
          >
            Cancel
          </button>
          <button
            type="submit"
            className={cx(
              "btn",
              classes["btn"],
              classes["confirm-btn"],
              classes["dialog-button"],
              classes["submit-button"]
            )}
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            data-bs-dismiss="modal"
          >
            Confirm
          </button>
        </div>
      </>
    );
  };

  return (
    <div className="modal" id={id} tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          {title && (
            <div className="modal-header fw-bold">
              <header className="text-center">
                <div className={classes["modal-title-text"]}>{title}</div>
              </header>
            </div>
          )}
          <div className="modal-body">{renderModalContents()}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
