import React from "react";
import cx from "classnames";
import FormLabelField from "./FormLabelField";
import common_styles from "./Forms.common.module.css";

const RadioButtons = ({ id, label, value, options, onChange, name, readonly = false, required = false }) => {
    return (
        <FormLabelField id={id} label={label} readonly={readonly} required={required}>
            {options.map((option) => {
                let selected = option.value === value;
                return (
                <div className={cx("form-check", common_styles["radio-option"], {[common_styles["checked"]]: selected})} key={option.id}>
                    <input type="radio" name={name} id={option.id} value={option.value} checked={selected} required={required} onChange={onChange} className={cx("form-check-input", common_styles["radio-option-input"], {"required": required })} />
                    <label className="form-check-label" htmlFor={option.id}>
                        {option.label}
                    </label>
                </div>);
            })}
        </FormLabelField>
    );
};

export default RadioButtons;