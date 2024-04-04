import React from "react";

import styles from "./SuggestionBox.module.css";
import "../../Common.css";
import cx from "classnames";

const SuggestionBox = (props) => {
    const onSelectOption = (ev) => {
        if (props.onSelect) {
            const target = ev.target;
            if(target.tagName.toLowerCase() === "li") {
                props.onSelect(target.textContent);
            }
        }
    };

    const groupSuggestionsByCategory = (options) => {
        return options.reduce((groupedOptions, option) => {
          const category = option.category || 'Uncategorized';
          if (!groupedOptions[category]) {
            groupedOptions[category] = [];
          }
          groupedOptions[category].push(option);
          return groupedOptions;
        }, {});
    };
    
    const groupedSuggestions = groupSuggestionsByCategory(props.options)

    return (
        <div className={cx(styles["suggestion-box"], { hidden: !props.options.length })}>
            {Object.entries(groupedSuggestions).map(([category, suggestions]) => (
                category !== 'Uncategorized' && (
                    <div key={category}>
                        <div className={styles["category-title"]}>{category} Results</div>
                        <ul onMouseDown={onSelectOption}>
                            {suggestions.map((option) => (
                                <li value={option.id} key={option.id}>{option.value}</li>
                            ))}
                        </ul>
                    </div>
                )
            ))}
            {/* Render Uncategorized suggestions outside the loop */}
            {groupedSuggestions['Uncategorized'] && (
                <ul onMouseDown={onSelectOption}>
                    {groupedSuggestions['Uncategorized'].map((option) => (
                        <li value={option.id} key={option.id}>{option.value}</li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SuggestionBox;
