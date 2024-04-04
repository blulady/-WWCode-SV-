import React, { useState } from "react";
import WwcApi from "../../../WwcApi";
import styles from "./TechEventMentorForm.module.css";
import TextField from "../../common/forms/TextField";
import MessageBox from "../../messagebox/MessageBox";
import { useLocation, useNavigate } from "react-router-dom";

import { ERROR_REQUEST_MESSAGE } from "../../../Messages";
import RadioButtons from "../../common/forms/RadioButtons";

const defaultMentorData = {
    first_name: "",
    last_name: "",
    email: "",
    level: "",
    reliability: ""
};

const TechEventMentorForm = () => {
    const location = useLocation();
    const currentPath = location.pathname;
    const { edit, mentorInfo } = location.state;
    const [mentorData, setMentorData] = useState({...defaultMentorData, ...mentorInfo});
    const navigate = useNavigate();
    const [error, setError] = useState(false);

    const onPropertyChange = (e) => {
        setMentorData({
            ...mentorData,
            [e.target.name]: e.target.value
        });
    };

    const onCancel = (e) => {
        // Go back
        navigate(-1);
        e.stopPropagation();
    };

    const onSubmitMentorForm = async (e) => {
        e.preventDefault();
        const form = e.target;
        if (!form.checkValidity()) {
            form.classList.add('was-validated')
            return;
        }

        try {
            await (edit ? WwcApi.editTechMentor(mentorData.id, mentorData) : WwcApi.addTechMentor(mentorData));
            // Need to specify a path in order to add state
            navigate(currentPath.substring(0, currentPath.lastIndexOf("/")), { state: { status: edit ? "edit" : "new", name: `${mentorData.firstname}  ${mentorData.lastname}` }});
        } catch(e) {
            setError(true);
        }
    };

    const levelOptions = [
        {
            id: "beginner",
            label: "Beginner",
            value: "Beginner"
        },
        {
            id: "intermediate",
            label: "Intermediate",
            value: "Intermediate"
        },
        {
            id: "advanced",
            label: "Advanced",
            value: "Advanced"
        }
    ];

    const reliabilityOptions = [
        {
            id: "poor",
            label: "Poor",
            value: "Poor"
        },
        {
            id: "adequate",
            label: "Adequate",
            value: "Adequate"
        },
        {
            id: "good",
            label: "Good",
            value: "Good"
        },
        {
            id: "excellent",
            label: "Excellent",
            value: "Excellent"
        }
    ];

    return (
        <div className={styles["addmentor_container"]}>
            {error &&
                <MessageBox type="Error" title="Sorry!" message={ERROR_REQUEST_MESSAGE}></MessageBox>
            }
            <div className="d-flex flex-column align-items-center">
                <div className={styles["page-header"]}>{edit ? 'Edit' : 'Add'} Event Mentor</div>
                <div className={styles["label-required"]}>Mandatory Fields</div>
                <form onSubmit={onSubmitMentorForm} className={styles["form-container"] + " needs-validation"} noValidate>
                    <div>
                        <TextField id="firstname" label="First Name" type="text" name="first_name" readonly={false} value={mentorData.first_name} required={true} onChange={onPropertyChange} invalid="Please provide first name"></TextField>
                        <TextField id="lastname" label="Last Name" type="text" name="last_name" readonly={false} value={mentorData.last_name} required={true} onChange={onPropertyChange} invalid="Please provide last name"></TextField>
                        <TextField id="email" label="Email" type="text" name="email" readonly={false} value={mentorData.email} required={true} onChange={onPropertyChange} invalid="Please provide email"></TextField>
                        <RadioButtons id="level" label="Level" name="level" options={levelOptions} onChange={onPropertyChange} required={true}  value={mentorData.level}></RadioButtons>
                        <RadioButtons id="reliability" label="Reliability" name="reliability" options={reliabilityOptions} onChange={onPropertyChange} required={true} value={mentorData.reliability}></RadioButtons>
                    </div>
                    <div className="d-flex justify-content-center gap-3 mb-5">
                        <button className="wwc-secondary-button" onClick={onCancel}>Cancel</button>
                        <button type="submit" className="wwc-primary-button">Submit</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TechEventMentorForm;
