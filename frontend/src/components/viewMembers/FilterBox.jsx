import React, { useState, useRef, useEffect } from "react";

import styles from "./FilterBox.module.css";
import cx from "classnames";

const FilterBox = (props) => {
    const [filters, setFilters] = useState({...props.state});
    const boxRef = useRef(null);

    useEffect(() => {
        function clickBlur(e) {
            if(!boxRef.current.contains(e.target)) {
                if(props.onBlur) {
                    props.onBlur();
                }
            }
        }
        window.addEventListener("mousedown", clickBlur);
        return () => window.removeEventListener("mousedown", clickBlur);
    }, []);

    const onFilterSelect = (group, filterVal) => {
        return (ev) => {
            const index = filters[group].indexOf(filterVal);
            if(index === -1) {
                filters[group].push(filterVal);
                setFilters({ ...filters });
            } else {
                filters[group].splice(index, 1);
                setFilters({ ...filters });
            }
        };
    }

    const onFilterApply = () => {
        if(props.onFilterApply) {
            props.onFilterApply(filters);
        }
    };

    const onFilterReset = () => {
        let _filter = {};
        Object.keys(filters).forEach((key) => {
            _filter[key] = []
        });
        setFilters(_filter);
        if(props.onFilterReset) {
            props.onFilterReset(_filter);
        }
    };

    const renderOption = (option) => {
        if(option.type === "button") {
            return renderButtonOption(option.group, option.options);
        }
        if (option.type === "selection") {
            return renderSelectionOption(option.options);
        }
    };

    const renderButtonOption = (group, buttonOptions) => {
        return (
          buttonOptions.map((button) => {
              if (button.enable) {
                return <button type="button" className={cx(styles["filter-option-button"], (filters[group]|| []).indexOf(button.value) > -1 ? styles["selected"] : "")} value={button.value} onClick={onFilterSelect(group, button.value)}>{button.label}</button>
              } else {
                  return null;
              }
          }));
    }

    const renderSelectionOption = (selectionOptions) => {
        return (
            <select className={cx(styles["filter-selection"], "form-control")}>
                {selectionOptions.map((select) => {
                    return (<option value={select.value}>{select.label}</option>);
                })}
            </select>
        )
    }

    return (
        <div className={cx(styles["filter-box"])} ref={boxRef}>
            {props.options.map((option, index) => {
                return (
                    <div className={cx(styles["filter-group"], "form-group d-flex align-items-center")}>
                        <div className={styles["filter-category"]}>{option.label}:</div>
                        {renderOption(option)}
                        {index === props.options.length - 1 && 
                            <div className={styles["filter-action-button-group"]}>
                                <button type="button" className={cx(styles["filter-action-button"], styles["filter-clear-button"], "btn")} onClick={onFilterReset}>Clear</button>
                                <button type="button" className={cx(styles["filter-action-button"], styles["filter-submit-button"], "btn")} onClick={onFilterApply}>Filter</button>
                            </div>
                        }
                    </div>
                )
            })}
        </div>
    );
};

export default FilterBox;