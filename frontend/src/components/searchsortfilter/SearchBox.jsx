import React, { useState } from "react";

import styles from "./SearchBox.module.css";
import cx from "classnames";

const SearchBox = (props) => {
    //const [searchVal, setSearchVal] = useState(props.value);
    const searchInput = React.createRef()

    const onSearchChange = (ev) => {
        if (props.onSearchChange) {
            props.onSearchChange(ev.target.value);
        }
    };

    const onBlur = (ev) => {
        if (props.onBlur) {
            props.onBlur();
        }
    };

    const onFocus = () => {
        if (props.onFocus) {
            props.onFocus();
        }
    };

    const onEnter = (ev) => {
        if (ev.keyCode === 13) {
            if (props.onEnter) {
                props.onEnter(ev.target.value);
            }
        }
    };

    const onClear = (ev) => {
        searchInput.current.value = null;
        if (props.onEnter) {
            props.onEnter(null);
        }
    };

    return (
        <div className={cx(styles["search-box"], "input-group", "flex-nowrap", "align-items-center")}>
            <div className={styles["search-box-prepend"] + " input-group-prepend"}>
                <div className={cx(styles["search-box-search-icon"], "input-group-text bg-transparent")}><i className="fa fa-search"></i></div>
            </div>
            <input type="text" className={cx(styles["search-text"], "form-control border-left-0")} placeholder={props.searchPlaceholder} aria-label="Search Box" onChange={onSearchChange} onBlur={onBlur} onFocus={onFocus} onKeyUp={onEnter} value={props.value} ref={searchInput}></input>
            <div className="input-group-append">
                <button className={cx(styles["search-box-clear-btn"], "bg-transparent")} onClick={onClear}>
                    <i className="fa fa-times"></i>
                </button>
            </div>
        </div>
    );
};

export default SearchBox;