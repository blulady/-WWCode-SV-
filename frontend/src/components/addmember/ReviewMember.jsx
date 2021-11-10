import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import ContainerWithNav from "../layout/ContainerWithNav";
import EditIcon from "../../images/edit_24px.png";
import BackButton from "../../images/arrow_back_24px.png";
import EmailInput from "./EmailInput";
import RoleRadioInput from "./RoleRadioField";
import InputLabel from "./InputLabel";
import TextAreaInput from "./TextAreaInput";
import ConfirmationModal from "./ConfirmationModal";
import { useHistory } from "react-router-dom";
import WwcApi from "../../WwcApi";

function ReviewMember(props) {
  const history = useHistory();
  const location = useLocation();
  const data = location.state.memberinfo;
  const roleinfo = location.state.roleinfo;
  const [member, setMember] = useState({
    Email: data.Email,
    Role: data.Role,
    Message: data.Message,
  });

  const [memberRole, setMemberRole] = useState({
    MemberRoleId: roleinfo.MemberRoleId,
    MemberRole: roleinfo.MemberRole,
    MemberRoleDescription: roleinfo.MemberRoleDescription,
  });

  const [edit, setEdit] = useState({
    EmailInput: false,
    RoleInput: false,
    MessageInput: false,
  });
  const MemberRoleArray = [
    { id: "1", role: "Volunteer", desc: "Limited access to areas of portal" },
    {
      id: "2",
      role: "Leader",
      desc: "Access to all areas excluding Director area",
    },
    { id: "3", role: "Director", desc: "Access to all areas of portal" },
  ];
  const [showModal, setShowModal] = useState(false);
  const handleRadioClick = (id) => {
    MemberRoleArray.forEach((item) => {
      if (item.id === id) {
        setMemberRole({
          MemberRoleId: item.id,
          MemberRole: item.role,
          MemberRoleDescription: item.desc,
        });
        setShowModal(true);
      }
    });
  };

  const handleChange = (event) => {
    setMember({ ...member, [event.target.name]: event.target.value });
  };

  const onClickSendInvite = async (event) => {
    if (!edit.EmailInput && !edit.RoleInput && !edit.MessageInput) {
      //make the axios call to save the new member
      //if successful display the successModal
      event.preventDefault();
      const memberInfo = {
        email: member.Email,
        role: member.Role.toUpperCase(),
        message: member.Message,
      };
      try {
        const results = await WwcApi.createMember(memberInfo);
        console.log(results.result);
        history.push({
          pathname: "/member/add",
          state: { fromReview: true },
        });
      } catch (error) {
        alert(error + ':\n'+ JSON.stringify(error.response.data))
      }
    }
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    if (edit.EmailInput) {
      setEdit({ EmailInput: false });
    }
    if (edit.RoleInput) {
      setEdit({ RolelInput: false });
    }
    if (edit.MessageInput) {
      setEdit({ MessageInput: false });
    }
  };
  const onClickMessageEdit = (event) => {
    if (!edit.EmailInput && !edit.RoleInput) {
      setEdit({ MessageInput: true });
    }
  };

  const onClickRoleEdit = (event) => {
    if (!edit.MessageInput && !edit.EmailInput) {
      setEdit({ RoleInput: true });
    }
  };

  const onClickEmailEdit = (event) => {
    if (!edit.MessageInput && !edit.RoleInput) {
      setEdit({ EmailInput: true });
    }
  };

  return (
    <ContainerWithNav>
      <main>
        <div className='container'>
          <div className='button-inside-div'>
            <button
              className='chapter-member-btn'
              onClick={() => {
                history.push({ pathname: "/home" });
              }}
            >
              Chapter Members
            </button>
          </div>
          <div className='form-div'>
            <div className='back-member-img-btn-div'>
              <img
                src={BackButton}
                className='back-btn-img'
                style={{ width: "auto", height: "auto" }}
                alt='Back Button'
              />
              <button
                className='back-member-btn'
                onClick={() => {
                  history.push({ pathname: "/viewMembers" });
                }}
              >
                Back to Member Portal
              </button>
            </div>
            <div className='row justify-content-center form-div-spacing'>
              <div>
                <div className='header'>Review Member to Be</div>
                <div className='header'>Added</div>
                <p className='subheader'> *Mandatory Fields</p>
                <form onSubmit={handleSubmit}>
                  <div className='reviewform-border'>
                    <section className='review-email-div'>
                      <InputLabel labelName='email' text='Email *' />
                      <EmailInput
                        name='Email'
                        value={member.Email}
                        emailvalue={member.Email}
                        className={
                          edit.EmailInput
                            ? "form-control email-input show"
                            : "form-control email-input hide"
                        }
                        pclass={edit.EmailInput ? "hide" : "show"}
                        editclass={
                          edit.EmailInput
                            ? "hide"
                            : "show email-editicon-transform"
                        }
                        buttonclass={
                          edit.EmailInput
                            ? "show save-btn responsive-save-btn "
                            : "hide save-btn"
                        }
                        editiconclick={onClickEmailEdit}
                        onChange={handleChange}
                      />
                    </section>
                    <section className=' review-role-div'>
                      <InputLabel labelName='role' text='Role *' />
                      <div className='div-inline responsive-div-block'>
                        <div
                          className={
                            edit.RoleInput ? "hide" : "show responsive-role-div"
                          }
                        >
                          <div className='review-member-role'>
                            {memberRole.MemberRole}
                          </div>
                          <div className='review-role-desc'>
                            {memberRole.MemberRoleDescription}
                          </div>
                        </div>
                        <div className={edit.RoleInput ? "show" : "hide"}>
                          {MemberRoleArray.map((item) => (
                            <div
                              key={item.id}
                              className={
                                memberRole.MemberRoleId === item.id
                                  ? "form-check radio-btn-selected"
                                  : "form-check radio-input"
                              }
                            >
                              <RoleRadioInput
                                checked={memberRole.MemberRoleId === item.id}
                                id={item.id}
                                name='Role'
                                value={item.role}
                                pclass={edit.RoleInput ? "hide" : "show"}
                                datatarget='#confirmModal'
                                onClick={() => handleRadioClick(item.id)}
                                onChange={handleChange}
                                roletext={item.role}
                                roledesc={item.desc}
                              />
                            </div>
                          ))}
                        </div>
                        <div className='spacer' />

                        <button
                          type='submit'
                          className={
                            edit.RoleInput
                              ? "show save-btn responsive-save-btn"
                              : "hide"
                          }
                        >
                          Save
                        </button>
                        <div className='edit-icon'>
                          <img
                            className={
                              edit.RoleInput
                                ? "hide"
                                : "show role-editicon-transform"
                            }
                            src={EditIcon}
                            style={{ width: "auto", height: "auto" }}
                            alt='Edit'
                            onClick={onClickRoleEdit}
                          />
                        </div>
                      </div>
                    </section>
                    <section className='review-message-div'>
                      <InputLabel
                        labelName='message'
                        text='Message (optional)'
                      />
                      <TextAreaInput
                        name='Message'
                        memberclass={edit.MessageInput ? "hide" : "show "}
                        message={member.Message}
                        className={
                          edit.MessageInput
                            ? "form-control message-textarea show"
                            : "hide"
                        }
                        onChange={handleChange}
                        value={member.Message}
                        countervalue={
                          member.Message
                            ? member.Message.length + "/2000 char"
                            : null
                        }
                        editclass={
                          edit.MessageInput
                            ? "hide"
                            : "show message-editicon-transform"
                        }
                        editiconclick={onClickMessageEdit}
                        counterclass={
                          edit.MessageInput ? "show message-counter" : "hide"
                        }
                        buttonclass={
                          edit.MessageInput
                            ? "show save-btn responsive-save-btn "
                            : "hide"
                        }
                      />
                    </section>
                  </div>
                  <div className='form-group d-flex justify-content-center'>
                    <input
                      type='button'
                      className='d-flex justify-content-center sendinvite-btn'
                      onClick={onClickSendInvite}
                      value='Send Invite'
                    />
                  </div>
                </form>
                {/* Role Confirmation Modal code starts */}
                <ConfirmationModal
                  style={{ display: showModal ? "show" : "hide" }}
                  onClick={() => {
                    setShowModal(false);
                  }}
                  memberrole={memberRole.MemberRole}
                  memberdesc={memberRole.MemberRoleDescription}
                />
                {/* Role Confirmation Modal code ends */}
              </div>
            </div>
          </div>
        </div>
      </main>
    </ContainerWithNav>
  );
}
export default ReviewMember;
