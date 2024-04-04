import React, { useState } from "react";
import "./AddMember.css";
import { useNavigate, useLocation } from "react-router-dom";
import ContainerWithNav from "../layout/ContainerWithNav";
import EmailInput from "./EmailInput";
import RoleRadioInput from "./RoleRadioField";
import InputLabel from "./InputLabel";
import TextAreaInput from "./TextAreaInput";
import ConfirmationModal from "./ConfirmationModal";
import SuccessModal from "./SuccessModal";
import BackToMemberPortal from "../layout/BackToMemberPortal";

function AddMember() {
  const navigate = useNavigate();
  const location = useLocation();
  const pageId = (location.state ? location.state.pageId : "chapter");
  const pending = (location.state ? location.state.pending : false);
  let successFlag = false;
  if (location.state) {
    successFlag = location.state.fromReview;
  }

  const [memberRole, setMemberRole] = useState({
    MemberRoleId: "",
    MemberRole: "",
    MemberRoleDescription: "",
  });

  const [newMember, setNewMember] = useState({
    Email: "",
    Role: "",
    Message: "",
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
  const [check, setCheck] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(
    successFlag ? true : false
  );
  const handleRadioClick = (id) => {
    MemberRoleArray.forEach((item) => {
      if (item.id === id) {
        setMemberRole({
          MemberRoleId: item.id,
          MemberRole: item.role,
          MemberRoleDescription: item.desc,
        });
        setCheck(id);
        setShowModal(true);
      }
    });
  };

  const handleChange = (event) => {
    setNewMember({ ...newMember, [event.target.name]: event.target.value });
  };

  const handleSubmit = (event) => {
    navigate( "/member/review", {
      state: { memberinfo: newMember, roleinfo: memberRole, pageId, pending },
    });
  };

  return (
    <ContainerWithNav>
      <main>
        <div className='container'>
          <div className='button-inside-div'>
            <button
              className='chapter-member-btn'
              onClick={() => {
                navigate("/chapter/members");
              }}
            >
              {" "}
              Chapter Members{" "}
            </button>
          </div>
          <div className='form-div'>
            <BackToMemberPortal pageId={pageId} pending={pending}/>
            <div className='row justify-content-center form-div-spacing'>
              <div className='form-inner'>
                <div className='header'>Add New Member</div>
                <div className='header'>to Portal</div>
                <p className='subheader'> *Mandatory Fields</p>
                <form onSubmit={handleSubmit}>
                  <div className='form-group'>
                    <InputLabel labelName='email' text='Email *' />
                    <EmailInput
                      name='Email'
                      className='form-control email-input'
                      pclass='hide'
                      editclass='hide'
                      buttonclass='hide'
                      onChange={handleChange}
                      placeholder='eg. sam@wwcode.com'
                    />
                  </div>
                  <div className='form-group'>
                    <InputLabel labelName='role' text='Role *' />
                    {MemberRoleArray.map((item) => (
                      <div
                        key={item.id}
                        className={
                          check === item.id
                            ? "form-check radio-btn-selected"
                            : "form-check radio-input"
                        }
                      >
                        <RoleRadioInput
                          className={
                            check === item.id
                              ? "form-check-input position-static role-radio-selected"
                              : "form-check-input position-static role-radio"
                          }
                          id={item.id}
                          name='Role'
                          value={item.id}
                          pclass='hide'
                          datatarget='#confirmModal'
                          onClick={() => handleRadioClick(item.id)}
                          onChange={handleChange}
                          roletext={item.role}
                          roledesc={item.desc}
                        />
                      </div>
                    ))}
                  </div>
                  <div className='form-group'>
                    <InputLabel labelName='message' text='Message (optional)' />
                    <TextAreaInput
                      name='Message'
                      pclass='hide'
                      editclass='hide'
                      buttonclass='hide'
                      className='form-control message-textarea'
                      onChange={handleChange}
                      counterclass='message-counter'
                      value={newMember.Message}
                      countervalue={
                        newMember.Message
                          ? newMember.Message.length + "/2000 char"
                          : null
                      }
                    />
                  </div>
                  <div className='form-group d-flex justify-content-center'>
                    <button
                      type='submit'
                      disabled={!newMember.Email || !newMember.Role}
                      className='d-flex justify-content-center review-btn'
                    >
                      Review
                    </button>
                  </div>
                </form>
                {/* Role Confirmation Modal code starts */}
                <ConfirmationModal
                  memberrole={memberRole.MemberRole}
                  memberdesc={memberRole.MemberRoleDescription}
                />
                {/* Role Confirmation Modal code ends */}
                {/* Success Modal code starts */}
                {showSuccessModal ? (
                  <SuccessModal
                    onClick={() => {
                      setShowSuccessModal(false);
                      navigate("", { replace: true, state: { pageId, pending } })
                    }}
                  />
                ) : null}
                {/* Success Modal code ends */}
              </div>
            </div>
          </div>
        </div>
      </main>
    </ContainerWithNav>
  );
}
export default AddMember;
