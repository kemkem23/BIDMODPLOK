
import React from "react";
import { render, screen } from "@testing-library/react";
import TrackView from "../TrackView";
import useTrackData from "../../hooks/useTrackData";

jest.mock("../../hooks/useTrackData");

jest.mock("../LaneCard", () => {
  const MockLaneCard = ({ label, entry }) => (
    <div data-testid="lane-card">
      <span>{label}</span>
      {entry && entry.team && <span>{entry.team.name}</span>}
    </div>
  );
  return MockLaneCard;
});

const mockRace = {
  left: {
    team: { id: 1, name: "Team Alpha" },
    times: { qualify: 5.1234, run1: 5.2345, run2: null, run3: null },
  },
  right: {
    team: { id: 2, name: "Team Beta" },
    times: { qualify: 4.9876, run1: null, run2: null, run3: null },
  },
};

describe("TrackView", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("renders loading state with Thai text", () => {
    useTrackData.mockReturnValue({ race: null, loading: true, error: null });
    render(<TrackView />);
    expect(screen.getByText("กำลังโหลด...")).toBeInTheDocument();
  });

  it("renders error state", () => {
    useTrackData.mockReturnValue({ race: null, loading: false, error: "Network error" });
    render(<TrackView />);
    expect(screen.getByText("เกิดข้อผิดพลาด")).toBeInTheDocument();
  });

  it("renders no race when race is null", () => {
    useTrackData.mockReturnValue({ race: null, loading: false, error: null });
    render(<TrackView />);
    expect(screen.getByText("ยังไม่มีการแข่งขัน")).toBeInTheDocument();
  });

  it("renders two lane cards with race data", () => {
    useTrackData.mockReturnValue({ race: mockRace, loading: false, error: null });
    render(<TrackView />);
    expect(screen.getByText("TRACK")).toBeInTheDocument();
    const laneCards = screen.getAllByTestId("lane-card");
    expect(laneCards).toHaveLength(2);
    expect(screen.getByText("เลนซ้าย")).toBeInTheDocument();
    expect(screen.getByText("เลนขวา")).toBeInTheDocument();
    expect(screen.getByText("Team Alpha")).toBeInTheDocument();
    expect(screen.getByText("Team Beta")).toBeInTheDocument();
  });

  it("is wrapped in React.memo", () => {
    const imported = require("../TrackView").default;
    expect(imported["$$typeof"]).toBe(Symbol.for("react.memo"));
  });
});
