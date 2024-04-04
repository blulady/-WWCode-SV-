import React from "react";

import MemberImage from "../memberdetails/MemberImage";
import ProfileBio from "./ProfileBio";
import ProfileLocation from "./ProfileLocation";
import ProfileSocialMedia from "./ProfileSocialMedia";
import ProfileDetail from "./ProfileDetails";

import styles from "./UserProfile.module.css"

export const ViewProfile = ({ profileData, onClickEditPassword, onClickEditProfile }) => {
    return (
        <div className={styles["p-view-container"]}>
            <div className={styles["p-buttons"] + " d-flex justify-content-end gap-3 pt-3"}>
                <button className="wwc-secondary-button" onClick={onClickEditPassword}>Edit Password</button>
                <button className="wwc-secondary-button" onClick={onClickEditProfile}>Edit Profile</button>
            </div>
            <div className={styles["p-view-profile-container"]}>
                <div className="d-flex flex-row py-3 gap-4">
                    <div className={styles["user-profile-img"]}>
                        <MemberImage profile={profileData} />
                    </div>
                    <div className="d-flex flex-column gap-2 justify-content-center">
                        <div className={styles["p-name"]}>{profileData.first_name + " " + profileData.last_name}</div>
                        <div className={styles["p-email"]}>{profileData.email}</div>
                    </div>
                </div>

                <ProfileDetail {...profileData}></ProfileDetail>

                <ProfileLocation {...profileData} readonly={true}></ProfileLocation>

                <ProfileBio bio={profileData.bio} readonly={true}></ProfileBio>

                <ProfileSocialMedia {...profileData} readonly={true}></ProfileSocialMedia>
            </div>

        </div>
    );
};

export default ViewProfile;
