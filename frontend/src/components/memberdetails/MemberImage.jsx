import React from 'react';
import ProfileImage from "../../images/ProfileImage.png";
import styles from "./MemberImage.module.css";


const MemberImage = ({profile}) => {
  const imageSrc = profile?.photo && profile?.photo !== "" ? profile.photo :  ProfileImage

  return (
      <img
        alt="Profiles"
        src={imageSrc}
        className={styles["img-size"]}
      />
  )
}

export default MemberImage
