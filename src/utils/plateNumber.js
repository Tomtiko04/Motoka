// Nigerian plate numbers.
//
// The current FRSC series is three letters, three digits, two letters —
// ABC-123-DE — and that covers most private vehicles. It is deliberately NOT
// enforced, because plenty of legitimate plates do not match it: older series,
// commercial, government and diplomatic plates all differ, and Motoka itself
// sells personalised plates. Rejecting those would turn a typo guard into lost
// customers.
//
// So: normalise hard, validate loosely. `isPlausiblePlate` only rejects input
// that cannot be any plate at all — which is what actually reaches us
// ("ddfghhbbhnj" was typed straight into the homepage and went through).

const MIN_LENGTH = 6;
const MAX_LENGTH = 10;

// Uppercase, and drop anything that is not a letter or digit. This is what gets
// stored and sent — hyphens are presentation only.
export function normalizePlate(value = "") {
  return String(value).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, MAX_LENGTH);
}

// ABC123DE -> ABC-123-DE. Anything that is not the standard series is left
// alone rather than being forced into a shape it does not have.
export function formatPlateForDisplay(value = "") {
  const plate = normalizePlate(value);
  const standard = plate.match(/^([A-Z]{3})(\d{3})([A-Z]{2})$/);
  return standard ? `${standard[1]}-${standard[2]}-${standard[3]}` : plate;
}

// Loose check: right length, at least two letters, at least one digit. One
// digit rather than two is deliberate — a personalised plate like MOTOKA1 is
// a real thing we sell, and requiring two would reject it while doing nothing
// extra against the input this exists to catch.
export function isPlausiblePlate(value = "") {
  const plate = normalizePlate(value);
  if (plate.length < MIN_LENGTH || plate.length > MAX_LENGTH) return false;
  const letters = (plate.match(/[A-Z]/g) || []).length;
  const digits = (plate.match(/\d/g) || []).length;
  return letters >= 2 && digits >= 1;
}

export const PLATE_ERROR =
  "That does not look like a plate number. Enter it as it appears on the plate, e.g. ABC-123-DE.";
