import {
  analyzeCycles,
  parseISODate,
  formatISODate,
  addDays,
  daysBetween,
  CycleRecord,
} from '../utils/cycleMath';

export function runCycleMathTests(): { passed: boolean; failures: string[] } {
  const failures: string[] = [];

  const assert = (condition: boolean, testName: string) => {
    if (!condition) {
      failures.push(`Failed: ${testName}`);
    }
  };

  // Test 1: Date helper tests
  const d1 = parseISODate('2026-03-01');
  const d2 = addDays(d1, 28);
  assert(formatISODate(d2) === '2026-03-29', 'addDays and formatISODate should match 28 days');
  assert(daysBetween(d2, d1) === 28, 'daysBetween should return 28');

  // Test 2: Single cycle analysis with defaults
  const singleCycle: CycleRecord[] = [
    { start: '2026-03-01', end: '2026-03-05', flow: 1, cramps: 0 },
  ];
  const refDate1 = parseISODate('2026-03-10'); // Day 10 of cycle
  const res1 = analyzeCycles(singleCycle, refDate1);
  assert(res1 !== null, 'res1 should not be null');
  if (res1) {
    assert(res1.averageCycleLength === 28, 'Default cycle length should be 28');
    assert(res1.averagePeriodLength === 5, 'Period length should be 5');
    assert(res1.currentDayOfCycle === 10, 'Current day should be 10');
    assert(res1.currentPhase === 1, 'Day 10 should be Follicular phase (Phase 1)');
    assert(res1.ovulationDay === 14, 'Ovulation day should be 14 (28 - 14)');
    assert(res1.spreadRange === 2, 'Default spreadRange when spread is 0 is max(2, 2) = 2');
    assert(formatISODate(res1.predictedNextStartDate) === '2026-03-29', 'Predicted next start date should be 2026-03-29');
    assert(formatISODate(res1.predictedRangeStart) === '2026-03-27', 'Predicted range start should be 2026-03-27');
    assert(formatISODate(res1.predictedRangeEnd) === '2026-03-31', 'Predicted range end should be 2026-03-31');
  }

  // Test 3: Multiple cycles with varying gap
  const multiCycles: CycleRecord[] = [
    { start: '2026-01-01', end: '2026-01-05', flow: 1, cramps: 0 },
    { start: '2026-01-30', end: '2026-02-03', flow: 1, cramps: 0 }, // Gap = 29 days
    { start: '2026-03-02', end: '2026-03-06', flow: 2, cramps: 2 }, // Gap = 31 days
  ];
  // Gaps: 29, 31 -> average = 30 days. Spread = 31 - 29 = 2 days.
  // spreadRange = max(2, ceil(2/2) + 2) = max(2, 1 + 2) = 3 days.
  const refDate2 = parseISODate('2026-03-04'); // Day 3
  const res2 = analyzeCycles(multiCycles, refDate2);
  assert(res2 !== null, 'res2 should not be null');
  if (res2) {
    assert(res2.averageCycleLength === 30, 'Average cycle length should be 30');
    assert(res2.spread === 2, 'Spread should be 2');
    assert(res2.spreadRange === 3, 'spreadRange should be 3');
    assert(res2.currentPhase === 0, 'Day 3 should be Period phase (Phase 0)');
    assert(res2.nudges.includes('regular'), 'Spread <= 3 should nudge regular');
    assert(res2.nudges.includes('cramps'), 'Cramps >= 1 should nudge cramps');
    assert(res2.nudges.includes('redFlag'), 'Cramps level 2 should trigger gentle redFlag nudge');
  }

  // Test 4: Phase 2 (Ovulation window) test
  // For cycle length 28, ovulation = 14. 3-day window is day 13, 14, 15.
  const ovCycle: CycleRecord[] = [{ start: '2026-03-01' }];
  const refOvDay14 = parseISODate('2026-03-14'); // Day 14
  const resOv = analyzeCycles(ovCycle, refOvDay14);
  assert(resOv?.currentPhase === 2, 'Day 14 should be Peak energy / Ovulation phase (Phase 2)');

  // Test 5: Phase 3 (Luteal) test
  const refLutealDay20 = parseISODate('2026-03-20'); // Day 20
  const resLuteal = analyzeCycles(ovCycle, refLutealDay20);
  assert(resLuteal?.currentPhase === 3, 'Day 20 should be Slow down / Luteal phase (Phase 3)');

  // Test 6: Prolonged cycle nudge (> 45 days)
  const refLongDay50 = parseISODate('2026-04-20'); // Day 51
  const resLong = analyzeCycles(ovCycle, refLongDay50);
  assert(resLong?.nudges.includes('longCycle') === true, 'Day 50+ should trigger longCycle nudge');

  const passed = failures.length === 0;
  return { passed, failures };
}

// Self-executing if run directly
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('cycleMath.test')) {
  const result = runCycleMathTests();
  if (result.passed) {
    console.log('✓ All Cycle Math unit tests passed successfully!');
  } else {
    console.error('✗ Cycle Math unit tests failed:', result.failures);
    process.exit(1);
  }
}
