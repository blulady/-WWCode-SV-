let current_year =  new Date().getFullYear();

export const memberSortOptions = {
  DEFAULT: { value: "default", label: "Newest Member", prop: "-date_joined" },
  OLD: { value: "old", label: "Oldest Member", prop: "date_joined" },
  FIRST: { value: "first", label: "First Name (A-Z)", prop: "first_name" },
  LAST: { value: "last", label: "Last Name (A-Z)", prop: "last_name" },
};

export const memberBaseFilters = [
  {
    group: "role",
    label: "Role",
    type: "button",
    options: [
      { label: "Director", value: "DIRECTOR", enable: true },
      { label: "Leader", value: "LEADER", enable: true },
      { label: "Volunteer", value: "VOLUNTEER", enable: true },
    ],
  },
  {
    group: "status",
    label: "Status",
    type: "button",
    options: [
      { label: "Active", value: "ACTIVE", enable: true },
      { label: "Inactive", value: "INACTIVE", enable: true }
    ],
  },
  {
    group: "created_at",
    label: "Date Added",
    type: "selection",
    options: [
      { label: "Any time", value: "" },
      { label: "3 months", value: "3months" },
      { label: "6 months", value: "6months" },
      { label: current_year, value: "current_year" },
    ],
  },
];

export const hostCompanySortOptions = {
  DEFAULT: { value: "default", label: "Company Name (A-Z)", prop: "company" },
  ASCENDING: { value: "ascending", label: "Company Name (Z-A)", prop: "-company" },
};
