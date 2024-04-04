
import React, { useState, useEffect } from "react";
import { isBrowser } from "react-device-detect";

import cx from "classnames";
import styles from "./SearchSortFilter.module.css";

import SearchBox from "./SearchBox";
import FilterBox from "./FilterBox";
import SuggestionBox from  "./SuggestionBox";

const SearchSortFilter = ({
  initialFilterStatus,
  availableFilters,
  sortOptions,
  fetchData,
  addData,
  setData,
  setPrevSearch,
  searchPlaceholder,
  getFilters,
  getSearchSuggestions,
  isDirector,
  addButton,
  pageId,
  tabId
}) => {

  const [sortKey, setSort] = useState(sortOptions.DEFAULT || []);

  const [suggestions, setSuggestions] = useState([]);
  const [isOpenSuggestionBox, setIsOpenSuggestionBox] = useState(false);

  const [search, setSearch] = useState("");

  const [filters, setFilters] = useState(initialFilterStatus);
  const [isApplyingFilter, setIsApplyingFilter] = useState(false);
  const [filterOptions, setFilterOptions] = useState(availableFilters);

  const getData = async (searchKey) => {
    let sortProp = sortKey.prop;
    let data = await fetchData(sortProp, searchKey, filters);
    setData(data || []);
  };

  const onSearch = async (query) => {
    setSearch(query);
    if (query.length === 3) {
      const suggestOptions = await getSearchSuggestions(query);
      setSuggestions(suggestOptions);
      setIsOpenSuggestionBox(true);
    } else if (query.length < 3) {
      setSuggestions([]);
    }
  };

  const onBlurSearch = () => {
    setIsOpenSuggestionBox(false);
  };

  const onFocusSearch = () => {
    setIsApplyingFilter(false);
    if (suggestions.length) {
      setIsOpenSuggestionBox(true);
    }
  };

  const onEnterSearch = async (searchStr) => {
    setIsApplyingFilter(false);
    setIsOpenSuggestionBox(false);
    if (!searchStr) {
      setSuggestions([]);
    }
    setPrevSearch(searchStr ||  "");
    setSearch(searchStr);
    getData(searchStr);
  };

  const onSortSelect = (val) => {
    setSort(sortOptions[val.toUpperCase()]);
  };

  const onSelectSuggestion = async (selectedUser) => {
    setPrevSearch(selectedUser);
    setSearch(selectedUser);
    getData(selectedUser);
  };

  const toggleFilterBox = () => {
    setIsApplyingFilter(!isApplyingFilter);
  };

  const onFilterApply = (vals) => {
    if (!getFilters) return;
    const filtersToApply = getFilters(vals);
    setPrevSearch(search);
    setFilters(filtersToApply);
    toggleFilterBox();
  };

  const onFilterReset = (_filters) => {
    setPrevSearch("");
    setFilters(_filters);
    toggleFilterBox();
  };

  const onFilterBoxBlur = () => {
    setIsApplyingFilter(false);
  };

  const openFilter = () => {
    setIsOpenSuggestionBox(false);
    if (!isApplyingFilter) {
      setIsApplyingFilter(true);
    }
  };

  useEffect(() => {
    getData(search);
  }, [sortKey, filters]);

  return (
    <div className={cx(styles["view-member-page-list-wrapper"], "d-flex")}>
      <div
        id="functionContainer"
        className={cx(styles["search-container"], "d-flex")}
      >
        <div
          id="filterContainer"
          className={cx(styles["filter-container"], "d-flex")}
        >
          <div className={styles["filter-search-box"]}>
            <SearchBox
              onSearchChange={onSearch}
              onBlur={onBlurSearch}
              onFocus={onFocusSearch}
              onEnter={onEnterSearch}
              searchPlaceholder={searchPlaceholder}
              value={search}
            ></SearchBox>
          </div>
          <div className={styles["filter-suggestion-box"]}>
            {isOpenSuggestionBox && (
              <SuggestionBox
                options={suggestions}
                onSelect={onSelectSuggestion}
              ></SuggestionBox>
            )}
          </div>
          {tabId !== "pending" && (
            <div>
              {isBrowser && !!availableFilters && (
                <button
                  className={cx(
                    styles["btn-group-append"],
                    "btn btn-outline-secondary dropdown-toggle"
                  )}
                  type="button"
                  onClick={openFilter}
                >
                  Filters
                </button>
              )}
              {isApplyingFilter && (
                <FilterBox
                  options={filterOptions}
                  state={filters}
                  onBlur={onFilterBoxBlur}
                  onFilterApply={onFilterApply}
                  onFilterReset={onFilterReset}
                ></FilterBox>
              )}
            </div>
          )}
        </div>
        {isBrowser && (
                <div
                  id="sortContainer"
                  className={styles["sort-container"] + " d-flex dropdown"}
                >
                  <div id="sortLabel" className={styles.label}>
                    Sort By:
                  </div>
                  <button
                    className={cx(
                      styles["sort-button"],
                      styles["action-button"],
                      "btn dropdown-toggle"
                    )}
                    type="button"
                    id="sortDropdownButton"
                    data-bs-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                    data-offset="{top: 10}"
                  >
                    {sortKey.label}
                  </button>
                  <div
                    id="sortDropdownMenu"
                    className={cx(styles["sort-dropdown"], "dropdown-menu")}
                    aria-labelledby="sortDropdownButton"
                  >
                    <span className={styles["dropdown-menu-arrow"]}></span>
                    {Object.values(sortOptions).map((option, idx) => (
                      <button
                        type="button"
                        key={idx}
                        className={cx(
                          styles["sort-dropdown-item"],
                          "dropdown-item",
                          { [styles.active]: option.value === sortKey.value }
                        )}
                        value={option.value}
                        onClick={() => onSortSelect(option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
          {isDirector && pageId !== 'directors' && (
            <div
              id="addMemberButtonContainer"
              className={styles["add-member-button-container"]}
              onClick={addData}
            >
              <button
                type="button"
                id="addMemberButton"
                className={cx(
                  styles["add-button"],
                  styles["action-button"],
                  "btn"
                )}
              >
                {addButton}
              </button>
            </div>
          )}
      </div>
    </div>
  );
}  

export default SearchSortFilter;
