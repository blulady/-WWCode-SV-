import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Reroute from "./components/reroute/Reroute";
import Register from "./components/register/Register";
import Login from "./components/login/Login";
import ResetPasswordForm from "./components/resetpwform/ResetPasswordForm";
import Home from "./components/home/Home";
import NotFound from "./components/NotFound";
import AuthProvider from "./context/auth/AuthProvider";
import ReviewMember from "./components/addmember/ReviewMember";
import AddMember from "./components/addmember/AddMember";
import MemberDetails from "./components/memberdetails/MemberDetails";
import UserProfile from './components/userprofile/UserProfile'
import PrivateRoute from "./PrivateRoute";
import TeamResources from "./components/tabs/resources/TeamResources";
import ViewMembers from "./components/tabs/viewMembers/ViewMembers";
import PendingMembers from "./components/tabs/pendingMembers/PendingMembers";
import ResetScroll from "./ResetScroll";
import CompanyHosts from "./components/tabs/companyHosts/CompanyHosts";
import CompanyHostForm from "./components/tabs/companyHosts/CompanyHostForm";
import {NAVITEMS} from "./navitems";
import TabNav from "./components/tabs/TabNav";
import TeamProvider from "./context/team/TeamProvider";
import TechEventMentorList from "./components/tabs/techEvent/TechEventMentorList";
import TechEventMentorForm from "./components/tabs/techEvent/TechEventMentorForm";
import {DirectorBusiness} from "./components/tabs/directors/DirectorBusiness";
import {EventCalendar} from "./components/tabs/directors/EventCalendar";
import { MeetingNotes } from "./components/tabs/directors/MeetingNotes";

function App() {
  return (
    <AuthProvider>
      <Router>
        <ResetScroll />
        <Routes>
          <Route exact path='/' element={<Reroute />} />
          <Route exact path='/login' element={<Login />} />
          <Route exact path='/password/reset' element={<ResetPasswordForm />} />
          <Route exact path='/home' element={<PrivateRoute element={<Home />}/>} />
          <Route path='/register' element={<Register />} />
          {
            NAVITEMS.map((item) => {
              return (<Route path={item.pageId} element={<PrivateRoute element={<TeamProvider><TabNav navInfo={item} /></TeamProvider>} />}>
                {item.tabs.map((tab) => {
                  switch(tab.tabId) {
                    case "members":
                      return <Route path="members" element={<ViewMembers teamId={item.teamId} />} />;
                    case "pending":
                      return <Route path="pending" element={<PendingMembers teamId={item.teamId} />} />;
                    case "resources":
                      return <Route path='resources' element={<TeamResources teamId={item.teamId} />} />;
                    case "company-hosts":
                      return (
                      <>
                        <Route path="company-hosts" element={<CompanyHosts />} />;
                        <Route path="company-hosts/form" element={<CompanyHostForm />} />;
                      </>);
                    case "mentors":
                      return (
                      <>
                        <Route path="mentors" element={<TechEventMentorList />} />;
                        <Route path="mentors/form" element={<TechEventMentorForm />} />;
                      </>);
                    case "notes":
                      return <Route path="notes" element={<MeetingNotes/>} />;
                    case "business":
                      return <Route path="business" element={<DirectorBusiness/>} />;
                    case "event-calendar":
                      return <Route path="event-calendar" element={<EventCalendar/>} />;
                  }
                  
                })}
              </Route>);
            })
          }
          <Route exact path='/member/view' element={<PrivateRoute element={<TeamProvider><MemberDetails /></TeamProvider>}/>} />
          <Route exact path='/member/add' element={<PrivateRoute element={<AddMember />}/>} />
          <Route exact path='/member/review' element={<PrivateRoute element={<ReviewMember />}/>} />
          <Route exact path='/member/profile' element={<PrivateRoute element={<UserProfile />}/>} />
          <Route element={NotFound} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
