import React from "react";
import { render, act } from "@testing-library/react";
import WwcApi from "../../../WwcApi";
import PendingMembers from "./PendingMembers";

jest.mock("../../../WwcApi", () => {
  return {
    ...jest.requireActual("../../../WwcApi"),
    getInvitees: jest.fn(),
  };
});

const mockNavigation = jest.fn();
jest.mock('react-router-dom', () => {
  const ActualReactRouterDom = jest.requireActual('react-router-dom');
  return {
    ...ActualReactRouterDom,
    useNavigate: () => mockNavigation
  }
});


describe("PendingMembers Component Validation Tests", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("PendingMembers component is rendering", async () => {
    // Mock GET resources
    WwcApi.getInvitees.mockImplementation(async () => {
      return await Promise.resolve(
        [{
          id: 1,
          email: "abc@example.com",
          role_name: "volunteer",
          status: "invited"
        }]
      );
    });

    let res;
    await act(async () => {
      res = render(
        <PendingMembers />
      );
    });
    expect(res.container).toMatchSnapshot();

  });

  test("PendingMembers component renders no invitess message", async () => {
    // Mock GET resources
    WwcApi.getInvitees.mockImplementation(async () => {
      return await Promise.resolve([]);
    });

    let res;
    await act(async () => {
      res = render(
        <PendingMembers />
      );
    });

    expect(res.getByText("No invitees to display")).toBeTruthy();
  });

  test('PedingMembers component: Error while getting invitees', async () => {
    WwcApi.getInvitees.mockImplementation(async () => {
      throw new Error("No invitees");
    });

    let res;
    await act(async () => {
      res = render(
        <PendingMembers />
      );
    });

    expect(res.getByTestId('message-box')).toBeInTheDocument();
  });
});
