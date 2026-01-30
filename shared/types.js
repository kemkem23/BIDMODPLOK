/**
 * Shared type definitions (JSDoc)
 *
 * @typedef {Object} Team
 * @property {string} id
 * @property {string} name
 * @property {string} className - e.g. "รุ่น 1 เวฟ110 ซักเดิม"
 * @property {string} [photo] - URL or path to team photo
 *
 * @typedef {Object} RunTime
 * @property {number|null} qualify
 * @property {number|null} run1
 * @property {number|null} run2
 * @property {number|null} run3
 *
 * @typedef {Object} LaneEntry
 * @property {string} lane - "left" | "right"
 * @property {Team} team
 * @property {RunTime} times
 *
 * @typedef {Object} CurrentRace
 * @property {string} id
 * @property {string} className
 * @property {string} round - e.g. "รอบคัดเลือก", "รอบชิง"
 * @property {LaneEntry} left
 * @property {LaneEntry} right
 * @property {"waiting"|"running"|"finished"} status
 *
 * @typedef {Object} LeaderboardEntry
 * @property {number} rank
 * @property {Team} team
 * @property {RunTime} bestTimes
 * @property {number|null} bestTime
 *
 * @typedef {Object} RaceClass
 * @property {string} className
 * @property {LeaderboardEntry[]} entries
 */

module.exports = {};
