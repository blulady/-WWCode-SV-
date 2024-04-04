import React from "react";
import { render } from "@testing-library/react";
import PendingMemberTable from "./PendingMemberTable";

const pendingMembers = [{
    id: 1,
    email: "abc@example.com",
    role_name: "volunteer",
    status: "invited"
}];

describe("PendingMemberTable Component Validation Tests", () => {
  test("PendingMemberTable component is rendering", async () => {
      const target = 'group'
      const { container, getByText } = render(<PendingMemberTable users={pendingMembers} target={target}/>);
      expect(container).toMatchSnapshot();

      expect(getByText("abc@example.com")).toBeTruthy();
      expect(getByText("volunteer")).toBeTruthy();
      expect(getByText("invited")).toBeTruthy();
  });
});
