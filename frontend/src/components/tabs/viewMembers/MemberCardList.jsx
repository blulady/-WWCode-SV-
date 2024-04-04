import React, {useState, useEffect} from "react";
import ReactPaginate from "react-paginate";
import { isBrowser } from "react-device-detect";

import cx from "classnames";
import styles from "./MemberCardList.module.css";

import MemberCard from './MemberCard';

const MemberCardList = ({data, prevSearch, userInfo, isDirector}) => {
    const defaultDataPerPage = 12;

    const [paginationInfo, setPaginationInfo] = useState({
        pageCount: 0,
        offset: 0,
        dataPerPage: 0,
        currentData: [],
    });
    
    const handlePageClick = (data) => {
        let selected = data.selected;
        let offset = selected * paginationInfo.dataPerPage;
        setPaginationInfo({
          offset: offset,
          currentData: data.slice(offset, offset + paginationInfo.dataPerPage),
          pageCount: paginationInfo.pageCount,
          dataPerPage: paginationInfo.dataPerPage,
        });
    };
    
    // update pagination info once user data is changed
    useEffect(() => {
        let cardsPerPage = defaultDataPerPage;
        setPaginationInfo({
            userPerPage: cardsPerPage,
            pageCount: Math.ceil(data.length / cardsPerPage),
            currentData: data.slice(0, cardsPerPage),
            offset: 0,
        });
    }, [data]);

    return (
        <div className={cx(styles["memberlist-container"], "container px-0")}>
            <div
                className={cx(styles["memberlist-row"], "row", {
                    "no-gutters": isBrowser,
                })}
            >
            {!data.length && 
                ((prevSearch.length > 0) ? 
                    (<div className={styles["empty-users-msg"]}>
                        No name matching: {prevSearch}
                    </div>) :
                    (<div className={styles["empty-users-msg"]}>
                        No members to display
                    </div>)
                ) 
            }
            {(isBrowser ? paginationInfo.currentData : data).map(
                (userInfo, idx) => {
                    return (
                        <React.Fragment key={idx}>
                            <MemberCard
                                userInfo={userInfo}
                                isDirector={isDirector}
                                userRole={userInfo.role}
                                viewClassName={
                                    "col-12 col-lg-3 " +
                                    ((idx + 1) % 4 > 0 ? styles["memberlist-card-gap"] : "")
                                }
                            />
                            {(idx + 1) % 4 === 0 && (
                                <div className={cx(styles.break, "w-100")}></div>
                            )}
                        </React.Fragment>
                    );
                }
            )}
        </div>
        {isBrowser && data.length > 0 && (
            <div>
              <ReactPaginate
                previousLabel={""}
                nextLabel={""}
                breakLabel={"..."}
                breakClassName={styles["break-me"]}
                previousClassName={styles.previous}
                previousLinkClassName={styles["prev-link"]}
                nextClassName={styles.next}
                nextLinkClassName={styles["next-link"]}
                pageClassName={styles.page}
                pageLinkClassName={styles.link}
                pageCount={paginationInfo.pageCount}
                marginPagesDisplayed={2}
                pageRangeDisplayed={5}
                onPageChange={handlePageClick}
                containerClassName={styles.pagination}
                subContainerClassName={cx(styles.pages, styles.pagination)}
                activeClassName={styles.active}
              />
            </div>
          )}
    </div>
)}

export default MemberCardList;
