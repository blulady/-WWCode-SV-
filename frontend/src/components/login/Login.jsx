import React, { useState, useContext, useEffect } from "react";
import styles from "./Login.module.css";
import cx from "classnames";
import WwcBackground from "./WwcBackground";
import AuthContext from "../../context/auth/AuthContext";
import TeamContext from "../../context/team/TeamContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import ResetPasswordModal from "./ResetPasswordModal";
import WwcApi from "../../WwcApi";
import MessageBox from "../messagebox/MessageBox";
import { ERROR_REQUEST_MESSAGE, SUCCESS_REQUEST_PASSWORD_RESET, SUCCESS_REGISTRATION } from "../../Messages";


/*
 * sets session on submit and redirects to "/" on success
 */
const Login = () => {
  const navigate = useNavigate();
  const { handleSetAuth } = useContext(AuthContext);
  const pwdInput = React.createRef();
  const [loginData, setLoginData] = useState({
    // using username as key for email
    // to match backend
    username: "",
    password: "",
  });
  let initMsg = { type: null };
  const [searchParams] = useSearchParams();
  const isRegisterationSuccess = searchParams.get("register") === "true";
  if (isRegisterationSuccess) {
    initMsg = { type: "Success", title: "Registration Successful", message: SUCCESS_REGISTRATION };
  }
  
  let passwordReset = JSON.parse(sessionStorage.getItem('password-reset'));

  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showRequestStatus, setShowRequestStatus] = useState(initMsg);

  const clearPasswordResetInfo = () => {
    sessionStorage.removeItem('password-reset');
    passwordReset = null;
  }

  useEffect(() => {
    /*
     * Reroute if token present
     */
    if (sessionStorage.getItem("token")) {
      navigate("/");
    }
  }, []);

  // updates login state
  const handleChange = (event) => {
    let nam = event.target.name;
    let val = event.target.value;
    setLoginData({ ...loginData, [nam]: val });
  };

  /*
   * on submit sets success state to true
   * stores token in session
   * and redirects to "/"
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.target;
    try {
      const results = await WwcApi.login(loginData);
      const {
        access,
        refresh,
        access_expiry_in_sec,
        role
      } = results.data;
      const token = { access, refresh, access_expiry_in_sec };
      // stores access token returned in session storage
      // as {token: {access:...,refresh:...}}
      handleSetAuth(token, role);
      navigate("/");
    } catch (err) {
      form.classList.add(styles["was-validated"]);
    }
    clearPasswordResetInfo();
  };

  // Handle show/hide toggle on password field
  const handleShow = (e) => {
    let pwdEl = pwdInput.current;
    pwdEl.type === "password"
      ? pwdEl.setAttribute("type", "text")
      : pwdEl.setAttribute("type", "password");
    e.target.innerText === "SHOW"
      ? (e.target.innerText = "HIDE")
      : (e.target.innerText = "SHOW");
  };

  const handleOpenResetPasswordModal = () => {
    setShowResetPasswordModal(true);
  };

  const handleCloseResetPasswordModal = () => {
    setShowResetPasswordModal(false);
  };

  const handleSendResetPasswordEmail = async ({ email }) => {
    // make axios call to send request
    try {
      await WwcApi.sendResetEmail(email);
      // Show success message
      setShowRequestStatus({type: "Success", title: "Request sent", message: SUCCESS_REQUEST_PASSWORD_RESET});
    } catch (error) { // error with resetting email
      // Show error message
      setShowRequestStatus({type: "Error", title: "Sorry!", message: ERROR_REQUEST_MESSAGE}); // generic error
    } finally {
      setShowResetPasswordModal(false);
      clearPasswordResetInfo();
    }    
  };

  return (
    <div>
      <WwcBackground>
        <div className={cx('container', styles['container'])}>
          <div className={styles['WwcLogo']}></div>
          <main className={styles['login-main']}>
            <div className={cx(styles['Login'], 'col col-md-6 col-lg-4')}>
              <div className={cx('header', styles['header'])}>
                <div className={styles['h1Login']}>Chapter Tools Login</div>
              </div>

              <div className={cx(styles['message-container'])}>
                {showRequestStatus.type === null && passwordReset !== null && (
                  <MessageBox type={passwordReset.type} title={passwordReset.title} message={passwordReset.message}></MessageBox>
                )}
                {showRequestStatus.type !== null && (
                <MessageBox type={showRequestStatus.type} title={showRequestStatus.title} message={showRequestStatus.message}></MessageBox>
                )}
              </div>
              
              <form
                className={styles['LoginForm']}
                onSubmit={handleSubmit}
                data-testid = 'login-form'
              >
                <div className={cx('invalid-feedback', styles['invalid-feedback'])}>
                  Invalid username and password
                </div>
                <div className='form-group col'>
                  <label className='Label' htmlFor='email'>
                    Email *
                  </label>
                  <input
                    data-testid= 'login-email'
                    type='email'
                    name='username'
                    id='email'
                    className={cx('form-control', styles['form-control'])}
                    required
                    onChange={handleChange}
                  />
                </div>
                <div className='form-group col password'>
                  <label className='Label' htmlFor='password'>
                    Password *
                  </label>
                  <div className='input-group'>
                    <input
                      data-testid= 'login-password'
                      type='password'
                      name='password'
                      id='password'
                      ref={pwdInput}
                      className={cx('form-control', styles['form-control'], styles['login-pwd'])}
                      required
                      onChange={handleChange}
                    />
                    <div className={cx('input-group-append', styles['input-group-append'])}>
                      <span className={cx('input-group-text', styles['input-group-text'], styles['show-hide'])} onClick={handleShow}>
                        {" "}
                        SHOW{" "}
                      </span>
                    </div>
                  </div>
                  <span
                    className={styles['hypertext']}
                    type='text'
                    onClick={handleOpenResetPasswordModal}
                  >
                    Forgot your password?
                  </span>
                </div>
                <button
                  data-testid= 'login-submit-btn'
                  className={cx('btn', styles['btn'])}
                  type='submit'
                  disabled={!loginData.password || !loginData.username}
                >
                  Submit
                </button>
              </form>
            </div>
          </main>
        </div>
      </WwcBackground>
      {showResetPasswordModal ? (
        <ResetPasswordModal
          send={handleSendResetPasswordEmail}
          close={handleCloseResetPasswordModal}
        />
      ) : null}
    </div>
  );
};

export default Login;
