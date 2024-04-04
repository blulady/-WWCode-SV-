import React from "react";
import { render } from "@testing-library/react";
import PendingMemberList from "./PendingMemberList";

const pendingMembers = [{
    email: "abc@example.com",
    role_name: "volunteer",
    status: "invited"
}];

describe("PendingMemberList Component Validation Tests", () => {

  test("PendingMemberList component is rendering", async () => {
    const { container, getByText } = render(<PendingMemberList users={pendingMembers} />);
    expect(container).toMatchSnapshot();

    expect(getByText("abc@example.com")).toBeTruthy();
    expect(getByText("volunteer")).toBeTruthy();
    expect(getByText("invited")).toBeTruthy();
  });
});
