import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import ReviewMember from './ReviewMember';
import WwcApi from '../../WwcApi';
import * as TeamContext from "../../context/team/TeamContext";

const mockNavigation = jest.fn();

let mockMemberInfo = {
    Email: '',
    Role: '',
    Message: ''
}
let mockRoleInfo = {
    MemberRoleId: '',
    MemberRole: '',
    MemberRoleDescription: ''
};

const contextTeams = { teams: [{ id: 0, name: 'Team0', pages: [{ label: "Test Page" }] }] };

jest.mock('react-router-dom', () => {
    const ActualReactRouterDom = jest.requireActual('react-router-dom');
    return {
        ...ActualReactRouterDom,
        useNavigate: () => mockNavigation,
        useLocation: () => ({
            state: {
                memberinfo: mockMemberInfo,
                roleinfo: mockRoleInfo,
                pageId: "chapter",
                pending: false
            }
        })
    }
});

jest.mock('react', () => {
    const ActualReact = jest.requireActual('react');
    return {
        ...ActualReact,
        useContext: () => ({
            userInfo: {
                email: 'director@example.com',
                first_name: 'John',
                id: 1,
                last_name: 'Smith',
                role: 'DIRECTOR'
            }
        }),
    };
});

describe('ReviewMember', () => {
    beforeEach(() => {
        mockMemberInfo = {
            Email: 'test@example.com',
            Role: 'Director',
            Message: 'hello world!'
        };
        mockRoleInfo = {
            MemberRoleId: '3',
            MemberRole: 'Director',
            MemberRoleDescription: 'Access to all areas of portal'
        };
        jest
            .spyOn(TeamContext, "useTeamContext")
            .mockImplementation(() => contextTeams);
    });

    test('it renders without crashing', () => {
        const { container } = render(<ReviewMember />);
        
        expect(container).toMatchSnapshot();
    });

    test('it displays information correctly', () => {
        const { container, getByTestId, getAllByText } = render(<ReviewMember />);
        const email = container.querySelector('.email-input');
        const role = container.querySelector('.review-member-role');
        const roleDesc = container.querySelector('.review-role-desc');
        const message = getByTestId('message');

        expect(email.value).toBe('test@example.com');
        expect(role).toHaveTextContent('Director');
        expect(roleDesc).toHaveTextContent('Access to all areas of portal');
        expect(message.value).toBe('hello world!');
        expect(getAllByText('Save')[0]).not.toHaveClass('responsive-save-btn');
        expect(getAllByText('Save')[1]).not.toHaveClass('responsive-save-btn');
        expect(getAllByText('Save')[2]).not.toHaveClass('responsive-save-btn');
    });

    test('it allows email to be editable', () => {
        const { container, getAllByText } = render(<ReviewMember />);
        const edit = container.querySelector('.email-editicon-transform');

        fireEvent.click(edit);

        expect(getAllByText('Save')[0]).toHaveClass('responsive-save-btn');
    });

    test('it allows role to be editable', () => {
        const { container, getAllByText } = render(<ReviewMember />);
        const edit = container.querySelector('.role-editicon-transform');

        fireEvent.click(edit);

        expect(getAllByText('Save')[1]).toHaveClass('responsive-save-btn');
    });

    test('it allows message to be editable', () => {
        const { container, getAllByText } = render(<ReviewMember />);
        const edit = container.querySelector('.message-editicon-transform');

        fireEvent.click(edit);

        expect(getAllByText('Save')[2]).toHaveClass('responsive-save-btn');
    });

    test('it redirects on send invite click', async () => {
        const apiSpy = jest.spyOn(WwcApi, 'addInvitee').mockReturnValue(await Promise.resolve('success'));
        const { container } = render(<ReviewMember />);
        const sendInvite = container.querySelector('.sendinvite-btn');

        fireEvent.click(sendInvite);

        await expect(apiSpy).toHaveBeenCalledTimes(1);
        expect(mockNavigation).toHaveBeenCalledWith('/member/add',
            {state: {
                fromReview: true,
                pageId: "chapter",
                pending: false
            }
        });
        return Promise.resolve();
    });

    test('it shows error', () => {
        function CustomException(message) {
            const error = new Error(message);
          
            error.response = {
                data: message
            }

            return error;
        }
          
        CustomException.prototype = Object.create(Error.prototype);
        const exception = new CustomException('createMember failed')
        const apiSpy = jest.spyOn(WwcApi, 'addInvitee').mockImplementation(() => {
            throw exception;
        });
        const { container, getByTestId } = render(<ReviewMember />);
        const sendInvite = container.querySelector('.sendinvite-btn');

        fireEvent.click(sendInvite);

        expect(apiSpy).toHaveBeenCalled();
        expect(getByTestId('message-box')).toBeInTheDocument();
    });
});