
import React from "react";
import { render, screen } from "@testing-library/react";
import ClassSection from "../ClassSection";

const mockRaceClass = {
  className: "Pro Class",
  entries: [
    {
      team: { id: 1, name: "Dragon Racing" },
      bestTimes: { qualify: 5.1111, run1: 4.2222, run2: 4.8888, run3: null },
      bestTime: 4.2222,
    },
    {
      team: { id: 2, name: "Phoenix Speed" },
      bestTimes: { qualify: null, run1: null, run2: null, run3: null },
      bestTime: null,
    },
    {
      team: { id: 3, name: "Turbo Squad" },
      bestTimes: { qualify: 6.0000, run1: 5.5000, run2: 5.3333, run3: 5.1000 },
      bestTime: 5.1000,
    },
  ],
};

describe("ClassSection", () => {
  it("renders class name heading", () => {
    render(<ClassSection raceClass={mockRaceClass} />);
    expect(screen.getByText("Pro Class")).toBeInTheDocument();
    expect(screen.getByText("Pro Class").tagName).toBe("H3");
  });

  it("renders entry list with team names", () => {
    render(<ClassSection raceClass={mockRaceClass} />);
    expect(screen.getByText("Dragon Racing")).toBeInTheDocument();
    expect(screen.getByText("Phoenix Speed")).toBeInTheDocument();
    expect(screen.getByText("Turbo Squad")).toBeInTheDocument();
  });

  it("shows no time text for null bestTime", () => {
    render(<ClassSection raceClass={mockRaceClass} />);
    expect(screen.getByText("ยังไม่มีเวลา")).toBeInTheDocument();
  });

  it("identifies correct best run label", () => {
    render(<ClassSection raceClass={mockRaceClass} />);
    expect(screen.getByText("Run 1 เวลา 4.2222")).toBeInTheDocument();
    expect(screen.getByText("Run 3 เวลา 5.1000")).toBeInTheDocument();
  });

  it("is React.memo wrapped", () => {
    const imported = require("../ClassSection").default;
    expect(imported["$$typeof"]).toBe(Symbol.for("react.memo"));
  });
});
