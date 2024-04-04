import React from "react";
import { act, render, screen, fireEvent } from "@testing-library/react";
import TeamResources from "./TeamResources";
import AuthContext from "../../../context/auth/AuthContext";
import {
  ERROR_REQUEST_MESSAGE
} from "../../../Messages";
import WwcApi from "../../../WwcApi";
import * as TeamContext from "../../../context/team/TeamContext";
import Router from "react-router-dom";

const userInfo = { userInfo: { role: "DIRECTOR" }, isDirectorForTeam: () => true };
jest.mock("../../../WwcApi", () => {
  return {
    ...jest.requireActual("../../../WwcApi"),
    getTeamResources: jest.fn(),
    updateTeamResources: jest.fn(),
  };
});

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn(),
}));

describe("Team Resources Component Validation Tests", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(Router, "useParams").mockReturnValue({ teamId: "0" });

    const contextTeams = { teams: [{ id: 1, name: "Team1", slug: "test" }], getTeamInfo: () => { return {}} };
    jest
      .spyOn(TeamContext, "useTeamContext")
      .mockImplementation(() => contextTeams);
  });

  test("Tests TeamResources component behavior for GET resources", async () => {
    // Mock GET resources
    WwcApi.getTeamResources.mockImplementation(async () => {
      return await Promise.resolve({
        data: {
          edit_link: "test edit link",
          published_link: "test published link",
        },
      });
    });

    // WwcApi.updateVolunteerResources.mockImplementation(async () => {
    //   return await Promise.resolve({
    //     data: {
    //       edit_link: "test edit link",
    //       published_link: "test published link",
    //     },
    //   });
    // });

    await act(async () => {
      render(
        <AuthContext.Provider value={userInfo}>
          <TeamResources />
        </AuthContext.Provider>
      );
    });

    // form is rendered
    const editLink = screen.getByTestId("editLink");
    const publishedLink = screen.getByTestId("publishLink");
    expect(editLink.value).toBe("test edit link");
    expect(publishedLink.value).toBe("test published link");

    const saveBtn = screen.getByTestId("saveBtn");
    fireEvent.click(saveBtn);

    expect(() => screen.getByTestId("message-box")).toThrow(
      "Unable to find an element"
    );
  });

  test("Tests TeamResources component behavior for GET resources and fail on save", async () => {
    // Mock GET resources
    WwcApi.getTeamResources.mockImplementation(async () => {
      return await Promise.resolve({
        data: {
          edit_link: "test edit link",
          published_link: "test published link",
        },
      });
    });

    // Mock Update resources
    WwcApi.updateTeamResources.mockImplementation(async () => {
      return await Promise.reject(
        {
          response: {
            status: 404,
          },
        },
        404
      );
    });

    await act(async () => {
      render(
        <AuthContext.Provider value={userInfo}>
          <TeamResources />
        </AuthContext.Provider>
      );
    });

    // form is rendered
    const editLink = screen.getByTestId("editLink");
    const publishedLink = screen.getByTestId("publishLink");
    expect(editLink.value).toBe("test edit link");
    expect(publishedLink.value).toBe("test published link");

    const saveBtn = screen.getByTestId("saveBtn");

    await act(async () => {
      fireEvent.click(saveBtn);
    });

    await act(async () => {
      fireEvent.click(saveBtn);
    });
    expect(screen.getByText(ERROR_REQUEST_MESSAGE, { collapseWhitespace: false })).toBeTruthy();
    expect(editLink.value).toBe("test edit link");
    expect(publishedLink.value).toBe("test published link");
  });

  test("Tests TeamResources component behavior for fetch failure", async () => {
    // Mock GET resources
    WwcApi.getTeamResources.mockImplementation(async () => {
      return await Promise.reject(
        {
          response: {
            status: 404,
          },
        },
        404
      );
    });
    await act(async () => {
      render(
        <AuthContext.Provider value={userInfo}>
          <TeamResources />
        </AuthContext.Provider>
      );
    });
    // Registration form is rendered
    const editLink = screen.getByTestId("editLink");
    const publishedLink = screen.getByTestId("publishLink");
    const messageBox = screen.getByTestId("message-box-info");
    // expect(editLink.value).toBe("test edit link");
    // expect(publishedLink.value).toBe("test published link");
  });
});
