export const NAVITEMS = [
    {
        name: "Chapter Members",
        pageId: "chapter",
        teamId: 0,
        tabs: [
            {
                tabId: "members",
                label: "Chapter Members"
            },
            {
                tabId: "resources",
                label: "Volunteer Resources"
            },
            {
                tabId: "pending",
                label: "Pending Members",
                isDirectorOnly: true
            }
        ]
    },
    {
        name: "Social Media Team",
        pageId: "social-media",
        teamId: 5,
        tabs: [
            {
                tabId: "members",
                label: "Social Media Team"
            },
            {
                tabId: "resources",
                label: "Sodial Media Team Resources"
            },
            {
                tabId: "platforms",
                label: "Social Media Platforms",
                type: "externalLink",
                data: {
                    link: "https://linktr.ee/wwcodesv"
                }
            }
        ]
    },
    {
        name: "Tech Bloggers",
        pageId: "tech-bloggers",
        teamId: 8,
        tabs: [
            {
                tabId: "members",
                label: "Tech Bloggers"
            },
            {
                tabId: "resources",
                label: "Tech Bloggers Resources"
            }
        ]
    },
    {
        name: "Tech Event Team",
        pageId: "tech-event",
        teamId: 6,
        tabs: [
            {
                tabId: "members",
                label: "Tech Event Team"
            },
            {
                tabId: "resources",
                label: "Tech Event Team Resources"
            },
            {
                tabId: "mentors",
                label: "Tech Event Mentors",
                isMemberOnly: true
            },
        ]
    },
    {
        name: "Host Management",
        pageId: "host-management",
        teamId: 3,
        tabs: [
            {
                tabId: "members",
                label: "Host Management"
            },
            {
                tabId: "resources",
                label: "Host Management Resources",
            },
            {
                tabId: "company-hosts",
                label: "Company Hosts",
                isMemberOnly: true
            }
        ]
    },
    {
        name: "Directors",
        pageId: "directors",
        tabs: [
            {
                "tabId": "members",
                "label": "Directors",
                "isDirectorOnly": true
            },
            {
                "tabId": "notes",
                "label": "Director Meeting Notes",
                "isDirectorOnly": true
            },
            {
               "tabId": "business",
                "label": "Director Business",
                "isDirectorOnly": true
            },
            {
                "tabId": "event-calendar",
                "label": "Event Calendar",
                "isDirectorOnly": true
            }
        ]
    }
];

export const getNavItem = (pageId) => {
    return NAVITEMS.find((p) => p.pageId === pageId);
};
