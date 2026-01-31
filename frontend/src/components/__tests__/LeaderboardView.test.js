
import React from "react";
import { render, screen } from "@testing-library/react";
import LeaderboardView from "../LeaderboardView";
import useLeaderboard from "../../hooks/useLeaderboard";

jest.mock("../../hooks/useLeaderboard");

jest.mock("../ClassSection", () => {
  const MockClassSection = ({ raceClass }) => (
    <div data-testid="class-section">{raceClass.className}</div>
  );
  return MockClassSection;
});

jest.mock("../AllTeamsTable", () => {
  const MockAllTeamsTable = ({ allResults }) => (
    <div data-testid="all-teams-table">AllTeams: {allResults.length}</div>
  );
  return MockAllTeamsTable;
});

const mockClasses = [
  {
    className: "Class A",
    entries: [
      { team: { id: 1, name: "Team One" }, bestTimes: { qualify: 5.0, run1: 4.5, run2: null, run3: null }, bestTime: 4.5 },
    ],
  },
  {
    className: "Class B",
    entries: [
      { team: { id: 2, name: "Team Two" }, bestTimes: { qualify: 6.0, run1: null, run2: 5.5, run3: null }, bestTime: 5.5 },
    ],
  },
];

const mockAllResults = [
  { team: { id: 1, name: "Team One" }, number: 10, classNumber: 1, times: { qualify: 5.0, run1: 4.5, run2: null, run3: null } },
  { team: { id: 2, name: "Team Two" }, number: 20, classNumber: 2, times: { qualify: 6.0, run1: null, run2: 5.5, run3: null } },
];

describe("LeaderboardView", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("renders loading state", () => {
    useLeaderboard.mockReturnValue({ classes: [], allResults: [], loading: true, error: null });
    render(<LeaderboardView isAdmin={false} role="viewer" />);
    expect(screen.getByText("กำลังโหลด...")).toBeInTheDocument();
  });

  it("renders error state", () => {
    useLeaderboard.mockReturnValue({ classes: [], allResults: [], loading: false, error: "Failed" });
    render(<LeaderboardView isAdmin={false} role="viewer" />);
    expect(screen.getByText("เกิดข้อผิดพลาด")).toBeInTheDocument();
  });

  it("renders ClassSection for each class", () => {
    useLeaderboard.mockReturnValue({ classes: mockClasses, allResults: mockAllResults, loading: false, error: null });
    render(<LeaderboardView isAdmin={false} role="viewer" />);
    expect(screen.getByText("LEADER BOARD")).toBeInTheDocument();
    const sections = screen.getAllByTestId("class-section");
    expect(sections).toHaveLength(2);
    expect(screen.getByText("Class A")).toBeInTheDocument();
    expect(screen.getByText("Class B")).toBeInTheDocument();
  });

  it("renders AllTeamsTable", () => {
    useLeaderboard.mockReturnValue({ classes: mockClasses, allResults: mockAllResults, loading: false, error: null });
    render(<LeaderboardView isAdmin={false} role="viewer" />);
    expect(screen.getByTestId("all-teams-table")).toBeInTheDocument();
    expect(screen.getByText("AllTeams: 2")).toBeInTheDocument();
  });

  it("is React.memo wrapped", () => {
    const imported = require("../LeaderboardView").default;
    expect(imported["$$typeof"]).toBe(Symbol.for("react.memo"));
  });
});
