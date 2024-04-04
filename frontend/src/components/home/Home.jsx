import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/auth/AuthContext";
import ContainerWithNav from "../layout/ContainerWithNav";
import styles from "./Home.module.css";
import { NAVITEMS } from "../../navitems";

/*
 * Home page - contains header and Chapter Members link in the body
 */

const Home = () => {
  const navigate = useNavigate();
  const handleClick = (pageId) => {
    navigate(`/${pageId}/members`);
  };
  const { userInfo } = useAuthContext();

  return (
    <>
      {userInfo && (
        <ContainerWithNav>
          <div className={`${styles["home-container"]} container`}>
            <div className="row">
              {NAVITEMS.map((item) => {
                return (
                  <>
                    {item.pageId === "directors" && userInfo.highest_role !== 'DIRECTOR' ? <></> :
                      <div key={item.pageId} className={`${styles["home-card"]} ${styles[item.name.toLowerCase().replaceAll(" ", "-")]} col-12 col-md-4`} onClick={() => handleClick(item.pageId)}>
                        <div className={styles.cardimgtop}></div>
                        <div className={`${styles.cardbody} d-flex justify-content-center align-items-center`}>
                          {item.name}
                        </div>
                      </div>
                    }
                  </>
                )
              })}
            </div>
          </div>
        </ContainerWithNav>
      )}
    </>
  );
};

export default Home;
