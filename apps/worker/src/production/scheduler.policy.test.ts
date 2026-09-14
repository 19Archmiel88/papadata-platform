import { describe, expect, it } from "vitest";
import { dateTruncatedToHour } from "./scheduler.policy.js";

describe("dateTruncatedToHour", () => {
  it("zeroes minutes, seconds and milliseconds within the same UTC hour", () => {
    expect(dateTruncatedToHour(new Date("2026-03-05T14:37:42.123Z"))).toBe("2026-03-05T14:00:00.000Z");
  });

  it("maps every instant in the same UTC hour to the same reservation key", () => {
    const start = dateTruncatedToHour(new Date("2026-03-05T14:00:00.000Z"));
    const middle = dateTruncatedToHour(new Date("2026-03-05T14:30:00.000Z"));
    const end = dateTruncatedToHour(new Date("2026-03-05T14:59:59.999Z"));
    expect(middle).toBe(start);
    expect(end).toBe(start);
  });

  it("does not collapse adjacent hours into the same reservation key", () => {
    const thisHour = dateTruncatedToHour(new Date("2026-03-05T14:59:59.999Z"));
    const nextHour = dateTruncatedToHour(new Date("2026-03-05T15:00:00.000Z"));
    expect(nextHour).not.toBe(thisHour);
  });

  it("does not mutate the Date instance it is given", () => {
    const original = new Date("2026-03-05T14:37:42.123Z");
    const originalTime = original.getTime();
    dateTruncatedToHour(original);
    expect(original.getTime()).toBe(originalTime);
  });
});
