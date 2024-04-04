import React, { useState } from "react";
import ProfileSection from "./ProfileSection";
import ProfileImage from "../../images/ProfileImage.png";
import ProfileBio from "./ProfileBio";
import ProfileSocialMedia from "./ProfileSocialMedia";
import TextField from "../common/forms/TextField";

import MemberImage from "../memberdetails/MemberImage";
import ProfileLocation from "./ProfileLocation";
import ImageUpload from "./ImageUpload";

import styles from "./UserProfile.module.css"

export const EditProfile = ({ profileData, onSubmitEditForm, onCancelEdit }) => {
    const initProfile = {...profileData};
    const [profile, setProfile] = useState(initProfile);

    const onProfileChange = (e) => {
        setProfile({
          ...profile,
          [e.target.name]: e.target.value
        });
      };
    const onProfileSubmit = () => {
        onSubmitEditForm(profile);
    };

    const onCancel = () => {
        // restore to the initial state
        onCancelEdit(initProfile);
    };


    return (
        <>
            <div className="d-flex flex-column align-items-center">
                <div className={styles["page-header"]}>Edit Personal Profile</div>
                <div className={styles["label-required"]}>Mandatory Fields</div>
            </div>

            <ProfileSection header="User Photo">
                <div className={styles["user-profile-img"]}>
                  <MemberImage profile={profile} />
                </div>
                <ImageUpload profile={profile} onProfile={setProfile}/>
                <div>
                    Image must be square, with a minimum <br/> resolution of 100 ppi (400 X 400 pixels)
                </div>
            </ProfileSection>

            <ProfileSection header="Profile Name">
                <TextField id="profileFirstName" label="First Name" type="text" name="first_name" readonly={false} required={true} onChange={onProfileChange} value={profile.first_name}></TextField>
                <TextField id="profileLastName" label="Last Name" type="text" name="last_name" readonly={false} required={true} onChange={onProfileChange} value={profile.last_name}></TextField>
            </ProfileSection>

            <ProfileLocation {...profile} readonly={false} onChange={onProfileChange}></ProfileLocation>

            <ProfileBio bio={profile.bio} readonly={false} onChange={onProfileChange}></ProfileBio>

            <ProfileSocialMedia {...profile} readonly={false} onChange={onProfileChange}></ProfileSocialMedia>

            <hr className={"my-5"}></hr>

            <div className="d-flex justify-content-center gap-3">
                <button className="wwc-secondary-button" onClick={onCancel}>Cancel</button>
                <button className="wwc-primary-button" onClick={onProfileSubmit}>Save</button>
            </div>

        </>
    );
};

export default EditProfile;
