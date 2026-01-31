
import React from "react";
import { render, screen } from "@testing-library/react";
import LaneCard from "../LaneCard";

const mockEntryWithPhoto = {
  team: { id: 1, name: "Speed Racers", photo: "http://example.com/photo.jpg" },
  times: { qualify: 5.1234, run1: 4.5678, run2: null, run3: 3.9999 },
};

const mockEntryNoPhoto = {
  team: { id: 2, name: "Thunder Bolts", photo: null },
  times: { qualify: null, run1: null, run2: null, run3: null },
};

describe("LaneCard", () => {
  it("renders empty state when entry is null", () => {
    render(<LaneCard label="เลนซ้าย" entry={null} />);
    expect(screen.getByText("เลนซ้าย")).toBeInTheDocument();
    expect(screen.getByText("ว่าง")).toBeInTheDocument();
  });

  it("renders empty state when entry.team is null", () => {
    render(<LaneCard label="เลนขวา" entry={{ team: null }} />);
    expect(screen.getByText("เลนขวา")).toBeInTheDocument();
    expect(screen.getByText("ว่าง")).toBeInTheDocument();
  });

  it("renders team name and times table", () => {
    render(<LaneCard label="เลนซ้าย" entry={mockEntryWithPhoto} />);
    expect(screen.getByText("Speed Racers")).toBeInTheDocument();
    expect(screen.getByText("สถิติ")).toBeInTheDocument();
    expect(screen.getByText("ควอลิฟาย")).toBeInTheDocument();
    expect(screen.getByText("Run 1")).toBeInTheDocument();
    expect(screen.getByText("Run 2")).toBeInTheDocument();
    expect(screen.getByText("Run 3")).toBeInTheDocument();
  });

  it("formats null times as xx", () => {
    render(<LaneCard label="เลนซ้าย" entry={mockEntryWithPhoto} />);
    expect(screen.getByText("xx")).toBeInTheDocument();
  });

  it("formats numbers to 4 decimal places", () => {
    render(<LaneCard label="เลนซ้าย" entry={mockEntryWithPhoto} />);
    expect(screen.getByText("5.1234")).toBeInTheDocument();
    expect(screen.getByText("4.5678")).toBeInTheDocument();
    expect(screen.getByText("3.9999")).toBeInTheDocument();
  });

  it("shows photo when available", () => {
    render(<LaneCard label="เลนซ้าย" entry={mockEntryWithPhoto} />);
    const img = screen.getByAltText("Speed Racers");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "http://example.com/photo.jpg");
  });

  it("shows placeholder when no photo", () => {
    render(<LaneCard label="เลนขวา" entry={mockEntryNoPhoto} />);
    expect(screen.getByText("ชื่อทีม + รูปทีม")).toBeInTheDocument();
  });

  it("is React.memo wrapped", () => {
    const imported = require("../LaneCard").default;
    expect(imported["$$typeof"]).toBe(Symbol.for("react.memo"));
  });
});
