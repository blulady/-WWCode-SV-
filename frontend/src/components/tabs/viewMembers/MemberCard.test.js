import React from "react";
import { render } from "@testing-library/react";
import MemberCard from './MemberCard';

const mockedUsedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
   ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
  useLocation: () => ({
        pathname: "/member"
  })
}));

it('Should render Member Card', () => {
    const memeberInfo = {
        "id": 1,
        "first_name": "TestFirst",
        "last_name": "TestLast",
        "userprofile": {
            "status": "Active",
            "role": "VOLUNTEER"
        },
        "date_joined": "2020-09-14T20:13:30.451000Z",
        "email": "emailaddress@womenwhocode.com",
        "status": "active",
        "role_teams": [
            {
            "team_id": 1,
            "team_name": "Event Volunteers",
            "role_name": "VOLUNTEER"
            }
        ]
    };
const { queryAllByText } = render(<MemberCard userInfo={memeberInfo}></MemberCard>);
  expect(queryAllByText(memeberInfo.first_name + " " + memeberInfo.last_name)).toBeTruthy();
  expect(queryAllByText(memeberInfo.userprofile.status)).toBeTruthy();
});