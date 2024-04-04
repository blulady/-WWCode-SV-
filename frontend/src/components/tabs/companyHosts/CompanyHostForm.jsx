import React, { useState } from "react";
import WwcApi from '../../../WwcApi'
import styles from "./CompanyHostForm.module.css";
import TextField from "../../common/forms/TextField";
import TextArea from "../../common/forms/TextArea";
import MessageBox from "../../messagebox/MessageBox";
import { useLocation, useNavigate } from "react-router-dom";

import { ERROR_REQUEST_MESSAGE } from "../../../Messages";

const defaultContact = {name: "", email: "", info: ""};

const defaultCompanyHostData = {
    city: "",
    company: "",
    contacts: [],
    id: null,
    notes: ""
};

const CompanyHostForm = () => {
    const location = useLocation();
    const currentPath = location.pathname;
    const { edit, companyHostInfo } = location.state;
    const [hostCompany, setHostCompany] = useState({...defaultCompanyHostData, ...companyHostInfo});
    const navigate = useNavigate();
    const [error, setError] = useState(false);

    const onPropertyChange = (e) => {
        setHostCompany({
            ...hostCompany,
            [e.target.name]: e.target.value
        });
    };

    const onContactInfoChange = (e) => {
        const target = e.target.name;
        const [prop, index] = target.split("-");
        let contacts = [...hostCompany?.contacts] || [];
        let contact = contacts[index] || {...defaultContact};
        contacts[index] = { ...contact, [prop]: e.target.value };

        setHostCompany({
            ...hostCompany,
            contacts: contacts
        })
    };

    const onCancel = (e) => {
        // Go back
        navigate(-1);
        e.stopPropagation();
    };

    const onSubmitHostCompany = async (e) => {
        e.preventDefault();
        const form = e.target;
        if (!form.checkValidity()) {
            form.classList.add('was-validated')
            return;
        }

        // fill null entry
        hostCompany.contacts = hostCompany.contacts.filter((el) => {
            return el != null;
        });

        try {
            await (edit ? WwcApi.editCompanyHost(hostCompany.id, hostCompany) : WwcApi.addCompanyHost(hostCompany));
            // Need to specify a path in order to add state
            navigate(currentPath.substring(0, currentPath.lastIndexOf("/")), { state: { created: hostCompany.company }});
        } catch(e) {
            setError(true);
        }
    };

    const renderContactInfo = () => {
        const contacts = hostCompany?.contacts;
        let contactEls = [];
        for (let index = 0; index < 2; index++) {
            const contact = (contacts && contacts[index]) || {};
            contactEls.push(<TextField key={`contact-name-${index}`} id={`contact-name-${index}`} label={`Contact-${index + 1} Name`} name={`name-${index}`} type="text" readonly={false} value={contact.name} required={false} onChange={onContactInfoChange}></TextField>);
            contactEls.push(<TextField key={`contact-email-${index}`} id={`contact-email-${index}`} label={`Contact-${index + 1} Email`} name={`email-${index}`} type="email" readonly={false} value={contact.email} required={false} onChange={onContactInfoChange} invalid="Please provide valid email format"></TextField>);
            contactEls.push(<TextArea key={`contact-info-${index}`} id={`contact-info-${index}`} label={`Contact-${index + 1} Information`} name={`info-${index}`} type="text" readonly={false} value={contact.info} onChange={onContactInfoChange}></TextArea>);
        }
        return contactEls;
    };

    return (
        <div className={styles["addhost_container"]}>
            {error &&
                <MessageBox type="Error" title="Sorry!" message={ERROR_REQUEST_MESSAGE}></MessageBox>
            }
            <div className="d-flex flex-column align-items-center">
                <div className={styles["page-header"]}>{edit ? 'Edit' : 'Add'} Host Company</div>
                <div className={styles["label-required"]}>Mandatory Fields</div>
                <form onSubmit={onSubmitHostCompany} className={styles["form-container"] + " needs-validation"} noValidate>
                    <div>
                        <TextField id="companyName" label="Company Name" type="text" name="company" readonly={false} value={hostCompany.company} required={true} onChange={onPropertyChange} invalid="Please provide a company name"></TextField>
                        <TextField id="companyCity" label="City" type="text" name="city" readonly={false} value={hostCompany.city} required={false} onChange={onPropertyChange}></TextField>
                        {renderContactInfo()}
                        <TextArea id="companyNotes" label="Notes" name="notes" readonly={false} value={hostCompany.notes || ""} onChange={onPropertyChange}></TextArea>
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

export default CompanyHostForm;