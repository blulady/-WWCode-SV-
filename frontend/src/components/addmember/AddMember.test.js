import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import AddMember from './AddMember';
import * as TeamContext from "../../context/team/TeamContext";


const mockNavigation = jest.fn();
const contextTeams = { teams: [{ id: 0, name: 'Team0', pages: [{ label: "Test Page" }] }] };

let mockFromReview = false;

jest.mock('react-router-dom', () => {
    const ActualReactRouterDom = jest.requireActual('react-router-dom');
    return {
        ...ActualReactRouterDom,
        useNavigate: () => mockNavigation,
        useLocation: () => ({
            state: {
                fromReview: mockFromReview,
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
            },
            handleRemoveAuth: jest.fn()
        }),
    };
});

describe('AddMember', () => {
    beforeEach(() => {
        jest
            .spyOn(TeamContext, "useTeamContext")
            .mockImplementation(() => contextTeams);
    });

    test('it renders without crashing', () => {
        const { container } = render(<AddMember />);
        
        expect(container).toMatchSnapshot();
    });

    test('it reflects input change', () => {
        const { container, rerender } = render(<AddMember />);
        const emailInput = container.querySelector('.email-input');
        const selectedRole = container.querySelector("[id='2']");
        const textAreaInput = container.querySelector('.message-textarea');

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.click(selectedRole);
        fireEvent.change(textAreaInput, { target: { value: 'hello world!' } });
        rerender();

        expect(emailInput.value).toBe('test@example.com');
        expect(selectedRole).toHaveClass('role-radio-selected');
        expect(textAreaInput.value).toBe('hello world!');
    });

    test('it handles form submit', () => {
        const { container, getByText } = render(<AddMember />);
        const emailInput = container.querySelector('.email-input');
        const selectedRole = container.querySelector("[id='3']");
        const textAreaInput = container.querySelector('.message-textarea');

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.click(selectedRole);
        fireEvent.change(textAreaInput, { target: { value: 'hello world!' } });
        fireEvent.click(getByText('Confirm'));
        fireEvent.submit(getByText('Review'));

        expect(mockNavigation).toHaveBeenCalledTimes(1);
    });


    test('it shows success modal', () => {
        mockFromReview = true;
        const { getByText } = render(<AddMember />);

        expect(getByText('Member has been added and emailed a registration link')).toBeInTheDocument();
    });
});