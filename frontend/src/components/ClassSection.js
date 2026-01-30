import React from 'react';
import './ClassSection.css';

function ClassSection({ raceClass }) {
  const { className, entries } = raceClass;

  const formatBestRun = (entry) => {
    const { bestTimes, bestTime } = entry;
    if (bestTime == null) return 'ยังไม่มีเวลา';

    // Find which run produced the best time
    const runs = [
      { label: 'Qualify', value: bestTimes.qualify },
      { label: 'Run 1', value: bestTimes.run1 },
      { label: 'Run 2', value: bestTimes.run2 },
      { label: 'Run 3', value: bestTimes.run3 },
    ];
    const bestRun = runs.find((r) => r.value === bestTime);
    const runLabel = bestRun ? bestRun.label : 'Run';

    return `${runLabel} เวลา ${bestTime.toFixed(4)}`;
  };

  return (
    <div className="class-section">
      <h3 className="class-name">{className}</h3>
      <ol className="class-entries">
        {entries.map((entry) => (
          <li key={entry.team.id} className="class-entry">
            <span className="entry-team">{entry.team.name}</span>{' '}
            <span className="entry-time">{formatBestRun(entry)}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default React.memo(ClassSection);
