// Re-registration pricing.
//
// TEMPORARY location. Every other priced flow reads its price from the server
// — driver's licence through useDriverLicensePrices, renewals through
// /public/renewal-items — because a price hardcoded in the client can disagree
// with what the customer is actually charged. Re-registration has no catalogue
// entry yet, so both figures live here, in one place, and this file should be
// deleted once the catalogue carries them.

// Aggregated, all-in: government fees and Motoka's service fee together,
// deliberately not itemised. Real costs vary by a few hundred naira between
// vehicles, which is inside the rounding, so it is quoted flat.
export const RE_REGISTRATION_BASE_NAIRA = 150000;

// The base price assumes the vehicle's papers were current at the point of
// transfer. Where they lapsed, the arrears are settled as part of the
// re-registration and fall to the new owner.
export const ARREARS_PER_YEAR_NAIRA = 5000;

/**
 * Whole years elapsed between two dates.
 *
 * Counts completed years only: a licence eleven months overdue has not yet
 * missed a year. That is the literal reading of "every year missed", and it
 * errs toward under-charging, which is the safer direction for a quote shown
 * before anyone has agreed to anything.
 */
function completedYearsBetween(from, to) {
  let years = to.getFullYear() - from.getFullYear();
  const anniversary = new Date(from);
  anniversary.setFullYear(from.getFullYear() + years);
  if (anniversary > to) years -= 1;
  return Math.max(0, years);
}

/**
 * Quote a re-registration.
 *
 * The base price only holds if the papers were current, so the expiry date has
 * to be known before any figure can be shown. An unknown expiry returns
 * `unknown: true` and no total — quoting ₦150,000 and then adding arrears
 * later would be a worse experience than asking for the date up front.
 *
 * @param {Object} params
 * @param {string|Date|null} params.expiryDate - last vehicle licence expiry
 * @param {Date} [params.asOf] - defaults to now; injectable for tests
 */
export function quoteReRegistration({ expiryDate, asOf = new Date() }) {
  const base = RE_REGISTRATION_BASE_NAIRA;

  if (!expiryDate) {
    return { unknown: true, base, yearsMissed: 0, arrears: 0, total: null };
  }

  const expiry = expiryDate instanceof Date ? expiryDate : new Date(expiryDate);
  if (Number.isNaN(expiry.getTime())) {
    return { unknown: true, base, yearsMissed: 0, arrears: 0, total: null };
  }

  if (expiry >= asOf) {
    return {
      unknown: false,
      upToDate: true,
      expiry,
      base,
      yearsMissed: 0,
      arrears: 0,
      total: base,
    };
  }

  const yearsMissed = completedYearsBetween(expiry, asOf);
  const arrears = yearsMissed * ARREARS_PER_YEAR_NAIRA;

  return {
    unknown: false,
    upToDate: false,
    expiry,
    base,
    yearsMissed,
    arrears,
    total: base + arrears,
  };
}
