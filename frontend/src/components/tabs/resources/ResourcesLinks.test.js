import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import ResourcesLinks from './ResourcesLinks';

describe('ResourcesLinks', () => {
    let recourses;

    beforeEach(() => {
        recourses = {
            edit_link: "http://test.edit.com",
            published_link: "http://test.publish.com"
        }
    });

    test('it renders without crashing', () => {
        const { container, getByTestId } = render(<ResourcesLinks editUrl={recourses.edit_link} publishUrl={recourses.published_link} />);
        expect(container).toMatchSnapshot();
        const editLinkInput = getByTestId('editLink');
        expect(editLinkInput.value).toBe('http://test.edit.com');
        expect(editLinkInput).toHaveProperty('readOnly');

        const publishLinkInput = getByTestId('publishLink');
        expect(publishLinkInput.value).toBe('http://test.publish.com');
        expect(publishLinkInput).toHaveProperty('readOnly');
    });

    test('it changes input fields to be edit state', () => {
        const { container, getByTestId } = render(<ResourcesLinks editUrl={recourses.edit_link} publishUrl={recourses.published_link} />);
        const saveBtn = getByTestId('saveBtn');
        fireEvent.click(saveBtn);

        const editLinkInput = getByTestId('editLink');
        expect(editLinkInput).toHaveProperty('readOnly', false);
        expect(editLinkInput).not.toHaveClass('form-control-plaintext');

        const publishLinkInput = getByTestId('publishLink');
        expect(publishLinkInput).toHaveProperty('readOnly', false);
        expect(publishLinkInput).not.toHaveClass('form-control-plaintext');
    });

    test('it keeps modified values even after input fields become non-editable', () => {
        const { container, getByTestId } = render(<ResourcesLinks editUrl={recourses.edit_link} publishUrl={recourses.published_link} />);
        const saveBtn = getByTestId('saveBtn');
        fireEvent.click(saveBtn);

        const editLinkInput = getByTestId('editLink');
        fireEvent.change(editLinkInput, { target: { value: 'http://test.edit.modifled.com' } });

        const publishLinkInput = getByTestId('publishLink');
        fireEvent.change(publishLinkInput, { target: { value: 'http://test.publish.modifled.com' } });

        fireEvent.click(saveBtn);

        expect(editLinkInput.value).toBe('http://test.edit.modifled.com');
        expect(editLinkInput).toHaveProperty('readOnly');
        expect(editLinkInput).toHaveClass('form-control-plaintext');

        expect(publishLinkInput.value).toBe('http://test.publish.modifled.com');
        expect(publishLinkInput).toHaveProperty('readOnly');
        expect(publishLinkInput).toHaveClass('form-control-plaintext');
    });
});